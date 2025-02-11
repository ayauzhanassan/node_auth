require("dotenv").config();
const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");

const app = express();
connectDB();

// Serve static files
app.use(express.static("public")); 

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

// View Engine
app.set("view engine", "ejs");

// Routes
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/dashboard"));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

