import mongoose from "mongoose";
import { Router } from "express";
import getUsersController from "../controllers/userController.js";
const userRoutes=Router();
userRoutes.get("/users", getUsersController);

export default userRoutes;