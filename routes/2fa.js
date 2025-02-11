const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const isAuthenticated = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Render 2FA Verification Page
router.get("/2fa/verify", (req, res) => {
    if (!req.session.tempUser) return res.redirect("/login"); 
    res.render("2fa_verify", { error: null });
});

// Verify 2FA OTP
router.post("/2fa/verify", async (req, res) => {
    if (!req.session.tempUser) return res.redirect("/login");

    const user = await User.findById(req.session.tempUser);
    const { token } = req.body;

    const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token
    });

    if (verified) {
        req.session.user = user;
        delete req.session.tempUser;
        return res.redirect("/dashboard");
    } else {
        res.render("2fa_verify", { error: "Invalid OTP. Try again." });
    }
});

// Render 2FA Setup Page
router.get("/2fa/setup", isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user._id);

    // Generate a new secret key 
    if (!user.twoFASecret) {
        const secret = speakeasy.generateSecret({ length: 20 });
        user.twoFASecret = secret.base32;
        await user.save();
    }

    // Generate QR Code 
    const otpAuthUrl = `otpauth://totp/secure-app?secret=${user.twoFASecret}&issuer=testing`;
    qrcode.toDataURL(otpAuthUrl, (err, qrCodeData) => {
        if (err) return res.send("Error generating QR Code");
        res.render("2fa_setup", { qrCodeData, secret: user.twoFASecret, error: null });
    });
});

// Enable 2FA
router.post("/2fa/enable", isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user._id);
    const { token } = req.body;

    const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token
    });

    if (verified) {
        user.is2FAEnabled = true;
        await user.save();
        res.redirect("/dashboard");
    } else {
        res.render("2fa_setup", { error: "Invalid OTP. Try again." });
    }
});

module.exports = router;
