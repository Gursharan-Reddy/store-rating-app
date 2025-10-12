const express = require('express');
const cors = require('cors');
// The database connection is implicitly initialized when this module is required.
require('./database');

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const storeOwnerRoutes = require('./routes/storeOwnerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing for the React frontend (running on a different port).
app.use(cors());
// Parse incoming JSON request bodies.
app.use(express.json());

// --- API Routes ---
// Mount the imported route handlers to specific base paths.
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/store-owner', storeOwnerRoutes);

// --- Root Endpoint ---
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Store Rating API!' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});