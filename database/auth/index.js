const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const crypto = require('crypto');
const User = require('../../models/User');

const JWT_SECRET = process.env.JWT_SECRET || "arulzxd-super-secret-jwt-key";

// ==========================================
// 1. AUTENTIKASI VIA EMAIL & PASSWORD
// ==========================================

// Di dalam file ./database/auth/index.js
router.get('/', (req, res) => {
    res.json({
        status: true,
        message: "Auth router is working. Please use specific endpoints like /login or /register."
    });
});


// Route: Register Akun Baru
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ status: false, message: "Semua field wajib diisi!" });

    try {
        let userExist = await User.findOne({ email });
        if (userExist) return res.status(400).json({ status: false, message: "Email sudah terdaftar!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            provider: 'local',
            apikey: 'arulz-' + crypto.randomBytes(4).toString('hex')
        });

        res.status(201).json({ status: true, message: "Registrasi berhasil!", apikey: newUser.apikey });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Route: Login Akun Manual
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: false, message: "Email dan Password wajib diisi!" });

    try {
        const user = await User.findOne({ email });
        if (!user || user.provider !== 'local') return res.status(400).json({ status: false, message: "Kredensial salah atau akun terdaftar via OAuth!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ status: false, message: "Password salah!" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            status: true,
            message: "Login Berhasil! 👋",
            token,
            profile: { name: user.name, email: user.email, role: user.role, apikey: user.apikey }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// ==========================================
// 2. AUTENTIKASI VIA OAUTH (GOOGLE & GITHUB)
// ==========================================

// Google Auth Trigger
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google Callback Endpoint
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, JWT_SECRET, { expiresIn: '7d' });
    // Alihkan kembali ke dashboard utama Anda sembari melempar Token & API Key ke Frontend
    res.redirect(`/?token=${token}&apikey=${req.user.apikey}&name=${encodeURIComponent(req.user.name)}`);
});

// GitHub Auth Trigger
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

// GitHub Callback Endpoint
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/', session: false }), (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`/?token=${token}&apikey=${req.user.apikey}&name=${encodeURIComponent(req.user.name)}`);
});

module.exports = router;
