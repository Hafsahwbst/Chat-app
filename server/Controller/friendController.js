import User from "../Models/userModel.js";
import Friend from "../Models/friendModel.js";

// Fetch all users
export const allusers = async (req, res) => {
  try {
    const user = await User.find({});
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }
    res.status(200).json({ message: "User data", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId: requestsId } = req.body;
    const senderId = req.user.id;

    console.log(requestsId, ">>>> receiver ID");
    console.log(senderId, ">>>> sender ID");

    if (senderId === requestsId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if there's already a pending friend request
    const existingRequest = await Friend.findOne({
      $or: [
        { sender: senderId, requests: requestsId, status: "pending" },
        { sender: requestsId, requests: senderId, status: "pending" },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Check if the users are already friends
    const alreadyFriends = await Friend.findOne({
      $or: [
        { sender: senderId, requests: requestsId, status: "accepted" },
        { sender: requestsId, requests: senderId, status: "accepted" },
      ],
    });

    if (alreadyFriends) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Create a new friend request with status 'pending'
    const newRequest = new Friend({
      sender: senderId,
      requests: requestsId,
      status: "pending",
    });

    await newRequest.save();

    // Send both sender and receiver information in response
    const populatedRequest = await Friend.findById(newRequest._id)
      .populate("sender", "username email")
      .populate("requests", "username email")
      .exec();

    res.status(201).json({
      status: true,
      message: "Friend request sent",
      friendRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestsId } = req.body;
    const senderId = req.user.id;

    const request = await Friend.findOne({
      _id: requestsId,
      requests: senderId,
      status: "pending",
    });
    if (!request) {
      return res
        .status(400)
        .json({ message: "Request not found or already accepted or declined" });
    }
    request.status = "accepted";
    await request.save();

    // Reverse the request and mark as accepted
    const reverseRequest = new Friend({
      sender: senderId,
      requests: request.sender,
      status: "accepted",
    });
    await reverseRequest.save();

    // Add the users to their friends list
    await User.findByIdAndUpdate(senderId, {
      $addToSet: { friends: request.requests },
    });

    await User.findByIdAndUpdate(request.requests, {
      $addToSet: { friends: senderId },
    });

    // Populate the request data
    const populatedRequest = await Friend.findById(request._id)
      .populate("sender", "username email")
      .populate("requests", "username email")
      .exec();

    res.status(200).json({ message: "Friend request accepted", request: populatedRequest });
  } catch (error) {
    console.error("Error accepting friend request", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Decline a friend request
export const declineFriendRequest = async (req, res) => {
  const { requestsId } = req.body;
  try {
    const friendRequest = await Friend.findById(requestsId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    await Friend.findByIdAndDelete(requestsId);
    await User.findByIdAndUpdate(friendRequest.sender, {
      $pull: { sentRequests: requestsId },
    });
    await User.findByIdAndUpdate(friendRequest.receiver, {
      $pull: { receivedRequests: requestsId },
    });

    return res
      .status(200)
      .json({ message: "Friend request declined successfully" });
  } catch (error) {
    console.error("Error declining friend request:", error);
    return res.status(500).json({ message: "Error declining friend request" });
  }
};

// Get all received friend requests
export const recievedRequests = async (req, res) => {
  try {
    const senderId = req.user.id;
    const recievedFriends = await Friend.find({
      requests: senderId,
      status: "pending",
    })
      .populate("sender", "username email")
      .exec();
    if (!recievedFriends || recievedFriends.length === 0) {
      return res.status(200).json({ message: "No pending friend requests" });
    }
    return res.status(200).json(recievedFriends);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a friend request or friendship
export const deleteRequest = async (req, res) => {
  const { friendId } = req.body;
  const userId = req.user.id;

  console.log(friendId, ">>>> friendId in delete");
  console.log(userId, ">>>> userId in delete");

  try {
    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }

    const friendRecord = await Friend.findOne({
      $or: [
        { sender: userId, requests: friendId },
        { sender: friendId, requests: userId },
      ],
      status: "accepted",
    });

    if (!friendRecord) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Remove the friendship by setting the status to declined
    await Friend.updateOne(
      { _id: friendRecord._id },
      { $set: { status: "declined" } }
    );

    // Update user models to remove from the friends list
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    return res.status(200).json({
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all friends of a user
export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all accepted friend requests for the user
    const acceptedRequests = await Friend.find({
      $or: [
        { sender: userId, status: "accepted" },
        { requests: userId, status: "accepted" },
      ],
    }).populate("sender requests");

    // Use a Set to store unique friends' user IDs to avoid duplicates
    const friendsSet = new Set();

    // Iterate over the accepted requests and add unique friends to the Set
    acceptedRequests.forEach((request) => {
      const friend = String(request.sender._id) === String(userId)
        ? request.requests
        : request.sender;

      friendsSet.add(friend._id.toString());
    });

    // Convert Set to an array and fetch friend details from the User model
    const friends = await User.find({ '_id': { $in: [...friendsSet] } });

    res.status(200).json({
      success: true,
      friends,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching friends",
    });
  }
};
