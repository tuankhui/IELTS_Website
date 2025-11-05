import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './ContestDetails.module.css';
import config from '../config';
import { useSearchParams } from "next/navigation";
import ReactMarkdown from 'react-markdown';

interface ContestImage {
  data: string;
  contentType: string;
  name: string;
}

interface Contest {
  id: number;
  name: string;
  start: string;
  end: string;
  taskDescription: string;
  contestImage?: ContestImage;
}

const ContestDetails: React.FC = () => {
  const params = useSearchParams();
  // const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const id = params.get("id");
        const response = await axios.get(`${config.API_BASE_URL}api/get_contest/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setContest(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data.message);
        } else {
          setError('Error fetching contest');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [params]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{contest?.name}</h1>
        <ReactMarkdown>{contest?.taskDescription}</ReactMarkdown>
        {contest?.contestImage && (
          <img
            src={`data:${contest.contestImage.contentType};base64,${contest.contestImage.data}`}
            alt={contest.contestImage.name}
            className="w-full h-auto rounded-lg mb-4"
          />
        )}
        <div className="text-sm text-gray-500">
          <p>Start: {contest?.start ? new Date(contest.start).toLocaleString() : 'N/A'}</p>
          <p>End: {contest?.end ? new Date(contest.end).toLocaleString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default ContestDetails;
