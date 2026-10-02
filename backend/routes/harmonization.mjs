import Express from "express";
import { getLogsStatus, getLogs } from "../controllers/logs.controller.mjs";
import {
	saleStatus,
	harmonizeSales,
	harmonizeSalesDaily,
	harmonizeSalesCompressed,
	reset,
} from "../controllers/sales.controller.mjs";
import {
	purchaseStatus,
	harmonizePurchases,
	harmonizePurchasesDaily,
	harmonizePurchasesCompressed,
	purchase,
} from "../controllers/purchase.controller.mjs";

import {
	getInventories,
	getStores,
	getSuppliers,
} from "../controllers/inventory.controller.mjs";
const router = Express.Router();

// router.get("/indexes", createIndexes);
router.get("/inventories", getInventories);
router.get("/reset", reset);
router.get("/sales/status", saleStatus);

router.get("/sales/raw", harmonizeSales);
router.get("/sales/daily", harmonizeSalesDaily);
router.get("/sales/compressed", harmonizeSalesCompressed);
router.get("/sales/compressed", harmonizeSalesCompressed);
router.post("/purchases", purchase);
router.get("/purchases/raw", harmonizePurchases);
router.get("/purchases/daily", harmonizePurchasesDaily);
router.get("/purchases/compressed", harmonizePurchasesCompressed);
// router.get("/requests/raw/:clinic", harmonizeRequests);
// router.get("/requests/daily/:clinic", harmonizeRequestsDaily);
// router.get("/requests/compressed/:clinic", harmonizeRequestsCompressed);
// router.get("/requests/status", requestStatus);
router.get("/purchases/status", purchaseStatus);
router.get("/suppliers", getSuppliers);
router.get("/stores", getStores);
// logs
router.get("/logs/status", getLogsStatus);
router.get("/logs", getLogs);

export default router;
