// Load environment variables PERTAMA sebelum imports lain
// Ini penting agar config database & JWT bisa membaca .env
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// --- Peringatan konfigurasi saat startup ---
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET tidak diset di environment production!');
    process.exit(1);
}
if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: DATABASE_URL tidak diset di environment production!');
    process.exit(1);
}

// --- CORS ---
// Izinkan origin yang terdaftar. Set FRONTEND_URL di env var production.
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
    origin: (origin, callback) => {
        // Izinkan request tanpa origin (mobile apps, Postman, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin '${origin}' tidak diizinkan.`));
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (lokal; di Vercel gunakan Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = require('./models');

// Health check
app.get('/api', (req, res) => {
    res.json({
        message: '🚧 Lapor Jalan Rusak API',
        status: 'running',
        env: process.env.NODE_ENV || 'development',
        db: process.env.DATABASE_URL ? 'TiDB Cloud (MySQL)' : 'SQLite (local)',
    });
});

// DB Connection Check
app.get('/api/db-check', async (req, res) => {
    try {
        await db.sequelize.authenticate();
        res.json({
            message: '✅ Database Connection State: ESTABLISHED',
            config: process.env.DATABASE_URL ? 'TiDB Cloud (MySQL)' : 'SQLite Local'
        });
    } catch (error) {
        res.status(500).json({ message: '❌ Database Connection Error', error: error.message });
    }
});

// API routes
app.use('/api', apiRoutes);

// Export untuk Vercel serverless
module.exports = app;

// Local development server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;

    db.sequelize.sync().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📦 Database: ${process.env.DATABASE_URL ? 'TiDB Cloud (MySQL)' : 'SQLite (local)'}`);
        });
    }).catch(err => {
        console.error('❌ Database sync failed:', err.message);
        process.exit(1);
    });
}