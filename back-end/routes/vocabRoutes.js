const express = require('express');
const axios = require('axios');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authenticateTokenContest, authorizeTeacher } = require('../middleware/authMiddleware');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');
const { secret } = require('../config/config');
const router = express.Router();

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY

router.post('/generate-vocab-with-topic', authenticateToken, async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
  
    try {
      const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model, // Replace with your model id
          messages: [
            {
              role: 'system',
              content: `Provide 10 RANDOM FROM SIMPLE TO ADVANCED words about ${topic}$ first with numbers and shuffle their 10 definitions from Cambridge Dictionary with letters then, and 10 LINE OF ANSWERS, ONLY PRINT THE LETTER OF THE ANSWER, DO NOT GIVE THE NUMBER OF ANSWER. Sort answer with number increase. Don't need to provide any title of words, definitions,answers. No blank line between word and definition or definition and answer.`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
    //   console.log('External API Response:', response.data); // Debugging log
      res.json({ vocabulary: response.data.choices[0].message.content.trim() });
    } catch (error) {
      console.error('Error generating vocabulary with topic:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to generate vocabulary with topic' });
    }
  });

module.exports = router;
