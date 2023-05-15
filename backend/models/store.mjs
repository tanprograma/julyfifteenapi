import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, uppercase: true, trim: true },
  isWarehouse: { type: Boolean, default: false },
  isSupplier: { type: Boolean, default: false },
});

const StoreModel = mongoose.model("Stores", schema);
export { StoreModel };
