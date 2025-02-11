const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("login", { error: null });
});

// Render Register Page with Errors
router.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// Render Login Page with Errors
router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// Register User
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
        return res.render("register", { error: "All fields are required" });
    }
    if (password.length < 6) {
        return res.render("register", { error: "Password must be at least 6 characters long" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render("register", { error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });

        res.redirect("/login");
    } catch (error) {
        res.render("register", { error: "Server error, please try again" });
    }
});

// Login User
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render("login", { error: "All fields are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) return res.render("login", { error: "User not found" });

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.render("login", { error: "Account locked. Try again later." });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.failedAttempts += 1;

            if (user.failedAttempts >= 5) {
                user.lockUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
            }

            await user.save();
            return res.render("login", { error: "Incorrect password" });
        }

        // Reset failed attempts if login is successful
        user.failedAttempts = 0;
        user.lockUntil = null;
        await user.save();

        req.session.user = user;
        res.redirect("/dashboard");
    } catch (error) {
        res.render("login", { error: "Server error, please try again" });
    }
});


// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
