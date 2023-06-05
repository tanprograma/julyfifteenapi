import { UnitModel } from "../models/unit.mjs";

import { LogModel } from "../models/log.mjs";
import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await UnitModel.find();
  await LogModel.create({
    log: `get log units:sent ${resource.length} records`,
  });
  res.send(resource);
});
router.post("/create", async (req, res) => {
  const resource = await UnitModel.create(req.body);
  await LogModel.create({
    log: `create log units:added client ${resource.name}`,
  });

  res.send(resource);
});
router.post("/import", async (req, res) => {
  try {
    const resources = await UnitModel.create(req.body);
    await LogModel.create({
      log: `create log units:added ${resources.length} units`,
    });
    if (!resources.length) {
      res.send([]);
      return;
    }
    res.send(resources);
  } catch (error) {
    res.status(400).send([]);
  }
});

export default router;
