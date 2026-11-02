
import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI.includes("PASTE_YOUR_")) {
    throw new Error(
      "MONGODB_URI is missing. Please configure backend/.env"
    );
  }

  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB Atlas Connected Successfully!");
};

export default connectDB;
