require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5001,
    secret: process.env.JWT_SECRET,
    MODEL_NAME: process.env.MODEL_NAME,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    READING_MODEL_NAME: process.env.READING_MODEL_NAME,
    READING_OPENROUTER_API_KEY: process.env.READING_OPENROUTER_API_KEY,
    URL_SERVER: process.env.URL_SERVER,
    SPEAKING_MODEL: process.env.SPEAKING_MODEL,
    SPEAKING_KEY: process.env.SPEAKING_API_KEY,
};
