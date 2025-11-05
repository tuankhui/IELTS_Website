const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./utils/mongodb');
const {authenticateToken, authorizeTeacher, authenticateTokenContest} = require('./middleware/authMiddleware');
require('dotenv').config();
const multer = require('multer');
// const { GridFSBucket } = require('./mongodb');

const userRoutes = require('./routes/userRoutes');
const contestRoutes = require('./routes/contestRoutes');
const wriTask2Routes = require('./routes/wriTask2Routes');
const wriTask1Routes = require('./routes/wriTask1Routes');
const oldRoutes = require('./routes/oldRoutes');
const lisRoutes = require('./routes/listeningRoutes');
const readingRoutes = require('./routes/readingRoutes');
const vocabRoutes = require('./routes/vocabRoutes');
const generateRoutes = require('./routes/generateTaskRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const secret = process.env.JWT_SECRET;
const model = process.env.MODEL_NAME;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const speakingRoutes = require('./routes/speakingRoutes');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.json()); 

//WRITING
app.use('/api', userRoutes);
app.use('/api', contestRoutes);
app.use('/api', wriTask2Routes);
app.use('/api', wriTask1Routes);
app.use('/api', oldRoutes);
app.use('/api', lisRoutes);
app.use('/api', vocabRoutes);
app.use('/api', generateRoutes);
app.use('/api', readingRoutes);
app.use('/api', speakingRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
