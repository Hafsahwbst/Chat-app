import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./Routes/authRoute.js";
import userRoute from "./Routes/userRoute.js";
import friendRoute from "./Routes/friendRoute.js";
import chatRoute from "./Routes/chatRoute.js";
import messageRoute from "./Routes/messageRoute.js";
import SocketServer from './socketHandle.js'

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
  pingTimeout: 60000, //the amount of time it will wait being inactive like if anyone is bot active till 60 secods it is going to close the bandwisdth
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket", socket.id);
  SocketServer(socket,io)
});
