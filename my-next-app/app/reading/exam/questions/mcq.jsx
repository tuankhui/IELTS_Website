import { Progress, Spacer } from "@nextui-org/react";
import Question from "./questionmcq";
import "../style.css";
import CheckAnswerButton from "../../../components/Reading/checkanswer";
import ExportExamButton from "../../../components/Reading/exportexam";

export default function showQuestionsMCQ({
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
    return (
        <div>
            <h2 className="h2"> Questions </h2>
            <h4 className="h4"> Please choose the most suitable answer to the question below </h4>
            {data.questions.map((questionItem) => (
                <Question
                    key={questionItem.id}
                    question={questionItem}
                    canCheckAnswerState={canCheckAnswer}
                    correctAnswer={correctAnswers[questionItem.id]}
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