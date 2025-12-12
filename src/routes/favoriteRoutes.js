const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

// Get all favorites (of authenticated user)
router.get('/', favoriteController.getFavorites);

// Add favorite
router.post('/', favoriteController.addFavorite);

// Remove favorite
router.delete('/:wallpaperId', favoriteController.removeFavorite);

module.exports = router;
