// import { InventoryModel } from "../models/inventory.mjs";
// export async function requestStatus(req, res) {
// 	const data = await InventoryModel.find().select("received").lean();
// 	const reduced = data.reduce((cum, current) => {
// 		cum.push(...current.received);
// 	}, []);
// 	const last = await reduced.sort((a, b) => b.date - a.date);
// 	const first = await reduced.sort((a, b) => a.date - b.date);
// 	const count = reduced.length;
// 	res.send({ start: first[0].createdAt, end: last[0].createdAt, count });
// }
// export async function harmonizeRequests(req, res) {
// 	try {
// 		// creates date filter
// 		const { startDate, endDate } = req.query;
// 		let dateFilter = {};

// 		if (!!startDate) {
// 			dateFilter = {
// 				...dateFilter,
// 				$gte: new Date(startDate).getTime(),
// 			};
// 		}
// 		if (!!endDate) {
// 			dateFilter = {
// 				...dateFilter,
// 				$lte: new Date(endDate).getTime(),
// 			};
// 		}

// 		// query db
// 		const sales = await InventoryModel.find({})
// 			.select("received commodity outlet")
// 			.lean();

// 		const data = saleReducer(sales, dateFilter);
// 		res.send(data);
// 	} catch (error) {
// 		res.send([]);
// 	}
// }
// export async function harmonizeRequestsCompressed(req, res) {
// 	try {
// 		// creates date filter
// 		const { startDate, endDate } = req.query;
// 		let dateFilter = {};

// 		if (!!startDate) {
// 			dateFilter = {
// 				...dateFilter,
// 				$gte: new Date(startDate).toISOString(),
// 			};
// 		}
// 		if (!!endDate) {
// 			dateFilter = {
// 				...dateFilter,
// 				$lte: new Date(endDate).toISOString(),
// 			};
// 		}

// 		// query db
// 		const sales = await InventoryModel.find({})
// 			.select("received commodity outlet")
// 			.lean();

// 		const data = saleReducerCompressed(sales, products);
// 		res.send(data);
// 	} catch (error) {
// 		res.send([]);
// 	}
// }
// export async function harmonizeRequestsDaily(req, res) {
// 	try {
// 		// creates date filter
// 		const { startDate, endDate } = req.query;
// 		let dateFilter = {};

// 		if (!!startDate) {
// 			dateFilter = {
// 				...dateFilter,
// 				$gte: new Date(startDate).toISOString(),
// 			};
// 		}
// 		if (!!endDate) {
// 			dateFilter = {
// 				...dateFilter,
// 				$lte: new Date(endDate).toISOString(),
// 			};
// 		}

// 		// query db
// 		const sales = await InventoryModel.find({})
// 			.select("received commodity outlet")
// 			.lean();

// 		const data = saleReducerDaily(sales, dateFilter);
// 		res.send(data);
// 	} catch (error) {
// 		res.send([]);
// 	}
// }
// export function saleReducer(sales, filter) {
// 	// deconstruct all sales
// 	const data = sales.reduce((cumm, current) => {
// 		cumm.push(
// 			...current.received
// 				.filter((item) => {
// 					return compareDate(item, filter);
// 				})
// 				.map((item) => {
// 					return {
// 						productName: current.commodity,
// 						quantity: item.quantity,
// 						date: new Date(item.date).toISOString(),
// 						location: current.outlet,
// 					};
// 				}),
// 		);
// 		return cumm;
// 	}, []);
// 	return data;
// }

// export function saleReducerCompressed(sales, filter) {
// 	const data = sales.reduce((cumm, current) => {
// 		const quantity = current.received.reduce((total, item) => {
// 			return compareDate(item, filter) ? total + item.quantity : total;
// 		}, 0);

// 		// check availability in the dictionary
// 		const identifier = current.commodity;
// 		if (!cumm[identifier]) {
// 			cumm[identifier] = {
// 				productName: identifier,
// 				quantity: quantity,
// 			};
// 		} else {
// 			cumm[identifier] = {
// 				...cumm[identifier],
// 				quantity: cumm[identifier].quantity + quantity,
// 			};
// 		}

// 		return cumm;
// 	}, {});
// 	return Object.values(data).filter((item) => item.quantity > 0);
// }
// export function saleReducerDaily(sales, filter) {
// 	const data = sales.reduce((cumm, current) => {
// 		current.received
// 			.filter((item) => {
// 				return compareDate(item, filter);
// 			})
// 			.forEach((item) => {
// 				const date = new Date(new Date(item.date).toLocaleDateString());
// 				const identifier = `${date.getTime()}-${current.commodity}`;
// 				// check availability in the dictionary
// 				if (!cumm[identifier]) {
// 					cumm[identifier] = {
// 						productName: current.commodity,
// 						quantity: item.quantity,
// 						date: date.toISOString(),
// 					};
// 				} else {
// 					cumm[identifier] = {
// 						...cumm[identifier],
// 						quantity: cumm[identifier].quantity + item.quantity,
// 					};
// 				}
// 			});

// 		return cumm;
// 	}, {});
// 	return Object.values(data).filter((item) => item.quantity > 0);
// }
// export function compareDate(item, { $gte, $lte }) {
// 	// filters based on date
// 	if (!!$gte && !!$lte) {
// 		return item.date <= $gte && item.date >= $lte;
// 	}
// 	if (!$gte && !!$lte) {
// 		return item.date >= $lte;
// 	}
// 	if (!$gte && !$lte) {
// 		return item.date <= $gte;
// 	}
// 	if (!$gte && !!$lte) {
// 		return true;
// 	}
// }
