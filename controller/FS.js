const fs = require("fs");
const path = require("path");

const utils = require("../utils/utils");

const createFolder = (date) => {
	fs.mkdirSync(utils.getFolderPath(date), { recursive: true }, (err) => {
		if (err) throw err;
		console.log("Directory created successfully!");
	});
};

const checkFileExist = (filePath) => {
	return fs.existsSync("forecasts/" + filePath);
};

module.exports = {
	createFolder: createFolder,
	checkFileExist: checkFileExist,
};
