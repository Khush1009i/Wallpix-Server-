const db = require('../data/db.json');
const fs = require('fs');
const path = require('path');

// Get all wallpapers (with optional category filter)
const getAllWallpapers = (req, res) => {
    try {
        const { category, device } = req.query;

        let allWallpapers = db.wallpapers;

        if (category) {
            // Filter by category (case-insensitive)
            allWallpapers = allWallpapers.filter(w =>
                w.category && w.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (device) {
            // Filter by device type (mobile, desktop, tablet)
            allWallpapers = allWallpapers.filter(w =>
                w.deviceType && w.deviceType.toLowerCase() === device.toLowerCase()
            );
        }

        res.status(200).json({
            success: true,
            count: allWallpapers.length,
            data: allWallpapers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get all categories
const getCategories = (req, res) => {
    try {
        // Derive categories dynamically from wallpapers if not in db.categories, 
        // but db object has 'categories' array usually. 
        // If db.categories is static, we might want to update it or dynamically fetch unique categories.
        // The user wanted updated categories. My script only updated db.wallpapers.
        // I should probably update this to return dynamic categories to be accurate!
        // But for now, let's stick to what's in DB or derive it.
        // Let's derive it to be safe and accurate to the 295 wallpapers.

        const uniqueCategories = [...new Set(db.wallpapers.map(w => w.category))].sort();

        res.status(200).json({
            success: true,
            count: uniqueCategories.length,
            data: uniqueCategories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get single wallpaper by ID
const getWallpaperById = (req, res) => {
    try {
        const { id } = req.params;

        let wallpaper;

        // Check if ID is numeric
        if (!isNaN(id)) {
            const intId = parseInt(id);
            wallpaper = db.wallpapers.find(w => w.id === intId);
        }

        if (!wallpaper) {
            return res.status(404).json({ success: false, message: "Wallpaper not found" });
        }

        res.status(200).json({
            success: true,
            data: wallpaper
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getAllWallpapers,
    getCategories,
    getWallpaperById
};
