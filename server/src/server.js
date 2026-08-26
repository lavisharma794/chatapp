import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";


import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import registerChatSocket from "./socket/chatSocket.js";

const app = express();

// load env variables
dotenv.config();

//database connection
connectDB();
app.get("/", (req, res) => {
    res.json({
        message: "Chat server running"
    });
});


const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
// Auth routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);


app.use("/api", chatRoutes);
app.use("/api", messageRoutes);

// ==========================
// HTTP Server
// ==========================

const port = process.env.PORT || 5000;

// ==========================
// Socket.IO
// ==========================
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// ==========================
// Socket Connection
// ==========================
io.on("connection", (socket) => {
    console.log("User connected backedn:", socket.id);

     registerChatSocket(io, socket);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(port, () => {
    console.log("server started listen at the port: ", port);
});