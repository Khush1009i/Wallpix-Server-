const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const dbPath = path.join(__dirname, '../data/users.json');

// Helper to read DB
const readDb = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty users array
        return { users: [] };
    }
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
};

exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const db = readDb();

        // Check if user exists
        const existingUser = db.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Random Username
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const username = `User_${randomSuffix}`;

        // Create new user
        const newUser = {
            id: Date.now(), // Simple ID generation
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        // Push later
        // db.users.push(newUser); 
        // writeDb(db);

        // Create Token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        // Save token to user profile
        newUser.token = token;
        // db.users.push(newUser); // Already pushed? No, pushed at line 57. Wait.
        // It was pushed at line 57 WITHOUT token. I need to update it or push APTER generating token.
        // Actually, db object reference is live? 
        // line 57: db.users.push(newUser); 
        // newUser is an object. If I modify newUser, the reference in db.users array also sees it.
        // BUT I called writeDb(db) at line 58. That saved the version WITHOUT token.
        // I should call writeDb AFTER adding token. Or move writeDb down.

        // Let's rewrite the block to be cleaner.


        // Save token to user profile
        newUser.token = token;
        db.users.push(newUser);
        writeDb(db);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                token: token
            }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error processing signup' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const db = readDb();
        const user = db.users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        // Update user with new token
        const userIndex = db.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            db.users[userIndex].token = token;
            writeDb(db);
        }

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error processing login' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const db = readDb();
        const user = db.users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error('Profile Error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { email, password, username } = req.body || {};
        const db = readDb();
        const userIndex = db.users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = db.users[userIndex];

        // Update username if provided
        if (username) {
            // Check uniqueness
            const usernameExists = db.users.find(u => u.username === username && u.id !== req.user.id);
            if (usernameExists) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        // Update email if provided
        if (email) {
            // Check if email is taken by another user
            const emailExists = db.users.find(u => u.email === email && u.id !== req.user.id);
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        // Update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        db.users[userIndex] = user;
        writeDb(db);

        const { password: _, ...updatedUser } = user;
        res.json({ message: 'Profile updated successfully', user: updatedUser });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

exports.requestDeleteOtp = async (req, res) => {
    try {
        const db = readDb();
        const userIndex = db.users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userEmail = db.users[userIndex].email;

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Save OTP to user record
        db.users[userIndex].deleteOtp = otp;
        db.users[userIndex].deleteOtpExpires = otpExpires;
        writeDb(db);

        // Check if Email Config is Present
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email') || !process.env.EMAIL_APP_PASSWORD) {
            console.warn('⚠️  EMAIL CREDENTIALS NOT CONFIGURED IN .env. Printing OTP to console instead.');
            console.log(`\n📧 [FALLBACK OTP] To: ${userEmail} | OTP: ${otp}\n`);
            return res.json({
                message: 'OTP Generated (Check Console - Email not configured)',
                otp: otp // Still return in response for dev convenience if email fails
            });
        }

        // Configure Transporter (Port 587 is standard for TLS)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'WallPix - Delete Account OTP',
            text: `Your OTP for deleting your WallPix account is: ${otp}. It expires in 10 minutes.`,
            html: `<h3>WallPix Account Deletion</h3><p>Your OTP to delete your account is: <b>${otp}</b></p><p>This code expires in 10 minutes.</p>`
        };

        // Send Email
        // Send Email (Fire and forget to speed up response)
        // Send Email (Await to ensure it actually sends, or catch error)
        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${userEmail}`);
            res.json({
                message: `OTP sent to ${userEmail}`
            });
        } catch (mailError) {
            console.error(`❌ Failed to send email to ${userEmail}:`, mailError);
            return res.status(500).json({
                message: 'Failed to send OTP email. Check server logs.',
                error: mailError.message
            });
        }

    } catch (error) {
        console.error('Request OTP Error:', error);
        res.status(500).json({ message: 'Server error requesting OTP', error: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { otp } = req.body || {};

        if (!otp) {
            return res.status(400).json({ message: 'OTP is required' });
        }

        const db = readDb();
        const userIndex = db.users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = db.users[userIndex];

        // Verify OTP
        if (!user.deleteOtp || user.deleteOtp !== String(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check Expiry
        if (Date.now() > user.deleteOtpExpires) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Delete User
        db.users.splice(userIndex, 1);
        writeDb(db);

        res.json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ message: 'Server error deleting account' });
    }
};



exports.getAllUsers = async (req, res) => {
    try {
        console.log('API: getAllUsers called'); // Debug Log
        const db = readDb();

        const users = db.users.map(user => {
            // Ensure we handle missing arrays gracefully
            const favoritesCount = Array.isArray(user.favorites) ? user.favorites.length : 0;
            const downloadsCount = Array.isArray(user.downloads) ? user.downloads.length : 0;

            // Explicitly verify if token exists
            const token = user.token || "Login to generate token";

            // Return full user object + computed stats
            // We consciously include everything requested.
            return {
                ...user,
                favoritesCount,
                downloadsCount,
                token
            };
        });

        res.json({
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// Track a download for a user
exports.recordDownload = async (req, res) => {
    try {
        const userId = req.user.id;
        const { wallpaperId } = req.body || {};

        if (!wallpaperId) {
            return res.status(400).json({ message: 'Wallpaper ID is required' });
        }

        const db = readDb();
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = db.users[userIndex];

        if (!user.downloads) {
            user.downloads = [];
        }

        // Add download record with timestamp
        user.downloads.push({
            wallpaperId: parseInt(wallpaperId) || wallpaperId, // Handle both int/string info
            downloadedAt: new Date().toISOString()
        });

        db.users[userIndex] = user;
        writeDb(db);

        // Also update wallpaper global download count? 
        // That is in db.json (wallpapers DB), not users.json. 
        // For now, let's just track per user as requested.

        res.json({
            message: 'Download recorded',
            downloadsCount: user.downloads.length
        });

    } catch (error) {
        console.error('Record Download Error:', error);
        res.status(500).json({ message: 'Server error recording download' });
    }
};

// Get downloads for a specific user
exports.getUserDownloads = async (req, res) => {
    try {
        const userId = req.user.id; // Or req.params.userId if admin is asking? 
        // The request said "if it's necessary to create an API for getting all the Download a specific user did create that for user".
        // Sounds like the user themselves wants to see their history.

        const db = readDb();
        const user = db.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            count: user.downloads ? user.downloads.length : 0,
            downloads: user.downloads || []
        });

    } catch (error) {
        console.error('Get User Downloads Error:', error);
        res.status(500).json({ message: 'Server error fetching downloads' });
    }
};
