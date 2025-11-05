// app/page.tsx
'use client'

import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './App.css';


export default function Home() {

  const handleClickmc = () => {
    window.location.href ='/listening/multiple-choice';
  };

  const handleClicksc = () => {
    window.location.href = '/listening/sentence-completion';
  };

  const handleClickmi = () => {
    window.location.href ='/listening/matching';
  };

  const handleClicksa = () => {
    window.location.href ='/listening/sort-answer';
  };

  const handleClickpl = () => {
    window.location.href ='/listening/pick-from-a-list';
  };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-200 via-white to-white dark:from-zinc-800 dark:via-black dark:to-black">

            <Header />
            <div className="main-content">
                <header className="header">
                    <h1>IELTS Listening Practice</h1>
                    <h2>Web Design Inspiration 2023</h2>
                </header>
                <div className="skills-section">
                    <div onClick={handleClickmc} className="skill">
                    <h3>Multiple Choice</h3>
                    <p>Practice your multiple choice skills with various IELTS listening tests.</p>
                    </div>
                    <div onClick={handleClicksc} className="skill">
                    <h3>Sentence Completion</h3>
                    <p>Enhance your ability to complete sentences by listening to IELTS recordings.</p>
                    </div>
                    <div onClick={handleClickmi} className="skill">
                    <h3>Matching Information</h3>
                    <p>Improve your matching skills with tailored IELTS listening exercises.</p>
                    </div>
                    <div onClick={handleClicksa} className="skill">
                    <h3>Short Answer</h3>
                    <p>Hone your short answer skills by practicing with specific IELTS listening questions.</p>
                    </div>
                    <div onClick={handleClickpl} className="skill">
                    <h3>Pick From A List</h3>
                    <p>Develop your ability to select correct options from a list in IELTS listening tasks.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}