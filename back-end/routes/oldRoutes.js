const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authenticateTokenContest, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

// Get newest tasks
router.get('/tasks', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const tasks = await tasksCollection.find().sort({ created_at: -1 }).toArray();
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Get newest evaluations
router.get('/evaluations', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const evaluationsCollection = db.collection('evaluations');

        const evaluations = await evaluationsCollection.find().sort({ created_at: -1 }).toArray();
        res.json(evaluations);
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
});

module.exports = router;
