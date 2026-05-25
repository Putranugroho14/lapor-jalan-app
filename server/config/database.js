const fs = require('fs');
const path = require('path');

// Load .env jika ada (development lokal)
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    try {
        require('dotenv').config({ path: envPath });
    } catch (e) {
        console.warn('dotenv not loaded:', e.message);
    }
}

// TiDB Cloud menggunakan MySQL protocol dengan SSL wajib
// Format DATABASE_URL: mysql://user:password@host:4000/dbname?ssl-mode=VERIFY_IDENTITY
const tidbSSLConfig = {
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false,
    }
};

// Untuk Vercel Serverless: batas koneksi sangat kecil karena
// setiap function invocation bisa spawn instance baru
const serverlessPool = {
    max: 1,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 10000,
};

// Pool standar untuk server long-running (Railway, Render, dll)
const standardPool = {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
};

module.exports = {
    development: {
        // Jika DATABASE_URL ada di .env → pakai TiDB Cloud / MySQL remote
        // Jika tidak → fallback ke SQLite lokal
        ...(process.env.DATABASE_URL ? {
            use_env_variable: 'DATABASE_URL',
            dialect: 'mysql',
            dialectModule: require('mysql2'),
            dialectOptions: tidbSSLConfig,
            pool: standardPool,
            logging: false,
        } : {
            dialect: 'sqlite',
            storage: path.resolve(__dirname, '../database.sqlite'),
            logging: false,
        }),
    },

    production: {
        // Production WAJIB pakai DATABASE_URL (TiDB Cloud connection string)
        use_env_variable: 'DATABASE_URL',
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        dialectOptions: {
            ...tidbSSLConfig,
            connectTimeout: 60000,
        },
        // Vercel = serverless, jadi pool kecil
        pool: serverlessPool,
        logging: false,
    }
};

