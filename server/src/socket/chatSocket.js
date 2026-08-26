import messageModel from "../models/messageModel.js";
import chatModel from "../models/chatModel.js"

const onlineUsers = new Map();
const registerChatSocket = (io, socket) => {
    // Register user
    socket.on("register-user", (userId) => {
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);
        console.log("User registered:", userId);

        // Current user ko existing online users
        socket.emit("online-users", {
            users: Array.from(onlineUsers.keys())
        });

        // Baaki connected users ko notify karo
        socket.broadcast.emit(
            "user-online",
            {
                userId
            }
        );

        console.log("Socket ID:", socket.id);
        console.log("Online users:", Object.fromEntries(onlineUsers)


        );
    });


    // Send message
    /* socket.on("send-message", ({ receiverId, message }) => {
         const receiverSocketId = onlineUsers.get(receiverId);
         console.log("Sender:", socket.id);
         console.log("Sender User ID:", socket.userId);
         console.log("Receiver User ID:", receiverId);
         console.log("Receiver Socket:", receiverSocketId);
         console.log("Message:", message);
 
         // Receiver offline
         if (!receiverSocketId) {
             console.log("Receiver is offline");
             return;
         }
         // Send message to receiver
         io.to(receiverSocketId).emit("receive-message", { senderId: socket.userId, receiverId, message });
     }
     );*/


    socket.on(
        "send-message",
        async ({ chatId, receiverId, message }) => {
            try {
                // 1. Save message in DB
                const newMessage = await messageModel.create({
                    chatId,
                    senderId: socket.userId,
                    message,
                    messageType: "text"
                });


                // 2. Update chat last message
                await chatModel.findByIdAndUpdate(chatId, {
                    lastMessage: message,
                    lastMessageAt: new Date()
                });


                // 3. Existing online user logic
                const receiverSocketId =
                    onlineUsers.get(receiverId);


                // Receiver offline
                if (!receiverSocketId) {
                    console.log("Receiver is offline");
                    return;
                }


                // 4. Send real-time message
                io.to(receiverSocketId).emit(
                    "receive-message",
                    newMessage
                );

            } catch (error) {

                console.error(error);

            }
        }
    );

    // Disconnect
    socket.on("disconnect", () => {

    for (
        const [userId, socketId]
        of onlineUsers.entries()
    ) {

        if (socketId === socket.id) {

            onlineUsers.delete(userId);

            console.log(
                "User disconnected:",
                userId
            );

            // Baaki users ko notify karo
            socket.broadcast.emit(
                "user-offline",
                {
                    userId
                }
            );

            break;
        }
    }

});
   
};

export default registerChatSocket;