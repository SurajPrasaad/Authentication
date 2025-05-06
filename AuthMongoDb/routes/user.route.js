import express, { Router } from "express";
import { userRegister } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/register",userRegister)
export default router;