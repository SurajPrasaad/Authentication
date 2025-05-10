import express, { Router } from "express";
import { userLogin, userProfile, userRegister, verifyUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register",userRegister);
router.get("/verify:token",verifyUser);
router.post("/login",userLogin);
router.post("/profile",userProfile)

export default router;