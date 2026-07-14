import SupportMessage from "../../Models/manager/MSupportMessage.js";
import { sendSupportEmail } from "../../utils/supportMessage.js";

// 📩 Create new message
export const createSupportMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newMessage = await SupportMessage.create({ name, email, message });

    // Send email to support (non-blocking)
    sendSupportEmail({ name, email, message }).catch(err => 
      console.error("Failed to send support email:", err)
    );

    res.status(201).json({
      success: true,
      message: "Support request sent successfully",
      data: newMessage,
    });
  } catch (err) {
    console.error("Error creating support message:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📜 Get all messages (Admin use)
export const getAllSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("Error fetching support messages:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
