/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes";
import { boardModel } from "~/models/boardModel";
import ApiError from "~/utils/ApiError";
import { slugify } from "~/utils/formater";
import { cloneDeep } from "lodash";
const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    };
    //gọi đế tầng model để xử lí lưu bản ghi trong db
    const createdBoard = await boardModel.createNew(newBoard);
    //lấy bản ghi sau khi gọi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);

    //trả kết quả về trog services (luôn phải có)
    //cái return này chính là cái trả ra để nhận được và gán vào biến ở bên boardController
    return getNewBoard;
  } catch (error) {
    throw error;
  }
};
const getDetails = async (postId) => {
  try {
    const board = await boardModel.getDetails(postId);

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy board");
    }
    //convert dữ liệu chuẩn mockdataa
    const resBoard = cloneDeep(board);
    //đưa card về đúng clumns của nó
    resBoard.columns.forEach((c) => {
      c.cards = resBoard.cards.filter(
        (card) => card.columnId.toString() === c._id.toString()
        //cách 2 để so sánh => card.columnId.equals(c._id) equal của mongdb
      );
    });
    delete resBoard.cards; //ko cần cái mảng cards lúc đầu nằm //với cái colums đi
    return resBoard;
  } catch (error) {
    throw error;
  }
};
export const boardService = {
  createNew,
  getDetails,
};
