'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import config from '../config';
import './styles.css'; // Import the CSS file

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Contest {
  id: number;
  name: string;
  start: string;
  end: string;
  type: 'public' | 'private'; 
  access_user: string[];
  registered_user: string[];
}

const ContestPage: React.FC = () => {
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [pastContests, setPastContests] = useState<Contest[]>([]);
  const [page, setPage] = useState(1);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | null>(null);
  const limit = 10;
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : ''; 
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; // Assuming token is stored in localStorage
  const router = useRouter();
  // Common configuration for axios requests
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const fetchContests = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}api/contests?page=${page}&limit=${limit}`, axiosConfig);

      const current = new Date();

      const upcoming = response.data.filter((contest: Contest) => new Date(contest.end) >= current);
      const past = response.data.filter((contest: Contest) => new Date(contest.end) < current);

      if (page === 1) {
        setUpcomingContests(upcoming);
        setPastContests(past);
      } else {
        setUpcomingContests(prev => [...prev, ...upcoming]);
        setPastContests(prev => [...prev, ...past]);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      setAlertMessage('Failed to fetch contests');
      setAlertType('error');
    }
  };

  const registerForContest = async (contestId: number) => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}api/checkRegis`, { contestId }, axiosConfig);
      if (response.data.registered) {
        setAlertMessage('You have already registered for this contest');
        setAlertType('info');
        return;
      }

      await axios.post(`${config.API_BASE_URL}api/register_contest`, { contestId }, axiosConfig);
      setAlertMessage('You have successfully registered');
      setAlertType('success');
      window.location.reload(); // Reload to reflect changes
    } catch (error) {
      console.error('Error registering for contest:', error);
      setAlertMessage('Failed to register for the contest');
      setAlertType('error');
    }
  };

  useEffect(() => {
    fetchContests();
  }, [page]);

  const loadMoreContests = () => setPage(prev => prev + 1);

  const joinContest = (contestId: number) => {
    // history.push(`/contest/${contestId}`);
    // console.log(contestId);
    router.push(`/live?id=${contestId}`);
  };


  return (
    <div>
      <Header />
      {alertMessage && (
        <div className={`alert ${alertType}`}>
          {alertMessage}
          <button onClick={() => setAlertMessage(null)}>Close</button>
        </div>
      )}
      <section className="contests-section">
      <h2>Upcoming / On-going Contests</h2>
        {upcomingContests.map((contest: Contest) => {
          const now = new Date();
          const startDate = new Date(contest.start);
          const endDate = new Date(contest.end);

          const isOngoing = now >= startDate && now <= endDate;

          return (
            <div key={contest.id} className="contest-card">
              <h3>{contest.name}</h3>
              {contest.type === 'private' && <span className="tag">Private</span>}
              {contest.type === 'public' && <span className="tag_public">Public</span>}
              <p>Start: {startDate.toLocaleString()}</p>
              <p>End: {endDate.toLocaleString()}</p>
              <p>
                Countdown: {startDate > now ? `Starts in ${Math.ceil((startDate.getTime() - now.getTime()) / 1000 / 60 / 60 / 24)} days` : `Ends in ${Math.ceil((endDate.getTime() - now.getTime()) / 1000 / 60 / 60 / 24)} days`}
              </p>
              {isOngoing ? (
                <div className="pb-1">
                <button
                  className="w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-green-500 focus:outline-none focus:ring "
                  onClick={() => joinContest(contest.id)}
                >
                  Join
                </button>
                </div>
              ) : (<></>)}
                <button
                  disabled={contest.registered_user.includes(username)}
                  onClick={() => registerForContest(contest.id)}
                  className="w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-blue-500 focus:outline-none focus:ring"
                >
                  {contest.registered_user.includes(username) ? 'You have already registered' : 'Register'}
                </button>
              {/* )} */}
            </div>
          );
        })}
        {upcomingContests.length >= limit && (
          <button onClick={loadMoreContests} className="w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-blue-500 focus:outline-none focus:ring">
            Load more
          </button>
        )}
      </section>
      <section className="contests-section">
        <h2>Past Contests</h2>
        {pastContests.map((contest: Contest) => (
          <div key={contest.id} className="contest-card">
            <h3>{contest.name}</h3>
            {contest.type === 'private' && <span className="tag">Private</span>}
            <p>Start: {new Date(contest.start).toLocaleString()}</p>
            <p>End: {new Date(contest.end).toLocaleString()}</p>
          </div>
        ))}
        {pastContests.length >= limit && (
          <button onClick={loadMoreContests} className=" w-full sm:w-auto rounded-lg py-3 px-6 sm:py-2 sm:px-8 text-white bg-blue-500 focus:outline-none focus:ring">
            Load more
          </button>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default ContestPage;
