"use client";

import { useEffect, useState,Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReadingMaterial from "../../components/Reading/readingmaterial";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./style.css";
import LoadingPage from "../../components/Reading/loadingpage";

import ShowQuestionsMCQ from "./questions/mcq";
import ShowQuestionsHeaders from "./questions/matchingHeadings";

import NotFound from '../not-found'

import config from '../../config';
const API_URL = `${config.API_BASE_URL}api`;

function calcnums(props) {
    let numgood = 0,
        numtotal = 0;
    props.questions.forEach((question) => {
        if (props.choices[question.id] == props.correctAnswers[question.id]) {
            numgood++;
        }
        numtotal++;
    });
    return (numgood / numtotal) * 100.0;
}

function ExamContent() {
    const params = useSearchParams();
    const id = params.get("id");
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState();

    useEffect(() => {
        fetch(`${API_URL}/exam/fetch?id=${id}`)
            .then(async (response) => {
                console.log("Response status:", response.status);
                if (response.status == 200) {
                    const serverResponse = (await response.json()).data;
                    console.log("Server response:", serverResponse);
                    if (serverResponse.exist) {
                        setData(serverResponse.item);
                        console.log(data);
                    } else {
                        console.log("Data does not exist");
                    }
                } else {
                    throw new Error(`Server returned: ${JSON.stringify(await response.json())}`);
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                setIsLoading(false);
            });
    }, []);

    const [correctAnswers, setCorrectAnswers] = useState({});
    const [canCheckAnswer, setCanCheckAnswer] = useState(false);
    const [checkingAnswer, setCheckingAnswer] = useState(false);
    const [choices, setChoices] = useState({});

    return (
        <div className="app">
            {isLoading ? (
                    <LoadingPage />
                
            ) : (data == undefined ? (
                    <NotFound />
            ) : (
                <div className="main-content">
                    <div className="left-panel">
                        <h2 className="h2"> Reading Material </h2>
                        <h4 className="h4">
                            Please read the text below and answer questions on
                            the other panel
                        </h4>
                        <ReadingMaterial material={data.readingMaterial} />
                    </div>
                    <div className="right-panel">
                        {(data.examType === 0 || data.examType === 2) ? (
                            <ShowQuestionsMCQ
                                data={data}
                                canCheckAnswer={canCheckAnswer}
                                correctAnswers={correctAnswers}
                                choices={choices}
                                setChoices={setChoices}
                                checkingAnswer={checkingAnswer}
                                id={id}
                                setCanCheckAnswer={setCanCheckAnswer}
                                setCorrectAnswers={setCorrectAnswers}
                                setCheckingAnswer={setCheckingAnswer}
                                calcnums={calcnums}
                            />
                        ) : (
                            <ShowQuestionsHeaders
                                data={data}
                                canCheckAnswer={canCheckAnswer}
                                correctAnswers={correctAnswers}
                                choices={choices}
                                setChoices={setChoices}
                                checkingAnswer={checkingAnswer}
                                id={id}
                                setCanCheckAnswer={setCanCheckAnswer}
                                setCorrectAnswers={setCorrectAnswers}
                                setCheckingAnswer={setCheckingAnswer}
                                calcnums={calcnums}
                            />
                        )}
                    </div>
                </div>
            ))}
            <Footer/>
        </div>
    );
}

export default function Exam() {
    return (
      <div className="app">
        <Header />
        <Suspense fallback={<LoadingPage />}>
          <ExamContent />
        </Suspense>
        <Footer />
      </div>
    );
}