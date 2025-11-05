const express = require('express');
const axios = require('axios');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authenticateTokenContest, authorizeTeacher } = require('../middleware/authMiddleware');
const { MODEL_NAME, OPENROUTER_API_KEY, SPEAKING_MODEL, SPEAKING_KEY } = require('../config/config');
const { secret } = require('../config/config');
const router = express.Router();

const model = SPEAKING_MODEL;
const openRouterApiKey = SPEAKING_KEY;

// Generate random task
router.post('/generate_speaking_task', authenticateToken, async (req, res) => {
    const { tasknumber , topic } = req.body;
    const { username } = req.user;
    const taskMessages = {
        1: `Give me a speaking prompt for IELTS Speaking Task 1 about ${topic} without bold, highlighted text or special start character`,
        2: `Give me a speaking prompt for IELTS Speaking Task 2 about ${topic} without bold, highlighted text or special start character`,
        3: `Give me a speaking prompt for IELTS Speaking Task 3 about ${topic} without bold, highlighted text or special start character`,
        4: `Give me a speaking prompt for IELTS Speaking Task 4 about ${topic} without bold, highlighted text or special start character`
    };

    try {
        // Generate random task using external service (assuming model and openRouterApiKey are defined)
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-4o-mini',
            messages: [{ role: 'system', content: taskMessages[tasknumber] }], // Adjust the task number as needed
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const task = response.data.choices[0].message.content.trim();

        // Save task to MongoDB
        const db = await connectToDatabase();
        const tasksCollection = db.collection('log');
        const result = await tasksCollection.insertOne({ task, created_at: new Date(), generated_by: username });

        // Return response to client
        res.json({ id: result.insertedId, task });
    } catch (error) {
        console.error('Error generating random task:', error);
        res.status(500).json({ error: 'Failed to generate random task' });
    }
});

// Evaluate bandscore
router.post('/get_rating', authenticateToken, async (req, res) => {
    const { prompt, transcript } = req.body;
    const { username } = req.user;

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{ role: 'system', content: `Rate the band and give feedbacks for the following transcript based on the IELTS Speaking band without asterisk character in returned rating. Prompt: "${prompt}". Transcript: "${transcript}. Answer with band (1 - 9) for overal band score, Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation` }],
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const evaluation = response.data.choices[0].message.content.trim();

        res.json({ evaluation });
    } catch (error) {
        console.error('Error evaluating paragraph:', error);
        res.status(500).json({ error: 'Failed to evaluate paragraph' });
    }
});

// Get feedback
router.post('/get_feedback', authenticateToken, async (req, res) => {
    const { prompt, transcript } = req.body;
    const { username } = req.user;

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{ role: 'system', content: `Give a short example answer script. Prompt: "${prompt}"` }],
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const feedback = response.data.choices[0].message.content.trim();

        res.json({ feedback });
    } catch (error) {
        console.error('Error evaluating paragraph:', error);
        res.status(500).json({ error: 'Failed to evaluate paragraph' });
    }
});

// upload to MongoDB
router.post('/save_to_database', authenticateToken, async (req, res) => {
    const { prompt, transcript, rating, feedback, wordsPerMinute, fluency, curRecords } = req.body;
    const { username } = req.user;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`speakingtasks`);

    const result = await tasksCollection.insertOne({ prompt, transcript, rating, feedback, wordsPerMinute, fluency, curRecords, created_by: username});

    res.json({ id: result.insertedId});
});

// download from MongoDB
router.post('/get_data', authenticateToken, async (req, res) => {
    const { username } = req.user;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`speakingtasks`);

    const result = await tasksCollection.find({ created_by: username }).toArray();

    res.json({id: result.insertedId, result});
});

module.exports = router;