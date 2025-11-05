const express = require('express');
const axios = require('axios');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authenticateTokenContest, authorizeTeacher } = require('../middleware/authMiddleware');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');
const { secret } = require('../config/config');
const router = express.Router();
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const imagePath = path.join(__dirname, '/graph.jpg');

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY

const task1 = require('./task1Topic.js');

////////////////////////////////////TASK2////////////////////////////////////
router.post('/generate-random-task2', authenticateToken, authorizeTeacher, async (req, res) => {
    const { username } = req.user;

    try {
        const topic = [
            "Education",
            "Environment",
            "Health",
            "Technology",
            "Society",
            "Economy",
            "Government and Politics",
            "Media and Advertising",
            "Work and Career",
            "Culture and Arts",
            "Travel and Tourism",
            "Science and Innovation"
        ];          
        const choose = topic[Math.floor(Math.random() * 12)]
        console.log("sending...")
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{ role: 'system', content: `Generate a IELTS writing task with topic ${choose} (markdown, easy to read, important line with bold text) [JUST GIVE THE TASK, NEVER GIVE ANSWER TO THE TASK]` }],
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("[TASK2] received response status:", response.status);
        const task = response.data.choices[0].message.content.trim();

        const db = await connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const probCnt = await tasksCollection.countDocuments();
        const result = await tasksCollection.insertOne({ id: probCnt + 1,task:task, topic:choose , description:null, image: null, type:"task2", created_at: new Date(), generated_by: username });
        res.json({ id: probCnt + 1 });
    } catch (error) {
        console.error('Error generating random task:', error);
        res.status(500).json({ error: 'Failed to generate random task' });
    }
});

////////////////////////////////////TASK1////////////////////////////////////

router.post('/generate-random-task1', authenticateToken,authorizeTeacher, async (req, res) => {
    const { username } = req.user;

    try {
        // const topic = ['line graph', 'bar chart', 'table', 'compare two pie chart', 'pie chart'];
        // const choose = topic[Math.floor(Math.random() * 5)]
        // const choose =  'compare pie chart';

        const task = task1[Math.floor(Math.random() * 183)].task;

       const response1 = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
           model: model,
           messages: [{ role: 'system', content: `Which of this type of graph ['line graph', 'bar chart', 'table', 'compare two pie chart', 'pie chart'] is suitable for this ielts task 1:${task} [OUTPUT NAME TYPE OF THAT CHART FROM GIVEN ARRAY ONLY, NO COMMENT, NO MORE DESCRIPTION ABOUT THE GRAPH, TASK]` }],
       }, {
           headers: {
               'Authorization': `Bearer ${openRouterApiKey}`,
               'Content-Type': 'application/json'
           }
       });

       var choose = response1.data.choices[0].message.content.trim();
       choose = choose.replace(/(\r\n|\n|\r)/gm,"");
       choose = choose.replace('[','');
       choose = choose.replace(']','');
    //    console.log(choose);
       
    //    console.log(task);
    //    console.log(task);

       const response0 = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
              model: model,
              messages: [{ role: 'system', content: `Make up a random data of the ${choose}  for the given task: ${task}. [OUTPUT DATA ONLY, CLEAR NUMBER, DATA SHOULD BE RANDOM, DATA MUST HAVE FLUCTUATION]` }],
        }, {
              headers: {
                 'Authorization': `Bearer ${openRouterApiKey}`,
                 'Content-Type': 'application/json'
              }
        });

        const description = response0.data.choices[0].message.content.trim();
        // console.log(description);

       const response2 = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
              model: model,
              messages: [{ role: 'system', content: `give me a python code for drawing the ${choose} from this description: ${description}.\n The code should save the ${choose} in jpg image file format name "./routes/graph.jpg". [OUTPUT CODE ONLY]` }],
        }, {
              headers: {
                 'Authorization': `Bearer ${openRouterApiKey}`,
                 'Content-Type': 'application/json'
              }
        });

        var code = response2.data.choices[0].message.content.trim();
        
        code = code.replace('```python', '');
        code = code.replace('```', '');
        // console.log(code);

         // Step 3: Save the Python code to a file (temp.py)
       fs.writeFileSync('temp.py', code);

         // Step 4: Run the Python script (temp.py) using child_process.spawn and wait for completion
        await new Promise((resolve, reject) => {
            const pythonProcess = spawn('python3', ['temp.py']);

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(`Python script exited with code ${code}`);
                } else {
                    resolve();
                }
            });
        });

        // Step 5: Wait for a few seconds to ensure the image is saved
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Step 6: Read the generated image file
        let imageBuffer = null;
        try {
            imageBuffer = fs.readFileSync(imagePath);
        } catch (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ error: 'Failed to generate random task' });
        }

        const db = await connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const probCnt = await tasksCollection.countDocuments();
        const result = await tasksCollection.insertOne({ id: probCnt + 1,task, description, image: imageBuffer,topic: choose, type:"task1", created_at: new Date(), generated_by: username });
        res.json({ id: probCnt + 1 });
        // const db = await connectToDatabase();
        // const tasksCollection = db.collection('tasks');

        // const probCnt = await taskCollection.countDocuments();
        // const result = await tasksCollection.insertOne({ id: probCnt + 1,task:task, description:null, image: null, type:"task2", created_at: new Date(), generated_by: username });
        // res.json({ id: probCnt + 1 });
    } catch (error) {
        console.error('Error generating random task:', error);
        res.status(500).json({ error: 'Failed to generate random task' });
    }
});


//////////////////////////////ADD CUSTOM PROBLEM///////////////////////////////////

// router.post('/create-task', authenticateToken,authorizeTeacher, async (req, res) => {
//     const { taskDescription, image } = req.body;
//     const { username } = req.user;

//     try {

//         const db = await connectToDatabase();
//         const tasksCollection = db.collection('tasks');
//         const probCnt = await tasksCollection.countDocuments();
//         const result = await tasksCollection.insertOne({ id: probCnt + 1, task:taskDescription, description:null, created_at: new Date(), image, type:"custom", generated_by: username });
//         res.json({ id: probCnt + 1 });
//     } catch (error) {
//         console.error('Error creating task:', error);
//         res.status(500).json({ error: 'Failed to create task' });
//     }
// });


module.exports = router;
