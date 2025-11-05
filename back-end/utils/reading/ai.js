const { OpenAI } = require("node-openai");

const AI_API_KEY = process.env.READING_OPENROUTER_API_KEY;
const AI_BASE_URL = /*"https://g4f.ariidesu.moe";*/ "https://openrouter.ai/api";
const AI_MODEL = /*"gpt-4-turbo";*/ 'openai/gpt-4o-mini';
const client = new OpenAI({
    apiKey: AI_API_KEY,
    endpoint: AI_BASE_URL,
}).v1();

class AISession {
    _messages = [];

    async chat(message) {
        const user = { role: "user", content: message };
        this._messages.push(user);
    
        const completion = await client.chat.create({
            messages: this._messages,
            model: AI_MODEL,
        });
    
        return completion;
    }

    pushMessage(message) {
        this._messages.push(message);
    }

    constructor() {
        this._messages.push({
            role: "system",
            content: "You are a text generator, you will generate the text case sensitive, you have to fulfil all syntax requirements that the user asks. Remember to never, ever print out any blank lines, even if they make the text easier to read"
        });
    }
}

module.exports = AISession;