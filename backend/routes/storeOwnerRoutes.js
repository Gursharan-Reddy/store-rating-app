const express = require('express');
const { db } = require('../database');
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

// Apply authentication and role authorization middleware to all routes in this file.
router.use(authenticateToken, authorizeRole(['StoreOwner']));

// GET /api/store-owner/dashboard
router.get('/dashboard', (req, res) => {
    const ownerId = req.user.id;

    // First, find the store ID associated with the logged-in owner.
    const storeSql = `SELECT id FROM Stores WHERE ownerId = ?`;

    db.get(storeSql, [ownerId], (err, store) => {
        if (err) return res.status(500).json({ message: 'Database error finding store.' });
        if (!store) {
            return res.status(404).json({ message: 'No store found for this owner.' });
        }

        const storeId = store.id;

        // Two queries to get the average rating and the list of users who rated.
        const avgRatingSql = `SELECT AVG(rating) as averageRating FROM Ratings WHERE storeId = ?`;
        const ratersSql = `
            SELECT u.name, u.email, r.rating
            FROM Ratings r
            JOIN Users u ON r.userId = u.id
            WHERE r.storeId = ?
        `;

        // Run both queries concurrently.
        Promise.all([
            new Promise((resolve, reject) => db.get(avgRatingSql, [storeId], (err, row) => err ? reject(err) : resolve(row))),
            new Promise((resolve, reject) => db.all(ratersSql, [storeId], (err, rows) => err ? reject(err) : resolve(rows)))
        ])
        .then(([avgRatingResult, ratersList]) => {
            res.json({
                averageRating: avgRatingResult.averageRating ? avgRatingResult.averageRating.toFixed(2) : "0.00",
                raters: ratersList
            });
        })
        .catch(err => res.status(500).json({ message: 'Error fetching dashboard data.', error: err.message }));
    });
});

module.exports = router;