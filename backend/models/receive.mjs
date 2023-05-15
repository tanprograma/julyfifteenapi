import mongoose from "mongoose";
const schema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: "Stores" },
  isIssued: { type: Boolean, default: false },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Stores" },
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
      issued: Number,
      unit: { type: mongoose.Schema.Types.ObjectId, ref: "Units" },
    },
  ],
});

const ReceiveModel = mongoose.model("Receiveds", schema);
export { ReceiveModel };
