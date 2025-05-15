import { PrismaClient } from '../generated/prisma/index.js';

// import pkg from '@prisma/client';
// const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const registerUser = async () => {
  try {
    console.log("Registering User...");
    const user = await prisma.user.create({
      data: {
        name: "Suraj",
        email: "surajprasad31100874@gmail.com",
        password: "12450"
      }
    });
    console.log("User Created", user);
  } catch (err) {
    console.error("Error creating user:", err.message);
  }
};
