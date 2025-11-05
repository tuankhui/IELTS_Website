// API to fetch contests

const express = require('express');
const axios = require('axios');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authenticateTokenContest, authorizeTeacher } = require('../middleware/authMiddleware');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { URL_SERVER } = require('../config/config');

router.get('/contests', authenticateTokenContest,async (req, res) => {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;
    const queryPage = parseInt(page, 10);
    const queryLimit = parseInt(limit, 10);
    
    try {
        const db = await connectToDatabase();
        const contestsCollection = db.collection('contests');

        let query;
        if (user && user.username) {
            const username = user.username;
            query = {
                $or: [{ type: 'public' }, { type: 'private', access_user: username }]
            };
        } else {
            query = { type: 'public' };
        }

        const contests = await contestsCollection.find(query)
            .sort({ start: -1 })
            .skip((queryPage - 1) * queryLimit)
            .limit(queryLimit)
            .toArray();

        res.json(contests);
    } catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({ error: 'Failed to fetch contests' });
    }
});

// API to check if the user is registered
router.post('/checkRegis', authenticateToken, async (req, res) => {
    const { contestId } = req.body;
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const contestsCollection = db.collection('contests');

        const contest = await contestsCollection.findOne({ id: contestId, registered_user: username });

        if (contest) {
            res.json({ registered: true });
        } else {
            res.json({ registered: false });
        }
    } catch (error) {
        console.error('Error checking registration:', error);
        res.status(500).json({ error: 'Failed to check registration' });
    }
});

// API to register user in a contest
router.post('/register_contest', authenticateToken, async (req, res) => {
    const { contestId } = req.body;
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const contestsCollection = db.collection('contests');

        const result = await contestsCollection.updateOne({ id: contestId }, { $addToSet: { registered_user: username } });

        if (result.modifiedCount === 1) {
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Failed to register' });
        }
    } catch (error) {
        console.error('Error registering:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

// API to create a contest

router.post('/create_contest', authenticateToken, authorizeTeacher, upload.fields([{ name: 'contestImage', maxCount: 1 }]), async (req, res) => {
    const { name, start, end, type, access_user, taskOption, taskDescription } = req.body;
    const contestImage = req.files['contestImage'] ? req.files['contestImage'][0] : null;
    const authToken = req.headers['authorization'];
    const { username } = req.user;
    // console.log(authToken);

    // Check if type is private and access_user is provided

    // console.log(access_user);
    if (type === 'private' && (!Array.isArray(access_user) || (Array.isArray(access_user) && access_user.length === 0))) {
      return res.status(400).json({ error: 'For private contests, access_user must be a non-empty array' });
    }
  
    try {
      const db = await connectToDatabase();
      const contestsCollection = db.collection('contests');
  
      // Generate a new unique ID for the contest
      const contestCount = await contestsCollection.countDocuments();
      const newContest = {
        id: contestCount + 1,
        name,
        start,
        end,
        type,
        access_user: type === 'private' ? access_user : [],
        registered_user: [],
        taskId: '',
        created_at: new Date(),
      };

      if (taskOption === 'randomtask2') {
        const response = await axios.post(`${URL_SERVER}api/generate-random-task2`, {}, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        });
        newContest.taskId = response.data.id;
      } else if (taskOption === 'randomtask1') {
        const response = await axios.post(`${URL_SERVER}api/generate-random-task1`, {}, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        });
        newContest.taskId = response.data.id;
      }
      else{
        var image = null;
        if (contestImage) {
            image =  contestImage.buffer;
        }
        const db = await connectToDatabase();
        const tasksCollection = db.collection('tasks');
        const probCnt = await tasksCollection.countDocuments();
        const result = await tasksCollection.insertOne({ id: probCnt + 1, task:taskDescription, description:null, created_at: new Date(), image, type:(type === 'private' ? 'private' : 'public'), generated_by: username });
        newContest.taskId = probCnt + 1;
      }
  
      await contestsCollection.insertOne(newContest);
      res.status(200).json({ message: 'Contest created successfully' });
    } catch (error) {
      console.error('Error creating contest:', error);
      res.status(500).json({ message: 'Failed to create contest' });
    }
  });

router.get('/get_contest/:id', authenticateToken, async (req, res) => {
    const contestId = parseInt(req.params.id, 10);
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const contestsCollection = db.collection('contests');

        const contest = await contestsCollection.findOne({ id: contestId });


        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Check if the contest is private and the current user is not in the access_user list
        if (contest.type === 'private' && !contest.access_user.includes(username)) {
            return res.status(403).json({ message: 'Access denied to this contest' });
        }

        if(!contest.registered_user.includes(username)){
            return res.status(403).json({ message: 'You have not registered' });
        }

        const tasksCollection = db.collection('tasks');

        const tasks = await tasksCollection.findOne({ id: contest.taskId });

        let contestResponse = {
            id: contest.id,
            name: contest.name,
            start: contest.start,
            end: contest.end,
            // type: contest.type,
            // access_user: contest.access_user,
            // registered_user: contest.registered_user,
            // taskOption: contest.taskOption,
            taskDescription: tasks.task,
            // created_at: contest.created_at,
  //           id: number;
  // name: string;
  // start: string;
  // end: string;
  // taskDescription: string;
  // contestImage?: ContestImage;
        };

        if (tasks.image) {
            if(tasks.image != 'null' && tasks.image != null){
              contestResponse.contestImage = {
                  data: tasks.image.toString('base64'),
                  contentType: 'image/png', // Change this to the appropriate MIME type
                  name: 'graph.jpg'
              };
            }
        }

        res.status(200).json(contestResponse);
    } catch (error) {
        console.error('Error retrieving contest:', error);
        res.status(500).json({ message: 'Failed to retrieve contest' });
    }
});

