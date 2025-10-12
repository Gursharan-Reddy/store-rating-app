const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../database');
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

// Apply authentication and role authorization middleware to all routes in this file.
router.use(authenticateToken, authorizeRole(['Admin']));

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', (req, res) => {
    const queries = [
        db.get.bind(db, `SELECT COUNT(*) as totalUsers FROM Users`),
        db.get.bind(db, `SELECT COUNT(*) as totalStores FROM Stores`),
        db.get.bind(db, `SELECT COUNT(*) as totalRatings FROM Ratings`)
    ];

    // Use Promise.all to run all count queries concurrently for efficiency.
    Promise.all(queries.map(q => new Promise((resolve, reject) => q((err, row) => err ? reject(err) : resolve(row)))))
        .then(results => {
            res.json({
                totalUsers: results[0].totalUsers,
                totalStores: results[1].totalStores,
                totalRatings: results[2].totalRatings
            });
        })
        .catch(err => res.status(500).json({ message: 'Error fetching dashboard stats.', error: err.message }));
});


// POST /api/admin/users (Add a new user of any role)
router.post('/users', (req, res) => {
    const { name, email, password, address, role } = req.body;
    // Basic validation
    if (!name || !email || !password || !address || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }
    if (!['Admin', 'Normal', 'StoreOwner'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified." });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: "Error hashing password" });
        const sql = `INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [name, email, hash, address, role], function(err) {
            if (err) return res.status(400).json({ message: "Failed to create user. Email may already exist.", error: err.message });
            res.status(201).json({ message: 'User created', id: this.lastID });
        });
    });
});

// POST /api/admin/stores (Add a new store)
router.post('/stores', (req, res) => {
    const { name, email, address, ownerId } = req.body;
     if (!name || !email || !address) {
        return res.status(400).json({ message: "Name, email, and address are required." });
    }
    const sql = `INSERT INTO Stores (name, email, address, ownerId) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, address, ownerId], function(err) {
        if (err) return res.status(400).json({ message: 'Failed to create store. Email may already exist.', error: err.message });
        res.status(201).json({ message: 'Store created', id: this.lastID });
    });
});

// GET /api/admin/users (List and filter users)
router.get('/users', (req, res) => {
    const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;
    let sql = `SELECT id, name, email, address, role FROM Users WHERE 1=1`;
    const params = [];

    if (name) { sql += ` AND name LIKE ?`; params.push(`%${name}%`); }
    if (email) { sql += ` AND email LIKE ?`; params.push(`%${email}%`); }
    if (address) { sql += ` AND address LIKE ?`; params.push(`%${address}%`); }
    if (role) { sql += ` AND role = ?`; params.push(role); }

    const validSortColumns = ['name', 'email', 'address', 'role'];
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    if (validSortColumns.includes(sortBy)) {
        sql += ` ORDER BY ${sortBy} ${sortOrder}`;
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching users.' });
        res.json(rows);
    });
});

// GET /api/admin/stores (List and filter stores with their average ratings)
router.get('/stores', (req, res) => {
    const { name, email, address, sortBy = 'name', order = 'ASC' } = req.query;
    let sql = `
        SELECT s.id, s.name, s.email, s.address, COALESCE(AVG(r.rating), 0) as rating
        FROM Stores s
        LEFT JOIN Ratings r ON s.id = r.storeId
        WHERE 1=1
    `;
    const params = [];

    if (name) { sql += ` AND s.name LIKE ?`; params.push(`%${name}%`); }
    if (email) { sql += ` AND s.email LIKE ?`; params.push(`%${email}%`); }
    if (address) { sql += ` AND s.address LIKE ?`; params.push(`%${address}%`); }

    sql += ` GROUP BY s.id, s.name, s.email, s.address`;

    const validSortColumns = ['name', 'email', 'address', 'rating'];
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    if (validSortColumns.includes(sortBy)) {
        sql += ` ORDER BY ${sortBy} ${sortOrder}`;
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching stores.' });
        res.json(rows);
    });
});

module.exports = router;