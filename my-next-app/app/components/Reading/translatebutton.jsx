import { Button } from "@nextui-org/react";
import { useState } from "react";

import config from '../../config';
const API_URL = `${config.API_BASE_URL}api`;

export default function TranslateButton(props) {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const onClick = () => {
        setError(false);
        setLoading(true);

        const formData = new FormData();
        formData.append("file", props.file);

        fetch(`${API_URL}/translate`, {
            method: "POST",
            body: formData,
        })
            .then(async (response) => {
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "translated";
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
                console.log("Error while translating the file:", error);
                setError(true);
                setLoading(false);
            });
    };

    return (
        <Button
            isDisabled={!props.file || isLoading}
            isLoading={isLoading}
            color={error ? "danger" : "primary"}
            onClick={onClick}
            size="lg"
        >
            Translate skibidi
        </Button>
    );
}