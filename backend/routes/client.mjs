import { ClientModel } from "../models/client.mjs";
import express from "express";
import { LogModel } from "../models/log.mjs";

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
    log: `created log client:created ${resource.name}`,
  });
  res.send(resource);
});
router.post("/create/many", async (req, res) => {
  const resource = await ClientModel.create(req.body);
  await LogModel.create({
    log: `created log client:created ${resource.length} clients`,
  });
  res.send(resource);
});
router.patch("/update/:id", async (req, res) => {
  const resource = await ClientModel.findById(req.params.id);
  resource.name = req.body.name;
  await resource.save();
  await LogModel.create({ log: `update log client:updated ${resource._id}` });
  res.send(resource);
});
export default router;
