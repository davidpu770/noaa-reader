$(document).ready(() => {
	var socket = io();

	$("#datatimepicker").flatpickr({
		enableTime: true,
		dateFormat: "d-M-Y H:i",
		time_24hr: true,
		minDate: new Date().fp_incr(-180),
		maxDate: new Date().fp_incr(3.9),
	});

	socket.on("response", (msg) => {
		$(".status").append(
			`<div class="alert alert-primary" role="alert">${msg}</div>`
		);
	});

	socket.on("downloadLog", (msg) => {
		$("." + msg.class)
			.html(`<div class="progress" style="height: 20px; margin-top: 10px;">
  <div class="progress-bar" role="progressbar" style="width:${msg.data}%" aria-valuenow="${msg.data}" aria-valuemin="0" aria-valuemax="100">${msg.data}%</div>
</div>`);
	});
	socket.on("createDownloadLog", (className) => {
		$(".download-log").append(
			`<div class="${className}" role="alert"></div>`
		);
	});

	socket.on("removeDownloadLog", (className) => {
		$("." + className).remove();
	});

	socket.on("getLocation", (location) => {
		$("#Latitude").val(location.lat);
		$("#longitude").val(location.lon);
	});

	$("#clear-log").on("click", (e) => {
		$(".status").empty();
	});
	$("#submit-form").on("click", (e) => {
		socket.emit("requestForecast", {
			date: $("#datatimepicker").val(),
			offset: "003",
			lat: $("#Latitude").val(),
			lon: $("#longitude").val(),
		});
		e.preventDefault();
	});

	$("#locateLocation").on("click", (e) => {
		socket.emit("getGeolocation", {
			location: $("#location").val(),
		});
	});
});
