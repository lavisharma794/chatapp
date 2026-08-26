import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { getAlluser } from "../../services/dashBoardApi";

import {
    createPrivateChat,
    getUserChats,
    getChatMessages
} from "../../services/chatApi";

import { socket } from "../../services/socket";

import "./Dashboard.css";

function Dashboard() {

    // ============================================
    // STATES
    // ============================================

    const [selectedUser, setSelectedUser] = useState(null);

    const [selectedChat, setSelectedChat] = useState(null);

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([]);

    const [usersindb, setUsersindb] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);

    const [chats, setChats] = useState([]);

    // NEW
    // Store all currently online user IDs
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    const navigate = useNavigate();

    const messagesAreaRef = useRef(null);

    // ============================================
    // GET CURRENT USER FROM LOCAL STORAGE
    // ============================================

    useEffect(() => {

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/");
            return;
        }

        const user = JSON.parse(storedUser);

        console.log("Current User:", user);

        setCurrentUser(user);

    }, [navigate]);

    // ============================================
    // GET ALL USERS
    // ============================================

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const data = await getAlluser();

                console.log("API Response:", data);

                const filterData = data.user.filter((user) => {
                    return user.email !== currentUser.email;
                });

                setUsersindb(filterData);

            } catch (error) {

                console.error(
                    "Error fetching users:",
                    error
                );

            }

        };

        if (currentUser) {
            fetchUsers();
        }

    }, [currentUser]);

    // ============================================
    // SCROLL TO BOTTOM
    // ============================================

    useEffect(() => {

        const container = messagesAreaRef.current;

        if (container) {
            container.scrollTop = container.scrollHeight;
        }

    }, [messages]);

    // ============================================
    // GET CURRENT USER CHAT LIST
    // ============================================

    useEffect(() => {

        const fetchChats = async () => {

            try {

                const data = await getUserChats(
                    currentUser.id
                );

                console.log(
                    "Current User Chats:",
                    data
                );

                setChats(data);

            } catch (error) {

                console.error(
                    "Error fetching chats:",
                    error
                );

            }

        };

        if (currentUser) {
            fetchChats();
        }

    }, [currentUser]);

    // ============================================
    // SOCKET CONNECTION + ONLINE/OFFLINE
    // ============================================

    useEffect(() => {

        if (!currentUser) {
            return;
        }

        // ========================================
        // CONNECT SOCKET
        // ========================================

        socket.connect();

        // ========================================
        // SOCKET CONNECT
        // ========================================

        const handleConnect = () => {

            console.log(
                "Socket connected frontend:",
                socket.id
            );

            // Register current user
            socket.emit(
                "register-user",
                currentUser.id
            );

        };

        // ========================================
        // INITIAL ONLINE USERS
        // ========================================

        const handleOnlineUsers = ({ users }) => {

            console.log(
                "Initial online users:",
                users
            );

            setOnlineUsers(new Set(users));

        };

        // ========================================
        // USER ONLINE
        // ========================================

        const handleUserOnline = ({ userId }) => {

            console.log(
                "User came online:",
                userId
            );

            setOnlineUsers((prev) => {

                const updated = new Set(prev);

                updated.add(String(userId));

                return updated;

            });

        };

        // ========================================
        // USER OFFLINE
        // ========================================

        const handleUserOffline = ({ userId }) => {

            console.log(
                "User went offline:",
                userId
            );

            setOnlineUsers((prev) => {

                const updated = new Set(prev);

                updated.delete(String(userId));

                return updated;

            });

        };

        // ========================================
        // SOCKET EVENTS
        // ========================================

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "online-users",
            handleOnlineUsers
        );

        socket.on(
            "user-online",
            handleUserOnline
        );

        socket.on(
            "user-offline",
            handleUserOffline
        );

        // ========================================
        // CLEANUP
        // ========================================

        return () => {

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "online-users",
                handleOnlineUsers
            );

            socket.off(
                "user-online",
                handleUserOnline
            );

            socket.off(
                "user-offline",
                handleUserOffline
            );

            socket.disconnect();

        };

    }, [currentUser]);

    // ============================================
    // RECEIVE MESSAGE
    // ============================================

    useEffect(() => {

        if (!currentUser) {
            return;
        }

        const handleReceiveMessage = (data) => {

            console.log(
                "Message received:",
                data
            );

            // ====================================
            // Ignore message if another chat is open
            // ====================================

            if (
                selectedChat &&
                String(data.chatId) !==
                String(selectedChat._id)
            ) {

                console.log(
                    "Message belongs to another chat"
                );

                return;
            }

            // ====================================
            // Convert DB message to UI message
            // ====================================

            const newMessage = {

                id: data._id || Date.now(),

                text: data.message,

                sender:
                    String(data.senderId) ===
                    String(currentUser.id)
                        ? "me"
                        : "other",

                senderId: data.senderId,

                receiverId:
                    String(data.senderId) ===
                    String(currentUser.id)
                        ? selectedUser?._id
                        : currentUser.id,

                time:
                    data.createdAt
                        ? new Date(
                            data.createdAt
                        ).toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )
                        : new Date().toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )
            };

            // ====================================
            // Prevent duplicate message
            // ====================================

            setMessages((prevMessages) => {

                const alreadyExists =
                    prevMessages.some(
                        (msg) =>
                            String(msg.id) ===
                            String(newMessage.id)
                    );

                if (alreadyExists) {
                    return prevMessages;
                }

                return [
                    ...prevMessages,
                    newMessage
                ];

            });

        };

        socket.on(
            "receive-message",
            handleReceiveMessage
        );

        return () => {

            socket.off(
                "receive-message",
                handleReceiveMessage
            );

        };

    }, [
        currentUser,
        selectedChat,
        selectedUser
    ]);

    // ============================================
    // SELECT USER
    // ============================================

    const handleSelectUser = async (user) => {

        try {

            console.log(
                "Selected User:",
                user
            );

            // ------------------------------------
            // Set selected user
            // ------------------------------------

            setSelectedUser(user);

            // ------------------------------------
            // Clear previous messages
            // ------------------------------------

            setMessages([]);

            // ------------------------------------
            // Create or get private chat
            // ------------------------------------

            const chat = await createPrivateChat(
                currentUser.id,
                user._id
            );

            if (!chat) {

                console.error(
                    "Unable to create/get private chat"
                );

                return;
            }

            console.log(
                "Private Chat:",
                chat
            );

            // ------------------------------------
            // Save selected chat
            // ------------------------------------

            setSelectedChat(chat);

            // ------------------------------------
            // Get old messages
            // ------------------------------------

            const oldMessages =
                await getChatMessages(
                    chat._id
                );

            console.log(
                "Old Messages:",
                oldMessages
            );

            // ------------------------------------
            // Make sure messages is an array
            // ------------------------------------

            const messagesArray =
                Array.isArray(oldMessages)
                    ? oldMessages
                    : oldMessages?.messages ||
                      oldMessages?.data ||
                      [];

            // ------------------------------------
            // Format messages
            // ------------------------------------

            const formattedMessages =
                messagesArray.map((msg) => {

                    return {

                        id: msg._id,

                        text: msg.message,

                        sender:
                            String(msg.senderId) ===
                            String(currentUser.id)
                                ? "me"
                                : "other",

                        senderId:
                            msg.senderId,

                        receiverId:
                            String(msg.senderId) ===
                            String(currentUser.id)
                                ? user._id
                                : currentUser.id,

                        time:
                            msg.createdAt
                                ? new Date(
                                    msg.createdAt
                                ).toLocaleTimeString(
                                    [],
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    }
                                )
                                : ""

                    };

                });

            // ------------------------------------
            // Set messages
            // ------------------------------------

            setMessages(
                formattedMessages
            );

            // ------------------------------------
            // Join Socket.IO chat room
            // ------------------------------------

            socket.emit(
                "join-chat",
                chat._id
            );

            console.log(
                "Joined chat:",
                chat._id
            );

            // ------------------------------------
            // Add chat to local chat list
            // ------------------------------------

            setChats((prevChats) => {

                const chatsArray =
                    Array.isArray(prevChats)
                        ? prevChats
                        : [];

                const alreadyExists =
                    chatsArray.some(
                        (item) =>
                            String(item._id) ===
                            String(chat._id)
                    );

                if (alreadyExists) {
                    return chatsArray;
                }

                return [
                    chat,
                    ...chatsArray
                ];

            });

        } catch (error) {

            console.error(
                "Error selecting user:",
                error
            );

        }

    };

    // ============================================
    // SEND MESSAGE
    // ============================================

    const handleSendMessage = (e) => {

        e.preventDefault();

        // ----------------------------------------
        // Validation
        // ----------------------------------------

        if (!message.trim()) {
            return;
        }

        if (!selectedUser) {
            return;
        }

        if (!currentUser) {
            return;
        }

        if (!selectedChat) {

            console.log(
                "No chat selected"
            );

            return;
        }

        const messageText =
            message.trim();

        // ========================================
        // MESSAGE DATA
        // ========================================

        const msgData = {

            chatId:
                selectedChat._id,

            senderId:
                currentUser.id,

            receiverId:
                selectedUser._id,

            message:
                messageText

        };

        console.log(
            "Sending message:",
            msgData
        );

        // ========================================
        // SEND TO SOCKET.IO
        // ========================================

        socket.emit(
            "send-message",
            msgData
        );

        // IMPORTANT:
        // Don't call handleSelectUser here.
        // Backend will save and send receive-message.
        // Calling handleSelectUser again causes unnecessary API calls.

       
        setMessage("");

    };

    // ============================================
    // LOGOUT
    // ============================================

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        socket.disconnect();

        navigate("/");

    };

    // ============================================
    // CHECK USER ONLINE
    // ============================================

    const isUserOnline = (userId) => {

        return onlineUsers.has(
            String(userId)
        );

    };

    // ============================================
    // UI
    // ============================================

    return (

        <div className="dashboard-page">

            <div className="chat-container">

                {/* ================================= */}
                {/* LEFT PANEL */}
                {/* ================================= */}

                <div className="users-panel">

                    {/* HEADER */}

                    <div className="users-header">

                        <div>

                            <h2>
                                Messages
                            </h2>

                            <p>
                                {currentUser?.name}
                            </p>

                        </div>

                        <div className="header-actions">

                            <div className="my-profile">
                                👤
                            </div>

                            <button
                                className="logout-btn"
                                onClick={
                                    handleLogout
                                }
                                title="Logout"
                            >
                                ⎋
                            </button>

                        </div>

                    </div>

                    {/* SEARCH */}

                    <div className="search-box">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search users..."
                        />

                    </div>

                    {/* USERS */}

                    <div className="users-list">

                        {usersindb.map(
                            (user) => {

                                const isOnline =
                                    isUserOnline(
                                        user._id
                                    );

                                return (

                                    <div
                                        key={
                                            user._id
                                        }
                                        className={
                                            `user-item ${
                                                selectedUser?._id ===
                                                user._id
                                                    ? "active-user"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            handleSelectUser(
                                                user
                                            )
                                        }
                                    >

                                        <div className="profile-wrapper">

                                            <div className="profile-logo">

                                                {user.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase()}

                                            </div>

                                            {/* ONLINE DOT */}

                                            <span
                                                className={
                                                    `status-dot ${
                                                        isOnline
                                                            ? "online"
                                                            : "offline"
                                                    }`
                                                }
                                            />

                                        </div>

                                        <div className="user-info">

                                            <div className="user-name">

                                                {user.name}

                                            </div>

                                            <div
                                                className={
                                                    isOnline
                                                        ? "online-text"
                                                        : "offline-text"
                                                }
                                            >

                                                {isOnline
                                                    ? "Online"
                                                    : "Offline"}

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>

                {/* ================================= */}
                {/* RIGHT CHAT PANEL */}
                {/* ================================= */}

                <div className="chat-panel">

                    {selectedUser ? (

                        <>

                            {/* ================================= */}
                            {/* CHAT HEADER */}
                            {/* ================================= */}

                            <div className="chat-header">

                                <div className="chat-user">

                                    <div className="profile-wrapper">

                                        <div className="profile-logo">

                                            {selectedUser.name
                                                ?.charAt(0)
                                                ?.toUpperCase()}

                                        </div>

                                        {/* ONLINE DOT */}

                                        <span
                                            className={
                                                `status-dot ${
                                                    isUserOnline(
                                                        selectedUser._id
                                                    )
                                                        ? "online"
                                                        : "offline"
                                                }`
                                            }
                                        />

                                    </div>

                                    <div>

                                        <h3>
                                            {
                                                selectedUser.name
                                            }
                                        </h3>

                                        <span
                                            className={
                                                isUserOnline(
                                                    selectedUser._id
                                                )
                                                    ? "online-text"
                                                    : "offline-text"
                                            }
                                        >

                                            {
                                                isUserOnline(
                                                    selectedUser._id
                                                )
                                                    ? "Online"
                                                    : "Offline"
                                            }

                                        </span>

                                    </div>

                                </div>

                                <button
                                    className="chat-menu"
                                    title="More options"
                                >
                                    ⋮
                                </button>

                            </div>

                            {/* ================================= */}
                            {/* MESSAGES */}
                            {/* ================================= */}

                            <div
                                className="messages-area"
                                ref={
                                    messagesAreaRef
                                }
                            >

                                {messages.length === 0 ? (

                                    <div className="no-messages">

                                        <p>
                                            No messages yet.
                                        </p>

                                    </div>

                                ) : (

                                    messages.map(
                                        (msg) => (

                                            <div
                                                key={
                                                    msg.id
                                                }
                                                className={
                                                    `message-row ${
                                                        msg.sender ===
                                                        "me"
                                                            ? "message-right"
                                                            : "message-left"
                                                    }`
                                                }
                                            >

                                                <div
                                                    className={
                                                        `message-bubble ${
                                                            msg.sender ===
                                                            "me"
                                                                ? "my-message"
                                                                : "other-message"
                                                        }`
                                                    }
                                                >

                                                    <span>
                                                        {
                                                            msg.text
                                                        }
                                                    </span>

                                                    <small>
                                                        {
                                                            msg.time
                                                        }
                                                    </small>

                                                </div>

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                            {/* ================================= */}
                            {/* MESSAGE INPUT */}
                            {/* ================================= */}

                            <form
                                className="message-input-area"
                                onSubmit={
                                    handleSendMessage
                                }
                            >

                                <button
                                    type="button"
                                    className="emoji-btn"
                                >
                                    😊
                                </button>

                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={
                                        message
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setMessage(
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    type="submit"
                                    className="send-btn"
                                >
                                    ➤
                                </button>

                            </form>

                        </>

                    ) : (

                        /* ================================= */
                        /* EMPTY CHAT */
                        /* ================================= */

                        <div className="empty-chat">

                            <div className="empty-icon">
                                💬
                            </div>

                            <h2>
                                Welcome to Chat
                            </h2>

                            <p>
                                Select a user from the
                                left to start chatting.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default Dashboard;