import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({
    origin:"http:localhost:8000",
    credentials:true,
    methods:['GET','POST','DELETE','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization']
}))
const PORT = process.env.PORT || 8000;

app.get('/',(request,response)=>{
    response.send("Hello👻")
})
app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`)
})