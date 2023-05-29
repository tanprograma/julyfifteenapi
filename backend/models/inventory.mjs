import mongoose from "mongoose";
const schema = new mongoose.Schema({
  commodity: {
    type: String,
    required: true,
    uppercase: true,
  },
  active: {
    type: Boolean,
    default: () => {
      return true;
    },
  },
  isWarehouse: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  outlet: { type: String, required: true, uppercase: true },
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
      quantity: Number,
      date: {
        type: Number,
        default: () => {
          return Date.now();
        },
      },
      client: {
        type: String,
        uppercase: true,
        client: {
          type: String,
          uppercase: true,
          default: () => {
            return "CLINIC";
          },
        },
      },
    },
  ],

  received: [
    {
      quantity: Number,
      date: {
        type: Number,
        default: () => {
          return Date.now();
        },
      },
      client: {
        type: String,
        uppercase: true,
        client: {
          type: String,
          uppercase: true,
          default: () => {
            return "CLINIC";
          },
        },
      },
    },
  ],
  issued: [
    {
      quantity: Number,
      date: {
        type: Number,
        default: () => {
          return Date.now();
        },
      },
      client: {
        type: String,
        uppercase: true,
        default: () => {
          return "CLINIC";
        },
      },
    },
  ],
  unit: String,
  unit_value: Number,
});

const InventoryModel = mongoose.model("Inventories", schema);
export { InventoryModel };
