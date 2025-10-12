const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
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

// --- Authentication Routes ---

/**
 * Route for new "Normal" users to register.
 */
router.post('/signup', (req, res) => {
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

    // Hash the password for security before storing it in the database.
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password.' });
        }

        const sql = `INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, 'Normal')`;
        db.run(sql, [name, email, hash, address], function(err) {
            if (err) {
                // This error typically occurs if the email is not unique.
                return res.status(400).json({ message: 'This email address is already registered.' });
            }
            res.status(201).json({ message: 'User created successfully. Please log in.' });
        });
    });
});

/**
 * Route for any user to log in.
 * This version uses async/await for cleaner, more readable code and robust error handling.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // A single try/catch block handles all potential errors gracefully.
    try {
        const sql = `SELECT * FROM Users WHERE email = ?`;

        // Promisify the database call to use it with await
        const user = await new Promise((resolve, reject) => {
            db.get(sql, [email], (err, row) => {
                if (err) return reject(err); // Reject on database error
                resolve(row); // Resolve with the user or null
            });
        });

        // Check if user exists AND if the password matches in a single, efficient line.
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // If successful, create and send the token
        const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        // This block catches any crash, like a database connection error
        console.error("An error occurred during the login process:", error);
        return res.status(500).json({ message: 'A server error occurred.' });
    }
});

/**
 * Route for any authenticated user to update their own password.
 */
router.put('/update-password', authenticateToken, (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id;

    if (!validatePassword(newPassword)) {
        return res.status(400).json({ message: 'Password must be 8-16 characters, with one uppercase letter and one special character.' });
    }

    bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing new password.' });
        }

        const sql = `UPDATE Users SET password = ? WHERE id = ?`;
        db.run(sql, [hash, userId], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Could not update password.' });
            }
            res.json({ message: 'Password updated successfully.' });
        });
    });
});

/**
 * Route for any authenticated user to update their own profile (name and email).
 */
router.put('/profile', authenticateToken, (req, res) => {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!name || name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
    }
    if (!email || !validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    const sql = `UPDATE Users SET name = ?, email = ? WHERE id = ?`;
    db.run(sql, [name, email, userId], function (err) {
        if (err) {
            return res.status(400).json({ message: 'Email may already be in use by another account.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Issue a new token with the updated user details so the frontend stays in sync.
        const payload = { id: user.id, name: name, email: email, role: req.user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Profile updated successfully!',
            token: token
        });
    });
});

module.exports = router;