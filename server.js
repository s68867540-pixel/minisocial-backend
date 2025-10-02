const express = require("express");
const http = require("http");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// ===== Chat System =====
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// ===== File Upload Setup =====
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// File upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    url: `https://minisocial-backend.onrender.com/uploads/${req.file.filename}`,
    type: req.file.mimetype
  });
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
