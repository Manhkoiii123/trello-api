/* eslint-disable no-useless-catch */
import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";
import { cloudinaryProvider } from "~/providers/cloudinaryProvider";
const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody,
    };
    const createdCard = await cardModel.createNew(newCard);
    const getNewCard = await cardModel.findOneById(createdCard.insertedId);
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard);
    }
    return getNewCard;
  } catch (error) {
    throw error;
  }
};
const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: new Date(),
    };
    let updatedCard = {};
    if (cardCoverFile) {
      const uploadResult = await cloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        "trello-app"
      );
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url,
      });
    } else if (updateData.commentToAdd) {
      // tạo comment để thêm vào db nhưng thêm các field cần thiết
      // fe đẩy lên content, userAvt, username
      // thiếu commentAt (now), {userId,userEmail} => lấy từ token
      const commentData = {
        ...updateData.commentToAdd,
        commentAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email,
      };
      updatedCard = await cardModel.unShiftNewComment(cardId, commentData);
    } else {
      updatedCard = await cardModel.update(cardId, updateData);
    }
    return updatedCard;
  } catch (error) {
    throw error;
  }
};
export const cardService = {
  createNew,
  update,
};
