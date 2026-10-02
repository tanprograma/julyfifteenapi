import { InventoryModel } from "../models/inventory.mjs";
import { StoreModel } from "../models/store.mjs";
import { SupplierModel } from "../models/suppliers.mjs";
export async function getInventories(req, res) {
	let query = {};
	const { outlet } = req.query;
	if (!!outlet) {
		query = { ...query, outlet };
	}
	const inventories = await InventoryModel.find(query)
		.select("_id commodity outlet beginning")
		.lean();
	res.send(
		inventories.map((item) => {
			return {
				productName: item.commodity,
				location: item.outlet,
				inventoryID: item._id,
				beginning: item.beginning,
			};
		}),
	);
}
export async function getSuppliers(req, res) {
	const suppliers = await SupplierModel.find().lean();
	res.send(suppliers);
}
export async function getStores(req, res) {
	const suppliers = await StoreModel.find().lean();
	res.send(suppliers);
}
