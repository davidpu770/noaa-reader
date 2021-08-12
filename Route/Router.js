const { socketConnection, sendMessage, assignListner } = require("./socket");
const express = require("express");

const path = require("path");
const http = require("http");
const noaa = require("../controller/NOAA");
const S3 = require("../controller/S3");
const FS = require("../controller/FS");
const utils = require("../utils/utils");

const app = express();
const port = 3000;
const server = http.createServer(app);

app.use("/js", express.static(__dirname + "/../public/js"));

socketConnection(server);

const router = () => {
	app.get("/", (req, res) => {
		res.sendFile(path.resolve(__dirname + "/../public/index.html"));
	});

	app.get("/forecast/:date-:offset/:lat/:lon", (req, res) => {
		//check if file exist
		//if exist serve json response
		req.params.api = true;

		params = utils.validateParams(req.params);
		let filePath = utils.querifyRequest(params);

		if (FS.checkFileExist(filePath)) {
			noaa.getFile(params, filePath, (response) => {
				res.send(response);
			});
			return;
		} else {
			S3.RESTgetForecastFromS3(filePath);
			res.send({ status: "downloading" });
			return;
		}
	});

	server.listen(port, () => {
		console.log(`start server on port: ${port}`);
	});
};

module.exports = router;
