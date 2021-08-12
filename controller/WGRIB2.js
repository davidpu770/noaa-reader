var execFile = require("child_process").execFile;
const fs = require("fs");
const S3 = require("./S3");

const getDataFromForecast = async (params, filePath, callback) => {
	let execution = __dirname + `\\..\\wgrib\\wgrib2.exe`;
	let args = [
		`${__dirname}\\..\\${filePath}`,
		"-match",
		"(TMP:2 m above ground)",
		`-lon`,
		`${params.lon}`,
		`${params.lat}`,
	];
	var child = execFile(execution, args, async (err, data) => {
		var response = {
			cel: 0.0,
			kel: 0.0,
		};

		try {
			var splitedResponse = data.toString().split("\n");
			await splitedResponse.forEach((element) => {
				if (element.length > 1) {
					var splitedElement = element.split(",");

					var splitedValue = splitedElement[2].split("=");
					response.kel = Math.round(splitedValue[1]);
					response.cel = Math.round(splitedValue[1] - 273.15);
				}
			});
			return callback(response);
		} catch (err) {
			console.log(err);
		}
	});
};

const checkFileCorrect = (params, filePath, callback) => {
	let execution = __dirname + `\\..\\wgrib\\wgrib2.exe`;
	let args = ["-v", `${__dirname}\\..\\forecasts\\${filePath}`];

	var child = execFile(execution, args, async (err, data) => {
		if (err) {
			if (params.api) {
				callback();
				return;
			}
			//file is incorrect
			S3.getForecastFromS3(params, filePath);
		} else {
			callback();
		}
	});
};

module.exports = {
	getDataFromForecast: getDataFromForecast,
	checkFileCorrect: checkFileCorrect,
};
