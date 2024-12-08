import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
} from "~/utils/validators";

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = "cards";
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),
  cover: Joi.string().default(null),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  comments: Joi.array().items({
    userId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    commentAt: Joi.date().timestamp(),
  }),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});
const validateBeforCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const createNew = async (data) => {
  try {
    const validData = await validateBeforCreate(data);
    const newCardToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId),
    };
    const createdCard = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .insertOne(newCardToAdd);
    return createdCard;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneById = async (id) => {
  try {
    const res = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id), //cái id ày phải là ObjectId
      });
    return res;
  } catch (error) {
    throw new Error(error);
  }
};

const INVALID_UPDATE_FIELDS = ["_id", "boardId", "createdAt"];
const update = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldname) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldname)) {
        delete updateData[fieldname]; //xóa khỏi phần update vì ko cho update
      }
    });
    //sửa cái truyền lên thành objectid
    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId);
    }
    const res = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
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
const deleteManyByColumId = async (columnId) => {
  try {
    const res = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({
        columnId: new ObjectId(columnId),
      });
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
const unShiftNewComment = async (cardId, commentData) => {
  try {
    const res = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(cardId) },
        {
          $push: {
            comments: {
              // trong mongo ko ko có unshift nên phải dùng $push
              $each: [commentData],
              $position: 0,
            },
          },
        },
        { returnDocument: "after" }
      );
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumId,
  unShiftNewComment,
};
