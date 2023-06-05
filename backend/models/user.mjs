import mongoose from "mongoose";
const schema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
});

const UserModel = mongoose.model("Users", schema);
export { UserModel };
