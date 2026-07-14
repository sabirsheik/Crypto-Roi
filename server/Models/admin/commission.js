
// import mongoose from "mongoose";

// const commissionSchema = new mongoose.Schema({
//   receiver: {
//     id: { type: mongoose.Schema.Types.ObjectId, required: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true }
//   },
//   referralUser: {
//     id: { type: mongoose.Schema.Types.ObjectId, required: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true }
//   },
//   level: { type: Number, required: true },
//   commission: { type: Number, required: true },
//   plan: {
//     title: { type: String, required: false },
//     roi: { type: Number, required: false }
//   },
//   investment: { type: Number, required: true },
//   date: { type: Date, default: Date.now },
//   status: { type: String, enum: ["pending", "paid"], default: "pending" }
// }, {
//   timestamps: true
// });

// export default mongoose.model("Commission", commissionSchema);


import mongoose from "mongoose";
const commissionSchema = new mongoose.Schema({
  receiver: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  referralUser: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  level: { type: Number, required: true },
  commission: { type: Number, required: true },
  plan: {
    title: { type: String, required: false },
    roi: { type: Number, required: false }
  },
  investment: { type: Number, required: true },

  // ✅ Direct UK time set by default
status: {
  type: Boolean,
  default: false
},
  createdAt: { type: Date, default: Date.now }
}, 
 { timestamps: true }
  // ✅ createdAt / updatedAt auto UK time
);

export default mongoose.model("Commission", commissionSchema);
