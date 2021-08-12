const fs = require("fs");
const FS = require("./FS");
const S3 = require("./S3");
const wgrib = require("./WGRIB2");
const { sendMessage } = require("../Route/socket");

const utils = require("../utils/utils");
const path = require("path");

const getForecast = async (params, callback) => {
	//validate params and format date and offset
	params = utils.validateParams(params);
	if (params.ok) {
		//check if file exist in file system
		let filePath = utils.querifyRequest(params);

		if (FS.checkFileExist(filePath)) {
			//if exist go to wgrib2
			wgrib.checkFileCorrect(params, filePath, async () => {
				await getFile(params, filePath, callback);
			});
		} else {
			//if not exist go to s3 and grab the file
			await S3.getForecastFromS3(params, filePath);
		}
	} else {
		sendMessage("response", "Date is invalid");
	}
};

const getFile = (params, filePath, callback) => {
	wgrib.checkFileCorrect(params, filePath, async () => {
		await wgrib.getDataFromForecast(
			params,
			"forecasts/" + filePath,
			(response) => {
				response.params = params;
				if (response.cel == 0 && response.kel == 0) {
					//file is incorect or still downloading
					return callback({ status: "downloading" });
				}
				return callback(response);
			}
		);
	});
};

module.exports = {
	getForecast: getForecast,
	getFile: getFile,
};
