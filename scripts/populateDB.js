const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/db.json');

const unsplashImages = [
    { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", category: "Nature", title: "Beach Sunset" },
    { url: "https://images.unsplash.com/photo-1519681393784-d120267933ba", category: "Nature", title: "Snowy Mountains" },
    { url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e", category: "Nature", title: "Green Valley" },
    { url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d", category: "Nature", title: "Forest Path" },
    { url: "https://images.unsplash.com/photo-1501854140884-074bf6b243e7", category: "Nature", title: "Ocean View" },
    { url: "https://images.unsplash.com/photo-1531297461136-82lw8u9l2w4f", category: "Cyberpunk", title: "Neon Arcade" },
    { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", category: "Cyberpunk", title: "Matrix Coding" },
    { url: "https://images.unsplash.com/photo-1555685812-4b943f3db990", category: "Cyberpunk", title: "Tech City" },
    { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b", category: "Cyberpunk", title: "Cyber Security" },
    { url: "https://images.unsplash.com/photo-1480796927426-f609979314bd", category: "Architecture", title: "City Skyline" },
    { url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233", category: "Architecture", title: "Modern Home" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab", category: "Architecture", title: "High Rise" },
    { url: "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f", category: "Space", title: "Milky Way" },
    { url: "https://images.unsplash.com/photo-1454789548728-85d2696dd038", category: "Space", title: "Galaxy Swirl" },
    { url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa", category: "Space", title: "Earth From Orbit" },
    { url: "https://images.unsplash.com/photo-1529641484336-efd516613436", category: "Abstract", title: "Color Explosion" },
    { url: "https://images.unsplash.com/photo-1550684847-75bdda21cc95", category: "Abstract", title: "Purple Haze" },
    { url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab", category: "Abstract", title: "Paint Splash" },
    { url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e", category: "Nature", title: "Mountain Lake" },
    { url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9", category: "Nature", title: "Green Tree" },
    { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", category: "Nature", title: "Sunlight Forest" },
    { url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1", category: "Nature", title: "Morning Dew" },
    { url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8", category: "Nature", title: "Autumn Leaves" },
    { url: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107", category: "Technology", title: "Drone Shot" },
    { url: "https://images.unsplash.com/photo-1535223289827-42f1e9919769", category: "Technology", title: "VR Headset" },
    { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", category: "Technology", title: "Code Screen" },
    { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa", category: "Technology", title: "Global Network" },
    { url: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387", category: "Artificial Intelligence", title: "AI Robot" },
    { url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e", category: "Artificial Intelligence", title: "Futuristic Face" },
    { url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a", category: "Artificial Intelligence", title: "Neural Network" },
    { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2", category: "Technology", title: "Laptop Work" },
    { url: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931", category: "Technology", title: "Computer Components" },
    { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", category: "Minimal", title: "Code Editor" },
    { url: "https://images.unsplash.com/photo-1550439062-609e1531270e", category: "Minimal", title: "Pastel Geometric" },
    { url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85", category: "Minimal", title: "Simple shapes" }
];

const devices = ['mobile', 'desktop', 'tablet'];

try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    let lastId = 0;

    // Find highest ID
    if (data.wallpapers.length > 0) {
        lastId = Math.max(...data.wallpapers.map(w => w.id));
    }

    const newWallpapers = unsplashImages.map((img, index) => ({
        id: lastId + index + 1,
        title: img.title,
        imageUrl: img.url + "?q=80&w=1000&auto=format&fit=crop",
        category: img.category,
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        downloads: Math.floor(Math.random() * 5000)
    }));

    data.wallpapers = [...data.wallpapers, ...newWallpapers];

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
    console.log(`Successfully added ${newWallpapers.length} new wallpapers!`);
    console.log(`Total wallpapers: ${data.wallpapers.length}`);

} catch (error) {
    console.error('Error updating database:', error);
}
