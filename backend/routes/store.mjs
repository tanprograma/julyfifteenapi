import { StoreModel } from "../models/store.mjs";
import { InventoryModel } from "../models/inventory.mjs";
import { CommodityModel } from "../models/commodity.mjs";
import { LogModel } from "../models/log.mjs";
import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await StoreModel.find();
  await LogModel.create({
    log: `get log stores:sent ${resource.length} records`,
  });
  res.send(resource);
});
router.post("/create", async (req, res) => {
  const stores = await StoreModel.find();
  if (!stores.length) {
    const supplier = await StoreModel.create({
      name: "supplier",
      isSupplier: true,
    });
  }
  const resource = await StoreModel.create(req.body);
  await LogModel.create({
    log: `create log stores:added store ${resource.name}`,
  });
  const commodity_status = await CommodityModel.find();
  if (!commodity_status.length) {
    res.send(resource);
    return;
  }
  const inventories = await createInventory(resource, commodity_status);
  await LogModel.create({
    log: `create log stores: created ${inventories.length} inventories`,
  });
  res.send(resource);
});
router.post("/create/many", async (req, res) => {
  const stores = await StoreModel.find();
  if (!stores.length) {
    const supplier = await StoreModel.create({
      name: "supplier",
      isSupplier: true,
    });
  }
  const resources = await StoreModel.create(req.body);
  await LogModel.create({
    log: `create log stores:added ${resources.length} stores`,
  });
  const commodity_status = await CommodityModel.find();
  if (!commodity_status.length) {
    res.send(resources);
    return;
  }
  const inventories = await createInventories(resources, commodity_status);
  await LogModel.create({
    log: `create log stores:added ${resources.length} inventories`,
  });
  res.send(resources);
});

export default router;
async function createInventory(store, commodities) {
  const inventories = [];
  commodities.forEach((i) => {
    inventories.push({
      commodity: i.name,
      outlet: store._id,
      dispensed: [],
      received: [],
      issued: [],
    });
  });
  return InventoryModel.create(inventories);
}
async function createInventories(stores, commodities) {
  const inventories = [];
  commodities.forEach((c) => {
    stores.forEach((store) => {
      inventories.push({
        commodity: c.name,
        outlet: store._id,
        dispensed: [],
        received: [],
        issued: [],
      });
    });
  });
  return InventoryModel.create(inventories);
}
