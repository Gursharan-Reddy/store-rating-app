const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../database'); // Use the new query function
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const router = express.Router();

// Apply authentication and role authorization to all routes in this file.
router.use(authenticateToken, authorizeRole(['Admin']));

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        const usersPromise = query('SELECT COUNT(*) as "totalUsers" FROM Users');
        const storesPromise = query('SELECT COUNT(*) as "totalStores" FROM Stores');
        const ratingsPromise = query('SELECT COUNT(*) as "totalRatings" FROM Ratings');

        const [usersResult, storesResult, ratingsResult] = await Promise.all([usersPromise, storesPromise, ratingsPromise]);

        res.json({
            totalUsers: parseInt(usersResult.rows[0].totalUsers),
            totalStores: parseInt(storesResult.rows[0].totalStores),
            totalRatings: parseInt(ratingsResult.rows[0].totalRatings)
        });
    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        res.status(500).json({ message: 'Error fetching dashboard stats.' });
    }
});

// GET /api/admin/users (List and filter users)
router.get('/users', async (req, res) => {
    const { name, email, address, role } = req.query;
    let sql = `SELECT id, name, email, address, role FROM Users WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (name) { sql += ` AND name ILIKE $${paramIndex++}`; params.push(`%${name}%`); }
    if (email) { sql += ` AND email ILIKE $${paramIndex++}`; params.push(`%${email}%`); }
    if (address) { sql += ` AND address ILIKE $${paramIndex++}`; params.push(`%${address}%`); }
    if (role) { sql += ` AND role = $${paramIndex++}`; params.push(role); }

    try {
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching users for admin:", error);
        res.status(500).json({ message: 'Error fetching users.' });
    }
});


// ... (Other admin routes like POST /users and POST /stores would also be updated here)
// For now, let's focus on the GET routes to fix the immediate error.


module.exports = router;
