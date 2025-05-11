import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
   console.log("connect to mysql");
   return connection;
  } catch (error) {
    console.log("MySQL Connection Failed ...", error);
    throw error;
  }
};

export default connectDb;