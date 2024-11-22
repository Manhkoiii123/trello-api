import { StatusCodes } from "http-status-codes";
import { env } from "~/config/environment";
import { JwtProvider } from "~/providers/JwtProvider";
import ApiError from "~/utils/ApiError";

const isAuthorized = async (req, res, next) => {
  // lấy toke từ req.cookie do cái withCredentials: true nên nó sẽ lấy được cookie
  const clientAccessToken = req.cookies?.accessToken;
  //nếu ko tồn tại => lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized! (no token)"));
    return;
  }
  try {
    // giải mã
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    );
    // nếu token hợp lệ => lưu thông tin giải mã vào req.jwtDecoded cho tầng sau xử lí
    req.jwtDecoded = accessTokenDecoded;
    // đi tiếp
    next();
  } catch (error) {
    // nếu acc hết hạ => trả về 1 lỗi 410 (gone) cho fe biết để call refreshToken
    if (error?.message?.includes("jwt expired")) {
      next(new ApiError(StatusCodes.GONE, "Access token expired"));
      return;
    }
    // nếu acc ko hợp lệ => logout và trả về 1 lỗi 401 cho fe biết
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized! (invalid token)")
    );
  }
};
export const authMiddleware = {
  isAuthorized,
};
