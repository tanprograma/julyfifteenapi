import inventories from "./backend/routes/inventory.mjs";
import suppliers from "./backend/routes/supplier.mjs";
import stores from "./backend/routes/store.mjs";
import clients from "./backend/routes/client.mjs";
import units from "./backend/routes/unit.mjs";
import medicines from "./backend/routes/medicine.mjs";
import logs from "./backend/routes/logs.mjs";
import { dbConnect } from "./backend/db.mjs";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
const DB_URI = process.env.DB_URI;

const connection = await dbConnect(DB_URI);
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/logs", logs);
app.use("/api/inventories", inventories);
app.use("/api/suppliers", suppliers);
app.use("/api/stores", stores);
app.use("/api/clients", clients);
app.use("/api/units", units);
app.use("/api/medicines", medicines);
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  next();
});
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("hello world");
});
app.listen(PORT, () => {
  console.log(`successfully listening on port: ${PORT}`);
});
