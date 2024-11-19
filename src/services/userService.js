import { StatusCodes } from "http-status-codes";
import { userModel } from "~/models/userModal";
import ApiError from "~/utils/ApiError";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { pickUser } from "~/utils/formater";
const createNew = async (userData) => {
  try {
    // kiểm tra email đã có trong hệ thống chưa
    const existUser = await userModel.findOneByEmail(userData.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
    }
    // tạo data để lưu vào db
    const nameFromEmail = userData.email.split("@")[0];
    const newUser = {
      email: userData.email,
      password: bcryptjs.hashSync(userData.password, 10),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4(),
    };
    // lưu vào db
    const createdUser = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(createdUser.insertedId);

    // gửi email xác thực (sau)
    // return dữ liệu cho controller
    return pickUser(getNewUser);
  } catch (error) {
    throw new Error(error);
  }
};
export const userService = {
  createNew,
};
