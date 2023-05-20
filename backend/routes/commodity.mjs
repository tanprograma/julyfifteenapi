import { CommodityModel } from "../models/commodity.mjs";
import { StoreModel } from "../models/store.mjs";
import { InventoryModel } from "../models/inventory.mjs";
import { LogModel } from "../models/log.mjs";
import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await CommodityModel.find();
  await LogModel.create({
    log: `get log commodity:sent ${resource.length} commodities`,
  });
  res.send(resource);
});
router.post("/create", async (req, res) => {
  const resource = await CommodityModel.create(req.body);
  await LogModel.create({
    log: `post log commodity:created ${resource.name}`,
  });
  const store_status = (await StoreModel.find()).filter((i) => {
    return !i.isSupplier;
  });
  if (!store_status.length) {
    const supplier = await StoreModel.create({
      name: "supplier",
      isSupplier: true,
      isWarehouse: false,
    });
    res.send(resource);
    return;
  }
  const inventories = await createInventory(store_status, resource);
  await LogModel.create({
    log: `create log commodity:created ${inventories.length} inventories `,
  });

  res.send(resource);
});
export default router;
async function createInventory(stores, commodity) {
  const inventories = [];
  stores.forEach((store) => {
    inventories.push({
      commodity: commodity.name,
      outlet: store._id,
      dispensed: [],
      received: [],
      issued: [],
    });
  });
  return InventoryModel.create(inventories);
}
