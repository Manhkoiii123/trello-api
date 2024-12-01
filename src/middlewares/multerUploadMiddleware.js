import { StatusCodes } from "http-status-codes";
import multer from "multer";
import ApiError from "~/utils/ApiError";
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
} from "~/utils/validators";
// func kiểm tra loại file nào được chấp nhận

const customFileFilter = (req, file, cb) => {
  // kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMess = "File type is invalid. Only accept jpg, jpeg and png";
    return cb(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMess), null);
  }
  // nếu file hợp lệ
  return cb(null, true);
};

//  khởi tạo func upload được bọc bởi thằng multer

const upload = multer({
  limits: {
    fileSize: LIMIT_COMMON_FILE_SIZE,
  },
  fileFilter: customFileFilter,
});
export const multerUploadMiddleware = { upload };
