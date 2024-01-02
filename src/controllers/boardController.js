import { StatusCodes } from "http-status-codes";
// import ApiError from "~/utils/ApiError";
const createNew = async (req, res, next) => {
  try {
    // throw new ApiError(StatusCodes.BAD_GATEWAY, "test error");
    res.status(StatusCodes.CREATED).json({
      message: "Note Post from controlller:create new  post",
    });
  } catch (error) {
    next(error);
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    //   errors: error.message,
    // });
  }
};
export const boardController = {
  createNew,
};
