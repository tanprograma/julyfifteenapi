import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, uppercase: true, trim: true },
});

const MedicineModel = mongoose.model("Medicines", schema);
export { MedicineModel };
