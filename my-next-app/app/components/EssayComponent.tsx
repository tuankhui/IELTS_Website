import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileWord, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import styles from './EssayComponent.module.css';

const textToType = ["In my opinion, teenagers are more likely to accept advice from someone who can speak from experience. Reformed offenders can tell young people about how they became involved in crime, the dangers of a criminal lifestyle, and what life in prison is really like, and what life in prison is really like. They can also dispel any ideas that"];

const typeEffect = (element: HTMLSpanElement, text: string, typeSpeed: number = 150, deleteSpeed: number = 100, delay: number = 2000) => {
    let charIndex = 0;
    let isDeleting = false;
    const lastPart = text.slice(-50);

    const type = () => {
        if (isDeleting) {
            if (charIndex > 0) {
                element.innerHTML = text.slice(0, -50) + lastPart.substring(0, charIndex - 1) + "|";
                charIndex--;
                setTimeout(type, deleteSpeed);
            } else {
                isDeleting = false;
                setTimeout(type, 500);
            }
        } else {
            if (charIndex < lastPart.length) {
                element.innerHTML = text.slice(0, -50) + lastPart.substring(0, charIndex + 1) + "|";
                charIndex++;
                setTimeout(type, typeSpeed);
            } else {
                isDeleting = true;
                setTimeout(type, delay);
            }
        }
    };

    type();
};

const EssayComponent: React.FC = () => {
    const textElement = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (textElement.current) {
            typeEffect(textElement.current, textToType[0]);
        }
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.textContainer}>
                <FontAwesomeIcon icon={faFileWord} className={styles.icon} />
                <p className={styles.filename}>Writing.docx</p>
            </div>
            <div className={styles.textContainer}>
                <div className={styles.separatorLine}></div>
            </div>
            <div className={styles.textContainer}>
                <span ref={textElement} className={styles.text}></span>
            </div>
            <button className={styles.button}>
                <FontAwesomeIcon icon={faPaperPlane} /> Mark this IELTS Writing Task 2 Essay
            </button>
        </div>
    );
};

export default EssayComponent;