router.post('/getprob', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { topic } = req.body;
    console.log("currently get prob");
    try {
        const db = await connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const tasks = await tasksCollection.find({ topic: topic, type: { $ne: "custom" } }).toArray();

        if (tasks.length === 0) {
            console.log("notfound");
            return res.status(404).json({ error: 'No tasks found for the specified topic' });
        }

        // Choose a random task from the filtered tasks
        const randomIndex = Math.floor(Math.random() * tasks.length);
        const randomTask = tasks[randomIndex];

        res.json({ id: randomTask.id, task: randomTask.task, image: randomTask.image });
    } catch (error) {
        console.error('Error to get random problem with topic :', error);
        res.status(500).json({ error: 'Failed to get random problem with topic :' });
    }
});

// router.post('/create_contest', authenticateToken, authorizeTeacher, async (req, res) => {
//     const { name, start, end, type, access_user } = req.body;

//     // Check if type is private and access_user is provided
//     // console.log(type);
//     if (type === 'private' && (!Array.isArray(access_user) || (Array.isArray(access_user) && access_user.length === 0))) {
//         return res.status(400).json({ error: 'For private contests, access_user must be a non-empty array' });
//     }

//     try {
//         const db = await connectToDatabase();
//         const contestsCollection = db.collection('contests');

//         // Generate a new unique ID for the contest
//         const contestCount = await contestsCollection.countDocuments();
//         const newContest = {
//             id: contestCount + 1,
//             name,
//             start,
//             end,
//             type,
//             access_user: type === 'private' ? access_user : [],
//             registered_user: []
//         };

//         await contestsCollection.insertOne(newContest);
//         res.json({ success: true, contest: newContest });
//     } catch (error) {
//         console.error('Error creating contest:', error);
//         res.status(500).json({ error: 'Failed to create contest' });
//     }
// });

// Create contest
// router.post('/create_contest', authenticateToken, authorizeTeacher, upload.single('contestImage'), async (req, res) => {
//     const { contestName, description, startDate, endDate, tasks } = req.body;
//     const { username } = req.user;

//     if (!req.file) {
//         return res.status(400).json({ error: 'Contest image is required' });
//     }

//     try {
//         const db = await connectToDatabase();
//         const contestsCollection = db.collection('contests');

//         const result = await contestsCollection.insertOne({
//             contestName,
//             description,
//             startDate,
//             endDate,
//             tasks,
//             contestImage: req.file.buffer,
//             created_at: new Date(),
//             created_by: username
//         });

//         res.json({ success: true, id: result.insertedId });
//     } catch (error) {
//         console.error('Error creating contest:', error);
//         res.status(500).json({ error: 'Failed to create contest' });
//     }
// });

// // Get contest tasks
// router.get('/get-contest-tasks/:contestId', authenticateTokenContest, async (req, res) => {
//     const { contestId } = req.params;

//     try {
//         const db = await connectToDatabase();
//         const contestsCollection = db.collection('contests');

//         const contest = await contestsCollection.findOne({ _id: new require('mongodb').ObjectID(contestId) });
//         if (!contest) {
//             return res.status(404).json({ error: 'Contest not found' });
//         }

//         res.json({ tasks: contest.tasks });
//     } catch (error) {
//         console.error('Error fetching contest tasks:', error);
//         res.status(500).json({ error: 'Failed to fetch contest tasks' });
//     }
// });

module.exports = router;