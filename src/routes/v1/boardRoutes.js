import express from "express";
import { StatusCodes } from "http-status-codes";
const Router = express.Router();
Router.route("/")
  .get((req, res) => {
    res.status(StatusCodes.OK).json({
      message: "Note: Api get list post",
    });
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({
      message: "Note:create new  post",
    });
  });
export const boardRoutes = Router;
