const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
    const { username, email, name, password, role } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (user) {
            if (user.username === username) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
            if (user.email === email) {
                return res.status(400).json({ error: 'Email is already registered' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await usersCollection.insertOne({ username, email, name, password: hashedPassword, role, created_at: new Date() });
        res.json({ id: result.insertedId, username, email, name });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const accessToken = jwt.sign({ username: user.username, id: user._id, role: user.role }, secret);
        res.json({ accessToken, username: user.username, role: user.role });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to login user' });
    }
});

// Get user info
router.get('/user', authenticateToken, async (req, res) => {
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ username }, { projection: { _id: 0, username: 1, email: 1, name: 1 } });
        if (!user) {
            return res.status(500).json({ error: 'Failed to get user info' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Update user info
router.post('/user', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { email, name } = req.body;

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne({ username }, { $set: { email, name } });
        if (result.modifiedCount === 0) {
            return res.status(500).json({ error: 'Failed to update user info' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ error: 'Failed to update user info' });
    }
});

// API endpoint to get user evaluations
router.get('/get_evaluations', authenticateToken, async (req, res) => {
    const { user } = req.query;

    try {
        const db = await connectToDatabase();
        const evaluationsCollection = db.collection('evaluations');

        const evaluations = await evaluationsCollection.find({ generated_by: user }).sort({ created_at: -1 }).toArray();
        res.json(evaluations);
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
});

module.exports = router;
