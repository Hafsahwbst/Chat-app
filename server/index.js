import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./Routes/authRoute.js";
import userRoute from "./Routes/userRoute.js";
import friendRoute from "./Routes/friendRoute.js";
import chatRoute from "./Routes/chatRoute.js";
import messageRoute from "./Routes/messageRoute.js";

import dotenv from "dotenv";
import db from "./config/db/connection.js";
const PORT = process.env;
dotenv.config();
import * as Server from "socket.io";
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

db();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./uploads"));
app.use("/", authRoute);
app.use("/user", userRoute);
app.use("/", friendRoute);
app.use("/", chatRoute);
app.use("/", messageRoute);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

const io = new Server.Server(server, {
  pingTimeout: 60000, //the amount of tim eit will wait being inactive like if anyone is bot active till 60 secods it is going to close the bandwisdth
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // for typing functionality
  socket.on("typing", (room) => socket.in(room).emit("typing"));
//for stop typing
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("friend-request", (data) => {
    const {senderId,recieverId } = data
    if (userData[recieverId]) { 
      io.to(userData[recieverId].emit(`Friend request recieved `,{senderId}))
    }
  })

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});