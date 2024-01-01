import Joi from "joi";
import { StatusCodes } from "http-status-codes";
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
  });
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false, //nó có dứng sớm hay ko ví dụ title lỗi thì trả về luôn mà ko chyaj cái des nữa
      //để là false thì chạy hết(mặc định là true)
    });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message, //new Error(error) trả về string luôn dễ lấy
    });
  }
};
export const boardValidation = { createNew };
