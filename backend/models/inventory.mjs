import mongoose from "mongoose";
const schema = new mongoose.Schema({
  commodity: {
    type: String,
  },
  active: {
    type: Boolean,
    default: () => {
      return true;
    },
  },
  outlet: { type: String },
  beginning: {
    type: Number,
    default: () => {
      return 0;
    },
  },
  inventory_level: {
    type: Number,
    default: () => {
      return 0;
    },
  },
  dispensed: [
    {
      serial_number: Number,
      quantity: Number,
      date: {
        type: Number,
        default: () => {
          return Date.now();
        },
      },
      client: String,
    },
  ],

  received: [
    {
      serial_number: Number,
      quantity: Number,
      date: {
        type: Number,
        default: () => {
          return Date.now();
        },
      },
      client: String,
    },
  ],
  issued: [
    {
      serial_number: Number,
      quantity: Number,
      date: {
        type: Number,
        default: () => {
          return Date.now();
        },
      },
      client: String,
    },
  ],
});

const InventoryModel = mongoose.model("Inventories", schema);
export { InventoryModel };
