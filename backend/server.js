const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const appNext = next({ dev, dir: path.join(__dirname, "..") }); // point to Next.js root
const handle = appNext.getRequestHandler();

// Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
});

app.set("io", io);
let onlineUsers = 0; 

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);
  onlineUsers++;
  io.emit("online-count", onlineUsers);

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("online-count", onlineUsers);
  });
});

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Routes
const { router: userRoutes } = require("./routes/userRoutes");
const drinkRoutes = require("./routes/drinkRoutes");
const menuRoutes = require("./routes/menuRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const metricsRoutes = require("./routes/metricRoutes");

app.use("/api/stripe", stripeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drinks", drinkRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/metrics", metricsRoutes);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Start Next.js and fallback handler
appNext.prepare().then(() => {
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 5050;
  server.listen(PORT, () =>
    console.log(`🚀 Server + Next.js + Socket.IO running on port ${PORT}`)
  );
});
