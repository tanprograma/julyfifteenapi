import { ReceiveModel } from "../models/receive.mjs";
import { InventoryModel } from "../models/inventory.mjs";
import express from "express";
import { StoreModel } from "../models/store.mjs";
import { LogModel } from "../models/log.mjs";
const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await ReceiveModel.find();
  await LogModel.create({
    log: `get log receiveds:${resource.length} records`,
  });
  res.send(resource);
});
router.get("/unissued/:store", async (req, res) => {
  const store = await StoreModel.findOne({ name: req.params.store });
  if (!store) {
    res.status(404).send([]);
    return;
  }
  const resource = await ReceiveModel.find({
    host: store._id,
    isIssued: false,
  });
  await LogModel.create({
    log: `get log receiveds:${resource.length} records`,
  });
  res.send(resource);
});

router.post("/create", async (req, res) => {
  const request = await ReceiveModel.create(req.body);
  if (!request) {
    await LogModel.create({
      log: `failed log receiveds: couldnot create ${req.body}`,
    });
    res.status(500).send({});
    return;
  }
  await LogModel.create({
    log: `create log receiveds: created ${request._id}`,
  });
  res.send(request);
});
router.patch("/update/:id", async (req, res) => {
  const resource = await ReceiveModel.findOne({ _id: req.params.id });
  if (!resource) {
    await LogModel.create({
      log: `failed log receiveds: could not update ${req.params.id}`,
    });
    res.status(500).send({});
  }
  resource.isIssued = true;
  resource.items = req.body;
  const updatedResource = await resource.save();

  updateInventory(updatedResource);

  res.send(updatedResource);
});
function updateInventory(data) {
  updateReceived(data);
  updateIssued(data);
}
async function updateReceived(data) {
  data.items.forEach(async (item) => {
    const inventory = await InventoryModel.findOne({
      commodity: item.commodity,
      outlet: data.client,
    });

    if (!inventory) return;
    inventory.received.push({
      transaction: data._id,
      date: data.date,
      quantity: item.requested,
      unit: item.unit,
    });
    const resItem = await inventory.save();
    await LogModel.create({
      log: `update log inventories:received ${item.requested} into ${resItem._id}`,
    });
  });
}
async function updateIssued(data) {
  data.items.forEach(async (item) => {
    const inventory = await InventoryModel.findOne({
      commodity: item.commodity,
      outlet: data.host,
    });
    console.log({ inventory });
    if (!inventory) return;
    inventory.issued.push({
      transaction: data._id,
      date: data.date,
      quantity: item.requested,
      unit: item.unit,
    });
    const resItem = await inventory.save();
    await LogModel.create({
      log: `update log inventories:issued ${item.requested} from ${resItem._id}`,
    });
  });
}
export default router;
