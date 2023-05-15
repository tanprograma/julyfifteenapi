import { LogModel } from "../models/log.mjs";
import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await LogModel.find();
  await LogModel.create({ log: `get logs: ${resource.length} logs` });
  res.send(resource);
});

export default router;
