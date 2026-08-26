import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
    }
},
    {
        timestamps: true
    }
);

const messageModel = new mongoose.model("messages", messageSchema);

export default messageModel;