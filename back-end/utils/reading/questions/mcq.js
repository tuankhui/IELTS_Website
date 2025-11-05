const AISession = require("../ai.js");
const db = require("../db/index.js");

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function removeEmptyStrings(arr) {
    return arr.filter(item => item !== "");
}

function generate(presets) {
    const query = `Please generate the reading material for a ${presets[0]} IELTS Reading Test, with only the reading material being a long article with 6 paragraphs, each with 5-7 sentences, with the topics of ${presets[1]}. It is recommended that you make up ONE PERSON who is an expert in the field (or it could be the writer themselves) is an expert in the field and whoever the expert is, narrate the material along with their opinions for added authenicity. Most importantly, bolded characters needs to represented by <b> bolded text here </b>. ONLY BOLD THE TITLE, DO NOT BOLD THE REST OF THE READING MATERIAL. Please only output the reading material, and nothing else, and make sure the essay tone is ${presets[2]}.`;
    const questions = [`Please generate 1 question for the FIRST PARAGRAPH OF the reading material you have just generated, the syntax is the question, the correct answer, and 3 other incorrect choices, with two of them close to the correct answer but is still VERY OBVIOUSLY WRONG, and all of the choices and questions are on seperate lines. Do not print out any blank lines between the contents, and I cannot stress that enough, DO NOT PRINT OUT ANY BLANK LINES BETWEEN THE CONTENTS OF THE OUTPUT YOU HEAR ME??????. DO NOT BOLD THE QUESTIONS OR THE CHOICES. DO NOT GENERATE "All of the above". Do not output anything else.`,
                    `Please generate 1 question for the SECOND PARAGRAPH OF the reading material you have just generated, the syntax is the question, the correct answer, and 3 other incorrect choices, with two of them close to the correct answer but is still VERY OBVIOUSLY WRONG, and all of the choices and questions are on seperate lines. Do not print out any blank lines between the contents, and I cannot stress that enough, DO NOT PRINT OUT ANY BLANK LINES BETWEEN THE CONTENTS OF THE OUTPUT YOU HEAR ME??????. DO NOT BOLD THE QUESTIONS OR THE CHOICES. DO NOT GENERATE "All of the above". Do not output anything else.`,
                    `Please generate 1 question for the THIRD PARAGRAPH OF the reading material you have just generated, the syntax is the question, the correct answer, and 3 other incorrect choices, with two of them close to the correct answer but is still VERY OBVIOUSLY WRONG, and all of the choices and questions are on seperate lines. Do not print out any blank lines between the contents, and I cannot stress that enough, DO NOT PRINT OUT ANY BLANK LINES BETWEEN THE CONTENTS OF THE OUTPUT YOU HEAR ME??????. DO NOT BOLD THE QUESTIONS OR THE CHOICES. DO NOT GENERATE "All of the above". Do not output anything else.`,
                    `Please generate 1 question for the FOURTH PARAGRAPH OF the reading material you have just generated, the syntax is the question, the correct answer, and 3 other incorrect choices, with two of them close to the correct answer but is still VERY OBVIOUSLY WRONG, and all of the choices and questions are on seperate lines. Do not print out any blank lines between the contents, and I cannot stress that enough, DO NOT PRINT OUT ANY BLANK LINES BETWEEN THE CONTENTS OF THE OUTPUT YOU HEAR ME??????. DO NOT BOLD THE QUESTIONS OR THE CHOICES. DO NOT GENERATE "All of the above". Do not output anything else.`,
                    `Please generate 1 question for the FIFTH PARAGRAPH OF the reading material you have just generated, the syntax is the question, the correct answer, and 3 other incorrect choices, with two of them close to the correct answer but is still VERY OBVIOUSLY WRONG, and all of the choices and questions are on seperate lines. Do not print out any blank lines between the contents, and I cannot stress that enough, DO NOT PRINT OUT ANY BLANK LINES BETWEEN THE CONTENTS OF THE OUTPUT YOU HEAR ME??????. DO NOT BOLD THE QUESTIONS OR THE CHOICES. DO NOT GENERATE "All of the above". Do not output anything else.`,
                    `Please generate 1 question to ask about the ATTITIUDE OF THE WRITER TO THE DISCUSSED TOPIC in reading material you have just generated, the syntax is the choices, the correct answer, and 3 other incorrect answers, with two of them close to the correct answer but is still VERY OBVIOUSLY WRONG, and all of the choices and questions are on seperate lines. Do not print out any blank lines between the contents, and I cannot stress that enough, DO NOT PRINT OUT ANY BLANK LINES BETWEEN THE CONTENTS OF THE OUTPUT YOU HEAR ME??????. DO NOT BOLD THE QUESTIONS OR THE CHOICES. DO NOT GENERATE "All of the above". Do not output anything else.`,
                    ];

    return new Promise((resolve, reject) => {
        const aiSession = new AISession();
        aiSession
            .chat(query)
            .then(async (response) => {
                aiSession.pushMessage({
                    role: "assistant",
                    content: response.choices[0].message.content,
                });
                const readingMaterial = response.choices[0].message.content;
                let questionsList = [];
                let fetchedQuestionsSuccessfully = true;

                for (let numquest = 0; numquest < 6; numquest++) {
                    try {
                        const questionResponse = await aiSession.chat(questions[numquest]);
                        let questArr = questionResponse.choices[0].message.content.split("\n");
                        questArr = removeEmptyStrings(questArr);
                        let choices = [
                            questArr[1],
                            questArr[2],
                            questArr[3],
                            questArr[4],
                        ];
                        shuffle(choices);
                        questionsList.push({
                            id: numquest + 1,
                            content: questArr[0],
                            correctAnswer: questArr[1],
                            choices: choices,
                        });
                        aiSession.pushMessage({
                            role: "assistant",
                            content: questionResponse.choices[0].message.content,
                        });
                    } catch (err) {
                        fetchedQuestionsSuccessfully = false;
                        reject(`Failed to fetch question choices: ${err}`);
                        break;
                    }
                }
                if (fetchedQuestionsSuccessfully) {
                    const databaseId = await db.pushExamAndReceiveId(
                        0,
                        readingMaterial,
                        questionsList
                    );
                    resolve(databaseId);
                }
            })
            .catch((err) => {
                reject(`Failed to fetch question: ${err}`);
            });
    });
}

module.exports = generate;