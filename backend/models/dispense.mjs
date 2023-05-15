import mongoose from "mongoose";
const schema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: "Stores" },
  isIssued: { type: Boolean, default: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Clients" },
  date: {
    type: Number,
    default: () => {
      return new Date().valueOf();
    },
  },
  items: [
    {
      commodity: { type: mongoose.Schema.Types.ObjectId, ref: "Medicines" },
      requested: Number,
      Issued: Number,
      unit: { type: mongoose.Schema.Types.ObjectId, ref: "Units" },
    },
  ],
});

const DispenseModel = mongoose.model("Dispenseds", schema);
export { DispenseModel };
