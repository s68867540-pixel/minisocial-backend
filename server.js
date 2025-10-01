const express = require('express');
const multer = require('multer');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Routes
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ url: `http://localhost:3000/uploads/${req.file.filename}`, type: req.file.mimetype });
});

// Socket.io for chat
io.on('connection', socket => {
  console.log('A user connected');

  socket.on('sendMessage', msg => {
    io.emit('receiveMessage', msg);
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(3000, () => console.log('Server running at http://localhost:3000'));
