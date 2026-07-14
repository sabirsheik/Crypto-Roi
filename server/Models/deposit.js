import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  email: { type: String, required: true },
  paymentMethod: { type: String, default: "manual", enum: ["manual"] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  screenshot: { type: String },
  transactionId: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  mlmProcessed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Deposit', depositSchema);
