import mongoose from "mongoose";
import env from "../env";

export const connectMongo = async () => {
  try {
    await mongoose.connect(env.database_url as string);
    console.log("✅ Mail Connected to database");
  } catch (error) {
    console.error("❌ Database connection failed", error);
    process.exit(1);
  }
};
