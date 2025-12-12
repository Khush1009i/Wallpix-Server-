const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const wallpaperRoutes = require('./routes/wallpaperRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api', wallpaperRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', require('./routes/favoriteRoutes'));


// Root Endpoint
app.get('/', (req, res) => {
    res.send(`
        <h1>WallPix Server is Running 🚀</h1>
        <p>Try these endpoints:</p>
        <ul>
            <li><a href="/api/wallpapers">/api/wallpapers</a> - Get all wallpapers</li>
            <li><a href="/api/categories">/api/categories</a> - Get all categories</li>
            <li>POST /api/auth/signup - Create account</li>
            <li>POST /api/auth/login - Login</li>
        </ul>
    `);
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`👉 API Endpoint: http://localhost:${PORT}/api/wallpapers\n`);
});
