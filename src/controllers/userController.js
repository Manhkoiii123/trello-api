import { userService } from "~/services/userService";
const { StatusCodes } = require("http-status-codes");

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
};
export const userController = {
  createNew,
};
