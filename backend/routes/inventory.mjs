import { InventoryModel } from "../models/inventory.mjs";
import express from "express";
import { LogModel } from "../models/log.mjs";
import { InventoryModule } from "../utilities/inventory.mjs";

const router = express.Router();
const Model = new InventoryModule(InventoryModel);
router.get("/", async (req, res) => {
  const resource = await InventoryModel.find({ active: true });
  await LogModel.create({
    log: `get log inventories:sent ${resource.length} records`,
  });
  res.send(resource);
});
router.get("/:store", async (req, res) => {
  console.log({ urlstore: req.params.store });
  const resource = await InventoryModel.find({
    active: true,
    outlet: req.params.store,
  });
  await LogModel.create({
    log: `get log inventories:sent ${resource.length} records`,
  });
  console.log({ test: resource.length });
  res.send(resource);
});
router.post("/upload/dispensed/:store", async (req, res) => {
  // console.log({ body: req.body });
  const resources = await InventoryModel.find({
    active: true,
    outlet: req.params.store,
  });
  if (!resources.length) return;
  const uploaded = await uploadDispensed(req.body, resources);
  if (!uploaded) {
    res.status(500).send([]);
    console.log({ uploaded });
    return;
  }
  await LogModel.create({
    log: `get log inventories:sent ${uploaded.length} records`,
  });

  res.send(uploaded);
});

router.post("/create", async (req, res) => {
  const resource = await InventoryModel.create(req.body);
  await LogModel.create({
    log: `create log inventories:created ${resource._id} inventory`,
  });
  res.send(resource);
});
router.post("/dispense/:store", async (req, res) => {
  const inventories = await InventoryModel.find({ outlet: req.params.store });
  const results = [];
  for (let i = 0; i < req.body.length; i++) {
    const inventory = inventories.find((x) => {
      return x.commodity == req.body[i].commodity;
    });

    const isInventory = validate(inventory);
    if (isInventory) {
      inventory.dispensed.splice(0, 0, req.body[i].payload);
      await inventory.save();
      results.push(inventory);
      await LogModel.create({
        log: `create log inventories:added to inventory ${inventory.commodity}`,
      });
    }
  }

  res.send(results);
});
router.post("/issue/:store", async (req, res) => {
  const inventories = await InventoryModel.find({ outlet: req.params.store });
  const recInventories = await InventoryModel.find({
    outlet: req.body[0].payload.client,
  });
  const results = [];

  for (let i = 0; i < req.body.length; i++) {
    const inventory = inventories.find((x) => {
      return x.commodity == req.body[i].commodity;
    });

    const isInventory = validate(inventory);
    if (isInventory) {
      inventory.issued.splice(0, 0, req.body[i].payload);
      await inventory.save();
      results.push(inventory);
      await LogModel.create({
        log: `create log inventories:added to dispensed ${inventory.commodity}`,
      });
    }
  }
  const toReceive = findIssued(results, req.body);
  const recResults = [];
  for (let i = 0; i < toReceive.length; i++) {
    const recInventory = recInventories.find((x) => {
      return x.commodity == toReceive[i].commodity;
    });

    const isInventory = validate(recInventory);
    if (isInventory) {
      recInventory.received.splice(0, 0, toReceive[i].payload);
      await recInventory.save();
      recResults.push(recInventory);
      await LogModel.create({
        log: `create log inventories:added to received ${recInventory.commodity}`,
      });
    }
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
router.post("/beginnings/update/:store", async (req, res) => {
  const results = [];
  const docs = await InventoryModel.find({
    outlet: req.params.store,
  });
  const items = req.body;
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
router.post("/delete/:store/:date", async (req, res) => {
  const items = await InventoryModel.find({ outlet: req.params.store });
  const start_date = Number(req.params.date);
  let results = [];

  const date_2 = new Date(start_date);

  const end_date = date_2.setDate(date_2.getDate() + 1);

  for (let i = 0; i < items.length; i++) {
    let { dispensed } = items[i];
    const isValid = dispensed.filter((z) => {
      return z.date >= start_date && z.date < end_date;
    });
    if (isValid.length > 0) {
      dispensed = dispensed.filter((x) => {
        return !(x.date >= start_date && x.date < end_date);
      });
      items[i].dispensed = dispensed;
      const saved = await items[i].save();
      results.push(saved);
    }
  }
  res.send(results);
});
async function uploadDispensed(items, resources) {
  const uploaded = [];

  for (let i = 0; i < items.length; i++) {
    const found = resources.find((r) => {
      return r.commodity == items[i].commodity;
    });
    const isFound = validate(found);
    if (isFound) {
      found.dispensed.splice(0, 0, ...items[i].quantities);
      await found.save();
      found.dispensed = items[i].quantities;
      uploaded.splice(0, 0, found);
    }
    if (!isFound) {
      console.log({ notfound: items[i] });
    }
  }

  return uploaded;
}
function validate(item) {
  if (!item) return false;
  return true;
}
function findIssued(results, posted) {
  const isIssued = [];
  results.forEach((x) => {
    const f = posted.find((z) => {
      return z.commodity == x.commodity;
    });
    if (!f) return;
    f.payload.client = x.outlet;
    isIssued.push(f);
  });
  return isIssued;
}

export default router;
