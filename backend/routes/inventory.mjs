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
router.get("/stock", async (req, res) => {
  const docs = await InventoryModel.find({ active: true });
  const resp = Object.values(
    docs.reduce((acc, curr) => {
      if (acc[curr.commodity]?.commodity == curr.commodity) {
        acc[curr.commodity].stock += curr.stock;
        return acc;
      }
      acc[curr.commodity] = {
        commodity: curr.commodity,
        stock: curr.stock,
        unit: curr.unit,
        unit_value: curr.unit_value,
        expiry: curr.expiry,
      };
      return acc;
    }, {})
  ).sort((a, b) => {
    if (a.commodity > b.commodity) return 1;
    if (a.commodity < b.commodity) return -1;
    return 0;
  });
  console.log({ resp: resp });
  res.send(resp);
});
router.get("/stock/:store", async (req, res) => {
  const resource = await InventoryModel.find({
    active: true,
    outlet: req.params.store,
  });
  await LogModel.create({
    log: `get log inventories:sent ${resource.length} records`,
  });
  console.log(resource.length);
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
router.get("/clean/dispensed/:store", async (req, res) => {
  // console.log({ urlstore: req.params.store });
  const resource = await InventoryModel.find({
    active: true,
    outlet: req.params.store,
  });
  await LogModel.create({
    log: `get log inventories:sent ${resource.length} records`,
  });
  console.log({ test: resource.length });
  const u = [];
  for (let i = 0; i < resource.length; i++) {
    resource[i].dispensed = [];
    await resource[i].save();
    u.push(resource[i]);
  }

  res.send({ cleaned: u.length });
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
  console.log(req.body);
  for (let i = 0; i < req.body.length; i++) {
    const { commodity, quantity, date, client } = { ...req.body[i] };
    const inventory = inventories.find((x) => {
      return x.commodity == commodity;
    });

    const isInventory = validate(inventory);
    if (isInventory) {
      if (date != undefined) {
        inventory.dispensed.splice(0, 0, { quantity, client });
      } else {
        inventory.dispensed.splice(0, 0, { quantity, date, client });
      }

      inventory.stock -= quantity;
      await inventory.save();
      results.push(inventory);
      await LogModel.create({
        log: `create log inventories:added to inventory ${commodity}`,
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
      const item = req.body[i].payload;
      inventory.issued.splice(0, 0, item);
      inventory.stock -= item.quantity;
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
      const receivedItem = toReceive[i].payload;
      recInventory.received.splice(0, 0, receivedItem);
      recInventory.stock += receivedItem.quantity;
      await recInventory.save();
      recResults.push(recInventory);
      await LogModel.create({
        log: `create log inventories:added to received ${recInventory.commodity}`,
      });
    }
  }

  res.send(results);
});
router.post("/receive/:store", async (req, res) => {
  const inventories = await InventoryModel.find({ outlet: req.params.store });

  const results = [];

  for (let i = 0; i < req.body.length; i++) {
    const inventory = inventories.find((x) => {
      return x.commodity == req.body[i].commodity;
    });

    const isInventory = validate(inventory);
    if (isInventory) {
      const receivedItem = req.body[i].payload;
      inventory.received.splice(0, 0, receivedItem);
      inventory.stock += receivedItem.quantity;
      await inventory.save();
      results.push(inventory);
      await LogModel.create({
        log: `create log inventories:added to received ${inventory.commodity}`,
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
  store.beginning += req.body.beginning;
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
  const results = await updateBeginning(req, InventoryModel);
  console.log({
    items: req.body,
  });
  res.send(results);
});
router.post("/expiry/update", async (req, res) => {
  const results = await updateExpirely(req, InventoryModel);
  console.log({
    items: req.body,
    results,
  });
  res.send(results);
});
router.get("/beginnings/refill/:store", async (req, res) => {
  const results = [];
  const docs = await InventoryModel.find({
    outlet: req.params.store,
  });

  for (let i = 0; i < docs.length; i++) {
    const item = docs[i];
    item.stock -= docs[i].dispensed.reduce((acc, curr) => {
      return acc + curr.quantity;
    }, 0);
    const response = await item.save();
    results.push(response);
  }

  res.send(results);
});

router.get("/fix/:store", async (req, res) => {
  const items = await InventoryModel.find({ outlet: req.params.store });
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item.dispensed = [];
    await item.save();
    results.push(item);
  }
  res.send(results);
});
router.get("/setwarehouse/:store", async (req, res) => {
  const items = await InventoryModel.find({ outlet: req.params.store });
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item.isWarehouse = true;
    await item.save();
    results.push(item);
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

// setting new Date

//
async function updateBeginning(req, model) {
  const results = [];
  const docs = await model.find();
  const items = req.body;
  const outlet = req.params.store;
  for (let i = 0; i < items.length; i++) {
    const mappedItems = docs
      .filter((x) => {
        return x.commodity == items[i].commodity;
      })
      .map((z) => {
        if (z.outlet == outlet) {
          z.beginning += items[i].beginning;
          z.stock += items[i].beginning;
        }
        if (items[i].expiry != undefined) {
          z.expiry = new Date(items[i].expiry).toISOString();
          return z;
        }
        return z;
      });
    for (let q = 0; q < mappedItems.length; q++) {
      const answer = await mappedItems[q].save();
      if (answer.outlet == outlet) {
        results.push(answer);
      }
    }
  }
  return results;
}
async function updateExpirely(req, model) {
  const results = [];
  const docs = await model.find();
  const items = req.body;
  for (let i = 0; i < items.length; i++) {
    const mappedItems = docs
      .filter((x) => {
        return x.commodity == items[i].commodity;
      })
      .map((z) => {
        if (
          items[i].expiry == undefined ||
          (z.expiry == undefined && items[i].expiry == undefined)
        ) {
          return z;
        }
        if (items[i].expiry != undefined) {
          z.expiry = new Date(items[i].expiry).toISOString();
          return z;
        }
        return z;
      });
    for (let q = 0; q < mappedItems.length; q++) {
      const answer = await mappedItems[q].save();
    }
    results.push(items[i]);
  }

  return results;
}
