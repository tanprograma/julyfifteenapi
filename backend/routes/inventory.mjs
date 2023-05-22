import { InventoryModel } from "../models/inventory.mjs";
import express from "express";
import { LogModel } from "../models/log.mjs";
const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await InventoryModel.find({ active: true });
  await LogModel.create({
    log: `get log inventories:sent ${resource.length} records`,
  });
  res.send(resource);
});
router.get("/:store", async (req, res) => {
  const resource = await InventoryModel.find({
    active: true,
    outlet: req.params.store,
  });
  await LogModel.create({
    log: `get log inventories:sent ${resource.length} records`,
  });
  res.send(resource);
});

router.post("/create", async (req, res) => {
  const resource = await InventoryModel.create(req.body);
  await LogModel.create({
    log: `create log inventories:created ${resource._id} inventory`,
  });
  res.send(resource);
});
router.post("/dispense", async (req, res) => {
  const inventories = await InventoryModel.find({ outlet: req.body.outlet });
  const results = [];
  for (let i = 0; i < req.body.items.length; i++) {
    const inventory = inventories.find((x) => {
      return x.commodity == req.body.items[i].commodity;
    });
    if (!inventory) return;
    inventory.dispensed.splice(0, 0, {
      client: req.body.client,
      quantity: req.body.items[i].quantity,
      date: req.body.items[i].date,
    });
    await inventory.save();
    results.push(inventory);
    await LogModel.create({
      log: `create log inventories:added to inventory ${inventory.commodity}`,
    });
  }

  res.send(results);
});
router.post("/issue", async (req, res) => {
  const issueds = await InventoryModel.find({ outlet: req.body.outlet });
  const receiveds = await InventoryModel.find({ outlet: req.body.client });
  const results = [];
  for (let i = 0; i < req.body.items.length; i++) {
    const inventory = issueds.find((x) => {
      return x.commodity == req.body.items[i].commodity;
    });
    if (!inventory) return;
    inventory.issued.splice(0, 0, {
      client: req.body.client,
      quantity: req.body.items[i].quantity,
      date: req.body.items[i].date,
    });
    await inventory.save();
    results.push(inventory);
    await LogModel.create({
      log: `create log inventories:added ${inventory.commodity} to issued of ${req.body.outlet}`,
    });
  }
  for (let i = 0; i < req.body.items.length; i++) {
    const inventory = receiveds.find((x) => {
      return x.commodity == req.body.items[i].commodity;
    });
    if (!inventory) return;
    inventory.received.splice(0, 0, req.body.items[i]);
    await inventory.save();

    await LogModel.create({
      log: `create log inventories:added ${inventory.commodity} to received of ${req.body.client}`,
    });
  }

  res.send(results);
});
router.post("/beggining/update", async (req, res) => {
  const store = await InventoryModel.findOne({
    outlet: req.body.outlet,
    commodity: req.body.commodity,
  });
  if (!store) {
    res.status(404).send([]);
    return;
  }
  store.beginning = req.body.beginning;
  await store.save();
  await LogModel.create({
    log: `update log inventories:updated beggining for ${store.commodity} items`,
  });
  res.send(results);
});
router.post("/inventory/update", async (req, res) => {
  const store = await InventoryModel.findOne({
    outlet: req.body.outlet,
    commodity: req.body.commodity,
  });
  if (!store) {
    res.status(404).send([]);
    return;
  }
  store.inventory_level = req.body.inventory_level;
  await store.save();
  await LogModel.create({
    log: `update log inventories:updated inventory level for ${store.commodity} in ${req.body.outlet}`,
  });
  res.send(results);
});
router.post("/inventories/update", async (req, res) => {
  const results = [];
  const docs = await InventoryModel.find({
    outlet: req.body.outlet,
  });
  const items = req.body.items;
  for (let i = 0; i < items.length; i++) {
    const doc = docs.find((docitem) => {
      return docitem.commodity == items[i].commodity;
    });

    if (!doc) {
      await LogModel.create({
        log: `update log inventories:could not add inventory level stock for commodity: ${items[i].commodity} in store ${req.body.outlet}`,
      });
      return;
    }
    doc.inventory_level = items[i].inventory_level;
    await doc.save();
    await LogModel.create({
      log: `update log inventories:updated inventory level for ${items[i].commodity} in store ${req.body.outlet}`,
    });
    results.splice(0, 0, doc);
  }

  res.send(results);
});
router.post("/begginings/update", async (req, res) => {
  const results = [];
  const docs = await InventoryModel.find({
    outlet: req.body.outlet,
  });
  const items = req.body.items;
  for (let i = 0; i < items.length; i++) {
    const doc = docs.find((docitem) => {
      return docitem.commodity == items[i].commodity;
    });

    if (!doc) {
      await LogModel.create({
        log: `update log inventories:could not add beggining stock for commodity: ${items[i].commodity} in store ${req.body.outlet}`,
      });
      return;
    }
    doc.beginning = items[i].beginning;
    await doc.save();
    await LogModel.create({
      log: `update log inventories:updated beginning for ${items[i].commodity} in store ${req.body.outlet}`,
    });
    results.splice(0, 0, doc);
  }

  res.send(results);
});

export default router;
