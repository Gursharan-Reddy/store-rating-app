const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// The Pool will automatically use the DATABASE_URL environment variable.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Render's free tier
    }
});

const initializeDatabase = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log("PostgreSQL connected. Initializing database schema...");

        // Create tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY, name VARCHAR(60) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE, password TEXT NOT NULL,
                address VARCHAR(400), role VARCHAR(50) NOT NULL
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS Stores (
                id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE, address TEXT,
                "ownerId" INTEGER REFERENCES Users(id) ON DELETE SET NULL
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS Ratings (
                id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
                "storeId" INTEGER NOT NULL REFERENCES Stores(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                UNIQUE("userId", "storeId")
            );
        `);
        console.log("Tables created or already exist.");

        // --- Seed Admin User ---
        const adminEmail = 'admin@example.com';
        const adminRes = await client.query('SELECT * FROM Users WHERE email = $1', [adminEmail]);
        if (adminRes.rowCount === 0) {
            const hash = await bcrypt.hash('AdminPassword1!', 10);
            await client.query(
                `INSERT INTO Users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5)`,
                ['Default System Administrator', adminEmail, hash, '123 Admin Street, Hyderabad', 'Admin']
            );
            console.log("Default Admin user created.");
        }

        // --- ✅ Seed Sample Stores (Updated List) ---
        const storeRes = await client.query('SELECT COUNT(*) as count FROM Stores');
        if (storeRes.rows[0].count < 5) { // Check if there are fewer than 5 stores
            console.log("Seeding sample stores...");
            const stores = [
                { name: 'Paradise Biryani', email: 'contact@paradise.com', address: 'Paradise Circle, Secunderabad' },
                { name: 'Karachi Bakery', email: 'orders@karachibakery.com', address: 'Mozamjahi Market, Hyderabad' },
                { name: 'Pista House', email: 'info@pistahouse.com', address: 'Charminar, Hyderabad' },
                { name: 'Gokul Chat', email: 'help@gokulchat.com', address: 'Koti, Hyderabad' },
                { name: 'Shah Ghouse Cafe', email: 'contact@shahghouse.com', address: 'Tolichowki, Hyderabad' }
            ];

            // This loop will only insert stores that don't already exist.
            for (const store of stores) {
                await client.query(
                    `INSERT INTO Stores (name, email, address) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
                    [store.name, store.email, store.address]
                );
            }
            console.log("Sample stores seeding process complete.");
        }

    } catch (err) {
        console.error("FATAL: Error during database initialization:", err);
    } finally {
        if (client) {
            client.release();
            console.log("Database client released.");
        }
    }
};

initializeDatabase();

module.exports = {
    query: (text, params) => pool.query(text, params),
}