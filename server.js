// ===== Dependencies =====
const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const multer = require("multer");
const { Server } = require("socket.io");

// ===== App & Server Setup =====
const app = express();
const server = http.createServer(app);

// ===== Config =====
const FRONTEND_URL = "https://minniisocialsitee.netlify.app";
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, "uploads");

// ===== Middleware =====
// Log all incoming requests
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// Trim URLs to remove trailing spaces/newlines
app.use((req, res, next) => {
  req.url = req.url.trim();
  next();
});

// CORS
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));
app.options("*", cors());

// Parse JSON
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

// ===== Ensure Upload Folder Exists =====
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ===== Multer Setup =====
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ===== Routes =====
// Test route
app.get("/test", (req, res) => {
  res.json("Test is running!");
});

// File upload
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
app.use("/uploads", express.static(UPLOAD_DIR));

// ===== Start Server =====
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/test", (req, res) => {
  res.json("test is running!");
});



