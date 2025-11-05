'use client';

import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Container, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';


import Head from 'next/head';
import { motion } from 'framer-motion';
import config from '../config';

/////??/////////////////////CSS////////////////////////////////////////////////////////
const paperStyle1 = {
    padding: '20px',
    fontFamily: '"JetBrains Mono", monospace', 
    textAlign: 'center' as const,
    width: '80%', // Change the width
    maxWidth: '370px', // Optional: set a max width
    height : '150px',
    margin: '20px 0 20px 0', // Move the Paper component to the left
    fontSize: '16px', // Change the font size
    backgroundColor: '#d6f6e1', // Color for the second Paper
  };
const paperStyle2 = {
    padding: '20px',
    fontFamily: '"JetBrains Mono", monospace', 
    textAlign: 'center' as const,
    width: '80%', // Change the width
    maxWidth: '370px', // Optional: set a max width
    margin: '20px 0 20px 0', // Move the Paper component to the left
    fontSize: '16px', // Change the font size
    height : '150px',
    backgroundColor: '#f1f3e5', // Color for the second Paper
  };
const paperStyle3 = {
    padding: '20px',
    fontFamily: '"JetBrains Mono", monospace', 
    textAlign: 'center' as const,
    width: '80%', // Change the width
    maxWidth: '370px', // Optional: set a max width
    margin: '20px 0 20px 0', // Move the Paper component to the left
    fontSize: '16px', // Change the font size
    height : '150px',
    backgroundColor: '#fddfdf', // Color for the second Paper
  };
const textBandScore = {
    marginBottom: '10px',
    fontSize: '60px',
    textAlign: 'center' as const,
    fontFamily: '"JetBrains Mono", monospace', // Apply JetBrains Mono font
    color: '#019e43', // Change to your desired color
    fontWeight : 1000,
  };
const bandScore = {
    padding: '20px',
    fontFamily: '"JetBrains Mono", monospace', 
    textAlign: 'center' as const,
    width: '1000%', // Change the width
    maxWidth: '1150px', // Optional: set a max width
    fontSize: '16px', // Change the font size
    height : '180px',
    backgroundColor: '#ffffff', // Color for the second Paper
  }
const typographyStyle = {
    fontWeight : 600,
    marginBottom: '20px',
    textAlign: 'center' as const,
    fontFamily: '"JetBrains Mono", monospace', // Apply JetBrains Mono font
  };
const headStyle = {
    margin : '20px',
    marginBottom: '10px',
    textAlign: 'center' as const,
    fontSize : '40px',
    fontFamily: '"JetBrains Mono", monospace', // Apply JetBrains Mono font
  };
const descriptionStyle = {
    fontFamily: '"JetBrains Mono", monospace', 
    fontSize: '14px', // Change the font size
  }
const flexContainerStyle = {
    display: 'flex',
    gap : '19.5px',
};

// custom cho tung phan ________________________________________________
const flexContainerStyleDetail = {
    display: 'flex',
    gap : '19.5px',
};
const paperStyleDetail = {
    padding: '20px',
    fontFamily: '"JetBrains Mono", monospace', 
    textAlign: 'center' as const,
    width: '80%', // Change the width
    maxWidth: '700px', // Optional: set a max width
    height : 'auto',
    margin: '20px 0 20px 0', // Move the Paper component to the left
    fontSize: '16px', // Change the font size
    backgroundColor: '#f4f4f4' // Color for the second Paper
  };
const markdownContainerStyle = {
    fontSize: '20px', // Change to your desired font size
  };


