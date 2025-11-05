'use client'

import Head from 'next/head';
import Link from 'next/link';
import Header from './components/Header';
import Writing from './writing/page'
import HomePage from './homepage/page';
import Footer from './components/Footer';

export default function Home() {
    return (
         <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-200 via-white to-white dark:from-zinc-800 dark:via-black dark:to-black">
          <Header />
            <main className="flex-grow">
                <HomePage />
            </main>
          <Footer />
         </div>
    );
}

