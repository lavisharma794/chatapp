import chatModel from "../models/chatModel.js";

// ============================================
// CREATE OR GET PRIVATE CHAT
// ============================================

const getPrivateChatController = async (req, res) => {
    try {
        const {
            userId,
            otherUserId
        } = req.body || {};

        // Validation
        if (!userId || !otherUserId) {
            return res.status(400).json({
                message: "userId and otherUserId are required"
            });
        }

        // Same user ke saath chat allow nahi karni
        if (userId === otherUserId) {
            return res.status(400).json({
                message: "You cannot create chat with yourself"
            });
        }

        // Existing private chat find karo
        let chat = await chatModel.findOne({
            type: "private",
            members: {
                $all: [userId, otherUserId]
            }
        });

        // Chat nahi hai to create karo
        if (!chat) {
            chat = await chatModel.create({
                type: "private",
                members: [
                    userId,
                    otherUserId
                ]
            });
        }

        // Yahan se code normally chalega
        return res.status(200).json(chat);

    } catch (error) {
        console.error("Private chat error:", error);

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};


// ============================================
// GET ALL CHATS OF USER
// ============================================

const getSpecifByIdChatController = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                message: "userId is required"
            });
        }

        const chats = await chatModel
            .find({
                members: userId
            })
            .sort({
                lastMessageAt: -1
            });

        // Chat nahi hai
        if (!chats || chats.length === 0) {
            return res.status(200).json({
                message: "No chats found",
                chats: []
            });
        }

        // Chat hai
        return res.status(200).json({
            message: "Chats fetched successfully",
            chats
        });

    } catch (error) {
        console.error("Get user chats error:", error);

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};


export {
    getPrivateChatController,
    getSpecifByIdChatController
};
