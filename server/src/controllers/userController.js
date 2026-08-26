import mongoose from "mongoose";
import userModel from "../models/userModel.js";

const getUsersController = async (req, res) => {
    // Check if user already exists
    const users = await userModel.find({});
    console.log(users)
    return res.status(201).json({
        success: true,
        message: "All user fetched ",
        user: users,
    });
}

export default getUsersController;