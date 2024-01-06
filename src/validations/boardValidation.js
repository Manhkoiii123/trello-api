import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { BOARD_TYPES } from "~/utils/constants";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    //tạo post chỉ tạo bằng title và des thôi
    title: Joi.string().min(3).required().max(50).trim().strict().messages({
      "any.required": "Title is required(manh)",
      "string.empty": "Title is not allow to be empty",
      "string.min": "Title min 3 chars",
      "string.max": "Title max 50 chars",
      "string.trim": "Title must not have leading or trailing whitespace",
    }),
    description: Joi.string()
      .min(3)
      .required()
      .max(256)
      .trim()
      .strict()
      .messages({
        "any.required": "description is required(manh)",
        "string.empty": "description is not allow to be empty",
        "string.min": "description min 3 chars",
        "string.max": "description max 256 chars",
        "string.trim":
          "description must not have leading or trailing whitespace",
      }),
    type: Joi.string()
      .valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
      .required(),
  });
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false, //nó có dứng sớm hay ko ví dụ title lỗi thì trả về luôn mà ko chyaj cái des nữa
      //để là false thì chạy hết(mặc định là true)
    });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    );
    next(customError);
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //   errors: new Error(error).message, //new Error(error) trả về string luôn dễ lấy
    // });
  }
};
const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    //ko required
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array()
      .items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      )
      .default([]),
  });
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true, //cho phép unk để ko cần đẩy 1 vài field lên
    });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    );
    next(customError);
  }
};
const moveCardToDifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    nextColumnId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array()
      .required()
      .items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      )
      .default([]),
    nextCardOrderIds: Joi.array()
      .required()
      .items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      )
      .default([]),
  });
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    );
    next(customError);
  }
};
export const boardValidation = { createNew, update, moveCardToDifferentColumn };
