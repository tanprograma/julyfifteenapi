import { InventoryModel } from "../models/inventory.mjs";
export async function getInventories(req, res) {
	let query = {};
	const { outlet } = req.query;
	if (!!outlet) {
		query = { ...query, outlet };
	}
	const inventories = InventoryModel.find(query)
		.select("_id,commodity,outlet")
		.lean();
	res.send(
		inventories.map((item) => {
			return {
				productName: item.commodity,
				location: item.outlet,
				inventoryID: item._id,
			};
		}),
	);
}
