/* eslint-disable no-console */
import express from "express";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";
import exitHook from "async-exit-hook";
import { env } from "~/config/environment";
const START_SERVER = () => {
  const app = express();

  app.get("/", async (req, res) => {
    // hàm listco là hàm trả ra 1 promise nên cần có aw
    // console.log(await GET_DB().listCollections().toArray());
    res.end("<h1>Hello World!</h1><hr>");
  });

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(
      `Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`
    );
  });
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
