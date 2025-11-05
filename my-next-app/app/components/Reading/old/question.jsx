import { useEffect, useState } from "react";
import { RadioGroup, Radio, extendVariants } from "@nextui-org/react";

export const CustomRadio = extendVariants(Radio, {
    variants: {
        color: {
            correct: {
                control: "bg-success text-success-foreground",
                label: "text-success",
                wrapper: "border-success group-data-[selected=true]:border-success",
                description: "text-success-300",
            },
            wrong: {
                control: "bg-danger text-danger-foreground",
                label: "text-danger",
                wrapper: "border-danger group-data-[selected=true]:border-danger",
                description: "text-danger-300",
            },
        },
    }
});

export default function Question(props) {
    const question = props.question;
    const canCheckAnswerState = props.canCheckAnswerState;
    const [selected, setSelected] = useState();
    props.choices[question.id] = selected;
    props.setChoices(props.choices);

    const radioLabel = `${question.id}. ${question.content}`;
    return (
        <div className="question text-foreground bg-background">
            <RadioGroup
                label={radioLabel}
                onValueChange={setSelected}
            >
                {question.choices.map((choice) => (
                    <CustomRadio
                        key={''}//sus
                        color={
                            canCheckAnswerState ? (choice == props.correctAnswer ? "correct" : (choice == selected && "wrong")) : "default"
                        }
                        isDisabled={canCheckAnswerState}
                        value={choice}>
                        {choice}
                    </CustomRadio>
                ))}
            </RadioGroup>
        </div>
    );
}