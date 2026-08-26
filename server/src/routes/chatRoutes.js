
import { Router } from "express";
import { getPrivateChatController, getSpecifByIdChatController } from "../controllers/chatController.js";
const chatRoutes = Router();
chatRoutes.post("/chats/private", getPrivateChatController);

chatRoutes.get("/chats/user/:userId", getSpecifByIdChatController);

export default chatRoutes;