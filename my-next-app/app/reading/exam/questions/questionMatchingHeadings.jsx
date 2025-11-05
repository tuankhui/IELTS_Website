import { useState, useMemo } from "react";
import { Button } from "@nextui-org/react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    extendVariants
} from "@nextui-org/react";

export const CustomItem = extendVariants(DropdownItem, {
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
    console.log(question)
    const canCheckAnswerState = props.canCheckAnswerState;
    const [selected, setSelected] = useState();
    props.setChoices(props.choices);

    const [selectedKeys, setSelectedKeys] = useState(new Set(["text"]));
    const selectedValue = useMemo(
        () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
        [selectedKeys]
    );

    return (
        <div className="question text-foreground bg-background">
            {question.content}: 
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="bordered"
                        className="capitalize"
                    >
                        {selectedValue}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Single selection example"
                    variant="flat"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                >
                    {question.choices.map((choice) => (
                        <CustomItem key={''} disabledKeys = {canCheckAnswerState ? question.choices : []}
                            color={
                                canCheckAnswerState ? (choice == props.correctAnswer ? "correct" : (choice == selected && "wrong")) : "default"
                            }
                            onSelectionChange = {(keys) => setSelected(question.choices[Array.from(keys)[0]])}
                            value={choice}>
                            {choice}
                        </CustomItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}