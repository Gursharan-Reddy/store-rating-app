const express = require('express');
const { query } = require('../database'); // Use the new query function
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

// Apply authentication and role authorization to all routes in this file.
router.use(authenticateToken, authorizeRole(['StoreOwner']));

// GET /api/store-owner/dashboard
router.get('/dashboard', async (req, res) => {
    const ownerId = req.user.id;

    try {
        const storeResult = await query('SELECT id FROM Stores WHERE "ownerId" = $1', [ownerId]);
        if (storeResult.rowCount === 0) {
            return res.status(404).json({ message: 'No store found for this owner.' });
        }
        const storeId = storeResult.rows[0].id;
        
        const avgRatingSql = `SELECT AVG(rating) as "averageRating" FROM Ratings WHERE "storeId" = $1`;
        const ratersSql = `
            SELECT u.name, u.email, r.rating 
            FROM Ratings r
            JOIN Users u ON r."userId" = u.id
            WHERE r."storeId" = $1
        `;

        const [avgRatingResult, ratersResult] = await Promise.all([
            query(avgRatingSql, [storeId]),
            query(ratersSql, [storeId])
        ]);

        const averageRating = avgRatingResult.rows[0].averageRating;

        res.json({
            averageRating: averageRating ? parseFloat(averageRating).toFixed(2) : "0.00",
            raters: ratersResult.rows
        });

    } catch (error) {
        console.error("Error fetching store owner dashboard:", error);
        res.status(500).json({ message: 'Error fetching dashboard data.' });
    }
});

module.exports = router;
