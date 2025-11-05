const AISession = require("../ai.js");
const db = require("../db/index.js");

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function removeEmptyStrings(arr) {
    return arr.filter(item => item !== "");
}

function generate(presets) {
    const query = `Please generate the reading material for a ${presets[0]} IELTS Reading Test, with only the reading material being a long article with 6 paragraphs, each with 5-7 sentences, with the topics of ${presets[1]}. It is recommended that you make up ONE PERSON who is an expert in the field (or it could be the writer themselves) is an expert in the field and whoever the expert is, narrate the material along with their opinions for added authenticity. Most importantly, bolded characters need to be represented by <b> bolded text here </b>. ONLY BOLD THE TITLE, DO NOT BOLD THE REST OF THE READING MATERIAL. Please only output the reading material, and nothing else, and make sure the essay tone is ${presets[2]}.`;
    const generateCorrectHeadings = `In the type of IELTS Reading Matching Headings, generate the correct headings for each paragraph and DO NOT LABEL THEM, just print them out accordingly to their respective paragraph position. PRINT EACH HEADING ON SEPARATE LINES AND DO NOT PRINT OUT ANY BLANK LINES BETWEEN THE CONTENTS OF THE OUTPUT. DO NOT PRINT ANYTHING ELSE.`;
    const generateFalseHeadings = `In the type of IELTS Reading Matching Headings, generate 3 to 4 UNRELATED headings. PRINT EACH HEADING ON SEPARATE LINES AND DO NOT PRINT OUT ANY BLANK LINES BETWEEN THE CONTENTS OF THE OUTPUT. DO NOT PRINT ANYTHING ELSE. For example`;

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
                let questions = [];
                const questionResponse = await aiSession.chat(generateCorrectHeadings);
                let correctChoices = questionResponse.choices[0].message.content.split("\n");
                aiSession.pushMessage({
                    role: "assistant",
                    content: questionResponse.choices[0].message.content,
                });
                const falseResponse = await aiSession.chat(generateFalseHeadings);
                let headers = (falseResponse.choices[0].message.content.split("\n")).concat(correctChoices);
                shuffle(headers);
                headers = removeEmptyStrings(headers);

                let fetchedQuestionsSuccessfully = true;
                let numQuest = 1;
                while (numQuest <= 6) {
                    try {
                        questions.push({
                            id: numQuest,
                            content: `Paragraph ${numQuest}`,
                            correctAnswer: correctChoices[numQuest - 1],
                            choices: headers,
                        });
                        numQuest++;
                    } catch (err) {
                        fetchedQuestionsSuccessfully = false;
                        reject(`Failed to fetch question choices: ${err}`);
                        break;
                    }
                }
                if (fetchedQuestionsSuccessfully) {
                    const databaseId = await db.pushExamAndReceiveId(
                        1,
                        readingMaterial,
                        questions
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
