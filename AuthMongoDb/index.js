import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./utils/db.js";
import cookieParser from "cookie-parser";
import session from "express-session";

//import all routes
import userRoutes from "./routes/user.route.js"

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
app.use(cookieParser())
app.use(session(
    {
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true if using HTTPS
      sameSite: "strict",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
}))

app.get('/',(request,response)=>{
    response.send("Hello👻")
})

//connect of db
connectDb();

//user routes
app.use("/api/v1/users",userRoutes);

app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`);
})