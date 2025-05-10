import express, { Router } from "express";
import { userLogin, userRegister, verifyUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register",userRegister);
router.get("/verify:token",verifyUser);
router.post("/login",userLogin)

export default router;