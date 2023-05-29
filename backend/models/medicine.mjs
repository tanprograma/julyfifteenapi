import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, uppercase: true, trim: true, unique: true },
  unit: {
    type: String,
    uppercase: true,
    trim: true,

    required: true,
  },
  active: {
    type: Boolean,
    default: () => {
      return true;
    },
  },
  unit_value: { type: Number, required: true },
});

const MedicineModel = mongoose.model("Medicines", schema);
export { MedicineModel };
