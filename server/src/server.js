import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import registerChatSocket from "./socket/chatSocket.js";

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "Chat server running",
    });
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);
app.use("/api", messageRoutes);

// HTTP Server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Socket connection
io.on("connection", (socket) => {
    console.log("User connected backend:", socket.id);

    registerChatSocket(io, socket);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const port = process.env.PORT || 5000;

// Start application only after DB connection
const startServer = async () => {
    try {
        await connectDB();

        server.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();