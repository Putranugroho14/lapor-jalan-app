// Vercel Serverless Function Handler
try {
    const app = require('../server/server');
    module.exports = app;
} catch (error) {
    console.error('Server Startup Error:', error);
    // Return an error handler function for Vercel
    module.exports = (req, res) => {
        res.status(500).json({
            message: 'CRITICAL SERVER ERROR (Startup)',
            error: error.message,
            stack: error.stack
        });
    };
}
