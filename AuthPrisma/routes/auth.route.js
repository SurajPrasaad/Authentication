import express,{ Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";

const userRoutes = express.Router();
 userRoutes.get("/register",registerUser)

export default userRoutes;