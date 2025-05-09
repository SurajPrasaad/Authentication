import User from "../models/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const userRegister = async (req, res) => {
  //get data
  //validate data
  //check if already exists
  //create a user in database
  //create a verification token
  //save token in database
  //send token as email to user
  //send success status to user

  const { username, email, password } = req.body || {};

  console.log(req.body);

  console.log(username, email, password);
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required...",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists.",
      });
    }
    const user = await User.create({ email, username, password });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        message: "User not registered..",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    // console.log(token);
    user.verificationToken = token;

    await user.save();

    //send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_TRAP_HOST,
      port: process.env.MAIL_TRAP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_TRAP_USER,
        pass: process.env.MAIL_TRAP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_SENDER_EMAIL,
      to: user.email,
      subject: "Hello, Verify your email ✔",
      text: `please click of below given link
            ${process.env.BASE_URI}/api/v1/users/verify/${token}
            `, // plain‑text body
      html: `Hello ${user.username} <a href=${process.env.BASE_URI}/api/v1/users/verify/${token}>Verify Link</a>`, // HTML body
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      message: "User registered Successfully..",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "User not register..",
      error,
      success: false,
    });
  }
};

//To Verify User
const verifyUser = async (req, res) => {
  //get token from url
  //validate token
  //find user based on token
  //if not
  //set isVerifiedToken true
  //remove verification token
  //save
  //return response

  const { token } = req.params;
  console.log(token);

  if (!token) {
    return res.status(400).json({
      message: "Token Not Found..",
    });
  }

  try {
    const user = await User.findOne({ verificationToken: token });
    console.log("User coming:::: ",user)
    if (!user) {
      return res.status(400).json({
        message: "Token Not Found..",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined; // undefined, agar kabhi set nahi kiya || null , janbhujkar set nahi kiya
    // delete user.verificationToken;

    await user.save();
  } catch (error) {
    console.log(error)
  }
};
export { userRegister, verifyUser };
