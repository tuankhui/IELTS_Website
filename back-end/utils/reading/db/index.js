const mongoose = require("mongoose");
const { ExamModel } = require("./models.js");

module.exports.connect = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
}

module.exports.fetchExam = async (id) => {
    return await ExamModel.findById(id)
}

module.exports.pushExamAndReceiveId = async (examType, readingMaterial, questions) => {
    const item = await ExamModel.create({
        examType: examType,
        readingMaterial: readingMaterial,
        questions: questions
    });

    return item._id;
}