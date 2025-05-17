import { PrismaClient } from '../generated/prisma/index.js';
import crypto from "crypto";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { ApiResponse } from '../utils/ApiResponse.js';

const prisma = new PrismaClient();

export const registerUser = async (req, res) => {
  try {
    console.log("Registering User...");
    const { name, email, password,role = 'USER' } = req.body;

    // Input validation
    if (!name || !email || !password) {
     return res.status(400).json(new ApiResponse(false, "Name, email, and password are required."))
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json(new ApiResponse(false, "User with this email already exists."));
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(30).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken: token,
        role
      },
    });

    console.log("User Created:", user);

     return res.status(201).json(new ApiResponse(true, "User registered successfully."));

  } catch (err) {
    console.error("Error creating user:", err.message);
    return res.status(500).json(new ApiResponse(false, "Internal server error."));
  }
};


const JWT_SECRET = process.env.JWT_SECRET || "shh";
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(new ApiResponse(false, "Email and password are required."));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json(new ApiResponse(false, "Invalid email or password."));
    }

    if (!user.isVerified) {
      return res.status(403).json(new ApiResponse(false, "Please verify your email before logging in."));
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json(
      new ApiResponse(true, "Login successful.", {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      })
    );
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json(new ApiResponse(false, "Internal server error."));
  }
};



export const verifyUser = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json(new ApiResponse(false, "Verification token is missing."));
  }

  const user = await prisma.user.findFirst({ where: { verificationToken: token } });

  if (!user) {
    return res.status(400).json(new ApiResponse(false, "Invalid or expired token."));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  return res.status(200).json(new ApiResponse(true, "Email verified successfully."));
};
