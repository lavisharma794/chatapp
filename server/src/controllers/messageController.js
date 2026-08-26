
import messageModel from "../models/messageModel.js";

export const getMessageController = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await messageModel.find({
            chatId: chatId
        }).sort({
            createdAt: 1
        });
        return res.json(messages);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}
