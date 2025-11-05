import { Progress, Spacer } from "@nextui-org/react";
import Question from "./questionMatchingHeadings.jsx";
import "../style.css";
import CheckAnswerButton from "../../../components/Reading/checkanswer.jsx";
import ExportExamButton from "../../../components/Reading/exportexam.jsx";
import { format } from "path";

export default function ShowQuestionsHeaders({
    data,
    canCheckAnswer,
    correctAnswers,
    choices,
    setChoices,
    checkingAnswer,
    id,
    setCanCheckAnswer,
    setCorrectAnswers,
    setCheckingAnswer,
    calcnums
}) {
    // Concatenate headers with new lines
    const text = "<strong>Match one of the following headings to each paragraph</strong>";
    const lmao = "\n\t" + data.questions[0].choices.join("\n\t");
    const formattedText = text + `<pre>${lmao}</pre>`;
    return (
        <div>
            <h2 className="h2"> Questions </h2>
            <h4 className="h4"> Please select the most suitable headings from the headers below for each paragraph</h4>
            <div>   
                <div className="summary-paragraph-blanks text-foreground bg-background">
                    <div dangerouslySetInnerHTML={{ __html: formattedText }} />
                </div>
            </div>
            {data.questions.map((question) => (
                <Question
                    className = "HeadingMatching"
                    key={question.id}
                    question={question}
                    canCheckAnswerState={canCheckAnswer}
                    correctAnswer={correctAnswers[question.id]}
                    choices={choices}
                    setChoices={setChoices}
                    checkingAnswerState={checkingAnswer}
                />
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <ExportExamButton examId={id} />
                <CheckAnswerButton
                    examId={id}
                    choices={choices}
                    canCheckAnswerState={canCheckAnswer}
                    setCanCheckAnswer={setCanCheckAnswer}
                    setCorrectAnswers={setCorrectAnswers}
                    checkingAnswerState={checkingAnswer}
                    setCheckingAnswer={setCheckingAnswer}
                />
            </div>
            <Spacer />
            <Spacer />
            <Progress
                className="result-bar"
                isDisabled={!canCheckAnswer}
                size="md"
                radius="md"
                color="success"
                label="Your Results"
                value={
                    canCheckAnswer
                        ? calcnums({
                            questions: data.questions,
                            choices: choices,
                            correctAnswers: correctAnswers,
                        })
                        : 0
                }
                showValueLabel={true}
            />
        </div>
    );
}