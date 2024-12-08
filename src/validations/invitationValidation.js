import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "~/utils/ApiError";

const createNewBoardInvitation = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required(),
    inviteeEmail: Joi.string().required(),
  });
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (error) {
    return next(new ApiError(error.message, StatusCodes.BAD_REQUEST));
  }
};

export const invitationValidation = { createNewBoardInvitation };
