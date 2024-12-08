import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoute } from "./boardRoute";
import { columnRoute } from "./columnRoute";
import { cardRoute } from "./cardRoute";
import { userRoute } from "./userRoute";
import { invitationRoute } from "./invitationRoute";
const Router = express.Router();
//check v1 chạy
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "Api v1 are ready use to",
    code: StatusCodes.OK,
  });
});
//board api
Router.use("/boards", boardRoute);
//column api
Router.use("/columns", columnRoute);
//cardApi
Router.use("/cards", cardRoute);
//user
Router.use("/users", userRoute);
Router.use("/invitations", invitationRoute);
export const APIs_V1 = Router;
