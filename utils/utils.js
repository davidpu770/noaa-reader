const dateformat = require("dateformat");
const { sendMessage } = require("../Route/socket");

const querifyRequest = (params) => {
	return `gfs.${params.dateFormat}/00/atmos/gfs.t00z.pgrb2.0p25.f${params.offset}`;
};
const getFolderPath = (date) => {
	return `forecasts/gfs.${date}/00/atmos/`;
};

const getOffset = (date, today) => {
	let number = Math.round(
		Date.parse(date) / 1000 / 60 / 60 - Math.floor(today) / 1000 / 60 / 60
	);
	if (number < 10) {
		return "00" + number;
	}
	if (number >= 10 && number <= 100) {
		return "0" + number;
	} else {
		return number;
	}
};

const getPastOffset = (date) => {
	let d = dateformat(date, "yyyy-mm-dd 00:00:00");

	let number = Math.round(
		Date.parse(date) / 1000 / 60 / 60 -
			Math.floor(Date.parse(d)) / 1000 / 60 / 60
	);
	if (number < 10) {
		return "00" + number;
	}
	if (number >= 10 && number < 100) {
		return "0" + number;
	} else {
		return number;
	}
};

const validateParams = (params) => {
	params.ok = false;
	if (params.date.length == 0) {
		return params;
	}
	let today = new Date();
	params.ok = true;
	if (params.api) {
		var year = params.date.substring(0, 4);
		var month = params.date.substring(4, 6);
		var day = params.date.substring(6, 8);

		params.date = new Date(year, month - 1, day);

		if (new Date(params.date) > today) {
			params.offset = getOffset(new Date(params.date), today);
			params.date = dateformat(today, "yyyymmdd");
			params.dateFormat = dateformat(today, "yyyymmdd");
		}
	}
	if (!params.tryYesterday) {
		if (new Date(params.date) > today) {
			try {
				params.dateFormat = dateformat(today, "yyyymmdd");
				params.offset = getOffset(params.date, today);
			} catch (err) {
				params.dateFormat = params.date;
			}
		} else {
			try {
				params.dateFormat = dateformat(params.date, "yyyymmdd");
				params.offset = getPastOffset(params.date);
			} catch (err) {
				params.dateFormat = params.date;
			}
		}
	}

	return params;
};

const tryYesterday = (params) => {
	let today = new Date();
	today.setDate(today.getDate() - 1);

	params.offset = getOffset(params.date, today);

	params.date = dateformat(today, "dd-mm-yyyy hh:MM");
	params.dateFormat = dateformat(today, "yyyymmdd");
	params.tryYesterday = true;

	return params;
};

module.exports = {
	querifyRequest: querifyRequest,
	getFolderPath: getFolderPath,
	getOffset: getOffset,
	validateParams: validateParams,
	tryYesterday: tryYesterday,
};
