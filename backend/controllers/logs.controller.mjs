import { LogModel } from "../models/log.mjs";
export class LogController {
	model = LogModel;
	constructor(query) {
		this.query = query;
	}
	async logStatus() {
		const data = await this.model.find().lean();
		const reduced = data.map((item) => ({
			...item,
			date: new Date(item.date),
		}));
		const last = reduced.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		)[0];
		const first = reduced.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		)[0];
		const count = data.length;
		return {
			start: !!first ? first.date.toISOString() : "",
			end: !!last ? last.date.toISOString() : "",
			count,
		};
	}
	async getLogs() {
		const query = this.parseTime();
		constdata = await this.model
			.find({ createdAt: query })

			.lean();

		return data;
	}

	parseTime() {
		const { startDate, endDate } = this.query;
		let filter = {};

		if (!!startDate) {
			filter = {
				...filter,
				$gte: new Date(startDate).getTime(),
			};
		}
		if (!!endDate) {
			filter = {
				...filter,
				$lte: new Date(endDate).getTime(),
			};
		}
		return filter;
	}
}

export async function getLogsStatus(req, res) {
	const controller = new LogController(req.query);
	const data = await controller.logStatus();
	res.send(data);
}
export async function getLogs(req, res) {
	try {
		const controller = new LogController(req.query);
		const data = await controller.getLogs();
		res.send(data);
	} catch (error) {
		res.send([]);
	}
}
