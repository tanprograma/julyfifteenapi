import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, uppercase: true, trim: true, unique: true },
});

const UnitModel = mongoose.model("Units", schema);
export { UnitModel };
