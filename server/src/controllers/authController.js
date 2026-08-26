import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
// import mongoose from "mongoose";

const handelusersingup = async (req, res) => {
    const {name, email, password}=req.body;
    console.log(req.body);    
    
      // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(201).json({
            success: false,
            message: "User already exists",
        });
    }

    const user = await userModel.create({name,email, password});
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
}


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);

  // Check if user already exists
  const existingUser = await userModel.findOne({ email });
  // console.log(existingUser)
  if (!existingUser) {
    return res.status(201).json({
      success: false,
      message: "User does not exists",
    });
  }

  // console.log(existingUser.email);
  // console.log(existingUser.password);

  if (email == existingUser.email && password == existingUser.password) {

   // genreate jwt sign
    const token = jwt.sign({
      useId: existingUser.id,
      email: existingUser.email
    }, process.env.JWT_SECRET, { expiresIn: "1h", });
  
    //  console.log("token is genrated plz checkk")
    //  console.log(token)

    return res.status(201).json({
      success: true,
      message: "user login successfully",
      token: token,
      user:{name:existingUser.name,email:existingUser.email,id:existingUser.id}
    });
  }else{
    return res.status(201).json({
      success: false,
      message: "password is not correct",
    });
  }

}


export { handelusersingup, loginUser};
// export const registerUser = async (req, res) => {
//   // create user
// };

// export const loginUser = async (req, res) => {
//   // verify user
//   // generate JWT
// };