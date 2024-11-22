/* eslint-disable no-console */
import express from "express";
import cors from "cors";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";
import exitHook from "async-exit-hook";
import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1";
import cookieParser from "cookie-parser";
import { errorHandlingMiddleware } from "~/middlewares/errorHandlingMiddleware";
import { corsOptions } from "./config/cors";
const START_SERVER = () => {
  const app = express();

  // fix cache
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  app.use(cookieParser());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/v1", APIs_V1);

  //middleware xử lí lloix tập trung
  app.use(errorHandlingMiddleware);
  if (env.BUILD_MODE === "production") {
    app.listen(process.env.PORT, () => {
      //render sẽ tự lấy port
      console.log(
        `Hello ${env.AUTHOR}, I am running at Port : ${process.env.PORT}/`
      );
    });
  } else {
    app.listen(env.APP_PORT, env.APP_HOST, () => {
      console.log(
        `Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`
      );
    });
  }

  exitHook(() => {
    CLOSE_DB();
  });
};
CONNECT_DB()
  .then(() => {
    console.log("connected to mongodb Atlas");
  })
  .then(() => START_SERVER())
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
