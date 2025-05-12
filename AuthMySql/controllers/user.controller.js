import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import connection from "../utils/db.js";

const registerUser = async (req, res) => {
  const { username, email, password } = req.body || {};
  console.log(req.body);
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required...",
    });
  }
  try {
    // Check if user already exists
    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create the user
    const [insertResult] = await connection.query(
      "INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, verificationToken]
    );

    if (!insertResult.insertId) {
      return res.status(400).json({ message: "User not registered.." });
    }

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_TRAP_HOST,
      port: process.env.MAIL_TRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_TRAP_USER,
        pass: process.env.MAIL_TRAP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_SENDER_EMAIL,
      to: email,
      subject: "Hello, Verify your email ✔",
      text: `Please click the link below to verify your email:
      ${process.env.BASE_URI}/api/v1/users/verify/${verificationToken}`,
      html: `Hello ${username}, <br><a href="${process.env.BASE_URI}/api/v1/users/verify/${verificationToken}">Click here to verify your email</a>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "User registered successfully..",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "User not registered..",
      error,
      success: false,
    });
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ message: "Token Not Found.." });
  try {
    const existingUser = await connection.query(
      "SELECT * FROM users where verification_token = ? ",
      [token]
    );
    await connection.query(
      "UPDATE users SET is_verified = ?, verification_token = NULL WHERE verification_token = ?",
      [true, token]
    );
    return res.status(200).json({ message: "User Verfied" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: "All fields are required." });
  try {
    const user = await connection.query("SELECT * from users where email = ?", [
      email,
    ]);
    console.log(user[0][0].password);
    if (!user)
      return res.status(400).json({ message: "Invalid email or password.." });

    const isMatch = await bcrypt.compare(password, user[0][0].password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Check if verified
    if (!user[0][0].is_verified) {
      return res.status(400).json({
        message: "Please verify your email",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user[0][0].id,
        email: user[0][0].email,
        username: user[0][0].username,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error,
    });
  }
};
export { registerUser, verifyUser, loginUser };
