import { InventoryModel } from "../models/inventory.mjs";
export class SaleController {
	model = InventoryModel;
	constructor(query) {
		this.query = query;
	}
	async saleStatus() {
		const data = await this.model
			.find({ isWarehouse: true })
			.select("received")
			.lean();
		const reduced = data.reduce((cum, current) => {
			cum.push(...current.received);
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
	async harmonizePurchases() {
		const sales = await this.model
			.find({ isWarehouse: true })
			.select("received commodity outlet")
			.lean();

		const data = this.saleReducer(sales);
		return data;
	}
	async harmonizePurchasesCompressed() {
		const sales = await this.model
			.find({ isWarehouse: true })
			.select("received commodity")
			.lean();

		const data = this.saleReducerCompressed(sales);
		return data;
	}
	async harmonizePurchasesDaily() {
		const sales = await this.model
			.find({ isWarehouse: true })
			.select("received commodity _id outlet")
			.lean();

		const data = this.saleReducerDaily(sales);
		return data;
	}
	saleReducer(sales) {
		// deconstruct all sales
		const data = sales.reduce((cumm, current) => {
			const filtered = current.received
				.filter((item) => {
					return this.compareDate(item);
				})
				.map((item) => {
					return {
						productName: current.commodity,
						quantity: item.quantity,
						date: new Date(item.date).toISOString(),
						location: item.client,
					};
				});

			cumm.push(...filtered);
			return cumm;
		}, []);
		return data;
	}
	saleReducerCompressed(sales) {
		const data = sales.reduce((cumm, current) => {
			const quantity = current.received.reduce((total, item) => {
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
			current.received
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
							location: item.client,
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
				"received.date": { $gte: old },
			},
			{ $set: { "received.$.date": current } },
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
export async function harmonizePurchases(req, res) {
	try {
		const controller = new SaleController(req.query);
		const data = await controller.harmonizePurchases();
		res.send(data);
	} catch (error) {
		res.send([]);
	}
}
export async function harmonizePurchasesCompressed(req, res) {
	try {
		const controller = new SaleController(req.query);
		const data = await controller.harmonizePurchasesCompressed();
		res.send(data);
	} catch (error) {
		res.send([]);
	}
}

export async function harmonizePurchasesDaily(req, res) {
	try {
		const controller = new SaleController(req.query);
		const data = await controller.harmonizePurchasesDaily();
		res.send(data);
	} catch (error) {
		res.send([]);
	}
}
