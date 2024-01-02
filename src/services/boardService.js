/* eslint-disable no-useless-catch */
import { slugify } from "~/utils/formater";

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    };
    //gọi đế tầng model để xử lí lưu bản ghi trong db

    //trả kết quả về trog services (luôn phải có)
    //cái return này chính là cái trả ra để nhận được và gán vào biến ở bên boardController
    return newBoard;
  } catch (error) {
    throw error;
  }
};
export const boardService = {
  createNew,
};
