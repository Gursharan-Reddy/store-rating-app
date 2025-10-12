const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Connect to the SQLite database file. A new file will be created if it doesn't exist.
// Using '.verbose()' provides more detailed stack traces for easier debugging.
const db = new sqlite3.Database('/data/store_ratings.db', (err) => {
    if (err) {
        return console.error("Error connecting to database:", err.message);
    }
    console.log("Database connected successfully.");
    // Once connected, proceed to create the necessary tables and seed initial data.
    createTablesAndSeedData();
});

const createTablesAndSeedData = () => {
    // db.serialize() ensures that the database commands are executed in sequence.
    db.serialize(() => {
        console.log("Initializing database schema and data...");

        // 1. Create Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                address TEXT CHECK(length(address) <= 400),
                role TEXT NOT NULL CHECK(role IN ('Admin', 'Normal', 'StoreOwner'))
            );
        `);

        // 2. Create Stores Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                address TEXT,
                ownerId INTEGER,
                FOREIGN KEY (ownerId) REFERENCES Users(id) ON DELETE CASCADE
            );
        `);

        // 3. Create Ratings Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                storeId INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (storeId) REFERENCES Stores(id) ON DELETE CASCADE,
                UNIQUE(userId, storeId) -- Prevents a user from rating the same store twice.
            );
        `);

        console.log("Tables created or already exist.");

        // 4. Seed a Default Admin User (only if one doesn't exist)
        const adminEmail = 'admin@example.com';
        const adminPassword = 'AdminPassword1!';

        db.get('SELECT * FROM Users WHERE email = ?', [adminEmail], (err, row) => {
            if (err) return console.error("Error checking for admin user:", err.message);

            if (!row) {
                bcrypt.hash(adminPassword, 10, (err, hash) => {
                    if (err) return console.error("Error hashing password:", err.message);

                    db.run(
                        `INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
                        ['Default System Administrator', adminEmail, hash, '123 Admin Street, Hyderabad', 'Admin'],
                        (err) => {
                            if (err) console.error("Error creating default admin:", err.message);
                            else console.log(`Default Admin created. Email: ${adminEmail}, Password: ${adminPassword}`);
                        }
                    );
                });
            }
        });

        // 5. Seed Sample Stores (only if the table is empty)
        db.get('SELECT COUNT(*) as count FROM Stores', (err, row) => {
            if (err) return console.error("Error checking for stores:", err.message);

            if (row.count === 0) {
                console.log("No stores found, adding sample stores...");
                const stores = [
                    { name: 'Paradise Biryani', email: 'contact@paradise.com', address: 'Paradise Circle, Secunderabad' },
                    { name: 'Karachi Bakery', email: 'orders@karachibakery.com', address: 'Mozamjahi Market, Hyderabad' },
                    { name: 'Pista House', email: 'info@pistahouse.com', address: 'Charminar, Hyderabad' },
                    { name: 'Gokul Chat', email: 'help@gokulchat.com', address: 'Koti, Hyderabad' }
                ];

                const stmt = db.prepare("INSERT INTO Stores (name, email, address) VALUES (?, ?, ?)");
                stores.forEach(store => stmt.run(store.name, store.email, store.address));
                stmt.finalize((err) => {
                    if (err) console.error("Error adding sample stores:", err.message);
                    else console.log("Sample stores added successfully.");
                });
            }
        });
    });
};

// Export the database connection object.
// This is the crucial line that allows other files (like your route handlers)
// to import and use this configured database connection.
module.exports = { db };