import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, uppercase: true, trim: true, unique: true },
  isWarehouse: { type: Boolean, default: false },
});

const StoreModel = mongoose.model("Stores", schema);
export { StoreModel };
