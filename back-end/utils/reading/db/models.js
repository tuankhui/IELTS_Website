const mongoose = require("mongoose");
module.exports.ExamSchema = new mongoose.Schema({
    examType: Number,
    readingMaterial: String,
    questions: [{
        id: Number,
        content: String,
        correctAnswer: String,
        choices: [String]
    }]
});
module.exports.ExamModel = mongoose.model("exams", module.exports.ExamSchema);