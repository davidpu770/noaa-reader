let io;
const config = require("../utils/config").config;
const axios = require("axios");

const socketConnection = (server) => {
	const noaa = require("../controller/NOAA");

	io = require("socket.io")(server);

	io.on("connection", (socket) => {
		console.info(`Client connected [id=${socket.id}]`);

		socket.join(socket.request._query.id);

		socket.on("disconnect", () => {
			console.info(`Client disconnected [id=${socket.id}]`);
		});

		socket.on("requestForecast", (params) => {
			noaa.getForecast(params, (response) => {
				let text = `The temperature will be ${response.cel}° on ${response.params.lat}/${response.params.lon} at ${response.params.date} `;
				sendMessage("response", text);
			});
		});

		socket.on("getGeolocation", (query) => {
			if (query.location.length == 0) {
				sendMessage("response", "location is empty");
				return;
			}
			let url = `http://api.positionstack.com/v1/forward?access_key=${config.geo_access_key}&query=${query.location}`;

			axios
				.get(url)
				.then((response) => {
					sendMessage("getLocation", {
						lat: response.data.data[0].latitude,
						lon: response.data.data[0].longitude,
					});
				})
				.catch((error) => {
					console.log(error);
				});
		});
	});
};

const sendMessage = (eventName, data) => {
	io.emit(eventName, data);
};

module.exports = {
	socketConnection: socketConnection,
	sendMessage: sendMessage,
};
