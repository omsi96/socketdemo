const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
let onlineUsers = [];
let typingUsers = [];

io.on("connection", (socket) => {
  const username = `${socket.id}`.substring(0, 4);
  const msg = username + " connected!";
  onlineUsers.push(username);
  io.emit("chat message", msg);
  io.emit("user connection", { onlineUsers });

  socket.on("disconnect", () => {
    const msg = `${username} disconnected!`;
    io.emit("chat message", msg);
    onlineUsers = onlineUsers.filter((user) => user !== username);
    io.emit("user disconnect", { onlineUsers });
  });

  socket.on("chat message", (msg) => {
    console.log("User sent message:", msg);
    socket.broadcast.emit("chat message", `${username}: ${msg}`);
  });

  socket.on("typing", (isTyping) => {
    const typerExist = typingUsers.includes(username);
    console.log("typer ", username, "is insluded? ", typerExist);
    if (isTyping) {
      if (typerExist) {
        // don't do anything
        return;
      } else {
        // user is not there
        typingUsers.push(username);
      }
    } else {
      if (!typerExist) {
        return;
      } else {
        typingUsers = typingUsers.filter((user) => user !== username);
      }
    }
    console.log(username + "is typing");
    socket.broadcast.emit("typing", { typingUsers });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
