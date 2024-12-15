import { StatusCodes } from "http-status-codes";
import { invitationService } from "~/services/invitationService";

const createNewBoardInvitation = async (req, res, next) => {
  try {
    // người đi mời
    const inviterId = req.jwtDecoded._id;
    const resInvitation = await invitationService.createNewBoardInvitation(
      req.body,
      inviterId
    );
    res.status(StatusCodes.CREATED).json(resInvitation);
  } catch (error) {
    next(error);
  }
};
const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const invitations = await invitationService.getInvitations(userId);
    res.status(StatusCodes.OK).json(invitations);
  } catch (error) {
    next(error);
  }
};
const updateInvitationStatus = async (req, res, next) => {
  try {
    const invitationId = req.params.invitationId;
    const userId = req.jwtDecoded._id;
    const { status } = req.body;
    const invitation = await invitationService.updateInvitationStatus(
      userId,
      invitationId,
      status
    );
    res.status(StatusCodes.OK).json(invitation);
  } catch (error) {
    next(error);
  }
};

export const invitationController = {
  createNewBoardInvitation,
  getInvitations,
  updateInvitationStatus,
};
