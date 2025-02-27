import User from "../Models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId, {
      email: 1,
      username: 1,
      phoneNo: 1,
      address: 1,
      bio: 1,
      avatar: 1,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    console.log("UserId>>>>>>", userId);
    const updateData = req.body;
    console.log(req.body);

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    console.log(req.userId, ">>>>>REq");

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "User profile deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the profile" });
  }
};

export const authoriseUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  res.status(200).json({ allowed: true });
};

export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).send("Please upload a valid image");
  }
  res.send("Single file uploaded successfully");
};

export const allusers = async (req, res) => {
  const userId = req.user.id;
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {}; // If no search query, return all users

  const users = await User.find({
    ...keyword,
    _id: { $ne: userId },  // Exclude the current user
  });

  res.send(users);
};

