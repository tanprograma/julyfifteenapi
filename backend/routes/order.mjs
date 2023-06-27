import { OrderModel } from "../models/order.mjs";

import { LogModel } from "../models/log.mjs";
import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await OrderModel.find();
  await LogModel.create({
    log: `get log orders:sent ${resource.length} records`,
  });
  res.send(resource);
});
router.post("/create", async (req, res) => {
  const resource = await OrderModel.create(req.body);
  await LogModel.create({
    log: `create log orders:added order ${resource._id}`,
  });

  res.send(resource);
});
router.post("/save/:id", async (req, res) => {
  const resource = await OrderModel.findOne({ _id: req.params.id });
  resource.items = req.body;
  resource.last_updated = Date.now();
  await resource.save();
  await LogModel.create({
    log: `update log orders:updated order ${resource._id}`,
  });

  res.send(resource);
});

export default router;
