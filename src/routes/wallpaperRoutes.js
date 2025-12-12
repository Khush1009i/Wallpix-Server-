const express = require('express');
const router = express.Router();
const {
    getAllWallpapers,
    getCategories,
    getWallpaperById
} = require('../controllers/wallpaperController');

// @route   GET /api/wallpapers
// @desc    Get all wallpapers
router.get('/wallpapers', getAllWallpapers);

// @route   GET /api/wallpapers/:id
// @desc    Get single wallpaper
router.get('/wallpapers/:id', getWallpaperById);

// @route   GET /api/categories
// @desc    Get all categories
router.get('/categories', getCategories);

module.exports = router;
