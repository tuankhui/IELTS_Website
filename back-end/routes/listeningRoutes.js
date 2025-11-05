const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authenticateTokenContest, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');
const { READING_MODEL_NAME, READING_OPENROUTER_API_KEY } = require('../config/config');


const router = express.Router();

// Get newest tasks

router.post('/generate-reading-material', async (req, res) => {
    console.log("Reached here");
    const model = READING_MODEL_NAME;
    const { task, difficulty } = req.body; // Task and difficulty parameters sent from the client
  
    const generatePrompt = (task, difficulty) => {
      let prompt = '';
  
      switch(task){
        case 'Multiple Choices':
          console.log("Generating Multiple Choices Prompt");
          prompt = `Generate an IELTS reading practice paragraph followed by ten questions and ten answers for each question. Start your answer with a paragraph. Format it as follows:
          [Your paragraph here]
          Question 1: [Your question here]
          A: [Answer option a]
          B: [Answer option b]
          C: [Answer option c]
          D: [Answer option d]
          Question 2: [Your question here]
          A: [Answer option a]
          B: [Answer option b]
          C: [Answer option c]
          D: [Answer option d]
          Question 3: [Your question here]
          A: [Answer option a]
          B: [Answer option b]
          C: [Answer option c]
          D: [Answer option d]
          ...
          Question 10: [Your question here]
          A: [Answer option a]
          B: [Answer option b]
          C: [Answer option c]
          D: [Answer option d]
          Answers: 
          [Answer for question 1 here (The answer only A B C or D)]
          [Answer for question 2 here (The answer only A B C or D)]
          [Answer for question 3 here (The answer only A B C or D)]
          ...
          [Answer for question 10 here (The answer only A B C or D)]`;
          break;
        case 'Matching':
          prompt = `start your reply with only one paragraph
          just generate the paragraph,objects and the questions, dont say anything thing useless     
            generate for me an Ielts listening paragraph(which mentioned at least 5 objects and each objects have 4 informations about it).
            the paragraph should be a natural speech . 
  
            Show 5 objects mentioned in the paragraph
            represent as below(dont say anything else):
              A.[object 1]
              B.[object 2]
              C.[object 3]
              ...
       
            and I want to have exatly 4 short clauses starts with number(1,2,3,...)
            (which detenmined "only one" category of the object(each clause determined a different object), but dont have the exact same word in the object) to provide the information about objects to match,
            the word should be sometimes represent as a synonym.
           represent as below:
           1.[clause 1]
           2.[clause 2]
           ...
           
            now print the answer for 4 claues as below:
            Answer key
         (in each line,only show the character correspondinng to the answer, "dont show the number" )
       
            ...
              `;
          break;
        case 'sort-answer':
          prompt = `
            generate for me a paragraph and several questions that get information from the passage and don't have the question type like fill in the blank Just print the paragraph and questions, don't print anything useless like "paragraph:".
            Type of question: form completion with no more than three words. Don't print "form completion with no more than three words" it's just the requirements.
            Requirements:5 question
            Format:
            1.[Question 1]
            2.[Question 2]
            3.[Question 3]
            4.[Question 4]
            5.[Question 5]
            [Answer 1] without 1.
            [Answer 2] without 2.
            [Answer 3] without 3.
            [Answer 4] without 4.
            [Answer 5] without 5.
          `;
          break;
        case 'Sentence Completion':
          prompt = `Can you create a IELTS Listening paragraph about Sentence Completion part about topics not conversations with 5 questions and 5 answers with exactly 7 underscores in questions,exactly format it as followed, there is no need for greeting or ordinal number in answers section,
            format it as followed:
            [Paragraph here]
            1. [Question with underscore as place to answer]
            2. [Question with underscore as place to answer]
            3. [Question with underscore as place to answer]
            4. [Question with underscore as place to answer]
            5. [Question with underscore as place to answer]
            Answers:
            [Answer for question 1]
            [Answer for question 2]
            [Answer for question 3]
            [Answer for question 4]
            [Answer for question 5]
            `
          break;
        case 'Pick From A List':
          prompt = `start your reply with a paragraph
         just generate the paragraph,objects and the questions, dont say anything thing useless     
            generate for me an Ielts listening paragraph(which mentioned at least 3 objects and each objects have informations about it).
            the paragraph should be a natural speech 
  
            Show 3 objects mentioned in the paragraph
            represent as below(dont say anything else):
              A.[object 1]
              B.[object 2]
              C.[object 3]
              ...
       
            and I want to have exactly 6 short clauses starts with number(1,2,3,...)
            (which detenmined only one category of the object(some clauses must determined same objects), but dont have the exact same word in the object) to provide the information about objects to match,
            the word should be sometimes represent as a synonym.
           represent as below:
           1.[clause 1]
           2.[clause 2]
           ...
  
           Answer key
         (only show the character correspondinng to the answer separate line, "dont show the number")
            ...
              `;
          break;  
      }
  
      if (difficulty === 'Easy') {
        prompt = prompt.replace(/paragraph\./, 'paragraph. The paragraph should have around 70 words and the words should mostly be elementary level.');
      } else if (difficulty === 'Hard') {
        prompt = prompt.replace(/paragraph\./, 'paragraph. The paragraph should have around 300 words and the words should mostly be college level.');
      }
      return prompt;
    };
  
    try {
      if(task==='Matching'){
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model,
          messages: [{ role: 'system', content: generatePrompt(task, difficulty) }],
        }, {
          headers: {
            'Authorization': `Bearer ${READING_OPENROUTER_API_KEY}`
          }
        });
        const text = response.data.choices[0].message.content.trim();
        const [generatedParagraph, ...lmaobruhbruh] = text.split('\n').filter(line => line.trim() !== '');
        const generatedQuestions=[];
        const generatedAnswer=[];
        for(var i=0;i<9;i++){
          generatedQuestions.push(lmaobruhbruh[i]);
        }
        for(var i=10;i<=13;i++){
          generatedAnswer.push(lmaobruhbruh[i]);
        }
        console.log(generatedParagraph);
        console.log(generatedQuestions);
        console.log(generatedAnswer);
        res.json({ paragraph: generatedParagraph, questions: generatedQuestions,answerkey:generatedAnswer });
      }
      if (task === 'Multiple Choices') {
        console.log("OMG");
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model,
          messages: [{ role: 'system', content: generatePrompt(task, difficulty) }],
        }, {
          headers: {
            'Authorization': `Bearer ${READING_OPENROUTER_API_KEY}`
          }
        });
        console.log("SHARK")
        const text = response.data.choices[0].message.content.trim();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const paragraph = lines[0];
        const questions = [];
        const answers = [];
        let currentQuestion = null;
  
        lines.slice(1).forEach(line => {
          if (line.startsWith('Question')) {
            if (currentQuestion) {
              questions.push(currentQuestion);
            }
            currentQuestion = {
              question: line,
              options: []
            };
          } else if (line.startsWith('A:') || line.startsWith('B:') || line.startsWith('C:') || line.startsWith('D:')) {
            if (currentQuestion) {
              currentQuestion.options.push(line.substring(3).trim());  // Only push the answer text, not the prefix
            }
          } else if (/^[A-D]$/.test(line.trim())) {  // Match lines with only A, B, C, or D
            answers.push(line.trim());
          }
        });
  
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
  
        res.json({ paragraph, questions, answers });
      }
      if(task==='sort-answer'){
        const prompt = generatePrompt(task, difficulty);
        console.log('Generated Prompt:', prompt);
  
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model,
          messages: [{ role: 'system', content: prompt }],
        }, {
          headers: {
            'Authorization': `Bearer ${READING_OPENROUTER_API_KEY}`
          }
        });
  
        console.log('Response from OpenAI:', response.data);
  
        const text = response.data.choices[0].message.content.trim();
        const lines = text.split('\n').filter(line => line.trim() !== '');
  
        const generatedParagraph = lines[0];
        const generatedQuestions = lines.slice(1, 6);
        const generatedAnswers = lines.slice(6, 11);
  
        res.json({ paragraph: generatedParagraph, questions: generatedQuestions, answerkey: generatedAnswers });
      }
      if(task==='Sentence Completion'){
        const prompt = generatePrompt(task, difficulty);
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model,
          messages: [{ role: 'system', content: prompt }],
        }, {
          headers: {
            'Authorization': `Bearer ${READING_OPENROUTER_API_KEY}`
          }
        });
  
        const text = response.data.choices[0].message.content.trim();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const generatedParagraph = lines[0];
        const generatedQuestions = [];
        const generatedAnswer = [];
    
        for(let i = 1; i <= 5;i++) {
          generatedQuestions.push(lines[i]);
        }
        for(let i = 7; i <= 11; i++) {
          const stringArray = lines[i].split(";");
          generatedAnswer.push(stringArray);
        }
    
        res.json({ paragraph: generatedParagraph, questions: generatedQuestions, answers: generatedAnswer});
      }
      if(task==='Pick From A List'){
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model,
          messages: [{ role: 'system', content: generatePrompt(task, difficulty) }],
        }, {
          headers: {
            'Authorization': `Bearer ${READING_OPENROUTER_API_KEY}`
          }
        });
        const text = response.data.choices[0].message.content.trim();
        const [generatedParagraph, ...lmaobruhbruh] = text.split('\n').filter(line => line.trim() !== '');
        const generatedQuestions=[];
        const generatedAnswer=[];
        for(var i=0;i<9;i++){
          generatedQuestions.push(lmaobruhbruh[i]);
        }
        for(var i=10;i<=15;i++){
          generatedAnswer.push(lmaobruhbruh[i]);
        }
        console.log(generatedParagraph);
        console.log(generatedQuestions);
        console.log(generatedAnswer);
        res.json({ paragraph: generatedParagraph, questions: generatedQuestions,answerkey:generatedAnswer });
      }
    } catch (error) {
      console.error('Error fetching reading material:', error);
      res.status(500).json({ error: 'Failed to fetch reading material' });
    }
  });

module.exports = router;
