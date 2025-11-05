import { Button } from "@nextui-org/react";
import { useState } from "react";
import config from '../config';
const API_URL = `${config.API_BASE_URL}api`;
export default function CheckAnswerButton(props) {
    const [error, setError] = useState(false);

    const onClick = () => {
        setError(false);
        props.setCheckingAnswer(true);
        console.log(props.choices instanceof Array)
        fetch(`${API_URL}/exam/validate`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: props.examId,
                answers: props.choices,
            }),
        })
            .then(async (response) => {
                if (response.status == 200) {
                    props.setCheckingAnswer(false);
                    const result = (await response.json()).data.result;
                    let correctAnswers = {};
                    Object.keys(result).forEach((id) => {
                        if (result[id].correct) {
                            correctAnswers[id] = props.choices[id]
                        } else {
                            correctAnswers[id] = result[id].correctAnswer;
                        }
                    });

                    props.setCorrectAnswers(correctAnswers);
                    props.setCanCheckAnswer(true);
                } else {
                    throw new Error(`Server returned: ${JSON.stringify(await response.json())}`);
                }
            })
            .catch((err) => {
                console.log(`Error while validating answers: ${err}`);
                props.setCheckingAnswer(false);
                props.setCanCheckAnswer(false);
                setError(true);
            });
    };

    return (
        <Button
            className="button-check"
            isLoading={props.checkingAnswerState}
            isDisabled={props.canCheckAnswerState || props.checkingAnswerState}
            color={error ? "danger" : "default"}
            size="lg"
            variant="ghost"
            onClick={onClick}
        >
            Check Answers
        </Button>
    );
}
