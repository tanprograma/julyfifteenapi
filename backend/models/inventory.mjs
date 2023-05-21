import mongoose from "mongoose";
const schema = new mongoose.Schema({
  commodity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicines",
  },
  active: {
    type: Boolean,
    default: () => {
      return true;
    },
  },
  outlet: { type: mongoose.Schema.Types.ObjectId, ref: "Stores" },
  beginning: {
    type: Number,
    default: () => {
      return 0;
    },
  },
  dispensed: [
    {
      transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Dispenseds" },

      quantity: Number,
      date: Number,
      unit: { type: mongoose.Schema.Types.ObjectId, ref: "Units" },
    },
  ],

  received: [
    {
      transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Receiveds" },

      quantity: Number,
      date: Number,
      unit: { type: mongoose.Schema.Types.ObjectId, ref: "Units" },
    },
  ],
  issued: [
    {
      transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Receiveds" },

      quantity: Number,
      date: Number,
      unit: { type: mongoose.Schema.Types.ObjectId, ref: "Units" },
    },
  ],
});

const InventoryModel = mongoose.model("Inventories", schema);
export { InventoryModel };
