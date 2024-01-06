/* eslint-disable no-useless-catch */
import { boardModel } from "~/models/boardModel";
import { columnModel } from "~/models/columnModel";
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
export const columnService = {
  createNew,
  update,
};
