import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./utils/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin:process.env.BASE_URI,
    credentials:true,
    methods:['GET','POST','DELETE','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization']
}))

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.get('/',(request,response)=>{
    response.send("Hello👻")
})
app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`);
    connectDb();
})