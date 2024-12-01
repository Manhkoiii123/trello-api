import Joi from "joi";
import { GET_DB } from "~/config/mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { ObjectId } from "mongodb";
import { BOARD_TYPES } from "~/utils/constants";
import { columnModel } from "./columnModel";
import { cardModel } from "./cardModel";
import { pagingSkipValue } from "~/utils/algorithms";
//Define collection
const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().min(3).required().max(50).trim().strict(),
  slug: Joi.string().min(3).required().trim().strict(),
  description: Joi.string().min(3).required().max(256).trim().strict(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  // những chủ board
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  // các thành viên của board
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});
const INVALID_UPDATE_FIELDS = ["_id", "createdAt"]; // ko cho phép cập nhật
const validateBeforCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const createNew = async (data) => {
  //data từ serve gửi sag
  try {
    const validData = await validateBeforCreate(data);
    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(validData);
    return createdBoard;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneById = async (id) => {
  try {
    const res = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id), //cái id ày phải là ObjectId
      });
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
//query tổng hợp(aggregate) để lấy all column và card thuộc về board
const getDetails = async (userId, boardId) => {
  try {
    const queryCondition = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ],
      },
    ];
    const res = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryCondition } },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME, // đứng từ borad tìm đế coll column
            localField: "_id", //coll hiện tại ở board
            foreignField: "boardId", // tại cái column như cái khóa ngoại (bên colimn có lưu board id)
            as: "columns", //lưu dữ liệu vào trong là 1 cái mảng
          },
        },
        {
          //tt với card
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "cards",
          },
        },
      ])
      .toArray();
    return res[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};
const pushColumnOrderIds = async (column) => {
  try {
    const res = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        // tại sao lại là column.boardId => vì lúc tạo mới chạy hàm này
        // thì đẩy lên 1 cái boardid
        { _id: new ObjectId(column.boardId) }, // tìm cái board có cái column đấy
        {
          $push: {
            // đẩy cái id của column mới tạo vào cuối mảng
            columnOrderIds: new ObjectId(column._id),
          },
        },
        //nếu ko có cái này thì trả ra bản ch được cập nhật
        { returnDocument: "after" } // trả về cái doc mới sau cập nhật
      );
    return res; //findOneAndUpdate hàm  này trả ra vậy => thực tế cái bên kia cũng ko hứng cái này mà chỉ cần nó chạy đúng thôi
  } catch (error) {
    throw new Error(error);
  }
};
const pullColumnOrderIds = async (column) => {
  try {
    const res = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        {
          $pull: {
            //kéo ra 1 column._id phần tử ra khỏi mảng rồi xóa nó đi
            columnOrderIds: new ObjectId(column._id),
          },
        },
        { returnDocument: "after" }
      );
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldname) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldname)) {
        delete updateData[fieldname]; //xóa khỏi phần update vì ko cho update
      }
    });
    // đưa id về object
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(
        (c) => new ObjectId(c)
      );
    }
    const res = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        {
          $set: updateData,
        },
        { returnDocument: "after" }
      );
    return res; //findOneAndUpdate hàm  này trả ra vậy => thực tế cái bên kia cũng ko hứng cái này mà chỉ cần nó chạy đúng thôi
  } catch (error) {
    throw new Error(error);
  }
};
const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryCondition = [
      // điều kiện 1: Board ch bị xóa
      {
        _destroy: false,
      },
      // điều kiện 2: uerId đang thực hiện query phải thuộc 1 trong 2 cái mảng ownerIds hoặc memberIds, sử dụng $all của mongodb
      {
        $or: [
          {
            ownerIds: { $all: [new ObjectId(userId)] },
          },
          {
            memberIds: { $all: [new ObjectId(userId)] },
          },
        ],
      },
    ];
    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          {
            $match: { $and: queryCondition }, // do trên queryCondition là 1 mảng nên dùng $and => và (cả 2 cái)
          },
          { $sort: { title: 1 } }, // sắp xếp theo title tăng dần theo ascii
          {
            // xử lí nhiều luồng trong 1 query
            $facet: {
              // luồng 1: query board
              queryBoards: [
                { $skip: pagingSkipValue(page, itemsPerPage) },
                { $limit: itemsPerPage },
              ],
              // luồng 2: query đếm tổng all bản ghi trong db và trả về
              queryTotalBoards: [{ $count: "countedAllBoards" }], // countedAllBoards là 1 cái tên mình đặt để lấy cái giá trị trả về
            },
          },
        ],
        {
          collation: {
            locale: "en", // fix vụ B trước a thường (như theo ascii là ko đúng)
          },
        }
      )
      .toArray();
    const result = query[0];
    return {
      boards: result.queryBoards || [], // cái này là cái bên facet nó đặt tên ở 2 cái luồng
      totalBoards: result.queryTotalBoards[0]?.countedAllBoards || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  getDetails,
  findOneById,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
};
