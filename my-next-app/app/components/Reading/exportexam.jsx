import { Button } from "@nextui-org/react";
import { useState } from "react";

import config from '../../config';
const API_URL = `${config.API_BASE_URL}api`;

export default function ExportExamButton(props) {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const onClick = () => {
        setLoading(true);
        fetch(`${API_URL}/exam/export`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: props.examId }),
        })
            .then(async (response) => {
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(new Blob([blob], {type: "text/csv"}));
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "exported-exam";
                    document.body.appendChild(link);

                    link.click();

                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    setLoading(false);
                } else {
                    throw new Error((await response.json()).reason);
                }
            })
            .catch((error) => {
                console.log("Error fetching the file:", error);
                setError(true);
                setLoading(false);
            });
    };

    return (
        <Button
            isDisabled={isLoading}
            isLoading={isLoading}
            color={error ? "danger" : "secondary"}
            onClick={onClick}
            size="lg"
        >
            Export Exam
        </Button>
    );
}
