const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../database');
const { JWT_SECRET, authenticateToken } = require('../authMiddleware');
const router = express.Router();

const validatePassword = (p) => /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/.test(p);
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());

router.post('/signup', async (req, res) => {
    const { name, email, password, address } = req.body;
    if (!name || name.length < 20 || !validateEmail(email) || !validatePassword(password) || !address) {
        return res.status(400).json({ message: 'Invalid input data. Please check all fields.' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        await query(`INSERT INTO Users (name, email, password, address, role) VALUES ($1, $2, $3, $4, 'Normal')`, [name, email, hash, address]);
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        res.status(400).json({ message: 'Email may already be in use.' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await query('SELECT * FROM Users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: payload });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});
router.put('/update-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    if (!validatePassword(newPassword)) return res.status(400).json({ message: 'Invalid password format.' });
    try {
        const hash = await bcrypt.hash(newPassword, 10);
        await query('UPDATE Users SET password = $1 WHERE id = $2', [hash, req.user.id]);
        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error("PASSWORD UPDATE ERROR:", error);
        res.status(500).json({ message: 'Could not update password.' });
    }
});
router.put('/profile', authenticateToken, async (req, res) => {
    const { name, email } = req.body;
    if (!name || name.length < 20 || !validateEmail(email)) return res.status(400).json({ message: 'Invalid name or email format.' });
    try {
        await query('UPDATE Users SET name = $1, email = $2 WHERE id = $3', [name, email, req.user.id]);
        const payload = { id: req.user.id, name, email, role: req.user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Profile updated successfully!', token });
    } catch (error) {
        console.error("PROFILE UPDATE ERROR:", error);
        res.status(400).json({ message: 'Email may already be in use.' });
    }
});
module.exports = router;