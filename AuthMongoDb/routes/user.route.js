import express, { Router } from "express";
import { userRegister, verifyUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register",userRegister);
router.get("/verify:token",verifyUser);

export default router;