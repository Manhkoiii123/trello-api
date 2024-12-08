import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "~/utils/constants";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
const INVITATION_COLLECTION_NAME = "invitations";
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  type: Joi.string()
    .required()
    .valid(...Object.values(INVITATION_TYPES)),
  boardInvitation: Joi.object({
    boardId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string()
      .required()
      .valid(...Object.values(BOARD_INVITATION_STATUS)),
  }).optional(),
  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = [
  "_id",
  "inviterId",
  "inviteeId",
  "type",
  "createdAt",
];
const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    let newInvitaionToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId),
    };
    // nếu tồn tại dữ liệu boardInvitation thì update sang kiểu ObjectId cho cái boardID
    if (validData.boardInvitation) {
      newInvitaionToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId),
      };
    }
    // insert vào db
    const createdInvitation = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .insertOne(newInvitaionToAdd);
    return createdInvitation;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const res = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldname) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldname)) {
        delete updateData[fieldname];
      }
    });
    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId),
      };
    }
    const res = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(invitationId) },
        { $set: updateData },
        {
          returnDocument: "after",
        }
      );
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
};
