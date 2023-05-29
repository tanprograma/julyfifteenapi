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
  try {
    const store = await StoreModel.create(req.body);
    await LogModel.create({
      log: `create log stores:added store ${store.name}`,
    });
    const medicines = await MedicineModel.find();
    if (!medicines.length) {
      for (let i = 0; i < medicines.length; i++) {
        await createInventory(resource, medicines[i]);
      }
    }

    res.send(store);
  } catch (error) {
    console.log("something happened");
    res.status(500).send([]);
    return;
  }
});
router.post("/import", async (req, res) => {
  try {
    const stores = await StoreModel.create(req.body);

    await LogModel.create({
      log: `create log stores:added ${stores.length} stores`,
    });
    if (!stores.length) {
      res.send([]);
      return;
    }
    const medicines = await MedicineModel.find();
    if (!medicines.length) {
      res.send(stores);
      return;
    }

    for (let i = 0; i < medicines.length; i++) {
      await createInventories(stores, medicines[i]);
    }

    res.send(stores);
  } catch (error) {
    res.status(400).send([]);
  }
});
async function createInventories(stores, item) {
  for (let i = 0; i < stores.length; i++) {
    await createInventory(stores[i], item);
  }
}
async function createInventory(store, item) {
  try {
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
  } catch (error) {
    console.log("something happened");
    return;
  }
}

export default router;
