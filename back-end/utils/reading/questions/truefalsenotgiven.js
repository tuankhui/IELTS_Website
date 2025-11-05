const AISession = require("../ai.js");
const db = require("../db/index.js");

function generateRandomIntFrom0To(max) {
    return Math.round(Math.random() * max);
}

const numToMap = {
    1: "FIRST",
    2: "SECOND",
    3: "THIRD",
    4: "FOURTH",
    5: "FIFTH",
    6: "SIXTH"
};

function generate(presets) {
    const query = `Please generate the reading material for a ${presets[0]} IELTS Reading Test, with only the reading material being a long article with 6 paragraphs, each with 5-7 sentences, with the topics of ${presets[1]}. It is recommended that you make up ONE PERSON who is an expert in the field (or it could be the writer themselves) is an expert in the field and whoever the expert is, narrate the material along with their opinions for added authenticity. Most importantly, bolded characters need to be represented by <b> bolded text here </b>. ONLY BOLD THE TITLE, DO NOT BOLD THE REST OF THE READING MATERIAL. Please only output the reading material, and nothing else, and make sure the essay tone is ${presets[2]}.`;
    const questions = [
        `Please generate a statement that could only be inferred from only the `,
        `Please generate a statement that could be proven false from the information derived from only the `,
        `Please generate a statement that is not derived from the reading passage, but information related to it may be in the `
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

                let numquest = 1, lastCorrectAnswer = 2;
                while (numquest <= 6) {
                    try {
                        let correctAns;
                        if (lastCorrectAnswer === 2) {
                            correctAns = generateRandomIntFrom0To(1);
                        } else {
                            correctAns = generateRandomIntFrom0To(2);
                        }
                        lastCorrectAnswer = correctAns;
                        const questionResponse = await aiSession.chat(questions[correctAns] + numToMap[numquest] + ` paragraph, DO NOT OUTPUT ANYTHING ELSE`);
                        const statement = questionResponse.choices[0].message.content;
                        let choices = [
                            "True",
                            "False",
                            "Not Given"
                        ];
                        questionsList.push({
                            id: numquest,
                            content: statement,
                            correctAnswer: choices[correctAns],
                            choices: choices,
                        });
                        numquest++;
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
                        2,
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
