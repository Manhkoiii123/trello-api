import { StatusCodes } from "http-status-codes";
import { boardService } from "~/services/boardService";
// import ApiError from "~/utils/ApiError";

const createNew = async (req, res, next) => {
  try {
    //điều hướng sag services
    const createdBoard = await boardService.createNew(req.body);
    //có kết quả trả về cho client
    res.status(StatusCodes.CREATED).json(createdBoard);
  } catch (error) {
    next(error);
  }
};
const getDetails = async (req, res, next) => {
  try {
    //lấy params ra
    const postId = req.params.id; //:id
    const board = await boardService.getDetails(postId);
    res.status(StatusCodes.CREATED).json(board);
  } catch (error) {
    next(error);
  }
};
export const boardController = {
  createNew,
  getDetails,
};
