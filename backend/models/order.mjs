import mongoose from "mongoose";
const schema = new mongoose.Schema({
  create_date: {
    type: Date,
    default: () => {
      return Date.now();
    },
    immutable: true,
  },
  last_updated: {
    type: Date,
    default: () => {
      return Date.now();
    },
  },
  items: [{ commodity: String, quantity: Number, unit: String }],
});

const OrderModel = mongoose.model("orders", schema);
export { OrderModel };
