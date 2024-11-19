const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { GET_DB } = require("~/config/mongodb");
const { EMAIL_RULE, EMAIL_RULE_MESSAGE } = require("~/utils/validators");

const USER_ROLES = {
  CLIENT: "client",
  ADMIN: "admin",
};
const USER_COLECTION_NAME = "users";
const USER_COLLECTION_SCEHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string()
    .valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN)
    .default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  createdAt: Joi.date().timestamp("javascript").default(Date.now()),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});
// các trường không được cập nhật
const INVALID_UPDATE_FIELDS = ["_id", "email", "username", "createdAt"];
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCEHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const createdUser = await GET_DB()
      .collection(USER_COLECTION_NAME)
      .insertOne(validData);
    return createdUser;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneById = async (id) => {
  try {
    const res = await GET_DB()
      .collection(USER_COLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneByEmail = async (email) => {
  try {
    const res = await GET_DB()
      .collection(USER_COLECTION_NAME)
      .findOne({ email });
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
const update = async (userId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updateData[key];
      }
    });
    const res = await GET_DB()
      .collection(USER_COLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: "after" }
      );
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
export const userModel = {
  USER_ROLES,
  USER_COLECTION_NAME,
  USER_COLLECTION_SCEHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  update,
};
