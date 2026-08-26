import mongoose from "mongoose";
import { Router } from "express";
import {handelusersingup,loginUser} from "../controllers/authController.js";
const authRoutes=Router();
// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/logout", logoutUser);
// router.get("/me", authMiddleware, getCurrentUser);
authRoutes.post("/signupUser", handelusersingup);
authRoutes.post("/login", loginUser);

export default authRoutes;