const express = require('express');
const { db } = require('../database');
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

// Apply authentication and role authorization middleware to all routes in this file.
router.use(authenticateToken, authorizeRole(['Normal']));

// GET /api/users/stores (List and search stores from a normal user's perspective)
router.get('/stores', (req, res) => {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
    const userId = req.user.id;

    // This complex query does the following:
    // 1. Joins Stores with Ratings to calculate the average rating (overallRating).
    // 2. LEFT JOINs Ratings again specifically for the current user (ur) to get their specific rating (userSubmittedRating).
    let sql = `
        SELECT
            s.id,
            s.name,
            s.address,
            COALESCE(AVG(r.rating), 0) as overallRating,
            ur.rating as userSubmittedRating
        FROM Stores s
        LEFT JOIN Ratings r ON s.id = r.storeId
        LEFT JOIN Ratings ur ON s.id = ur.storeId AND ur.userId = ?
        WHERE 1=1
    `;
    const params = [userId];

    if (name) { sql += ` AND s.name LIKE ?`; params.push(`%${name}%`); }
    if (address) { sql += ` AND s.address LIKE ?`; params.push(`%${address}%`); }

    sql += ` GROUP BY s.id, s.name, s.address`;

    const validSortColumns = ['name', 'address', 'overallRating'];
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
     if (validSortColumns.includes(sortBy)) {
        sql += ` ORDER BY ${sortBy} ${sortOrder}`;
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error fetching stores.', error: err.message });
        res.json(rows);
    });
});

// POST /api/users/ratings (Submit or update a rating for a store)
router.post('/ratings', (req, res) => {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Store ID and a rating between 1 and 5 are required.' });
    }

    // Using "INSERT OR REPLACE" is a concise SQLite-specific way to handle this.
    // It will INSERT a new row if the (userId, storeId) pair doesn't exist,
    // or UPDATE the existing row if it does.
    // This is possible because of the UNIQUE constraint on (userId, storeId) in the table schema.
    const sql = `
        INSERT INTO Ratings (userId, storeId, rating)
        VALUES (?, ?, ?)
        ON CONFLICT(userId, storeId)
        DO UPDATE SET rating = excluded.rating;
    `;

    db.run(sql, [userId, storeId, rating], function(err) {
        if (err) return res.status(500).json({ message: 'Error submitting rating.', error: err.message });
        res.status(201).json({ message: 'Rating submitted successfully.' });
    });
});

module.exports = router;