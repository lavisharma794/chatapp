import express from "express";
import dotenv from "dotenv";

import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// load env variables
dotenv.config();

//database connection
connectDB();
app.use(express.json());

app.get("/", (req, res) => { res.json({ message: "Chat server running" }); });

// Auth routes
app.use("/api", authRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("server started listen at the port: ", port);
});