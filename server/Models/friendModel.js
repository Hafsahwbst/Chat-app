import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  requests:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
