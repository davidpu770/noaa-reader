const expect = require("chai").expect;
const noaa = require("../controller/NOAA");
const wgrib = require("../controller/WGRIB2");
const utils = require("../utils/utils");

describe("Get Response", () => {
	it("should return Noaa Object", async () => {
		const params = {
			date: "20210810",
			offset: "023",
			api: true,
			lat: 34.45454,
			lon: 23.24654,
		};
		await noaa.getForecast(params, (response) => {
			expect(response).to.be.a("object");
		});
	});
	it("check file correct", async () => {
		const params = {
			date: "20210810",
			offset: "023",
			api: true,
			lat: 34.45454,
			lon: 23.24654,
		};
		let filePath = utils.querifyRequest(params);
		await wgrib.checkFileCorrect(params, filePath, (response) => {
			expect(response).to.be.be(true);
		});
	});
});
