// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);

// // Enable general CORS for Express (not necessary for Socket.IO)
// app.use(cors());

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("send_message", (data) => {
//     console.log("Message received:", data);
//     io.emit("receive_message", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// server.listen(3001, () => {
//   console.log("Server is running on http://localhost:3001");
// });
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

let connectedUsers = 0;

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`User connected: ${socket.id}. Total users: ${connectedUsers}`);
  
  // Send updated user count to all clients
  io.emit("users_count", connectedUsers);

  socket.on("send_message", (data) => {
    console.log("Message received:", data);
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.broadcast.emit("stop_typing", data);
  });

  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(`User disconnected: ${socket.id}. Total users: ${connectedUsers}`);
    io.emit("users_count", connectedUsers);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
