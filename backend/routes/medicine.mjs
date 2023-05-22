import { MedicineModel } from "../models/medicine.mjs";
import express from "express";
import { LogModel } from "../models/log.mjs";
const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await MedicineModel.find();
  await LogModel.create({
    log: `get log medicines:sent ${resource.length} medicines`,
  });
  res.send(resource);
});
router.post("/create", async (req, res) => {
  const resource = await MedicineModel.create(req.body);
  await LogModel.create({
    log: `create log medicines:created ${resource.name}`,
  });
  res.send(resource);
});
router.post("/create/many", async (req, res) => {
  const resource = await MedicineModel.create(req.body);
  await LogModel.create({
    log: `create log medicines:created ${resource.length} records`,
  });
  res.send(resource);
});

export default router;
