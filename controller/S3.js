const AWS = require("aws-sdk");
const fs = require("fs");
const fileSystem = require("./FS");

const utils = require("../utils/utils");
const config = require("../utils/config").config;
const { v4: uuidv4 } = require("uuid");
const { sendMessage } = require("../Route/socket");

const s3 = new AWS.S3({ region: "us-east-1" });

const getS3Params = (filePath) => {
	const s3params = {
		Bucket: config.BucketName,
		Key: filePath,
	};
	return s3params;
};

const RESTgetForecastFromS3 = async (filePath) => {
	let s3params = getS3Params(filePath);
	let file = fs.createWriteStream(config.ForecasFolderName + filePath);

	fileSystem.createFolder(params.dateFormat);

	const stream = s3.getObject(s3params).createReadStream();
	stream.pipe(file);
};

const getForecastFromS3 = async (params, filePath) => {
	const noaa = require("./NOAA");
	let s3params = getS3Params(filePath);
	let ok = true;

	const metadata = await s3
		.headObject(s3params, (err, data) => {})
		.promise()
		.catch((err) => {
			if (!params.tryYesterday) {
				sendMessage(
					"response",
					"File for this date is not exist, getting last available file..."
				);
				params.oldDate = params.date;
				params = utils.tryYesterday(params);

				noaa.getForecast(params, (response) => {
					let text = `The temperature will be ${response.cel}° on ${response.params.lat}/${response.params.lon} at ${params.oldDate} `;
					sendMessage("response", text);
				}).catch((err) => {
					console.log(err);
				});
			} else {
				sendMessage("response", `${filePath} not found!`);
			}

			ok = false;
			return;
		});

	if (ok) {
		fileSystem.createFolder(params.dateFormat);

		//check if file exist on S3
		let file = fs.createWriteStream(config.ForecasFolderName + filePath);

		var obj = {};
		var className = uuidv4();
		let transferred = 0;
		let percentage = 0;

		sendMessage("createDownloadLog", className);

		const stream = s3
			.getObject(s3params)
			.createReadStream()
			.on("error", (err) => {
				sendMessage("response", err);
			})
			.on("data", (chunk) => {
				transferred += chunk.length;
				percentage = (transferred / metadata.ContentLength) * 100;

				obj.data = percentage.toFixed(2);
				obj.class = className;

				sendMessage("downloadLog", obj);
			})
			.on("finish", () => {
				sendMessage("removeDownloadLog", className);

				noaa.getForecast(params, (response) => {
					let text = `The temperature will be ${response.cel}° on ${
						response.params.lat
					}/${response.params.lon} at ${
						response.params.tryYesterday
							? response.params.oldDate
							: response.params.date
					} `;
					sendMessage("response", text);
				});
			});

		stream.pipe(file);
	}
};

module.exports = {
	getForecastFromS3: getForecastFromS3,
	RESTgetForecastFromS3: RESTgetForecastFromS3,
};
