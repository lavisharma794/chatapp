
import { Router } from "express";
import { getMessageController } from "../controllers/messageController.js";
const messageRoutes = Router();
messageRoutes.get("/chats/:chatId/messages", getMessageController);

export default messageRoutes;