import { SupplierModel } from "../models/suppliers.mjs";

import { LogModel } from "../models/log.mjs";
import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await SupplierModel.find();
  await LogModel.create({
    log: `get log suppliers:sent ${resource.length} records`,
  });
  res.send(resource);
});
router.post("/create", async (req, res) => {
  if (req.body.length) {
    const resources = await SupplierModel.create(req.body);
    await LogModel.create({
      log: `create log suppliers:added ${resources.length} suppliers`,
    });

    res.send(resources);
    return;
  }
  const resource = await SupplierModel.create(req.body);
  await LogModel.create({
    log: `create log suppliers:added supplier ${resource.name}`,
  });

  res.send(resource);
});
router.post("/create/many", async (req, res) => {
  const resources = await SupplierModel.create(req.body);
  await LogModel.create({
    log: `create log suppliers:added ${resources.length} suppliers`,
  });

  res.send(resources);
});

export default router;
