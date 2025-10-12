const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../database'); // Use the new query function
const { JWT_SECRET, authenticateToken } = require('../authMiddleware');
const router = express.Router();

// --- Validation Helper Functions ---
const validatePassword = (password) => {
    // Requires 8-16 characters, at least 1 uppercase letter, 1 special character.
    const re = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/;
    return re.test(password);
};

const validateEmail = (email) => {
    // Standard email format validation.
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};


// --- Authentication Routes (Updated for PostgreSQL) ---

/**
 * Route for new "Normal" users to register.
 */
router.post('/signup', async (req, res) => {
    const { name, email, password, address } = req.body;

    // --- Server-side Validations ---
    if (!name || name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
    }
    if (!email || !validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!password || !validatePassword(password)) {
        return res.status(400).json({ message: 'Password must be 8-16 characters, with one uppercase letter and one special character.' });
    }
    if (!address || address.length > 400) {
        return res.status(400).json({ message: 'Address cannot exceed 400 characters.' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO Users (name, email, password, address, role) VALUES ($1, $2, $3, $4, 'Normal')`;
        await query(sql, [name, email, hash, address]);
        res.status(201).json({ message: 'User created successfully. Please log in.' });
    } catch (error) {
        // This error typically occurs if the email is not unique.
        console.error("Signup Error:", error);
        res.status(400).json({ message: 'This email address is already registered.' });
    }
});


/**
 * Route for any user to log in.
 */
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
        console.error("Login error:", error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
});


/**
 * Route for any authenticated user to update their own password.
 */
router.put('/update-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id;

    if (!validatePassword(newPassword)) {
        return res.status(400).json({ message: 'Password must be 8-16 characters, with one uppercase letter and one special character.' });
    }

    try {
        const hash = await bcrypt.hash(newPassword, 10);
        const sql = `UPDATE Users SET password = $1 WHERE id = $2`;
        await query(sql, [hash, userId]);
        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error("Password Update Error:", error);
        res.status(500).json({ message: 'Could not update password.' });
    }
});


/**
 * Route for any authenticated user to update their own profile (name and email).
 */
router.put('/profile', authenticateToken, async (req, res) => {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!name || name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
    }
    if (!email || !validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        const sql = `UPDATE Users SET name = $1, email = $2 WHERE id = $3`;
        const result = await query(sql, [name, email, userId]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const payload = { id: userId, name: name, email: email, role: req.user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Profile updated successfully!', token: token });
    } catch (error) {
        console.error("Profile Update Error:", error);
        // This error is likely because the new email already exists (UNIQUE constraint).
        res.status(400).json({ message: 'Email may already be in use by another account.' });
    }
});


module.exports = router;

