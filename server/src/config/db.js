import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
    try {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
        const connection = await mongoose.connect(process.env.MONGO_DB_URL);

        console.log("MongoDB connected successfully");
        console.log("Database:", connection.connection.name);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        throw error;
    }
};

export default connectDB;