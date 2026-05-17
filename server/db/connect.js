import mongoose from "mongoose";

const connect = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job_findrr";
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    
    // Disable command buffering so that if DB connection fails, queries fail immediately instead of hanging
    mongoose.set("bufferCommands", false);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
    });
    console.log("Connected to Database!");
  } catch (error) {
    console.error("\n❌ MongoDB Connection Error!");
    console.error(`Reason: ${error.message}`);
    console.error("👉 Please ensure MongoDB is running locally, or configure a valid MONGO_URI in server/.env\n");
    console.warn("⚠️ Continuing server execution without MongoDB. Database operations will fail gracefully.");
  }
};

export default connect;
