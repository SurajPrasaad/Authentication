import User from "../models/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

// To register User
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
    console.log("User coming:::: ", user);
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
    console.log(error);
  }
};

//To Login User
const userLogin = async (req, res) => {
  //get email and password from body
  //validate email
  //decrypt password

  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    //
    const isVerifiedUser = user.isVerified;
    if (!isVerifiedUser) {
      return res.status(400).json({
        message: "Please Verified your email",
        success: false,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    const cookieOption = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("test", token, cookieOption);

    res.status(200).json({
      message: "Login Successful",
      success: true,
      token,
      user: {
        id: user._id,
        name: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

//To fetch profile
const userProfile = async (req, res) => {
  try {
    const id = req.user.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id not found",
      });
    }
    const existingUser = await User.findOne({ _id: id }).select("-password");
    console.log(existingUser);
    if (!existingUser) {
      return res.status(400).json({
        message: "User email not registered",
      });
    }
    const { _id, username, email, role, isVerified } = existingUser;
    return res.status(200).json({
      message: "Profile data fetch successful",
      user: { _id, username, email, role, isVerified },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found.." });
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });
    const resetURL = `http://localhost:8000/api/v1/users/reset-password?token=${resetToken}`;
    // TODO: send this URL via email
    console.log("Password reset URL:", resetURL);
    res.status(200).json({ message: "Password reset link sent to email" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } catch (error) {}
};

//reset password
const resetPassword = async (req, res) => {
  const token = req.query.token;
  const { newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiries: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token is invalid or expired" });

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiries = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//To Logout User
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Logout failed", error: err.message });
    }

    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
};

export {
  userRegister,
  verifyUser,
  userLogin,
  userProfile,
  forgotPassword,
  resetPassword,
  logoutUser,
};
