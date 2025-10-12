const jwt = require('jsonwebtoken');
// IMPORTANT: In a real application, this secret key should be stored in an environment variable (.env file)
// and should be a long, complex, random string.
const JWT_SECRET = 'your-super-secret-key-for-jwt-that-is-long-and-secure';

/**
 * Middleware to authenticate a user's token.
 * It checks for the 'Authorization' header, verifies the JWT, and attaches the user's payload to the request object.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // The token is expected in the format: "Bearer TOKEN_STRING"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token was provided in the header.
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token using the secret key.
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token is invalid (e.g., expired, tampered).
            return res.status(403).json({ message: 'Forbidden. Invalid token.' });
        }
        // Attach the decoded user payload (e.g., { id: 1, role: 'Admin' }) to the request object.
        req.user = user;
        next(); // Proceed to the next middleware or the route handler.
    });
};

/**
 * Middleware factory to authorize a user based on their role.
 * This should be used *after* authenticateToken.
 * @param {Array<string>} roles - An array of roles that are allowed to access the route (e.g., ['Admin']).
 */
const authorizeRole = (roles) => {
    return (req, res, next) => {
        // Check if the user's role (from the decoded token) is included in the list of allowed roles.
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
        }
        next(); // User has the required role, proceed.
    };
};

module.exports = { authenticateToken, authorizeRole, JWT_SECRET };