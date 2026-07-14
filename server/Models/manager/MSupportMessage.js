import mongoose from "mongoose";

const SupportMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true
  }
}, { timestamps: true });

export default mongoose.model("SupportMessage", SupportMessageSchema);
