import mongoose from 'mongoose'; // Fixed typo here

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;