const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { router: userRoutes } = require("./routes/userRoutes");
const drinkRoutes = require("./routes/drinkRoutes");
const menuRoutes = require("./routes/menuRoutes");

dotenv.config();

const app = express();
const stripeRoutes = require("./routes/stripeRoutes");

app.use(bodyParser.json({ limit: "10mb" })); // or higher if needed
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

const helmet = require("helmet");
const corsOptions = {
  origin: [
    "http://localhost:8081",               // ✅ frontend dev
    "http://localhost:5050",               // optional, backend itself
    "https://morningjoycoffee-8807d101e92a.herokuapp.com" // ✅ production
  ],
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["*", "data:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["*"],
      },
    },
  })
);

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update with frontend URL in production
    methods: ["GET", "POST"]
  }
});

app.set("io", io); // Attach io instance to express
app.use(express.json());
app.use("/api/stripe", stripeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drinks", drinkRoutes);
app.use("/api/menu", menuRoutes);

const path = require("path");

app.use(express.static(path.join(__dirname, "../client/out")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/out/index.html"));
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5050;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// SOCKET .IO
server.listen(PORT, () => console.log(`Server + Socket.IO running on port ${PORT}`));

