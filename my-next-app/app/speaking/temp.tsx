'use client'

import { CircularProgress } from "@mui/material";
import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RecordRTC from 'recordrtc';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './styles.css';

declare const window: any;

const SpeakingPage = () => {
    const [prompt, setPrompt] = useState('');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
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
    const recognitionRef = useRef<any>(null);
    const startTimeRef = useRef<number | null>(null);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const mediaRecorderRef = useRef<RecordRTC | null>(null);
    const audioBlobRef = useRef<Blob | null>(null);

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

    const getRandomPrompt = (task: number) => {
        setActiveTask(task);
        const newIsFetching = [...isFetching];
        newIsFetching[task - 1] = true;
        setIsFetching(newIsFetching);

        const taskMessages: { [key: number]: string } = {
            1: "Give me about 7 words speaking prompt for IELTS Speaking Task 1 without bold, highlighted text or special start character",
            2: "Give me about 15 words speaking prompt for IELTS Speaking Task 2 without bold, highlighted text or special start character",
            3: "Give me about 20 words speaking prompt for IELTS Speaking Task 3 without bold, highlighted text or special start character",
            4: "Give me about 25 words speaking prompt for IELTS Speaking Task 4 without bold, highlighted text or special start character"
        };

        setTaskType(task);

        fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.SPEAKING_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o-mini",
                "messages": [
                    { "role": "user", "content": taskMessages[task] },
                ],
            })
        })
        .then(response => response.json())
        .then(data => {
            const messageContent = data.choices[0].message.content;
            setPrompt(messageContent);
            newIsFetching[task - 1] = false;
            setIsFetching(newIsFetching);
            setActiveTask(null);
        })
        .catch(error => {
            console.error('Error:', error);
            setError('An error occurred while fetching the prompt.');
            newIsFetching[task - 1] = false;
            setIsFetching(newIsFetching);
            setActiveTask(null);
        });
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

    const handleSaveRecord = () => {
        if (rating && feedback && wordsPerMinute && fluency) {
            saveRecord(transcript, prompt, audioBlobRef.current, rating, feedback, wordsPerMinute, fluency);
        }
    };

    const rateTranscript = (transcript: string, prompt: string) => {
        fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.SPEAKING_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o-mini",
                "messages": [
                    { "role": "user", "content": `Rate the following transcript based on the IELTS Speaking band without asterisk character in returned rating. Each part of the returned rating should start with a hyphen, and add line breaks before any hyphen. Overall band score should be on the first line starting with "- Overall Speaking Band Score: ". Prompt: "${prompt}". Transcript: "${transcript}"` },
                ],
            })
        })
        .then(response => response.json())
        .then(data => {
            const messageContent = formatWithLineBreaks(data.choices[0].message.content);
            setRating(messageContent);
            checkRecordingCompletion(); // Check if recording completion tasks are done
        })
        .catch(error => {
            console.error('Error:', error);
            setError('An error occurred while rating the transcript.');
        });
    };

    const getFeedback = (transcript: string, prompt: string) => {
        fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.SPEAKING_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o-mini",
                "messages": [
                    { "role": "user", "content": `Give feedback for improvement and a short example answer script based on the IELTS Speaking band without asterisk character in returned feedback. Each part of the returned feedback should start with a hyphen, and add line breaks before any hyphen. Prompt: "${prompt}". Transcript: "${transcript}"` },
                ],
            })
        })
        .then(response => response.json())
        .then(data => {
            const messageContent = formatWithLineBreaks(data.choices[0].message.content);
            setFeedback(messageContent);
            checkRecordingCompletion(); // Check if recording completion tasks are done
        })
        .catch(error => {
            console.error('Error:', error);
            setError('An error occurred while getting feedback.');
        });
    };

    const checkRecordingCompletion = () => {
        if (rating && feedback) {
            handleSaveRecord();
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
            setError('An error occurred while accessing the microphone.');
            setIsLoading(false);
        });
    };

    const stopSpeechRecognition = () => {
        setIsLoading(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stopRecording(() => {
                audioBlobRef.current = mediaRecorderRef.current?.getBlob() || null;
            });
        }
    };

    const calculateWordsPerMinute = () => {
        if (startTimeRef.current && transcript) {
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

    return (
        <div>
            <Header />
            <div className="container mx-auto my-8 p-4 border border-gray-300 rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">IELTS Speaking Practice</h1>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Task Type:</label>
                    <div className="flex space-x-4">
                        {[1, 2, 3, 4].map((taskNumber) => (
                            <button
                                key={taskNumber}
                                className="custom-button"
                                onClick={() => getRandomPrompt(taskNumber)}
                                disabled={activeTask !== null && activeTask !== taskNumber}
                            >
                                {isFetching[taskNumber - 1] ? <div className="spinner"></div> : `Task ${taskNumber}`}
                            </button>
                        ))}
                    </div>
                </div>
                {prompt && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prompt:</label>
                        <p className="p-2 bg-gray-100 border rounded">{prompt}</p>
                    </div>
                )}
                <div className="mb-4">
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={startSpeechRecognition}
                    >
                        Start Recording
                    </button>
                    {isLoading && (
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-4"
                            onClick={stopSpeechRecognition}
                        >
                            Stop Recording
                        </button>
                    )}
                </div>
                {taskType === 2 && isLoading && (
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
                {rating && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating:</label>
                        <pre className="p-2 bg-gray-100 border rounded whitespace-pre-wrap">{rating}</pre>
                    </div>
                )}
                {feedback && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Feedback:</label>
                        <pre className="p-2 bg-gray-100 border rounded whitespace-pre-wrap">{feedback}</pre>
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
                <div className="mb-4">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={downloadAllRecords}
                    >
                        Download All Records
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-4"
                        onClick={clearRecords}
                    >
                        Clear Records
                    </button>
                </div>

                {/* Displaying past records */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Past Records</h2>
                    {records.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {records.map((record, index) => (
                                <li key={index} className="mb-2">
                                    <div className="border p-2 rounded mb-2">
                                        <p><strong>Record {index + 1}:</strong></p>
                                        <p><strong>Prompt:</strong> {record.prompt}</p>
                                        <div>
                                            <p><strong>
                                                Transcript:{' '}
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
                                                Rating:{' '}
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
                                                Feedback:{' '}
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
                                        <p><strong>Words Per Minute:</strong> {record.wordsPerMinute}</p>
                                        <p><strong>Fluency:</strong> {record.fluency}</p>
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
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No past records available.</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SpeakingPage;