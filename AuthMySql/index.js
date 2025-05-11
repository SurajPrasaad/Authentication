import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./utils/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectDb()


app.get("/", (req, res) => {
  res.send({ message: "Welcome" });
});

app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});

