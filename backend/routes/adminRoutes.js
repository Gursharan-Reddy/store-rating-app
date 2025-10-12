const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../database');
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

router.use(authenticateToken, authorizeRole(['Admin']));

router.get('/dashboard-stats', async (req, res) => {
    try {
        const [usersResult, storesResult, ratingsResult] = await Promise.all([
            query('SELECT COUNT(*) FROM Users'),
            query('SELECT COUNT(*) FROM Stores'),
            query('SELECT COUNT(*) FROM Ratings'),
        ]);
        res.json({
            totalUsers: usersResult.rows[0].count,
            totalStores: storesResult.rows[0].count,
            totalRatings: ratingsResult.rows[0].count,
        });
    } catch (error) {
        console.error("ADMIN STATS ERROR:", error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
    }
});
router.get('/users', async (req, res) => {
    try {
        const result = await query('SELECT id, name, email, address, role FROM Users ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("ADMIN FETCH USERS ERROR:", error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});
router.get('/stores', async (req, res) => {
    const sql = `
        SELECT s.id, s.name, s.email, s.address, COALESCE(AVG(r.rating), 0) as rating
        FROM Stores s LEFT JOIN Ratings r ON s.id = r."storeId"
        GROUP BY s.id ORDER BY s.name ASC
    `;
    try {
        const result = await query(sql);
        res.json(result.rows);
    } catch (error) {
        console.error("ADMIN FETCH STORES ERROR:", error);
        res.status(500).json({ message: 'Failed to fetch stores.' });
    }
});
router.post('/users', async (req, res) => {
    const { name, email, password, address, role, storeName, storeEmail, storeAddress } = req.body;
    if (!name || name.length < 20 || !email || !password || !address || !role) return res.status(400).json({ message: "User details are incomplete." });
    if (role === 'StoreOwner' && (!storeName || !storeEmail || !storeAddress)) return res.status(400).json({ message: "Store details are required." });
    try {
        const hash = await bcrypt.hash(password, 10);
        const userResult = await query(`INSERT INTO Users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [name, email, hash, address, role]);
        const newUserId = userResult.rows[0].id;
        if (role === 'StoreOwner') {
            await query(`INSERT INTO Stores (name, email, address, "ownerId") VALUES ($1, $2, $3, $4)`, [storeName, storeEmail, storeAddress, newUserId]);
        }
        res.status(201).json({ id: newUserId });
    } catch (error) {
        console.error("ADMIN CREATE USER/STORE ERROR:", error);
        res.status(400).json({ message: 'A user email, store name, or store email may already exist.' });
    }
});
module.exports = router;