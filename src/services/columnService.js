/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes";
import { boardModel } from "~/models/boardModel";
import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";
import ApiError from "~/utils/ApiError";
const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody,
    };
    const createdColumn = await columnModel.createNew(newColumn);
    const getNewColumn = await columnModel.findOneById(
      createdColumn.insertedId
    );
    if (getNewColumn) {
      //lúc tạo thì sẽ trả luôn là cards là []
      getNewColumn.cards = [];
      //cập nhật vào columnOrderIds vào colection bỏad
      await boardModel.pushColumnOrderIds(getNewColumn);
    }
    return getNewColumn;
  } catch (error) {
    throw error;
  }
};
const update = async (columnId, body) => {
  try {
    const updateData = {
      ...body,
      updatedAt: Date.now(),
    };
    const updatedColumn = await columnModel.update(columnId, updateData);
    return updatedColumn;
  } catch (error) {
    throw error;
  }
};
const deleteColumn = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId);
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tồn tại Column");
    }
    //xóa column
    await columnModel.deleteOneById(columnId);
    //xóa card tronng column đó
    await cardModel.deleteManyByColumId(columnId);
    //caạp nhật lại columnorderids
    await boardModel.pullColumnOrderIds(targetColumn);
    return { deleteResult: "Column and its cards deleted successfully" };
  } catch (error) {
    throw error;
  }
};
export const columnService = {
  createNew,
  update,
  deleteColumn,
};
