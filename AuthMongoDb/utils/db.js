import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
//export a function to connect MongoDb

const connectDb = async ()=>{
    await mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("Mongodb connected!"))
    .catch((error) => console.error("Failed to Connecting MongoDb.."));
  
}

export default connectDb;