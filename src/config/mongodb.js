import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "~/config/environment";

//taọ 1 ins lúc đầu là null do ch kết nối db => tạo ra tí nối nó dễ
let trelloDatabaseInstance = null;

//khoởi tạo 1 clinet hưu trên docs
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
export const CONNECT_DB = async () => {
  await mongoClientInstance.connect();
  //kết nối thành công thì lấy ra db theo name và gán ó lại biến trelloDatabaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
};
//hcir gọi hàm này khi đã kết ối thành công tới môngdb
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error("Must connect to Db first");
  return trelloDatabaseInstance;
};
export const CLOSE_DB = async () => {
  await mongoClientInstance.close();
};
