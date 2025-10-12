const express = require('express');
const { query } = require('../database');
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

router.use(authenticateToken, authorizeRole(['StoreOwner']));

router.get('/dashboard', async (req, res) => {
    const ownerId = req.user.id;
    try {
        const storeResult = await query('SELECT id FROM Stores WHERE "ownerId" = $1', [ownerId]);
        if (storeResult.rowCount === 0) return res.status(404).json({ message: 'No store found for this owner.' });
        
        const storeId = storeResult.rows[0].id;
        const avgSql = `SELECT AVG(rating) as "averageRating" FROM Ratings WHERE "storeId" = $1`;
        const ratersSql = `
            SELECT u.name, u.email, r.rating FROM Ratings r
            JOIN Users u ON r."userId" = u.id WHERE r."storeId" = $1
        `;
        const [avgResult, ratersResult] = await Promise.all([
            query(avgSql, [storeId]), query(ratersSql, [storeId])
        ]);
        const avg = avgResult.rows[0].averageRating;
        res.json({
            averageRating: avg ? parseFloat(avg).toFixed(2) : "0.00",
            raters: ratersResult.rows
        });
    } catch (error) {
        console.error("STORE OWNER DASHBOARD ERROR:", error);
        res.status(500).json({ message: 'Failed to fetch dashboard data.' });
    }
});

module.exports = router;