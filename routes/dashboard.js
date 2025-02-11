const express = require("express");
const multer = require("multer");
const isAuthenticated = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Dashboard
router.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.session.user });
});

// Multer Storage Config
const storage = multer.diskStorage({
    destination: "public/uploads/",
    filename: (req, file, cb) => {
        cb(null, req.session.user._id + "-" + Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Upload Profile Picture
router.post("/upload", isAuthenticated, upload.single("profilePic"), async (req, res) => {
    if (!req.file) return res.send("No file uploaded");

    try {
        const user = await User.findById(req.session.user._id);
        user.profilePic = req.file.filename;
        await user.save();
        req.session.user.profilePic = user.profilePic; // Update picture
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Error uploading file");
    }
});


// Edit Username
router.post("/edit", isAuthenticated, async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findById(req.session.user._id);
        user.username = username;
        await user.save();
        req.session.user.username = username; // Update username
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Error updating profile");
    }
});

// Delete Account
router.post("/delete", isAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.session.user._id);
        req.session.destroy(() => res.redirect("/register"));
    } catch (error) {
        res.send("Error deleting account");
    }
});



module.exports = router;
