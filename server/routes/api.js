const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/reports', authenticateToken, upload.single('photo'), reportController.createReport);
router.get('/reports', authenticateToken, reportController.getAllReports);
router.patch('/reports/:id/status', authenticateToken, authorizeAdmin, reportController.updateStatus);
router.delete('/reports/:id', authenticateToken, authorizeAdmin, reportController.deleteReport);

// Public Routes
router.get('/stats', reportController.getStats);

module.exports = router;