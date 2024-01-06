import Joi from "joi";
import { GET_DB } from "~/config/mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { ObjectId } from "mongodb";
import { BOARD_TYPES } from "~/utils/constants";
import { columnModel } from "./columnModel";
import { cardModel } from "./cardModel";
//Define collection
const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().min(3).required().max(50).trim().strict(),
  slug: Joi.string().min(3).required().trim().strict(),
  description: Joi.string().min(3).required().max(256).trim().strict(),
  columnOrderIds: Joi.array()
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
//query toogr hợp(aggregate) để lấy all column và card thuộc về bỏad
const getDetails = async (postId) => {
  //tạm thời giống hệt hàm findone => sẽ update phần aggregate tiếp
  try {
    // const res = await GET_DB()
    //   .collection(BOARD_COLLECTION_NAME)
    //   .findOne({
    //     _id: new ObjectId(postId), //cái id ày phải là ObjectId
    //   });
    const res = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(postId),
            _destroy: false,
          },
        },
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
const update = async (postId, updateData) => {
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
        { _id: new ObjectId(postId) },
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
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  getDetails,
  findOneById,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
};
