import { StatusCodes } from "http-status-codes";
import { boardService } from "~/services/boardService";
const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const { page, itemsPerPage } = req.query;
    const result = await boardService.getBoards(userId, page, itemsPerPage);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
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
    const boardId = req.params.id; //:id
    const board = await boardService.getDetails(boardId);
    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};
const update = async (req, res, next) => {
  try {
    const boardId = req.params.id; //:id
    const updatedBoard = await boardService.update(boardId, req.body);
    res.status(StatusCodes.OK).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
};
