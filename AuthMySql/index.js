import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connection from "./utils/db.js";

import userRoutes from "./routes/user.route.js"

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

connection
  .connect()
  .then(() => console.log("Mysql connected successful"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send({ message: "Welcome" });
});

app.use("/api/v1/users",userRoutes)
app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});
