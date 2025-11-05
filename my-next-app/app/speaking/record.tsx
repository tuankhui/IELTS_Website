'use client'

import { CircularProgress } from "@mui/material";
import React, { useState, useRef, useEffect, ChangeEvent} from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RecordRTC from 'recordrtc';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './styles.css';
import config from '../config';
import axios from 'axios';
import Textarea from '@mui/joy/Textarea';
import Markdown from 'react-markdown'

declare const window: any;

interface MyComponentState {
    userInput: string;
}

const SpeakingPage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const [topicInput, setTopicInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState([false, false, false, false]);
    const [activeTask, setActiveTask] = useState<number | null>(null);
    const [transcriptExpanded, setTranscriptExpanded] = useState(true);
    const [ratingExpanded, setRatingExpanded] = useState(true);
    const [feedbackExpanded, setFeedbackExpanded] = useState(true);
    const [rating, setRating] = useState('');
    const [feedback, setFeedback] = useState('');
    const [wordsPerMinute, setWordsPerMinute] = useState(0);
    const [fluency, setFluency] = useState('');
    const [taskType, setTaskType] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes countdown for Task 2
    const [records, setRecords] = useState<any[]>([]); // State to store past records
    const [curRecords, setCurRecords] = useState<any>(); // State to store past records
    const [Data, setData] = useState<any[]>([]); 
    const [showingPrompt, setShowingPrompt] = useState(false);
    const recognitionRef = useRef<any>(null);
    const startTimeRef = useRef<number | null>(null);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const mediaRecorderRef = useRef<RecordRTC | null>(null);
    const audioBlobRef = useRef<Blob | null>(null);
    const [editable, setEditable] = useState(false);
    const [startTest, setStartTest] = useState(false);
    const [promptExist, setPromptExist] = useState(false);
    const [deleleRecordButton, setDeleteRecordButton] = useState(false);
    const [savingToDatabase, setSavingToDatabase] = useState(false);
    const [saved, setSaved] = useState(false);
    const [audioURL, setAudioURL] = useState('');

    const toggleTranscript = () => {
        setTranscriptExpanded(!transcriptExpanded);
    };
    
    const toggleRating = () => {
        setRatingExpanded(!ratingExpanded);
    };
    
    const toggleFeedback = () => {
        setFeedbackExpanded(!feedbackExpanded);
    };

    const formatWithLineBreaks = (text: string) => {
        return text.split('-').map((line, index) => index === 0 ? line : `- ${line}`).join('\n');
    };

    const handlePromptGeneration = () => {
        const topic = topicInput.trim(); // Use topicInput state for the topic
        if (topic) {
            setTopicInput(topic);
        } else {
            setError('Please enter a topic for the prompt.');
        }
    };

    const getRandomPrompt = async (tasknumber: number, topic: string) => {
        setSaved(false);
        setTranscript('');
        setError('');
        setRating('');
        setFeedback('');
        setWordsPerMinute(0);
        setFluency('');
        setDeleteRecordButton(false);
        setActiveTask(tasknumber);
        setShowingPrompt(false);
        const newIsFetching = [...isFetching];
        newIsFetching[tasknumber - 1] = true;
        setIsFetching(newIsFetching);
        const token = localStorage.getItem('token');
        setPromptExist(false);

        setTaskType(tasknumber);

        try {
            const response = await axios.post(`${config.API_BASE_URL}api/generate_speaking_task`, {tasknumber,topic},{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setPrompt(response.data.task);
            setPromptExist(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 401) {
                    alert('Please log in to generate a task.');
                } else {
                    console.error('Error generating task:', error);
                }
            } else {
                console.error('Unexpected error:', error);
            }
        } finally {
            newIsFetching[tasknumber - 1] = false;
            setIsFetching(newIsFetching);
            setActiveTask(null);
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (taskType === 2 && isLoading && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0) {
            stopSpeechRecognition();
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isLoading, taskType]);

    useEffect(() => {
        const savedRecords = JSON.parse(localStorage.getItem('speakingRecords') || '[]');
        if (Array.isArray(savedRecords)) {
            setRecords(savedRecords);
        } else {
            console.error('Records retrieved from localStorage are not an array:', savedRecords);
        }
    }, []);

    const rateTranscript = async (transcript: string, prompt: string) => {
        const token = localStorage.getItem('token');
        console.log("RATING HERE:");
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_rating`, { prompt, transcript },{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRating(response.data.evaluation);
            checkRecordingCompletion();
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while rating the transcript.');
        }
    };

    const getFeedback = async (transcript: string, prompt: string) => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_feedback`, { prompt, transcript },{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFeedback(response.data.feedback);
            checkRecordingCompletion();
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while rating the transcript.');
        }
    };

    const checkRecordingCompletion = () => {
        if (rating && feedback) {
            saveRecord;
        }
    };

    let timerInterval: NodeJS.Timeout | null = null;
    
    const startPrepare = () => {
        setStartTest(true);
        setPromptExist(false);
        setShowingPrompt(true);
        setEditable(true);
        setTimeLeft(240); 
        timerInterval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    stopPrepare();
                    return 0;
                }
            });
        }, 1000);
    };
    
    const stopPrepare = () => {
        setEditable(false);
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    };

    const startSpeechRecognition = () => {
        setIsLoading(true);
        setTranscript(''); // Clear the transcript when starting a new recording
        setError('');
        setRating('');
        setFeedback('');
        setWordsPerMinute(0);
        setFluency('');
        startTimeRef.current = Date.now(); // Record the start time
        setTimeLeft(120); // Reset the timer for Task 2

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser.');
            setIsLoading(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true; // Allows for continuous speech recognition
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[event.resultIndex][0].transcript;
            setTranscript(prev => prev + ' ' + result);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setError('An error occurred during speech recognition');
            setIsLoading(false);
        };

        recognition.onend = () => {
            setIsLoading(false);
            calculateWordsPerMinute(); // Calculate words per minute when recognition ends
            rateTranscript(transcript, prompt); // Rate the transcript after stopping
            getFeedback(transcript, prompt); // Get feedback after stopping
        };

        recognition.start();

        // Start audio recording
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const mediaRecorder = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/wav',
                recorderType: RecordRTC.StereoAudioRecorder,
                desiredSampRate: 16000,
            });
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.startRecording();
        }).catch(error => {
            console.error('Audio recording error:', error);
            setError('An error occurred while a vccessing the microphone.');
            setIsLoading(false);
        });
    };

    const stopSpeechRecognition = () => {
        setDeleteRecordButton(true);
        setIsLoading(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stopRecording(() => {
                const audioBlob = mediaRecorderRef.current?.getBlob();
                if (audioBlob) {
                    const audioURL = URL.createObjectURL(audioBlob);
                    setAudioURL(audioURL);
                    audioBlobRef.current = audioBlob;
                    setCurRecords(audioBlobRef.current); 
                }
            });
        }
    };

    const calculateWordsPerMinute = () => {
        if (startTimeRef.current) {
            const endTime = Date.now();
            const durationInMinutes = (endTime - startTimeRef.current) / 60000;
            const wordsArray = transcript.trim().split(/\s+/);
            const wordsCount = wordsArray.length;
            const wpm = (wordsCount / durationInMinutes).toFixed(2);
            setWordsPerMinute(parseFloat(wpm));
            setFluency(parseFloat(wpm) > 100 ? 'Fluent' : 'Non-Fluent');
        }
    };

    const saveRecord = (transcript: string, prompt: string, audioBlob: Blob | null, rating: string, feedback: string, wordsPerMinute: number, fluency: string) => {
        const newRecord = {
            transcript,
            prompt,
            audioBlob,
            rating,
            feedback,
            wordsPerMinute,
            fluency,
            timestamp: new Date().toISOString()
        };
        const updatedRecords = [...records, newRecord];
        setRecords(updatedRecords);
        localStorage.setItem('speakingRecords', JSON.stringify(updatedRecords));
    };

    const downloadRecord = async (record: any, index: number) => {
        const zip = new JSZip();
        const folder = zip.folder(`record_${index + 1}`);
        folder?.file('transcript.txt', record.transcript);
        folder?.file('prompt.txt', record.prompt);
        folder?.file('rating.txt', record.rating);
        folder?.file('feedback.txt', record.feedback);
        folder?.file('details.txt', `Words Per Minute: ${record.wordsPerMinute}\nFluency: ${record.fluency}`);
        if (record.audioBlob) {
            folder?.file('audio.wav', record.audioBlob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `record_${index + 1}.zip`);
    };

    const deleteRecord = (index: number) => {
        const updatedRecords = records.filter((_, i) => i !== index);
        setRecords(updatedRecords);
        localStorage.setItem('speakingRecords', JSON.stringify(updatedRecords));
    };

    const downloadAllRecords = async () => {
        const zip = new JSZip();

        records.forEach((record, index) => {
            const folder = zip.folder(`record_${index + 1}`);
            folder?.file('transcript.txt', record.transcript);
            folder?.file('prompt.txt', record.prompt);
            folder?.file('rating.txt', record.rating);
            folder?.file('feedback.txt', record.feedback);
            folder?.file('details.txt', `Words Per Minute: ${record.wordsPerMinute}\nFluency: ${record.fluency}`);
            if (record.audioBlob) {
                folder?.file('audio.wav', record.audioBlob);
            }
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'speaking_records.zip');
    };

    const clearRecords = () => {
        setRecords([]);
        localStorage.removeItem('speakingRecords');
    };

    const saveToDataBase = async () => {
        setSavingToDatabase(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/save_to_database`, { prompt, transcript, rating, feedback, wordsPerMinute, fluency, curRecords},{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } finally {
            setSavingToDatabase(false);
            setSaved(true);
        }
    };

    const getMongoDB = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}api/get_data`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setData(response.data.result);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="flex justify-center mx-8">
                <div className="w-1/2 container mx-auto my-4 p-4 border border-gray-300 rounded shadow-md mr-4">
                    <h1 className="text-2xl font-bold mb-4">IELTS Speaking Practice</h1>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Topic:</label>
                        <input
                            type="text"
                            className="border border-gray-300 px-3 py-2 rounded-md w-full"
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.target.value)}
                            placeholder="Enter topic for the prompt"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Task Type:</label>
                        <div className="flex space-x-4">
                            {[1, 2, 3].map((taskNumber) => (
                                <button
                                    key={taskNumber}
                                    className="custom-button"
                                    onClick={() => getRandomPrompt(taskNumber,topicInput)}
                                    disabled={activeTask !== null && activeTask !== taskNumber}
                                >
                                    {isFetching[taskNumber - 1] ? <div className="spinner"></div> : `Task ${taskNumber}`}
                                </button>
                            ))}
                        </div>
                    </div>
                    {prompt && (
                        <div className="mb-4">
                            {!editable && promptExist && (
                                <button
                                className="px-4 py-2 bg-blue-500 text-white rounded bg-green-600"
                                onClick={startPrepare}
                                >
                                Start The Test
                                </button>
                            )}
                            {showingPrompt && (
                                <div className="mb-4">
                                    <p className="text-back-500">
                                        You will have 6 minutes <span className="text-black-500">(including time for this instructions)</span> to:
                                    </p>
                                    <p className="text-back-500 mb-3">
                                        &#8226; Read the task statement <span className="text-black-500">(30 seconds)</span><br />
                                        &#8226; Prepare for your script <span className="text-black-500">(3 minute)</span><br />
                                        &#8226; Record your speaking <span className="text-black-500">(2 minutes)</span><br />
                                        &#8226; And extra 30 seconds to read this instructions
                                    </p>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Statement:</label>
                                    <p className="p-2 bg-gray-100 border rounded">{prompt}</p>
                                </div>
                            )}
                            {editable && (
                                <div className="mb-4">
                                    <p className="text-red-500 mb-3">Time left: {timeLeft} seconds</p>
                                    <button
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={stopPrepare}
                                    >
                                        Stop Preparing
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="mb-4">
                        {showingPrompt && !editable && !deleleRecordButton && (
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={startSpeechRecognition}
                            >
                                Start Recording
                            </button>
                        )}
                        {isLoading && (
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-4"
                                onClick={stopSpeechRecognition}
                            >
                                Stop Recording
                            </button>
                        )}
                    </div>
                    {isLoading && (
                        <div className="mb-4">
                            <p className="text-red-500">Time left: {timeLeft} seconds</p>
                        </div>
                    )}
                    {error && (
                        <div className="mb-4">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}
                    {transcript && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transcript:</label>
                            <p className="p-2 bg-gray-100 border rounded">{transcript}</p>
                        </div>
                    )}
                    {wordsPerMinute > 0 && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Words Per Minute:</label>
                            <p className="p-2 bg-gray-100 border rounded">{wordsPerMinute}</p>
                        </div>
                    )}
                    {fluency && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fluency:</label>
                            <p className="p-2 bg-gray-100 border rounded">{fluency}</p>
                        </div>
                    )}
                    {rating && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating:</label>
                            <pre className="p-2 bg-gray-100 border rounded whitespace-pre-wrap">
                                {rating}
                            </pre>
                        </div>
                    )}
                    {feedback && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Example Script:</label>
                            <pre className="p-2 bg-gray-100 border rounded whitespace-pre-wrap">
                                {feedback}
                            </pre>
                            {!saved && (
                                <button
                                    className="button p-2 my-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={saveToDataBase}
                                >
                                    {savingToDatabase ? <div className="spinner"></div> : `Saving To DataBase`}
                                </button>
                            )}
                            {saved && (
                                <button
                                    className="button p-2 my-4 mb-4 bg-green-500 text-white rounded hover:bg-green-500"
                                    disabled
                                >
                                    Saved Successfully
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="w-1/2 container mx-auto my-4 p-4 border border-gray-300 rounded shadow-md">
                    <h1 className="text-2xl font-bold mb-4">Note Preparation</h1>
                    {showingPrompt && (
                        <Textarea 
                        placeholder="Type your note here…" 
                        minRows={3}
                        />
                    )}
                    {!showingPrompt && (
                        <Textarea 
                        placeholder="Your test hasn't started yet…" 
                        disabled
                        minRows={3}
                        />
                    )}
                </div>
            </div>
            
            {/* Displaying past records */}
            <div className="">
                <div className="container-fluid my-0.5 p-4 border border-gray-300 rounded shadow-md ml-8 mr-8">
                    <div className="mb-4">
                        <button
                            className="button p-2 my-4 mb-4 bg-[#2196f3] text-white rounded hover:bg-[#2489db]"
                            onClick={getMongoDB}
                        >
                            {isLoading ? <div className="spinner"></div> : `Fetch Data From Database`}
                        </button>
                        <h2 className="text-xl font-bold mb-2">Past Records</h2>
                        {Data.length > 0 ? (
                            <ul className="list-disc list-inside">
                                {Data.slice().reverse().map((record, index) => (
                                    <div className="p-2" key={''}>
                                        <div className="border p-2 rounded my-2 mb-2">
                                            <p><strong>Record {index + 1}:</strong></p>
                                            <p><strong>&#8226; Prompt:</strong> {record.prompt}</p>
                                            <div>
                                                <p><strong>&#8226; Record:{' '}</strong></p>
                                                {audioURL && (
                                                    <div>
                                                        <p><strong>&#8226; Recorded Audio:</strong> {record.prompt}</p>
                                                        <audio controls src={audioURL} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p><strong>
                                                    &#8226; Transcript:{' '}
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={toggleTranscript}
                                                    >
                                                        {transcriptExpanded ? 'See More' : 'See Less'}
                                                    </button>
                                                </strong></p>
                                                <p>
                                                    <pre className="whitespace-pre-wrap">
                                                        {transcriptExpanded ? `${record.transcript.substring(0, 20)}...` : record.transcript}
                                                    </pre>
                                                </p>
                                            </div>
                                            <div>
                                                <p><strong>
                                                    &#8226; Rating:{' '}
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={toggleRating}
                                                    >
                                                        {ratingExpanded ? 'See More' : 'See Less'}
                                                    </button>
                                                </strong></p>
                                                <p>
                                                    <pre className="whitespace-pre-wrap">
                                                        {ratingExpanded ? `${record.rating.substring(0, 50)}...` : record.rating}
                                                    </pre>
                                                </p>
                                            </div>
                                            <div>
                                                <p><strong>
                                                    &#8226; Example Script:{' '}
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={toggleFeedback}
                                                    >
                                                        {feedbackExpanded ? 'See More' : 'See Less'}
                                                    </button>
                                                </strong></p>
                                                <p>
                                                    <pre className="whitespace-pre-wrap">
                                                        {feedbackExpanded ? `${record.feedback.substring(0, 100)}...` : record.feedback}
                                                    </pre>
                                                </p>
                                            </div>
                                            <p><strong>&#8226; Words Per Minute:</strong> {record.wordsPerMinute}</p>
                                            <p><strong>&#8226; Fluency:</strong> {record.fluency}</p>
                                            <button
                                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                                                onClick={() => downloadRecord(record, index)}
                                            >
                                                Download
                                            </button>
                                            <button
                                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                onClick={() => deleteRecord(index)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </ul>
                        ) : (
                            <p>No past records available.</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SpeakingPage;