const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: "default.jpg" },
  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  twoFASecret: { type: String, default: null },
  is2FAEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
