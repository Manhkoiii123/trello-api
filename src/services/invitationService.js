import { invitationModel } from "~/models/invitationModel";
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "~/utils/constants";

/* eslint-disable no-useless-catch */
const { StatusCodes } = require("http-status-codes");
const { boardModel } = require("~/models/boardModel");
const { userModel } = require("~/models/userModal");
const { default: ApiError } = require("~/utils/ApiError");
const { pickUser } = require("~/utils/formater");

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    const inviter = await userModel.findOneById(inviterId);
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
    const board = await boardModel.findOneById(reqBody.boardId);
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User or board not found");
    }
    const newInvitationData = {
      inviterId: inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING,
      },
    };
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvitationData
    );
    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId.toString()
    );
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee),
    };
    return resInvitation;
  } catch (error) {
    throw error;
  }
};
export const invitationService = { createNewBoardInvitation };
