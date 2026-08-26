import mongoose from "mongoose";

const connectDB= async ()=>{
     try {
       // console.log("Mongo URL:", process.env.MONGO_DB_URL);
        await mongoose.connect(process.env.MONGO_DB_URL);
      console.log("Database connected successfully");

     }
     catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
  }
}

export default connectDB;
