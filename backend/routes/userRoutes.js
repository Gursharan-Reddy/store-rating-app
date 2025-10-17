const express = require('express');
const { query } = require('../database');
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

router.use(authenticateToken, authorizeRole(['Normal']));

router.get('/stores', async (req, res) => {
    const userId = req.user.id;
    const { name, address } = req.query;

    const sql = `
        SELECT
            s.id,
            s.name,
            s.address,
            (SELECT COALESCE(AVG(rating), 0) FROM Ratings WHERE "storeId" = s.id) as "overallRating",
            (SELECT rating FROM Ratings WHERE "storeId" = s.id AND "userId" = $1) as "userSubmittedRating"
        FROM
            Stores s
        WHERE 1=1
    `;
    
    let filterClauses = "";
    const params = [userId];

    if (name) {
        params.push(`%${name}%`);
        filterClauses += ` AND s.name ILIKE $${params.length}`;
    }
    if (address) {
        params.push(`%${address}%`);
        filterClauses += ` AND s.address ILIKE $${params.length}`;
    }

    const finalSql = sql + filterClauses + " ORDER BY s.name ASC";

    try {
        const result = await query(finalSql, params);
        res.json(result.rows);
    } catch (error) {
        console.error("FATAL ERROR in userRoutes.js:", error);
        res.status(500).json({ message: 'A critical server error occurred while fetching stores.' });
    }
});

router.post('/ratings', async (req, res) => {
    const { storeId, rating } = req.body;
    const userId = req.user.id;
    if (!storeId || rating < 1 || rating > 5) return res.status(400).json({ message: 'Invalid rating data.' });
    const sql = `
        INSERT INTO Ratings ("userId", "storeId", rating) VALUES ($1, $2, $3)
        ON CONFLICT ("userId", "storeId") DO UPDATE SET rating = EXCLUDED.rating
    `;
    try {
        await query(sql, [userId, storeId, rating]);
        res.status(201).json({ message: 'Rating submitted successfully.' });
    } catch (error) {
        console.error("RATING SUBMISSION ERROR:", error);
        res.status(500).json({ message: 'Failed to submit rating.' });
    }
});

module.exports = router;