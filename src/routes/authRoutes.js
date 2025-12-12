const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/delete-otp', authMiddleware, authController.requestDeleteOtp);
router.get('/users', authController.getAllUsers);
router.post('/downloads', authMiddleware, authController.recordDownload); // Record a download
router.get('/downloads', authMiddleware, authController.getUserDownloads); // Get user's download history
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

module.exports = router;
