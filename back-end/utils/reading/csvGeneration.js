const {stringify} = require("csv-stringify/sync");
module.exports = (item) => {
    let csv = [];
    val = 1;
    item.questions.forEach((question, index) => {
        let rowData = ["MC", "", question.choices.length, `${
            (index == 0
                ? item.readingMaterial
                        .replace("<b>", "")
                        .replace("</b>", "")
                        .replace("\n", "\" \n \"")
                        .replace('"', '""') + "\n"
                : "") + question.content
        }`, question.choices.indexOf(question.correctAnswer) + 1];
        question.choices.forEach((choice) => {
            rowData.push(choice);
        });

        csv.push(rowData);
    });
    return { state: val, content: stringify(csv) };
}
