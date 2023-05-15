import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.ObjectId, ref: "Medicines" },
  units: [
    {
      name: { type: mongoose.Schema.Types.ObjectId, ref: "Units" },
      quantity: Number,
    },
  ],
  inventory_level: Number,
});

const CommodityModel = mongoose.model("Commodities", schema);
export { CommodityModel };
