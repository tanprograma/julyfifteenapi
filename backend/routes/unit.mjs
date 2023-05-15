import { UnitModel } from "../models/unit.mjs";
import express from "express";
import { LogModel } from "../models/log.mjs";
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
    log: `create log units:created ${resource.name}`,
  });
  res.send(resource);
});
router.post("/create/many", async (req, res) => {
  const resource = await UnitModel.create(req.body);
  await LogModel.create({
    log: `create log units:created ${resource.length} records`,
  });
  res.send(resource);
});
router.patch("/update/:id", async (req, res) => {
  const resource = await UnitModel.findById(req.params.id);
  resource.name = req.body.name;
  const updated = await resource.save();
  await LogModel.create({
    log: `update log Units:updated ${req.params.id}`,
  });
  res.send(resource);
});
export default router;
