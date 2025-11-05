require("dotenv").config();
const fs = require("fs");
const express = require("express");
const { authenticateToken, authenticateTokenContest, authorizeTeacher } = require('../middleware/authMiddleware');
//them AUTHEN vao sau


// const {join} = require("path");
// const {dirname} = require("path");
// const next = require("next");

const {IncomingForm} = require("formidable");
const pdfParse = require("../utils/pdf-parse/index");
const { Document, Packer, Paragraph, TextRun } = require("docx");

const db = require("../utils/reading/db/index");
const AISession = require("../utils/reading/ai");

const ielts = require("../utils/reading/ielts");
const generateMCQ = require("../utils/reading/questions/mcq");
const generateTFNG = require("../utils/reading/questions/truefalsenotgiven");
const generateHeaders = require("../utils/reading/questions/matchingHeaders");

const generateCsv = require("../utils/reading/csvGeneration");

async function generateDocx(originalText, translatedText) {
    const splitSentences = (text) => text.split(/(?<=[.\n!?])\s*/);

    const originalSentences = splitSentences(originalText);
    const translatedSentences = splitSentences(translatedText);

    const paragraphs = translatedSentences.flatMap((translatedSentence, index) => {
        const originalSentence = originalSentences[index] ? `${originalSentences[index]}` : null;

        if (translatedSentence && originalSentence) {
            return [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: originalSentence,
                            color: "000000", // Black color for original text
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `(${translatedSentence})`,
                            color: "FF0000", // Red color for translated text
                        }),
                    ],
                }),
                new Paragraph({ // Empty paragraph to add a line break
                    children: [
                        new TextRun({
                            text: '',
                        }),
                    ],
                }),
            ];
        }

        return [];
    });

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: paragraphs,
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
};

db.connect();

const router = express.Router();

router.get("/exam/fetch", async (req, res) => {
    let query = req.query;
    if (!query.id) {
        return res.status(400).send({
            code: 400,
            reason: "Invalid id value in query. (type: string)",
        });
    }

    const item = await db.fetchExam(query.id);
    let realItem = undefined;
    if (item) {
        realItem = {
            examType: item.examType,
            readingMaterial: item.readingMaterial,
            questions: [],
        };

        // So we don't expose the "correctAnswer"
        item.questions.forEach((question) => {
            realItem.questions.push({
                id: question.id,
                content: question.content,
                choices: question.choices,
            });
        });
    }

    return res.status(200).send({
        code: 200,
        data: {
            exist: item != undefined,
            item: realItem,
        },
    });
});
router.post("/exam/new", (req, res) => {
    console.log("Received request body:", req.body);
    req.setTimeout(360000);

    let body = req.body;
    let presets = [];
    const difficultyValue = parseInt(body.difficulty);
    const typeValue = parseInt(body.typeexercise);
    console.log(body);
    if (typeValue == -1 || typeValue < 0 || typeValue > 3) {
        return res.status(400).send({
            code: 400,
            reason: "Invalid type of exercise value in body. (0, 1, 2, 3)",
        });
    }
    if (difficultyValue == -1 || difficultyValue < 0 || difficultyValue > 4) {
        return res.status(400).send({
            code: 400,
            reason: "Invalid difficulty value in body. (0, 1, 2, 3)",
        });
    }

    if (body.presets) {
        if (!body.presets.topic) {
            return res.status(400).send({
                code: 400,
                reason: `Invalid topic value in presets. (type: string)`,
            });
        }
        if (!body.presets.tone) {
            return res.status(400).send({
                code: 400,
                reason: `Invalid tone value in presets. (type: string)`,
            });
        }

        presets = [
            ielts.DIFFICULTIES[difficultyValue],
            body.presets.topic,
            body.presets.tone,
        ];
    } else {
        // No presets? We generate then
        presets = ielts.generateRandomPresets(
            ielts.DIFFICULTIES[difficultyValue]
        );
    }
    /*
        Multiple: 0,
        Headers: 1,
        TrueFalse: 2,
    */
    if (typeValue == 0)
        generateMCQ(presets)
            .then((databaseId) => {
                res.status(200).send({
                    code: 200,
                    data: {
                        id: databaseId,
                    },
                });
            })
            .catch((err) => {
                console.log(err)
                res.status(500).send({
                    code: 500,
                    reason: err
                });
            })
    else if (typeValue == 1) {
        generateHeaders(presets)
            .then((databaseId) => {
                res.status(200).send({
                    code: 200,
                    data: {
                        id: databaseId,
                    },
                });
            })
            .catch((err) => {
                console.log(err)
                res.status(500).send({
                    code: 500,
                    reason: err
                });
            })
    }
    else if (typeValue == 2) {
        generateTFNG(presets)
            .then((databaseId) => {
                res.status(200).send({
                    code: 200,
                    data: {
                        id: databaseId,
                    },
                });
            })
            .catch((err) => {
                console.log(err)
                res.status(500).send({
                    code: 500,
                    reason: err
                });
            })
    }
    else {
        res.status(500).send({
            code: 500,
            reason: `invalid examtype: ${typeValue}`
        });
    }
});

router.post("/exam/validate", async (req, res) => {
    let body = req.body;
    if (!body.id) {
        return res.status(400).send({
            code: 400,
            reason: `Invalid id value in body. (type: string)`,
        });
    }
    if (!(body.answers instanceof Object)) {
        return res.status(400).send({
            code: 400,
            reason: `Invalid answers value in body. (type: Object)`,
        });
    }

    const item = await db.fetchExam(body.id);
    if (!item) {
        return res.status(400).send({
            code: 400,
            reason: `Exam id does not exist.`,
        });
    }

    let result = {};
    for (let i = 0; i < item.questions.length; i++) {
        const questionData = item.questions[i];
        if (questionData.correctAnswer == body.answers[questionData.id]) {
            result[questionData.id] = { correct: true };
        } else {
            result[questionData.id] = {
                correct: false,
                correctAnswer: questionData.correctAnswer,
            };
        }
    }

    return res.status(200).send({
        code: 200,
        data: {
            result: result,
        },
    });
});
router.post("/exam/export", async (req, res) => {
    let body = req.body;
    if (!body.id) {
        return res.status(400).send({
            code: 400,
            reason: `Invalid id value in body. (type: string)`,
        });
    }

    const item = await db.fetchExam(body.id);
    if (!item) {
        return res.status(400).send({
            code: 400,
            reason: `Exam id does not exist.`,
        });
    }

    let csvgen = generateCsv(item);
    let csv = csvgen.content;
    if (csvgen.state == 0) {
        return res.status(400).send({
            code: 400,
            reason: `This build is sigmar`,
        });
    }
    return res.status(200).send(Buffer.from(csv));
})
router.post("/translate", async (req, res) => {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(500).json({ code: 500, reason: `Error parsing the file: ${err}` });
            return;
        }

        const file = files.file;
        if (!file) {
            res.status(400).json({ code: 400, reason: 'No file uploaded' });
            return;
        }

        try {
            const filePath = file[0].filepath || file[0].path;
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);

            const text = pdfData.text;
            const translateAi = new AISession();
            translateAi.chat(`Translate all of the content to Vietnamese, don't output anything else.: ${text}`)
                .then(async (response) => {
                    const translation = response.choices[0].message.content.trim();
                    res.status(200).send(await generateDocx(text, translation));
                })
                .catch((err) => {
                    res.status(500).json({
                        code: 500,
                        reason: `Error while translating file: ${err}`
                    });
                });
        } catch (err) {
            res.status(500).json({
                code: 500,
                reason: `Error while reading file: ${err}`
            });
        }
    });
});


module.exports = router;