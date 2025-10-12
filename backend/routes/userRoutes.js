const express = require('express');
const { query } = require('../database'); // Use the new query function
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

// Apply authentication and role authorization to all routes in this file.
router.use(authenticateToken, authorizeRole(['Normal']));

// GET /api/users/stores (Updated for PostgreSQL)
router.get('/stores', async (req, res) => {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
    const userId = req.user.id;

    // Note the PostgreSQL syntax: COALESCE, double quotes for mixed-case column names, and $1, $2 for parameters.
    let sql = `
        SELECT 
            s.id, 
            s.name, 
            s.address, 
            COALESCE(AVG(r.rating), 0) as "overallRating",
            ur.rating as "userSubmittedRating"
        FROM Stores s
        LEFT JOIN Ratings r ON s.id = r."storeId"
        LEFT JOIN Ratings ur ON s.id = ur."storeId" AND ur."userId" = $1
        WHERE 1=1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (name) {
        sql += ` AND s.name ILIKE $${paramIndex++}`; // ILIKE is case-insensitive in PostgreSQL
        params.push(`%${name}%`);
    }
    if (address) {
        sql += ` AND s.address ILIKE $${paramIndex++}`;
        params.push(`%${address}%`);
    }

    sql += ` GROUP BY s.id, s.name, s.address, ur.rating`;

    // Basic sanitization for order by
    const validSortColumns = ['name', 'address', 'overallRating'];
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    if (validSortColumns.includes(sortBy)) {
        // Use double quotes for column names that might be mixed case from the query result
        sql += ` ORDER BY "${sortBy}" ${sortOrder}`;
    }

    try {
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching stores for user:", error);
        res.status(500).json({ message: 'Error fetching stores.' });
    }
});

// POST /api/users/ratings (Updated for PostgreSQL)
router.post('/ratings', async (req, res) => {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Store ID and a rating between 1 and 5 are required.' });
    }

    // PostgreSQL's "UPSERT" syntax
    const sql = `
        INSERT INTO Ratings ("userId", "storeId", rating) 
        VALUES ($1, $2, $3)
        ON CONFLICT ("userId", "storeId") 
        DO UPDATE SET rating = EXCLUDED.rating;
    `;
    
    try {
        await query(sql, [userId, storeId, rating]);
        res.status(201).json({ message: 'Rating submitted successfully.' });
    } catch (error) {
        console.error("Error submitting rating:", error);
        res.status(500).json({ message: 'Error submitting rating.' });
    }
});

module.exports = router;