const topicsTask1 = ['line graph', 'bar chart', 'table', 'pie chart', 'compare two pie chart'];
const topicsTask2 = [
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

const linkingWords = ["and","but","or","so","because","therefore","however","moreover","although","nevertheless","furthermore","in addition","for example","for instance","meanwhile","subsequently","consequently","hence","thus","otherwise","in contrast","likewise","similarly","instead","nonetheless","on the other hand","as a result","in the meantime","despite","even though","since","when","while","until","once","before","after","as soon as","unless","whereas"];
  


// Example of animating buttons
const buttonVariants = {
    hover: {
        scale: 1.1,
        transition: {
            duration: 0.3,
            yoyo: Infinity
        }
    }
};


const WritingPageTask1: React.FC = () => {
    // const [topic, setTopic] = useState<string>('');
    // const [task, setTask] = useState<string>('');
    const [paragraph, setParagraph] = useState<string>('');
    const [evaluation, setEvaluation] = useState<string | null>(null);
    const [loadingTask, setLoadingTask] = useState<boolean>(false);
    const [loadingEvaluation, setLoadingEvaluation] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<string>('');
    const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
    const [wordcount, setWordcount] = useState<string | null>(null);
    const [wordlinkcount, setWordlinkcount] = useState<string | null>(null);
    const [grammar, setGrammar] = useState<string | null>(null);

    const [point1, setpoint1] = useState<string | null>(null);
    const [d1 , setd1] = useState<string | null>(null);

    const [point2, setpoint2] = useState<string | null>(null);
    const [d2, setd2] = useState<string | null>(null);

    const [point3, setpoint3] = useState<string | null>(null);
    const [d3, setd3] = useState<string | null>(null);

    const [point4, setpoint4] = useState<string | null>(null);
    const [d4, setd4] = useState<string | null>(null);

    const [highlightedText, setHighlightedText] = useState(null);

    const [rewritePara, setRewritePara] = useState<string>('');

    const [task, setTask] = useState<string>('');
    const [taskId, setTaskId] = useState<string>('');
    const [topic, setTopic] = useState<string>('');
    const [topics, setTopics] = useState<string[]>([]);
    const [problem, setProblem] = useState<string>('');
    const [image, setImage] = useState<string>('');
    const [hasImage, setHasImage] = useState<boolean>(false);
    const contentType = 'image/png';

    // const handleTaskChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    //     const selectedTask = event.target.value as string;
    //     setTask(selectedTask);
    //     setTopics(selectedTask === 'Task 1' ? topicsTask1 : topicsTask2);
    //     setTopic('');
    //   };
    
    // const handleTopicChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    // setTopic(event.target.value as string);
    // };

    const handleTaskChange = (event: SelectChangeEvent<string>) => {
      const selectedTask = event.target.value as string;
      setTask(selectedTask);
      setTopics(selectedTask === 'Task 1' ? topicsTask1 : topicsTask2);
      setTopic('');
  };
  
  // Function to handle topic change
  const handleTopicChange = (event: SelectChangeEvent<string>) => {
      setTopic(event.target.value as string);
  };

    const handleFetchProblem = async () => {
    try {
      console.log("Fetching problem for topic:", topic);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${config.API_BASE_URL}api/getprob`, {topic}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      setProblem(res.data.task);
      setTaskId(res.data.id);
      if(res.data.image == null || res.data.image == "null"){
        setHasImage(false);
      }
      else{
        setHasImage(true);
      }
      setImage(res.data.image);
    } catch (error) {
        console.error('Error fetching problem:', error);
    }
    };


    let Num1: string = "this" , Num2: string = "" , Num3: string = "" , Num4: string = "";

    const runAllFunctions = async (): Promise<void> => {
        setLoadingEvaluation(true);
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
        try {
            var tt = "task1";
            if(task == "Task 2") tt = "task2";
            const res = await axios.post(`${config.API_BASE_URL}api/evaluate-${tt}`, { task_id:taskId, paragraph }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // res.json({cntWord: ((paragraph.trim().split(/\s+/).filter(Boolean)).length).toString(), cntLinking, cntGramar:ans[0], boldmistake: ans[1], coherence: ans[2], des_coherenece:ans[3],  lexical:ans[4], des_lexical:ans[5], gramar_range: ans[6], des_gramar_range:ans[7], task_archive:ans[8], des_task_archive:ans[9]});
            
            setWordcount(res.data.cntWord);
            setWordlinkcount(res.data.cntLinking);
            setGrammar(res.data.cntGramar);

            Num1 = res.data.coherence;
            Num1 = Num1.replace('[','');
            Num1 = Num1.replace(']','');
            setd1(res.data.des_coherenece);
            setpoint1(Num1);

            
            Num2 = res.data.lexical;
            Num2 = Num2.replace('[','');
            Num2 = Num2.replace(']','');
            setd2(res.data.des_lexical);
            setpoint2(Num2);

            
            Num3 = res.data.gramar_range;
            Num3 = Num3.replace('[','');
            Num3 = Num3.replace(']','');
            setpoint3(Num3);
            setd3(res.data.des_gramar_range);

            
            Num4 = res.data.task_archive;
            Num4 = Num4.replace('[','');
            Num4 = Num4.replace(']','');
            setpoint4(Num4);
            setd4(res.data.des_task_archive);

            setRewritePara(res.data.boldmistake);

            const num1 = parseFloat(Num1);
            const num2 = parseFloat(Num2);
            const num3 = parseFloat(Num3);
            const num4 = parseFloat(Num4);

            if(num1 == null || num2 == null || num3 == null || num4 == null) return;
            let cur = (num1 + num2 + num3 + num4) / 4.0;
            let dcm = cur - Math.floor(cur);
            if(dcm < 0.25) dcm = 0;
            else if(dcm >= 0.25 && dcm <= 0.5) dcm = 0.5;
            else if(dcm > 0.5 && dcm < 0.75) dcm = 0.5;
            else cur = Math.floor(cur) + 1, dcm = 0;
            const point = Math.floor(cur) + dcm;
            setEvaluation(point.toString());
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 401) {
                    alert('Please log in to evaluate a paragraph.');
                } else {
                    console.error('Error evaluate a paragraph:', error);
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
        finally{
            setLoadingEvaluation(false);
        }
    };
      
    
    const underlineText = (text: string) => {
        const escapedLinkingWords = linkingWords.map(
            word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        );
    
        // Create a regex pattern with all linking words joined by '|'.
        const pattern = new RegExp(`\\b(${escapedLinkingWords.join('|')})\\b`, 'gi');
    
        // Replace matching linking words with wrapped versions.
        const ntext = text.replace(pattern, '[$1]');
        const parts = ntext.split(/(\[.*?\]|\*\*.*?\*\*)/g); // Split the text by brackets and asterisks
        return parts.map((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            return (
              <span key={index} style={{ backgroundColor: '#f7ecb5' }}>
                {part.slice(1, -1)}
              </span>
            );
          } else if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={index} style={{ textDecoration: 'underline',textDecorationColor: 'red' }}>
                {part.slice(2, -2)}
              </span>
            );
          } else {
            return part;
          }
        });
      }

    return (
        <div>
            <Header />
            <div className="bg-gradient-to-b from-transparent to-white text-gray-800 min-h-screen flex items-center justify-center">
                <Container style = {{maxWidth : 'ld',}}>
                <Container>
                </Container>
                <Typography style = {headStyle}>
                    IELTS Writing Practice
                </Typography>             
                    
                <Paper elevation={3} className="p-10 mb-10 rounded-lg">
                      <div>
                      <FormControl fullWidth margin="normal">
                          <InputLabel>Task</InputLabel>
                          <Select value={task} onChange={handleTaskChange}>
                          <MenuItem value="Task 1">Task 1</MenuItem>
                          <MenuItem value="Task 2">Task 2</MenuItem>
                          </Select>
                      </FormControl>
                      {task && (
                          <FormControl fullWidth margin="normal">
                          <InputLabel>Topic</InputLabel>
                          <Select value={topic} onChange={handleTopicChange}>
                              {topics.map((topic, index) => (
                              <MenuItem key={index} value={topic}>
                                  {topic}
                              </MenuItem>
                              ))}
                          </Select>
                          </FormControl>
                      )}
                      <Button
                          variant="contained"
                          color="primary"
                          onClick={handleFetchProblem}
                          disabled={!topic}
                      >
                          Fetch Random Problem
                      </Button>
                      </div>
                    </Paper>

                    {task && (
                        <Paper elevation={3} className="p-10 mb-10 rounded-lg">
                            {/* <Typography variant="h5" className="text-xl mb-3 text-blue-900 text-center">
                                Generated Task
                            </Typography>
                            <ReactMarkdown>{task}</ReactMarkdown> */}
                            {problem && (<ReactMarkdown>{problem}</ReactMarkdown>)}
                            {hasImage && (<img
                              src={`data:${contentType};base64,${image}`}
                              alt={'graph.jpg'}
                              className="w-full h-auto rounded-lg mb-4"
                            />)}
                            
                        </Paper>
                    )}
                    <Paper elevation={3} className="p-10 mb-10 rounded-lg">
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Your Paragraph"
                            variant="outlined"
                            value={paragraph}
                            onChange={(e) => setParagraph(e.target.value)}
                            style={{ width: '100%', marginBottom: '2rem' }} // Adjust width and add margin bottom as needed
                        />
                        <div className="flex justify-center">
                            <motion.button
                                variants={buttonVariants} // Apply the animation variant
                                whileHover="hover" // Trigger the animation on hover
                                onClick={() => {
                                    runAllFunctions();
                                  }}
                                disabled={loadingTask}
                                className={`w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-blue-500 focus:outline-none focus:ring ${loadingEvaluation ? 'opacity-90 cursor-not-allowed' : ''}`}
                            >
                                {loadingEvaluation ? <CircularProgress size={24} color="inherit" style={{ marginLeft: 'auto', marginRight: 'auto' }} /> : 'Evaluate Paragraph'}
                            </motion.button>
                        </div>
                    </Paper>
                    
                    {point1 && point2 && point3 && point4 &&(
                        <Paper style={{ padding: '16px', marginTop: '2rem', height: 'auto' }}>
                        <Typography style = {typographyStyle}>
                          Some Note On Your Paragraph
                        </Typography>
                        <div>{underlineText(rewritePara)}</div>
                      </Paper>
                    )}
                    {point1 && point2 && point3 && point4 &&(
                            <div style={flexContainerStyle}>
                            <Paper style={paperStyle1}>
                              <Typography variant="h6" component="h2" style={typographyStyle}>
                                Words
                                <Typography variant="h6" component="h2" style={descriptionStyle}>
                                Above 250 words.
                              </Typography>
                              </Typography>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{wordcount}</ReactMarkdown>
                                </div>
                            </Paper>
                            <Paper style={paperStyle2}>
                              <Typography variant="h6" component="h2" style={typographyStyle}>
                                Linking Words
                                <Typography variant="h6" component="h2" style={descriptionStyle}>
                                  Above 7 words.
                              </Typography>
                              </Typography>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{wordlinkcount}</ReactMarkdown>
                                </div>
                            </Paper>
                            <Paper style={paperStyle3}>
                              <Typography variant="h6" component="h2" style={typographyStyle}>
                                Grammar mistakes
                                <Typography variant="h6" component="h2" style={descriptionStyle}>
                                          .
                              </Typography>
                              </Typography>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{grammar}</ReactMarkdown>
                              </div>
                            </Paper>
                          </div>
                          
                    )}
                    {point1 && point2 && point3 && point4 &&(
                            <Paper style={bandScore}>
                             <Typography variant="h6" component="h2" style={textBandScore}>
                                {evaluation}
                             </Typography>
                             <Typography variant="h6" component="h2" style={typographyStyle}>
                                Overall Band Score
                             </Typography>
                            </Paper>
                    )}
                    {point1 && point2 && point3 && point4 &&(
                            <div style={flexContainerStyleDetail}>
                            <Paper style={paperStyleDetail}>
                              <Typography variant="h6" component="h2" style={typographyStyle}>
                              COHERENCE AND COHESION
                              </Typography>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{point1}</ReactMarkdown>
                              </div>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{d1}</ReactMarkdown>
                              </div>
                            </Paper>
                            <Paper style={paperStyleDetail}>
                              <Typography variant="h6" component="h2" style={typographyStyle}>
                              LEXICAL RESOURCE
                              </Typography>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{point2}</ReactMarkdown>
                              </div>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{d2}</ReactMarkdown>
                              </div>
                            </Paper>
                          </div>
                    )}
                    {point1 && point2 && point3 && point4 &&(
                            <div style={flexContainerStyleDetail}>
                            <Paper style={paperStyleDetail}>
                              <Typography variant="h6" component="h2" style={typographyStyle}>
                              GRAMMATICAL RANGE
                              </Typography>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{point3}</ReactMarkdown>
                              </div>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{d3}</ReactMarkdown>
                              </div>
                            </Paper>
                            <Paper style={paperStyleDetail}>
                              <Typography variant="h6" component="h2" style={typographyStyle}>
                              TASK ACHIEVEMENT
                              </Typography>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{point4}</ReactMarkdown>
                              </div>
                              <div style={markdownContainerStyle}>
                                <ReactMarkdown>{d4}</ReactMarkdown>
                              </div>
                            </Paper>
                          </div>
                    )}
                    {suggestions && (
                        <Paper elevation={3} className="p-4 mb-4 rounded-lg">
                            <Typography variant="h5" className="text-white mb-3 text-blue-900 text-center">
                                Suggestions & Explanations
                            </Typography>
                            <ReactMarkdown>{suggestions}</ReactMarkdown>
                        </Paper>
                    )}
                </Container>
            </div>
            <Footer />
        </div>
    );
};

export default WritingPageTask1;
