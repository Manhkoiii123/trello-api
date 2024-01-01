import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoutes } from "./boardRoutes";
const Router = express.Router();
//check v1 chạy
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "Api v1 are ready use to",
    code: StatusCodes.OK,
  });
});
//board api
Router.use("/boards", boardRoutes);
export const APIs_V1 = Router;
