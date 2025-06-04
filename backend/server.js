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

const corsOptions = {
  origin: "http://localhost:8081", // Frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies if needed
};



app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/stripe", stripeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drinks", drinkRoutes);
app.use("/api/menu", menuRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
