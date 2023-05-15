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
router.post("/create", async (req, res) => {
  const dispensed = await DispenseModel.create(req.body);
  await LogModel.create({
    log: `create log dispensed:created ${dispensed._id}`,
  });
  updateInventory(dispensed);
  // console.log({ created: dispensed.items });
  res.send(dispensed);
});
function updateInventory(data) {
  data.items.forEach(async (item) => {
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
    console.log({ resItem });
  });
}
export default router;
