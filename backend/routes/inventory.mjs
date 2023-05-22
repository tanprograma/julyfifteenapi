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
router.get("/dispensed/:store/:date", async (req, res) => {
  const date = new Date(Number(req.params.date));

  const resource = await InventoryModel.find({ outlet: req.params.store });
  const filtered = resource.map((i) => {
    return {
      commodity: i.commodity,
      dispensed: i.dispensed.filter((x) => {
        const testDate = new Date(Number(x.date));
        const isDate = compareDate(date, testDate);
        if (isDate) return true;
      }),
    };
  });
  await LogModel.create({
    log: `get log inventories:sent ${filtered.length} records`,
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
router.post("/begginingstock/update/:store", async (req, res) => {
  const stores = await InventoryModel.find({ outlet: req.params.store });
  if (!stores.length) {
    res.status(404).send([]);
    return;
  }
  const results = await updateBeggining(req.body.payload, stores);
  await LogModel.create({
    log: `update log inventories:updated ${results.length} items`,
  });
  res.send(results);
});
router.post("/begginingstocks/update", async (req, res) => {
  const results = [];
  const items = req.body.items;
  for (let i = 0; i < items.length; i++) {
    const doc = await InventoryModel.findOne({
      outlet: items[i].outlet,
      commodity: items[i].commodity,
    });
    if (!doc) {
      results.splice(0, 0, {
        outlet: items[i].outlet,
        commodity: items[i].commodity,
        beggining: 0,
      });
      await LogModel.create({
        log: `update log inventories:could not add beggining stock for commodity: ${items[i].commodity} in store ${items[i].outlet}`,
      });
      return;
    }
    doc.beggining = items[i].beggining;
    await doc.save();
    await LogModel.create({
      log: `update log inventories:added commodity: ${items[i].commodity} in store ${items[i].outlet}`,
    });
    results.splice(0, 0, doc);
  }

  res.send(results);
});
async function updateBeggining(items, stores) {
  // items.forEach(async (element) => {
  //   const inventory = stores.find((i) => {
  //     return i._id == element.commodity;
  //   });
  //   if (!inventory) return;
  //   inventory.beggining = element.quantity;
  //   await inventory.save();
  // });
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const res = await update(items[i], stores);
    results.push(res);
  }
  return results;
}
async function updateBegginings(items, stores) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const res = await update(items[i], stores);
    results.push(res);
  }
  return results;
}
function update(item, stores) {
  const inventory = stores.find((i) => {
    return i.commodity == item.commodity;
  });
  if (!inventory) return {};
  inventory.beginning = item.quantity;
  return inventory.save();
}
function updateMany(item, stores) {
  const inventory = stores.find((i) => {
    return i.commodity == item.commodity;
  });
  if (!inventory) return {};
  inventory.beginning = item.quantity;
  return inventory.save();
}

function compareDate(date, test) {
  if (!(date.getUTCFullYear() == test.getUTCFullYear())) return false;
  if (
    date.getUTCDate() == test.getUTCDate() &&
    date.getUTCMonth() == test.getUTCMonth()
  )
    return true;
  return false;
}
export default router;
