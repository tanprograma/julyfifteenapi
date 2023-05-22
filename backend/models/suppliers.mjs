import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, uppercase: true, trim: true, unique: true },
});

const SupplierModel = mongoose.model("Suppliers", schema);
export { SupplierModel };
