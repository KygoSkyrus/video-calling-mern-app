const http = require("http");
const express = require("express");
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('my socket id:', socket.id)

  // Join room
  // socket.on('join-room', (roomId) => {
  //     console.log('join-room:',roomId)
  //   socket.join(roomId);
  //   socket.to(roomId).emit('user-joined', socket.id);
  // });

  // Signal data exchange
  socket.on('initiateCall', ({ userId, signalData, myId }) => {
    console.log('signal: ')
    io.to(userId).emit('incomingCall', { signalData, from: myId });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`server is running at ${port}`));