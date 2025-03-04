const users = {}; // to store connected users and their socket ids

const socketServer = async (socket, io) => {
  console.log("New socket connection:", socket.id);
  
  // User setup
  socket.on("setup", (user) => {
    if (user && user._id) {
      users[user._id] = socket.id;
      console.log(`User ${user._id} connected with socket ${socket.id}`);
      socket.emit("connected");
    } else {
      console.error("Invalid user data during setup");
    }
  });

  // Handle room joining
  socket.on("join-room", (roomId) => {
    if (!roomId) {
      console.error("Attempted to join room with invalid roomId");
      return;
    }
    
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("user-connected", socket.id);
  });

  // Call requests
  socket.on("call-user", ({ calleeId, caller, callType }) => {
    console.log(`Call request: ${caller.id} is calling ${calleeId} (${callType})`);
    
    if (!calleeId || !caller || !caller.id) {
      console.error("Invalid call request data");
      return;
    }
    
    // Include roomId in the call data
    const callData = {
      caller: {
        id: caller.id,
        username: caller.username || "User",
        roomId: caller.roomId
      },
      callType: callType
    };
    
    // Send to specific user
    const calleeSocketId = users[calleeId];
    if (calleeSocketId) {
      console.log(`Sending incoming-call to ${calleeId} (socket: ${calleeSocketId})`);
      io.to(calleeSocketId).emit("incoming-call", callData);
    } else {
      console.error(`User ${calleeId} is not connected`);
      // Notify caller that user is not available
      io.to(socket.id).emit("call-failed", { reason: "user-unavailable" });
    }
  });

  // WebRTC signaling
  socket.on("offer", ({ signal, receiverId }) => {
    console.log(`Offer from ${socket.id} to ${receiverId}`);
    
    if (!receiverId) {
      console.error("Missing receiverId in offer");
      return;
    }
    
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("offer", {
        signal,
        from: socket.id
      });
    } else {
      console.error(`Cannot send offer: Recipient ${receiverId} not found`);
    }
  });

  socket.on("answer", ({ signal, to }) => {
    console.log(`Answer from ${socket.id} to ${to}`);
    
    if (!to) {
      console.error("Missing 'to' in answer");
      return;
    }
    
    io.to(to).emit("answer", { signal, from: socket.id });
  });

  // ICE candidates
  socket.on("ice-candidate", ({ candidate, to }) => {
    console.log(`ICE candidate from ${socket.id} to ${to}`);
    
    if (!to) {
      console.error("Missing 'to' in ice-candidate");
      return;
    }
    
    io.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  // Call acceptance/rejection
  socket.on('call-accepted', (data) => {
    const { callerId, accepterId, roomId } = data;
    console.log(`Call accepted: ${accepterId} accepted call from ${callerId}`);
    
    if (!callerId || !accepterId) {
      console.error("Missing data in call-accepted");
      return;
    }
    
    const callerSocketId = users[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-accepted', { 
        accepterId,
        accepterSocketId: socket.id,
        roomId
      });
    } else {
      console.error(`Caller ${callerId} is not connected`);
    }
  });

  socket.on('call-declined', (data) => {
    const { userId } = data;
    console.log(`Call declined: Call to ${userId} was declined`);
    
    if (!userId) {
      console.error("Missing userId in call-declined");
      return;
    }
    
    const callerSocketId = users[userId];
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-declined');
    } else {
      console.error(`User ${userId} is not connected`);
    }
  });

  // Call ended
  socket.on('end-call', ({ roomId }) => {
    console.log(`Call ended in room ${roomId}`);
    if (roomId) {
      socket.to(roomId).emit('call-ended');
    }
  });

  // Chat messaging
  socket.on("typing", (room) => {
    if (room) {
      socket.to(room).emit("typing");
    }
  });
  
  socket.on("stop typing", (room) => {
    if (room) {
      socket.to(room).emit("stop typing");
    }
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    
    if (!chat || !chat.users) {
      console.error("Invalid message data - missing chat or users");
      return;
    }
    
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      
      // Send to user's room
      socket.to(user._id).emit("message received", newMessageReceived);
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
    
    // Find and remove user from the users object
    for (const userId in users) {
      if (users[userId] === socket.id) {
        console.log(`User ${userId} disconnected`);
        delete users[userId];
        break;
      }
    }
    
    // Notify rooms that this user was in
    if (socket.roomId) {
      socket.to(socket.roomId).emit("user-disconnected", socket.id);
    }
  });
};

export default socketServer;