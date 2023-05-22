import { StoreModel } from "../models/store.mjs";
import { InventoryModel } from "../models/inventory.mjs";
import { MedicineModel } from "../models/medicine.mjs";
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
  const resource = await StoreModel.create(req.body);
  await LogModel.create({
    log: `create log stores:added store ${resource.name}`,
  });
  const medicines = await MedicineModel.find();
  if (!medicines.length) {
    for (let i = 0; i < medicines.length; i++) {
      await createInventory(resource, medicines[i]);
    }
  }
  const inventories = await createInventory(resource, commodity_status);
  await LogModel.create({
    log: `create log stores: created ${inventories.length} inventories`,
  });
  res.send(resource);
});
router.post("/create/many", async (req, res) => {
  const stores = await StoreModel.find();
  const medicines = await MedicineModel.find();
  if (!medicines.length && stores.length) {
    for (let i = 0; i < medicines.length; i++) {
      await createInventory(stores, medicines[i]);
    }
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
async function createInventories(stores, item) {
  for (let i = 0; i < stores.length; i++) {
    await createInventory(stores[i], item);
  }
}
async function createInventory(store, item) {
  const inventory = await InventoryModel.create({
    outlet: store.name,
    commodity: item.name,
    unit: item.unit,
    unit_value: item.unit_value,
  });
  await inventory.save();
  await LogModel.create({
    log: `create log stores:created inventory ${inventory.commodity} in ${store.name} inventories`,
  });
}

export default router;
