import { StatusCodes } from "http-status-codes";
import { userModel } from "~/models/userModal";
import ApiError from "~/utils/ApiError";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { pickUser } from "~/utils/formater";
import { WEBSITE_DOMAIN } from "~/utils/constants";
import { brevoProvider } from "~/providers/brevoProvider";
import { env } from "~/config/environment";
import { JwtProvider } from "~/providers/JwtProvider";
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
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const customSubject = "Verify your account";
    const customBody = `Click this link to verify your account: <a>${verificationLink}</a>`;

    await brevoProvider.sendEmail(getNewUser.email, customSubject, customBody);

    // return dữ liệu cho controller
    return pickUser(getNewUser);
  } catch (error) {
    throw new Error(error);
  }
};
const verifyAccount = async (data) => {
  try {
    const user = await userModel.findOneByEmail(data.email);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    if (user.isActive) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Account is already active"
      );
    }
    // kiểm tra token
    if (user.verifyToken !== data.token) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid token");
    }
    // cập nhật trạng thái active
    const updateData = {
      isActive: true,
      verifyToken: null,
    };
    const updatedUser = await userModel.update(user._id, updateData);
    return pickUser(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
};
const login = async (data) => {
  try {
    const user = await userModel.findOneByEmail(data.email);
    if (!user) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Email and password not correct"
      );
    }
    if (!user.isActive) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Account is not active yet"
      );
    }
    const isMatch = bcryptjs.compareSync(data.password, user.password);
    if (!isMatch) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Email and password not correct"
      );
    }
    // Đính lên JWT
    const userInfo = {
      _id: user._id,
      email: user.email,
    };
    const access_token = await JwtProvider.generateToken(
      userInfo,
      // "5",
      env.ACCESS_TOKEN_LIFE,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    );
    const refresh_token = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_LIFE,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    );

    return {
      access_token,
      refresh_token,
      ...pickUser(user),
    };
  } catch (error) {
    throw new Error(error);
  }
};
export const userService = {
  createNew,
  verifyAccount,
  login,
};
//2518
