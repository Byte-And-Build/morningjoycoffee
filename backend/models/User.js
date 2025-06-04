const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rewards: { type: Number, default: 0 },
  role: { type: String,
    enum: ["Customer", "Employee", "Admin"],
    default: "Customer",
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const User = mongoose.model("User", userSchema);

module.exports = User;