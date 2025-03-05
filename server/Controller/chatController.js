import Chat from "../Models/chatModel.js";
import User from "../Models/userModel.js";

// Access chat or create a new one if it doesn't exist
export const accessChat = async (req, res) => {
  const userId = req.body.userId;

  // Check if the chat already exists
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage",
    select: "username avatar email",
  });

  if (isChat.length > 0) {
    return res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId], // Both users must be included here
    };

    try {
      const createdChat = await Chat.create(chatData);

      // Populate chat with user details and latest message
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "-password")
        .populate("latestMessage");

      return res.status(200).json(fullChat);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
};

// Fetch all chats for the current user
export const fetchChats = async (req, res) => {
  try {
    const results = await Chat.find({
      users: { $elemMatch: { $eq: req.user.id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender", // Populate sender details for the latest message
          select: "username avatar email", // Select relevant fields for sender
        },
      })
      .sort({ updatedAt: -1 }); // Sort chats by updatedAt, latest chat first

    // Send the results back to the client
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new group chat
export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  const users = req.body.users; // Now it's an array directly
  users.push(req.user); // Add the current user (admin) to the group

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Rename a group chat
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    // Find the chat and update its name
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true } // It will return the updated value, else the old value will be returned
    )
      .populate("users", "-password") // Populate users without the password field
      .populate("groupAdmin", "-password"); // Populate groupAdmin without the password field

    // Check if the chat was found and updated
    if (!updatedChat) {
      return res.status(404).json({ message: "No chat found" }); // Return 404 if chat is not found
    }    // Successfully updated the chat, return 200 with the updated chat data
    return res.status(200).json(updatedChat); 
  } catch (error) {
    console.error("Error renaming group:", error); // Log the error for debugging
    return res.status(500).json({ message: "Server error" }); // Return 500 in case of an error
  }
};

// Add a user to the group
export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    return res.status(400).json({ message: "Chat not found" });
  } else {
    return res.json(added);
  }
};

// Remove a user from the group
export const removefromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return res.status(400).json({ message: "Chat not found" });
  } else {
    return res.json(removed);
  }
};


// Delete a group
export const deleteGroupChat = async (req, res) => {
  const { chatId } = req.body;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.groupAdmin._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only admin can delete the group" });
    }

    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while deleting group" });
  }
};


export const voiceMessage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('Audio uploaded:', req.file);
  const audioUrl = `/uploads/voiceMessages/${req.file.filename}`;
  res.json({ audioUrl });
}