"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
    Button,
    Checkbox,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Input,
} from "@nextui-org/react";

import config from '../config';
const API_URL = `${config.API_BASE_URL}api`;

import './styles.css'

const DIFFICULTY_VALUE_MAPPING = {
    Easy: 0,
    Medium: 1,
    Hard: 2,
    Extreme: 3,
};
const TypeMapping = {
    Multiple: 0,
    Headers: 1,
    TrueFalse: 2,
};

export default function WelcomePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        randomize: false,
        difficulty: "Easy",
        topic: "",
        tone: "",
        typeexercise: "Multiple"
    });


    const [clickedButton, setClicked] = useState(false);
    const [requestError, setRequestError] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const onDifficultySelectionChange = (keys) => {
        const selectedDifficulty = Array.from(keys)[0];  // Convert Set to Array and get the first item
        console.log("Selected difficulty:", selectedDifficulty);
        setFormData((prevState) => ({
            ...prevState,
            difficulty: selectedDifficulty,
        }));
    };

    const onTypeSelectionChange = (keys) => {
        const selectedType = Array.from(keys)[0];  // Convert Set to Array and get the first item
        console.log("Selected type:", selectedType);
        setFormData((prevState) => ({
            ...prevState,
            typeexercise: selectedType
        }));
    };

    const handleSave = async () => {
        setClicked(true);
        setRequestError(false);
        console.log("Current formData:", formData);
        let body = {
            difficulty: DIFFICULTY_VALUE_MAPPING[formData.difficulty],
            typeexercise: TypeMapping[formData.typeexercise]
        };
        console.log("Constructed body:", body);
        if (!formData.randomize) {
            body.presets = {
                topic: formData.topic,
                tone: formData.tone,
            };
        }
        console.log("Final body to be sent:", body);

        fetch(`${API_URL}/exam/new`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then(async (response) => {
                if (response.status == 200) {
                    const data = await response.json();
                    const params = new URLSearchParams();
                    params.set("id", data.data.id);
                    router.push(`/reading/exam?${params.toString()}`);
                } else {
                    const errorData = await response.json();
                    throw new Error(`Server returned: ${JSON.stringify(errorData)}`);
                }
            })
            .catch((err) => {
                console.log("Error during HTTP request:", err);
                setClicked(false);
                setRequestError(true);
            });
    };


    return (
        <div className="welcome-page">
            <Header />
            <div className="welcome-content">
                <h2>Welcome to Reading Practice Generator</h2>
                <form className="form-content">
                    <Checkbox
                        name="randomize"
                        isSelected={formData.randomize}
                        onChange={handleChange}
                    >
                        Randomize
                    </Checkbox>
                    <Dropdown showArrow backdrop="opaque">
                        <DropdownTrigger>
                            <Button variant="bordered">
                                Difficulty: {formData.difficulty}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            selectionMode="single"
                            selectedKeys={new Set([formData.difficulty])}
                            onSelectionChange={onDifficultySelectionChange}
                        >
                            <DropdownItem key="Easy">Easy</DropdownItem>
                            <DropdownItem key="Medium">Medium</DropdownItem>
                            <DropdownItem key="Hard">Hard</DropdownItem>
                            <DropdownItem key="Extreme">
                                Extremely Hard
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <br />
                    <Dropdown showArrow backdrop="opaque">
                        <DropdownTrigger>
                            <Button variant="bordered">
                                Type: {formData.typeexercise}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            selectionMode="single"
                            selectedKeys={new Set([formData.typeexercise])}
                            onSelectionChange={onTypeSelectionChange}
                        >
                            <DropdownItem key="Multiple">Multiple Choice</DropdownItem>
                            <DropdownItem key="Headers">Matching Headers</DropdownItem>
                            <DropdownItem key="TrueFalse">True, False, Not Given</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <br />
                    <Input
                        isDisabled={formData.randomize}
                        className="welcome-input"
                        name="topic"
                        type="text"
                        value={formData.topic}
                        onChange={handleChange}
                        label="Topic"
                    />
                    <Input
                        isDisabled={formData.randomize}
                        className="welcome-input"
                        name="tone"
                        type="text"
                        value={formData.tone}
                        onChange={handleChange}
                        label="Tone"
                    />
                    <br />
                    <Button
                        color={requestError ? "danger" : "primary"}
                        size="md"
                        isDisabled={clickedButton}
                        isLoading={clickedButton}
                        onClick={handleSave}
                    >
                        Save and Continue
                    </Button>
                </form>
            </div>
            <Footer />
        </div>
    );
}
