const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: "default.jpg" },
  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
});

module.exports = mongoose.model("User", userSchema);
