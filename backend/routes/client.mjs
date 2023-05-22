import { ClientModel } from "../models/client.mjs";

import { LogModel } from "../models/log.mjs";
import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await ClientModel.find();
  await LogModel.create({
    log: `get log clients:sent ${resource.length} records`,
  });
  res.send(resource);
});
router.post("/create", async (req, res) => {
  const resource = await ClientModel.create(req.body);
  await LogModel.create({
    log: `create log clients:added client ${resource.name}`,
  });

  res.send(resource);
});
router.post("/create/many", async (req, res) => {
  const resources = await ClientModel.create(req.body);
  await LogModel.create({
    log: `create log clients:added ${resources.length} clients`,
  });

  res.send(resources);
});

export default router;
