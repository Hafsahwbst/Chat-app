import mongoose, { mongo, Types } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: "false" },
    latestMessage: { type: mongoose.Types.ObjectId, ref: "Message" },
    groupAdmin: { type: mongoose.Types.ObjectId, ref: "User" },
    filePath: { type: String, required: false },
    timestamp: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
