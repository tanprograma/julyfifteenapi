import mongoose from "mongoose";
const schema = new mongoose.Schema({
  log: { type: String, uppercase: true, trim: true },
  date: {
    type: Date,
    default: () => {
      return Date.now();
    },
  },
});

const LogModel = mongoose.model("logs", schema);
export { LogModel };
