
import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";

const ADMIN_NAME = "THANGAMAYIL Admin";
const ADMIN_EMAIL = "admin@thangamayil.com";
const ADMIN_PASSWORD = "Thangamayil@Admin2026";

async function createAdmin() {
  try {
    await connectDB();

    let admin = await User.findOne({
      email: ADMIN_EMAIL,
    }).select("+password");

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.password = ADMIN_PASSWORD;
      admin.role = "admin";
      await admin.save();
    } else {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
      });
    }

    console.log("Admin account created successfully!");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password:", ADMIN_PASSWORD);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
}

createAdmin();
