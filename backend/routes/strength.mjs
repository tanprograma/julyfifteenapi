import { StrengthModel } from "../models/strength.mjs";
import express from "express";

const router = express.Router();
router.get("/", async (req, res) => {
  const resource = await StrengthModel.find();
  console.log(`strengths: ${resource.length}`);
  res.send(resource);
});
router.post("/create", async (req, res) => {
  const resource = await StrengthModel.create(req.body);
  console.log(`added in strengths: ${resource}`);
  res.send(resource);
});
router.patch("/update/:id", async (req, res) => {
  const resource = await StrengthModel.findById(req.params.id);
  resource.name = req.body.name;
  const updated = await resource.save();
  console.log(`updated resource ${updated._id}`);
  res.send(resource);
});
export default router;
