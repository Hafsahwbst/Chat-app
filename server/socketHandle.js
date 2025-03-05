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

    // Call user (initiate call)
    socket.on('call-user', ({ calleeId, caller, callType }) => {
      console.log(`Call initiated from ${caller.id} to ${calleeId} with call type: ${callType}`);
      io.to(calleeId).emit('incoming-call', { caller, callType });
  });

  // When the user accepts the call
  socket.on('call-accepted', ({ callerId, accepterId, roomId }) => {
      console.log(`Call accepted by ${accepterId}`);
      io.to(callerId).emit('call-accepted', { roomId, accepterId });
  });

  // When the user declines the call
  socket.on('call-declined', ({ userId, roomId }) => {
      console.log(`Call declined by ${userId}`);
      io.to(userId).emit('call-declined', { roomId });
  });

  // Sending ICE candidate
  socket.on('offer', ({ userId, signal, receiverId }) => {
      console.log(`Sending offer to ${userId}`);
      io.to(userId).emit('offer', { signal, receiverId });
  });

  // ICE candidate handling
  socket.on('ice-candidate', (candidate) => {
      console.log('Sending ICE candidate');
      socket.to(candidate.receiverId).emit('ice-candidate', candidate);
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

  socket.on('send-voice-message', (data) => {
    // Emit the voice message to the specified room
    socket.to(data.roomId).emit('receive-voice-message', {
      senderId: data.senderId,
      audioUrl: data.audioUrl,  // This is the URL of the uploaded audio file
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