const fs = require('fs');
const path = require('path');

const usersDbPath = path.join(__dirname, '../data/users.json');
const wallpapersDbPath = path.join(__dirname, '../data/db.json');

// Helper to read Users DB
const readUsersDb = () => {
    try {
        const data = fs.readFileSync(usersDbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
};

// Helper to write Users DB
const writeUsersDb = (data) => {
    fs.writeFileSync(usersDbPath, JSON.stringify(data, null, 4));
};

// Helper to read Wallpapers DB
const readWallpapersDb = () => {
    try {
        const data = fs.readFileSync(wallpapersDbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { wallpapers: [] };
    }
};

// Add a favorite wallpaper
exports.addFavorite = async (req, res) => {
    try {
        const { wallpaperId } = req.body || {};
        const userId = req.user.id;

        if (!wallpaperId) {
            return res.status(400).json({ message: 'Wallpaper ID is required' });
        }

        const usersDb = readUsersDb();
        const userIndex = usersDb.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = usersDb.users[userIndex];

        // Initialize favorites if not present
        if (!user.favorites) {
            user.favorites = [];
        }

        // Check if already favorite
        // Ensure we compare types correctly (wallpaperId from body might be string/int)
        // Storing as Integer usually, assuming wallpaper IDs are ints.
        const idToAdd = parseInt(wallpaperId);

        if (user.favorites.includes(idToAdd)) {
            return res.status(400).json({ message: 'Wallpaper already in favorites' });
        }

        // Check if wallpaper exists in DB (Optional but good practice)
        const wallpapersDb = readWallpapersDb();
        const wallpaperExists = wallpapersDb.wallpapers.find(w => w.id === idToAdd);
        if (!wallpaperExists) {
            return res.status(404).json({ message: 'Wallpaper not found' });
        }

        user.favorites.push(idToAdd);
        usersDb.users[userIndex] = user;
        writeUsersDb(usersDb);

        res.json({ message: 'Added to favorites', favorites: user.favorites });

    } catch (error) {
        console.error('Add Favorite Error:', error);
        res.status(500).json({ message: 'Server error adding favorite' });
    }
};

// Remove a favorite wallpaper
exports.removeFavorite = async (req, res) => {
    try {
        const { wallpaperId } = req.params;
        const userId = req.user.id;

        const usersDb = readUsersDb();
        const userIndex = usersDb.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = usersDb.users[userIndex];

        if (!user.favorites) {
            user.favorites = [];
            return res.status(400).json({ message: 'No favorites found' });
        }

        const idToRemove = parseInt(wallpaperId);
        const initialLength = user.favorites.length;
        user.favorites = user.favorites.filter(favId => favId !== idToRemove);

        if (user.favorites.length === initialLength) {
            return res.status(404).json({ message: 'Wallpaper not in favorites' });
        }

        usersDb.users[userIndex] = user;
        writeUsersDb(usersDb);

        res.json({ message: 'Removed from favorites', favorites: user.favorites });

    } catch (error) {
        console.error('Remove Favorite Error:', error);
        res.status(500).json({ message: 'Server error removing favorite' });
    }
};

// Get all favorites
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const usersDb = readUsersDb();
        const user = usersDb.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const favoriteIds = user.favorites || [];

        if (favoriteIds.length === 0) {
            return res.json([]);
        }

        // Fetch actual wallpaper details
        const wallpapersDb = readWallpapersDb();
        const favoriteWallpapers = wallpapersDb.wallpapers.filter(w => favoriteIds.includes(w.id));

        res.json(favoriteWallpapers);

    } catch (error) {
        console.error('Get Favorites Error:', error);
        res.status(500).json({ message: 'Server error fetching favorites' });
    }
};
