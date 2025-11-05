const express = require('express');
const axios = require('axios');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authenticateTokenContest, authorizeTeacher } = require('../middleware/authMiddleware');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');
const { secret } = require('../config/config');
const router = express.Router();

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY
const linkingWords = ["and","but","or","so","because","therefore","however","moreover","although","nevertheless","furthermore","in addition","for example","for instance","meanwhile","subsequently","consequently","hence","thus","otherwise","in contrast","likewise","similarly","instead","nonetheless","on the other hand","as a result","in the meantime","despite","even though","since","when","while","until","once","before","after","as soon as","unless","whereas"];

router.post('/evaluate-task2', authenticateToken, async (req, res) => {
    const { task_id, paragraph } = req.body;
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const tasksCollection = db.collection('tasks');
        const tasks = await tasksCollection.findOne({ id: task_id });
// console.log(tasks.task, tasks.description, paragraph);
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{ role: 'system', content: `
Task (Ielts writing task 2): ${tasks.task}
Description: ${tasks.description}
User input paragraph: ${paragraph}
Question 1: Count how many grammar mistakes in this following paragraph  (ONLY NUMBER, NO OTHER TEXT OR CHARACTER) [ANSWER ONLY THE NUMBER]
Question 2:  Bold all grammar mistakes. (ONLY GIVE THE PARAGRAPH DO NOT PRINT ANYTHING ELSE)
Question 3: GIVE THE BAND SCORE OF THIS CRITERIA : COHERENCE AND COHESION .DONT ANSWER ANYTHING ELSE (ONLY NUMBER NO ANY OTHER TEXT OR CHARACTER , ALWAYS SHOW FIRST DECIMAL DIGIT)
Question 4: DESCRIBE THIS PARAGRAPH IN THIS CRITERIA (UNDER 20 WORDS) : COHERENCE AND COHESION with 5 factors: Logical structure,Introduction & conclusion present , Supported main points ,Accurate linking words , Variety in linking words. Each factor discribe in one sentences between 15-20 words. Use this structure: [-only the comment about factor 1\n-only the comment about factor 2\n-... IN LESS THAN 20 WORDS\n]
Question 5: GIVE THE BAND SCORE OF THIS CRITERIA : LEXICAL RESOURCE .DONT ANSWER ANYTHING ELSE (ONLY NUMBER NO ANY OTHER TEXT OR CHARACTER , ALWAYS SHOW FIRST DECIMAL DIGIT)
Question 6: DESCRIBE THIS PARAGRAPH IN THIS CRITERIA (UNDER 20 WORDS) : LEXICAL RESOURCE with 2 factors: Varied vocabulary, Accurate spelling & word formation. Each factor discibe in one sentences between 15 - 20 words. Use this structure:[-only the comment about factor 1\n-only the comment about factor 2\n-…]
Question 7: GIVE THE BAND SCORE OF THIS CRITERIA : GRAMMATICAL RANGE .DONT ANSWER ANYTHING ELSE (ONLY NUMBER NO ANY OTHER TEXT OR CHARACTER , ALWAYS SHOW FIRST DECIMAL DIGIT) 
Question 8: DESCRIBE THIS PARAGRAPH IN THIS CRITERIA (UNDER 20 WORDS) : GRAMMATICAL RANGE with 2 factors: Mix of complex & simple sentences, Clear and correct grammar. Each factor describe in one sentences between 15 - 20 words. Use this structure:[ -only the comment about factor 1\n-only the comment about factor 2.]
Question 9: GIVE THE BAND SCORE OF THIS CRITERIA :TASK ACHIEVEMENT .DONT ANSWER ANYTHING ELSE (ONLY NUMBER NO ANY OTHER TEXT OR CHARACTER , ALWAYS SHOW FIRST DECIMAL DIGIT)
Question 10: DESCRIBE THIS PARAGRAPH IN THIS CRITERIA (UNDER 20 WORDS) : TASK ACHIEVEMENT with 4 factors: Complete response, Clear & comprehensive ideas, Relevant & specific examples, Appropriate word count. Each factor descibe in one sentences between 15-20 words. Use this structure:[ -only the comment about factor 1\n-only the comment about factor 2\n-…\n]

Answer all the question in this format (DO NOT SHOW [Answer question x], each question separate by line of ‘<endline>’":
[Answer question 1]
<endline>
[Answer question 2]
<endline>
[Answer question 3]
<endline>
[Answer question 4]
<endline>
[Answer question 5]
<endline>
[Answer question 6]
<endline>
[Answer question 7]
<endline>
[Answer question 8]
<endline>
[Answer question 9]
<endline>
[Answer question 10]

                `}],
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        var evaluation = response.data.choices[0].message.content.trim();
        var raw = evaluation;
        evaluation = evaluation.replace('[Answer question 1]', '')
        evaluation = evaluation.replace('[Answer question 2]', '')
        evaluation = evaluation.replace('[Answer question 3]', '')
        evaluation = evaluation.replace('[Answer question 4]', '')
        evaluation = evaluation.replace('[Answer question 5]', '')
        evaluation = evaluation.replace('[Answer question 6]', '')
        evaluation = evaluation.replace('[Answer question 7]', '')
        evaluation = evaluation.replace('[Answer question 8]', '')
        evaluation = evaluation.replace('[Answer question 9]', '')
        evaluation = evaluation.replace('[Answer question 10]', '')
        evaluation = evaluation.replace(/(\r\n|\n|\r)/gm,"");
        console.log(evaluation);
        var ans = evaluation.split("<endline>");
        ans = ans.filter(element => element !== "");
        console.log(ans);


        var cntLinking = 0;
        linkingWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const count = ((paragraph.toLowerCase()).match(regex) || []).length;
            cntLinking += count;
        });
        cntLinking = cntLinking.toString();

        const evaluateCollection = db.collection('evaluations');
        // const evaluationsCollection = db.collection('evaluations');

        // const taskDoc = await tasksCollection.findOne({ task });
        // if (!taskDoc) {
        //     return res.status(500).json({ error: 'Failed to find task' });
        // }

        const probCnt = await evaluateCollection.countDocuments();
        const result = await evaluateCollection.insertOne({ id: probCnt + 1, task_id: task_id, paragraph, cntWord: ((paragraph.trim().split(/\s+/).filter(Boolean)).length).toString(), cntLinking, cntGramar:ans[0], boldmistake: ans[1], coherence: ans[2], des_coherenece:ans[3],  lexical:ans[4], des_lexical:ans[5], gramar_range: ans[6], des_gramar_range:ans[7], task_archive:ans[8], des_task_archive:ans[9], created_at: new Date(), generated_by: username, raw });
        // res.json({ id: probCnt + 1});


        res.json({cntWord: ((paragraph.trim().split(/\s+/).filter(Boolean)).length).toString(), cntLinking, cntGramar:ans[0], boldmistake: ans[1], coherence: ans[2], des_coherenece:ans[3],  lexical:ans[4], des_lexical:ans[5], gramar_range: ans[6], des_gramar_range:ans[7], task_archive:ans[8], des_task_archive:ans[9]});
        // const db = await connectToDatabase();
        // const tasksCollection = db.collection('tasks');
        // const evaluationsCollection = db.collection('evaluations');

        // const taskDoc = await tasksCollection.findOne({ task });
        // if (!taskDoc) {
        //     return res.status(500).json({ error: 'Failed to find task' });
        // }

        // const result = await evaluationsCollection.insertOne({ task_id: taskDoc._id, paragraph, evaluation, created_at: new Date(), evaluated_by: username });
        // res.json({ id: result.insertedId, evaluation });
    } catch (error) {
        console.error('Error evaluating paragraph:', error);
        res.status(500).json({ error: 'Failed to evaluate paragraph' });
    }
});

module.exports = router;
