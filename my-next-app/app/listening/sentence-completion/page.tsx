'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import config from '../../config';

const ReadingPage = () => {
  // variable for sentence completion
  const [paragraph, setParagraph] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('openai/gpt-4o-mini');

  const [candidatePoint, setCandidatePoint] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isTouched, setTouched] = useState(false);
  const [inputValues, setInputValues] = useState<string[][]>([]);
  const [AnswerState, setAnswerState] = useState<number[]>([]);

  // variable for voice
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechActive, setSpeechActive] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [lastChunkIndex, setLastChunkIndex] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef = useRef<string[]>([]);
  const [difficulty, setDifficulty] = useState('Easy');

  const handleClick = () => {
    let currentScore = 0; // Initialize score counter
    let AnswerCheck = [];
    // Iterate over each set of answers
    for (let i = 0; i < answers.length; i++) {
      const userAnswers = [];

      // Collect user answers from inputValues, every second element starting from index 1
      for (let j = 1; j < inputValues[i].length; j += 2) {
        if (inputValues[i][j] === '') {
          userAnswers.push(0); // Push 0 if the value is empty
        } else {
          userAnswers.push(inputValues[i][j]); // Push the actual value otherwise
        }
      }

      // Compare user answers with the correct answers
      for (let j = 0; j < Math.min(answers[i].length, userAnswers.length); j++) {
        console.log(userAnswers[j]);
        if (answers[i][j] === userAnswers[j]) {
          currentScore++;
          AnswerCheck[i] = 1;
        } else AnswerCheck[i] = 0;
      }
    }
    // Update state
    setAnswerState(AnswerCheck);
    setTouched(true);
    setCandidatePoint(currentScore);
  };

  const handleBackButtonClick = () => {
    setTouched(false);
  };

  const handleChange = (questionIndex: number, inputIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValues = [...inputValues];
    newInputValues[questionIndex][inputIndex] = event.target.value;
    setInputValues(newInputValues);
  };

  const renderWithInputs = (text: string, questionIndex: number) => {
    const parts = text.split(/(_+)/); // Split the text by sequences of underscores
    const inputFields = parts.map((part, index) => {
      if (!part.startsWith('__')) return part; // Return the text part as it is
      return (
        <input
          key={index}
          type="text"
          value={inputValues[questionIndex][index] || ''}
          onChange={(event) => handleChange(questionIndex, index, event)}
          className="border-b-2 border-gray-400 focus:border-blue-400 outline-none mx-1"
        />
      );
    });
    return <span>{inputFields}</span>;
  };

  const handleShowDetails = () => {
    setIsTextVisible(!isTextVisible);
  };

  {/* voice here */}

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
      setVoices(englishVoices);
    };

    fetchVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }, []);

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
      setVoices(englishVoices);
    };

    fetchVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }, []);
  
  const speakParagraph = () => {
    if (!paragraph || !selectedVoice) return;

    const chunkSize = 200;
    let chunks = [];
    for (let i = 0; i < paragraph.length; i += chunkSize) {
      chunks.push(paragraph.substring(i, i + chunkSize));
    }
    chunksRef.current = chunks;

    const speakChunksSequentially = (index: number) => {
      if (index >= chunks.length) {
        setSpeechActive(false);
        setCurrentChunkIndex(0);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.pitch = 1;
      utterance.rate = speed;
      utterance.volume = 1;

      utterance.onstart = () => {
        setCurrentChunkIndex(index);
      };

      utterance.onend = () => {
        setLastChunkIndex(index + 1);
        if (speechActive) {
          speakChunksSequentially(index + 1);
        } else {
          setSpeechActive(false); // Ensure speechActive is false when stopping
        }
      };

      window.speechSynthesis.speak(utterance);
      utteranceRef.current = utterance;
    };

    // Stop any ongoing speech synthesis before starting a new one
    window.speechSynthesis.cancel();

    setCurrentChunkIndex(0); // Reset the current chunk index
    setLastChunkIndex(0); // Reset the last chunk index
    setSpeechActive(true);
    speakChunksSequentially(0);
  };

  useEffect(() => {
    if (speechActive) {
      speakParagraph();
    }

    // Cleanup function to stop speech synthesis when the component unmounts or speechActive changes
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [paragraph, selectedVoice, speechActive, speed]);

  const fetchReadingMaterial = async (task : string) => {
    stopSpeech();
    setLoading(true);
    try {
      // Ensure the task parameter is included in the API request
      const response = await axios.post(`${config.API_BASE_URL}api/generate-reading-material`, { model, task });
      const { paragraph, questions, answers } = response.data;
      setParagraph(paragraph);
      setQuestions(questions);
      setAnswers(answers);
      setInputValues(questions.map(() => [])); // Initialize input values for each question
    } catch (error) {
      console.error('Error fetching reading material:', error);
    }
    setLoading(false);
  };

  
  const handleSelectVoice = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoiceName = event.target.value;
    const voice = voices.find(voice => voice.name === selectedVoiceName);

    if (speechActive) {
      stopSpeech();
    }

    setSelectedVoice(voice || null);
  };

  const handleStopOrContinueSpeech = () => {
    if (speechActive) {
      stopSpeech();
    } else {
      continueSpeech();
    }
  };

  const stopSpeech = () => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      window.speechSynthesis.cancel();
    }
    setSpeechActive(false);
  };

  const continueSpeech = () => {
    if (lastChunkIndex < paragraph.length) {
      window.speechSynthesis.resume();
      setSpeechActive(true);
    }
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
    if (speechActive) {
      stopSpeech();
      continueSpeech();
    }
  };

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(event.target.value);
  };

  useEffect(() => {
    const initialSpeech = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(initialSpeech);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center mt-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">IELTS Listening Practice</h1>
        <div className="w-full max-w-screen-md">
          {!isTouched && (
            <div className="flex flex-col items-center">
              <div className="py-6">
                <button
                  onClick={() => fetchReadingMaterial('Sentence Completion')} 
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Sentence Completion'}
                </button>
              </div>
              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select Voice</h2>
                <select onChange={handleSelectVoice} className="px-4 py-2 rounded bg-gray-300 text-black">
                  <option value="">Select a voice</option>
                  {voices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <label htmlFor="speed" className="text-xl font-semibold text-gray-800 mb-2 block">Adjust Speed:</label>
                <input
                  type="range"
                  id="speed"
                  name="speed"
                  min="0.5"
                  max="1.8"
                  step="0.1"
                  value={speed}
                  onChange={handleSpeedChange}
                  className="w-64"
                />
                <span className="text-gray-700 ml-2">{speed.toFixed(1)}x</span>
              </div>

              <div className="mt-6">
                <label htmlFor="difficulty" className="text-xl font-semibold text-gray-800 mb-2 block">Select Difficulty:</label>
                <select id="difficulty" name="difficulty" value={difficulty} onChange={handleDifficultyChange} className="px-4 py-2 rounded bg-gray-300 text-black">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleStopOrContinueSpeech}
                  disabled={loading}
                  className={`px-6 py-3 rounded-md shadow-md ${speechActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} hover:bg-red-600 transition duration-300`}
                >
                  {loading ? 'Generating...' : (speechActive ? 'Stop Speaking' : 'Continue Speaking')}
                </button>
              </div>
              {paragraph && (
                <div className="max-w-3xl bg-white shadow-md rounded-lg p-6 mb-6">
                  <div className="max-w-3xl bg-white rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions</h2>
                    {questions.map((question, index) => (
                      <div key={index} className="mb-4">
                        <p className="text-gray-700">{renderWithInputs(question, index)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end w-full">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-5 rounded-md shadow-md transition duration-300"
                      onClick={handleClick}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isTouched && (
            <div className="flex flex-col">
              <div className="max-w-3xl bg-white shadow-md rounded-lg p-6 mt-6 relative">
              <button
                onClick={handleBackButtonClick}
                className="absolute top-4 right-4 bg-gray-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-gray-600 transition duration-300"
              >
                Back
              </button>

              <button
                onClick={handleShowDetails}
                className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition duration-300"
              >
                {isTextVisible ? 'Hide details' : 'Show details'}
              </button>
                {(
                  <div className="max-w-3xl bg-white rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Score</h2>
                    <p className="text-gray-700 text-lg">
                      Your score: <span className="font-bold text-3xl text-green-600">{candidatePoint * 20}</span> / 100
                    </p>
                  </div>
                )}
                {/* phong */}
                {isTextVisible && (
                  <div className="max-w-3xl bg-white rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Paragraph</h2>
                    <p className="text-gray-700 mb-6">{paragraph}</p>

                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions</h2>
                    {questions.map((question, index) => (
                      <div key={index} className="mb-4">
                        <p className="text-gray-700">{question}</p>
                      </div>
                    ))}

                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Answers</h2>
                    {answers.map((answer, index) => (
                      <div key={index} className={`mb-4 ${AnswerState[index] === 1 ? 'bg-green-100' : 'bg-red-100'} rounded-lg p-3`}>
                        <p className={`${AnswerState[index] === 1 ? 'text-green-800' : 'text-red-800'}`}>{index + 1}. {answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ReadingPage;
