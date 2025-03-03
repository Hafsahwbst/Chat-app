const users = {}; // to store connected users and their socket ids
let onlineUsers = {}; // Mapping userId to socketId
const socektServer = async (socket, io) => {
  socket.on("setup", (user) => {
    users[user._id] = socket.id;
    console.log("User:", user._id);
    socket.emit("connected");
  });

  // Handle room joining
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId; // Store the room ID on the socket for reference
    console.log(`User ${socket.id} joined room: ${roomId}`);

    // Notify other users in the room
    socket.to(roomId).emit("user-connected", socket.id);
  });

  // Handle call initiation
  socket.on("call-started", ({ receiverId, callerId }) => {
    if (!receiverId || !callerId) {
      return;
    }
    io.to(receiverId).emit("call-started", callerId);
  });

  socket.on("call-user", ({ calleeId, caller }) => {
    const roomId = caller.roomId || socket.roomId;
    const callerWithRoom = { ...caller, roomId };
    io.to(calleeId).emit("incoming-call", { caller: callerWithRoom });
  });

  socket.on("offer", ({ userId, signal, receiverId }) => {
    if (receiverId) {
      io.to(receiverId).emit("offer", {
        signal,
        receiverId: socket.id, // The recipient needs to know who to respond to
        caller: { id: socket.id },
      });
    }
  });

  socket.on("answer", ({ receiverId, signal }) => {
    io.to(receiverId).emit("answer", { signal });
  });

  // Handle call acceptance
  socket.on("call-accepted", ({ callerId, accepterId }) => {
    io.to(callerId).emit("call-accepted", { accepterId });
  });

  // Handle call declining
  socket.on("call-declined", ({ userId }) => {
    io.to(userId).emit("call-declined", { message: "User declined the call" });
  });

  // Handle ICE candidates
  socket.on("ice-candidate", ({ userId, candidate }) => {
    io.to(userId).emit("ice-candidate", { candidate });
  });

  // Handle room leaving
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    // Notify other users in the room
    socket.to(roomId).emit("user-disconnected", socket.id);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);

    // If the user was in a room, notify others
    if (socket.roomId) {
      socket.to(socket.roomId).emit("user-disconnected", socket.id);
    }
  });

  // Typing and stop typing functionality
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // Event to initiate an audio call (send the call info to the receiver)
  socket.on("initiate-call", (receiverId, senderId) => {
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", senderId);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove user from the onlineUsers list when they disconnect
    for (let userId in onlineUsers) {
      if (onlineUsers[userId].socketId === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    io.emit("get-online-users", onlineUsers);
  });
};

export default socektServer;
