import Message from "../Models/messsageModel.js";
import User from "../Models/userModel.js";
import Chat from "../Models/chatModel.js";

export const allMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username avatar")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMsg = async (req, res) => {
  try {
    const { chatId } = req.body;
    const message = await Message.findByIdAndDelete({ chatId });
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
