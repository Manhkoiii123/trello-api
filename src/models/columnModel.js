import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = "columns";
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});
const validateBeforCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const createNew = async (data) => {
  try {
    const validData = await validateBeforCreate(data);
    const newColumToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
    };
    const createdColumn = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .insertOne(newColumToAdd);
    return createdColumn;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneById = async (id) => {
  try {
    const res = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id), //cái id ày phải là ObjectId
      });
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
const pushCardOrderIds = async (card) => {
  try {
    const res = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        // tại sao lại là column.boardId => vì lúc tạo mới chạy hàm này
        // thì đẩy lên 1 cái boardid
        { _id: new ObjectId(card.columnId) }, // tìm cái board có cái column đấy
        {
          $push: {
            // đẩy cái id của column mới tạo vào cuối mảng
            cardOrderIds: new ObjectId(card._id),
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
export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
};
