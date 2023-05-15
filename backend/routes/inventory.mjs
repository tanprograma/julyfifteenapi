import { InventoryModel } from "../models/inventory.mjs";
import express from "express";
import { LogModel } from "../models/log.mjs";
const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await InventoryModel.find();
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
function update(item, stores) {
  console.log({ storesInve: stores });
  const inventory = stores.find((i) => {
    return i.commodity == item.commodity;
  });
  if (!inventory) return {};
  inventory.beginning = item.quantity;
  return inventory.save();
}

export default router;
