import express,{ Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register",registerUser);

export default router;