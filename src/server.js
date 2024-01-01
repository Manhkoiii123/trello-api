/* eslint-disable no-console */
import express from "express";
import { CONNECT_DB, GET_DB, CLOSE_DB } from "~/config/mongodb";
import exitHook from "async-exit-hook";
const START_SERVER = () => {
  const app = express();

  const hostname = "localhost";
  const port = 8017;

  app.get("/", async (req, res) => {
    // hàm listco là hàm trả ra 1 promise nên cần có aw
    console.log(await GET_DB().listCollections().toArray());
    res.end("<h1>Hello World!</h1><hr>");
  });

  app.listen(port, hostname, () => {
    console.log(`Hello Manhtd, I am running at http://${hostname}:${port}/`);
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
