'use client';
import React, { useState } from 'react';
import syllableStressTableData from './syllable_stress_table.json';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface SyllableStressTable {
  [key: string]: string[];
}

const Page: React.FC = () => {
  const [numQuestions, setNumQuestions] = useState<number>(1); // State for number of questions
  const [questions, setQuestions] = useState<any[]>([]); // State for storing questions
  const [userAnswers, setUserAnswers] = useState<string[]>([]); // State for storing user answers
  const [showResults, setShowResults] = useState<boolean>(false); // State to show results

  // Type assertion for syllableStressTable
  const syllableStressTable: SyllableStressTable = syllableStressTableData;

  // Function to generate questions
  const generateQuestions = () => {
    const maxQuestions = Math.min(numQuestions, 20); // Limit number of questions to 20

    let newQuestions = [];
    for (let i = 0; i < maxQuestions; i++) {
      const stressGroups: { [index: number]: string[][] } = {};

      Object.keys(syllableStressTable).forEach((key) => {
        const [syllables, stress] = key.split(',').map(Number);
        if (stress > 0 && stress <= 3) { // Ensure stress index is between 1-3
          if (!stressGroups[stress]) {
            stressGroups[stress] = [];
          }
          //console.log(syllableStressTable[key]);
          stressGroups[stress].push(syllableStressTable[key]);
        }
      });

      const validStressIndices = Object.keys(stressGroups).map(Number);

      const randomStressIndex = validStressIndices[Math.floor(Math.random() * validStressIndices.length)];
      const sameStressWords = getRandomWords(stressGroups[randomStressIndex].flat(), 3);

      let differentStressIndex: number;
      do {
        differentStressIndex = validStressIndices[Math.floor(Math.random() * validStressIndices.length)];
      } while (differentStressIndex === randomStressIndex);

      const differentStressWord = getRandomWords(stressGroups[differentStressIndex].flat(), 1)[0];

      // Shuffle options array
      const options = shuffleArray([...sameStressWords, differentStressWord]);

      // Create question object with formatted answers
      const question = {
        id: i + 1,
        options: options.map((word: string, index: number) => ({
          letter: String.fromCharCode(65 + index), // A, B, C, D
          word,
          selected: '', // No answer selected initially
        })),
        correctAnswer: String.fromCharCode(65 + options.findIndex(word => word === differentStressWord)), // Correct answer as letter
      };

      newQuestions.push(question);
    }

    setQuestions(newQuestions);
    setUserAnswers(new Array(maxQuestions).fill('')); // Initialize user answers array with correct length
    setShowResults(false); // Hide results when generating new questions
  };

  // Function to handle user answer selection
  const handleAnswerSelect = (selectedLetter: string, questionId: number) => {
    if (!showResults) {
      // Copy questions array
      const updatedQuestions = [...questions];
      // Find the question object by its ID
      const questionToUpdate = updatedQuestions.find(question => question.id === questionId);
      if (questionToUpdate) {
        // Update selected state of options in the found question
        questionToUpdate.options = questionToUpdate.options.map((option: any) => ({
          ...option,
          selected: option.letter === selectedLetter,
        }));
        // Update the questions state with the modified array
        setQuestions(updatedQuestions);

        // Update userAnswers array with the selected answer
        const updatedUserAnswers = [...userAnswers];
        updatedUserAnswers[questionId - 1] = selectedLetter; // Store selected answer in userAnswers array
        setUserAnswers(updatedUserAnswers);
      }
    }
  };

  // Function to check answers
  const checkAnswers = () => {
    setShowResults(true); // Show results after checking answers
  };

  // Helper function to generate random words
const getRandomWords = (words: string[], count: number): string[] => {
  const shuffled = words.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 

  // Helper function to shuffle an array
  const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  return (
    <>
      <Header />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>Note: The words used in this website are based on CMU Pronouncing Dictionary! The dictionary may not be accurate for all words, so be aware!</p>
        </div>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Pronunciation Practice Questions</h1>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <label htmlFor="numQuestions" style={{ marginRight: '10px' }}>Number of Questions:</label>
          <input
            type="number"
            id="numQuestions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value))))}
            min="1"
            max="20"
            style={{ width: '50px', marginRight: '10px', textAlign: 'center' }}
          />
          <button onClick={generateQuestions} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Generate Questions
          </button>
          {questions.length > 0 && (
            <button onClick={checkAnswers} style={{ marginLeft: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Check Answers
            </button>
          )}
        </div>
        {questions.length > 0 && (
          <div>
            {questions.map((question) => (
              <div key={question.id} style={{ marginBottom: '20px', border: '1px solid #ced4da', padding: '10px', borderRadius: '5px' }}>
                <p style={{ marginBottom: '10px' }}>Question {question.id}:</p>
                {question.options.map((option: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option.letter, question.id)}
                    disabled={showResults}
                    style={{
                      padding: '10px 20px',
                      margin: '5px',
                      backgroundColor: option.selected ? '#007bff' : (showResults && option.letter === question.correctAnswer ? '#28a745' : '#f8f9fa'),
                      color: option.selected ? 'white' : 'black',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {option.letter}. {option.word}
                  </button>
                ))}
                {showResults && (
                  <div style={{ marginTop: '10px' }}>
                    Correct Answer: {question.correctAnswer}
                    {userAnswers[question.id - 1] && (
                      <p style={{ color: userAnswers[question.id - 1] === question.correctAnswer ? '#28a745' : '#dc3545' }}>
                        {userAnswers[question.id - 1] === question.correctAnswer ? 'Correct!' : 'Incorrect'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
    
  );
};

export default Page;