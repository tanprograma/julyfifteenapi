import { parseInt } from "lodash";
import { InventoryModel } from "../models/inventory.mjs";
export class SaleController {
	model = InventoryModel;
	constructor(query) {
		this.query = query;
	}
	async saleStatus() {
		const data = await this.model.find().select("dispensed").lean();
		const reduced = data.reduce((cum, current) => {
			cum.push(...current.dispensed);
			return cum;
		}, []);
		const last = reduced.sort((a, b) => b.date - a.date)[0];
		const first = reduced.sort((a, b) => a.date - b.date)[0];
		const count = reduced.length;
		return {
			start: !!first ? new Date(first.date) : "",
			end: !!last ? new Date(last.date) : "",
			count,
		};
	}
	async harmonizeSales() {
		const sales = await this.model
			.find()
			.select("dispensed commodity outlet")
			.lean();

		const data = this.saleReducer(sales);
		return data;
	}
	async harmonizeSalesCompressed() {
		const sales = await this.model.find().select("dispensed commodity").lean();

		const data = this.saleReducerCompressed(sales);
		return data;
	}
	async harmonizeSalesDaily() {
		const sales = await this.model
			.find()
			.select("dispensed commodity _id outlet")
			.lean();

		const data = this.saleReducerDaily(sales);
		return data;
	}
	saleReducer(sales) {
		// deconstruct all sales
		const data = sales.reduce((cumm, current) => {
			const filtered = current.dispensed
				.filter((item) => {
					return this.compareDate(item);
				})
				.map((item) => {
					return {
						productName: current.commodity,
						quantity: item.quantity,
						date: new Date(item.date).toISOString(),
						location: current.outlet,
					};
				});

			cumm.push(...filtered);
			return cumm;
		}, []);
		return data;
	}
	saleReducerCompressed(sales) {
		const data = sales.reduce((cumm, current) => {
			const quantity = current.dispensed.reduce((total, item) => {
				return this.compareDate(item) ? total + item.quantity : total;
			}, 0);

			// check availability in the dictionary
			const identifier = current.commodity;
			if (!cumm[identifier]) {
				cumm[identifier] = {
					productName: identifier,
					quantity: quantity,
				};
			} else {
				cumm[identifier] = {
					...cumm[identifier],
					quantity: cumm[identifier].quantity + quantity,
				};
			}

			return cumm;
		}, {});
		return Object.values(data).filter((item) => item.quantity > 0);
	}
	saleReducerDaily(sales) {
		const data = sales.reduce((cumm, current) => {
			current.dispensed
				.filter((item) => {
					return this.compareDate(item);
				})
				.forEach((item) => {
					const date = new Date(new Date(item.date).toLocaleDateString());
					const identifier = `${date.getTime()}-${current._id}`;
					// check availability in the dictionary
					if (!cumm[identifier]) {
						cumm[identifier] = {
							productName: current.commodity,
							quantity: item.quantity,
							date: date.toISOString(),
							outlet: current.outlet,
						};
					} else {
						cumm[identifier] = {
							...cumm[identifier],
							quantity: cumm[identifier].quantity + item.quantity,
						};
					}
				});

			return cumm;
		}, {});
		return Object.values(data).filter((item) => item.quantity > 0);
	}
	compareDate(item) {
		const { start, end } = this.parseTime();
		if (!!end && !!start) {
			return item.date <= end && item.date >= start;
		}
		if (!end && !!start) {
			return item.date >= start;
		}
		if (!!end && !start) {
			return item.date <= end;
		}
		return true;
	}
	parseTime() {
		const { startDate, endDate } = this.query;
		let filter = {};

		if (!!startDate) {
			filter = {
				...filter,
				start: new Date(startDate).getTime(),
			};
		}
		if (!!endDate) {
			filter = {
				...filter,
				end: new Date(endDate).getTime(),
			};
		}
		return filter;
	}
}
export async function reset(req, res) {
	try {
		const old = parseInt(req.query.old);
		const current = parseInt(req.query.current);
		const item = await InventoryModel.updateMany(
			{
				"dispensed.date": { $gte: old },
			},
			{ $set: { "dispensed.$.date": current } },
		);
		res.send(item);
	} catch (error) {
		res.send({ error: "something bad happened" });
	}
}
export async function saleStatus(req, res) {
	const controller = new SaleController(req.query);
	const data = await controller.saleStatus();
	res.send(data);
}
export async function harmonizeSales(req, res) {
	try {
		const controller = new SaleController(req.query);
		const data = await controller.harmonizeSales();
		res.send(data);
	} catch (error) {
		res.send([]);
	}
}
export async function harmonizeSalesCompressed(req, res) {
	try {
		const controller = new SaleController(req.query);
		const data = await controller.harmonizeSalesCompressed();
		res.send(data);
	} catch (error) {
		res.send([]);
	}
}

export async function harmonizeSalesDaily(req, res) {
	try {
		const controller = new SaleController(req.query);
		const data = await controller.harmonizeSalesDaily();
		res.send(data);
	} catch (error) {
		res.send([]);
	}
}
