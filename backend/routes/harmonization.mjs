import Express from "express";
import { getLogsStatus, getLogs } from "../controllers/logs.controller.mjs";
import {
	saleStatus,
	harmonizeSales,
	harmonizeSalesDaily,
	harmonizeSalesCompressed,
	reset,
	createSale,
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
import {
	createRequest,
	harmonizeRequests,
	harmonizeRequestsCompressed,
	harmonizeRequestsDaily,
	requestStatus,
} from "../controllers/requests.controller.mjs";
const router = Express.Router();

// router.get("/indexes", createIndexes);
router.get("/inventories", getInventories);
router.get("/reset", reset);

// sales
router.get("/sales/status", saleStatus);
router.get("/sales/raw", harmonizeSales);
router.get("/sales/daily", harmonizeSalesDaily);
router.get("/sales/compressed", harmonizeSalesCompressed);
router.post("/sales", createSale);

// requests
router.get("/requests/raw", harmonizeRequests);
router.get("/requests/daily", harmonizeRequestsDaily);
router.get("/requests/compressed", harmonizeRequestsCompressed);
router.get("/requests/status", requestStatus);
router.post("/requests", createRequest);

// purchases
router.get("/purchases/status", purchaseStatus);
router.get("/purchases/raw", harmonizePurchases);
router.get("/purchases/daily", harmonizePurchasesDaily);
router.get("/purchases/compressed", harmonizePurchasesCompressed);
router.post("/purchases", purchase);

router.get("/suppliers", getSuppliers);
router.get("/stores", getStores);
// logs
router.get("/logs/status", getLogsStatus);
router.get("/logs", getLogs);

export default router;
