// ===== Dependencies =====
const express = require("express");
const http = require("http");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

// ===== App & Server Setup =====
const app = express();
const server = http.createServer(app);

// ===== CORS Setup =====
const FRONTEND_URL = "https://minniisocialsitee.netlify.app";

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.options("*", cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

// ===== Middleware =====
app.use(express.json());

// ===== Socket.io Setup =====
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ===== File Upload Setup =====
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ===== File Upload Route =====
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
