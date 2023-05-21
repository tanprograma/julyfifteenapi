import { DispenseModel } from "../models/dispense.mjs";
import { InventoryModel } from "../models/inventory.mjs";
import express from "express";
import { LogModel } from "../models/log.mjs";
const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await DispenseModel.find();
  await LogModel.create({
    log: `get log dispensed:${resource.length} dispenseds `,
  });
  res.send(resource);
});
router.get("/reports/:store/:date", async (req, res) => {
  const date = new Date(Number(req.params.date)).valueOf();
  const maxDate = date.setDate(date.getDate() + 1).valueOf();
  const resource = await DispenseModel.find({
    outlet: req.params.store,
  });
  const filtered = resource.map((i) => {
    i.items = i.items.filter((x) => {
      return x.date < maxDate || x.date >= date;
    });
    return i;
  });
  await LogModel.create({
    log: `get log dispensed:return ${filtered.length} dispenseds `,
  });
  res.send(filtered);
});
router.post("/create", async (req, res) => {
  const dispensed = await DispenseModel.create(req.body);
  await LogModel.create({
    log: `create log dispensed:created ${dispensed._id}`,
  });
  const results = await updateInventory(dispensed);
  // console.log({ created: dispensed.items });
  res.send(dispensed);
});
router.post("/create/many", async (req, res) => {
  const dispensed = await DispenseModel.create(req.body);
  await LogModel.create({
    log: `create log dispensed:created ${dispensed.length} records`,
  });
  const results = await updateInventories(dispensed);

  // console.log({ created: dispensed.items });
  res.send(dispensed);
});
async function updateInventories(data) {
  const results = [];
  for (let i = 0; i < data.length; i++) {
    let innerRes = await updateInventories(data[i]);
    results.push(...innerRes);
  }
  return results;
}
async function updateInventory(data) {
  let results = [];
  for (let i = 0; i < data.items.length; i++) {
    const inventory = await InventoryModel.findOne({
      commodity: item.commodity,
      outlet: data.host,
    });

    if (!inventory) return;
    inventory.dispensed.push({
      transaction: data._id,
      date: data.date,
      quantity: item.requested,
      unit: item.unit,
    });
    const resItem = await inventory.save();
    await LogModel.create({
      log: `update log dispensed:added to dispensed in ${resItem._id}  `,
    });
    results.push(resItem);
  }
  return results;
}
export default router;
