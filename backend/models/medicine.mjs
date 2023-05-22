import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, uppercase: true, trim: true, unique: true },
  unit: { type: String, uppercase: true, trim: true, unique: true },
  unit_value: { type: Number },
});

const MedicineModel = mongoose.model("Medicines", schema);
export { MedicineModel };
