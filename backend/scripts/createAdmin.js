
import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";

async function createAdmin() {
  try {
    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.ADMIN_NAME
    ) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
    }

    if (process.env.ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must contain at least 12 characters.");
    }

    await connectDB();

    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();

    let admin = await User.findOne({ email }).select("+password");

    if (admin) {
      admin.name = process.env.ADMIN_NAME;
      admin.role = "admin";
      admin.password = process.env.ADMIN_PASSWORD;
      await admin.save();
    } else {
      admin = await User.create({
        name: process.env.ADMIN_NAME,
        email,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
      });
    }

    console.log("Admin account created/updated successfully.");
    console.log("Admin email:", admin.email);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await User.db?.close();
  }
}

createAdmin();
