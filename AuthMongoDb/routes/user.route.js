import express, { Router } from "express";
import { forgotPassword, logoutUser, resetPassword, userLogin, userProfile, userRegister, verifyUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register",userRegister);
router.get("/verify/:token",verifyUser);
router.post("/login",userLogin);
router.post("/profile",userProfile)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutUser);

export default router;