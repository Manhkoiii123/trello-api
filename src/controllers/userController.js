import ms from "ms";
import { userService } from "~/services/userService";
import ApiError from "~/utils/ApiError";
const { StatusCodes } = require("http-status-codes");
const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
};
const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.cookie("refreshToken", result.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });
    res.cookie("accessToken", result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(StatusCodes.OK).json({
      message: "Logout successfully",
    });
  } catch (error) {
    next(error);
  }
};
const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(
      new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Please login! (error from refresh token)"
      )
    );
  }
};

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
};
