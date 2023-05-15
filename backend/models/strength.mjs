import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: String,
});

const StrengthModel = mongoose.model("Strength", schema);
export { StrengthModel };
