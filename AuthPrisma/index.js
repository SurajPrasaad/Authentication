import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/auth.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
const port = process.env.PORT||8000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

app.use("/api/v1/users",userRoutes);

app.listen(port,()=>{
    console.log(`Server is listening on ${port}...`)
});

