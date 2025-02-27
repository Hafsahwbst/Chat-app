let onlineUsers = {}; // Mapping userId to socketId
const socektServer = async (socket, io) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id, ">>>id");

    // Check if the user exists already
    // const existingUser = onlineUsers[userData._id];
    // if (existingUser) {
    //   // Update socket id if user already exists in onlineUsers
    //   existingUser.socketId = socket.id;
    // } else {
    //   // If new user joins
    //   onlineUsers[userData._id] = {
    //     userId: userData._id,
    //     name: userData.username,
    //     socketId: socket.id,
    //   };
    // }

    // io.emit("get-online-users", onlineUsers);
  });

  socket.on("join-room", (roomId) => {
    console.log("roomId received:", roomId);
    if (roomId) {
      socket.join(roomId.toString()); // Join the room
      socket.to(roomId.toString()).emit("user-connected", socket.id); // Emit user connection
    }
  });

  socket.on("offer", ({ userId, signal }) => {
    io.to(userId).emit("offer", { signal, userId: socket.id });
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

  // Handling user-to-user call
  // socket.on("callUser", ({ userToCall, signalData, from }) => {
  //   console.log("Calling user:", userToCall);
  //   console.log("Signal data:", signalData);  // This should not be undefined
  //   console.log("From user:", from);

  //   if (onlineUsers[userToCall]) {
  //     io.to(onlineUsers[userToCall].socketId).emit("callIncoming", {
  //       signal: signalData,
  //       from,
  //     });
  //   } else {
  //     console.log("User not found for the call");
  //   }
  // });

  // // Answer call logic
  // socket.on("answerCall", (data) => {
  //   console.log("Answering call for:", data.to);
  //   console.log("Signal:", data.signal);

  //   if (onlineUsers[data.to]) {
  //     io.to(onlineUsers[data.to].socketId).emit("callAccepted", data.signal);
  //   } else {
  //     console.log("User not found for the call answer");
  //   }
  // });
  // socket.on("join-room", (roomId) => {
  //   console.log("roomId>>>>>>>>>>>>>>>>", roomId);
  //   socket.join(roomId?.toString());
  //   socket.to(roomId?.toString()).emit("user-connected", roomId);
  // });
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
