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
const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId);
    // nếu có 1 pt thì trả về pt đó luôn ko lồng vào mảng nữa
    const resInvitations = getInvitations.map((invitation) => {
      return {
        ...invitation,
        inviter: invitation.inviter[0] || {},
        invitee: invitation.invitee[0] || {},
        board: invitation.board[0] || {},
      };
    });
    return resInvitations;
  } catch (error) {
    throw error;
  }
};
const updateInvitationStatus = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId);
    if (!getInvitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invitation not found");
    }
    const boardId = getInvitation.boardInvitation.boardId;
    const board = await boardModel.findOneById(boardId);
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found");
    }
    // ktra xem là thành viên của board chưa
    const boardOwnerAndMembers = [
      ...board.memberIds,
      ...board.ownerIds,
    ].toString();

    if (
      status === BOARD_INVITATION_STATUS.ACCEPTED &&
      boardOwnerAndMembers.includes(userId)
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You are already a member of this board"
      );
    } //update status

    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status,
      },
    };
    // b1 update status trong bản ghi invitation
    const updatedInvitation = await invitationModel.update(
      invitationId,
      updateData
    );
    // b2 nếu trường hợp accepted thì thêm user vào board => thêm vào id vào mảng membersIds của board
    if (
      updatedInvitation.boardInvitation.status ===
      BOARD_INVITATION_STATUS.ACCEPTED
    ) {
      // thêm user vào board
      await boardModel.pushMemberIds(boardId, userId);
    }
    return updatedInvitation;
  } catch (error) {
    throw error;
  }
};
export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateInvitationStatus,
};
