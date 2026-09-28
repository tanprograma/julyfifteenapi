import Express from "express";

import {
	harmonizeSales,
	harmonizeSalesCompressed,
	harmonizeSalesDaily,
	saleStatus,
} from "../controllers/sales.controller";
import {
	harmonizePurchases,
	harmonizePurchasesCompressed,
	harmonizePurchasesDaily,
	purchaseStatus,
} from "../controllers/purchase.controller.mjs";
import {
	harmonizeRequests,
	harmonizeRequestsCompressed,
	harmonizeRequestsDaily,
	requestStatus,
} from "../controllers/requests.controller.mjs";

const router = Express.Router();

// router.get("/indexes", createIndexes);
router.get("/sales/status", saleStatus);
router.get("/requests/status", requestStatus);
router.get("/purchases/status", purchaseStatus);
router.get("/sales/raw", harmonizeSales);
router.get("/sales/daily", harmonizeSalesDaily);
router.get("/sales/compressed", harmonizeSalesCompressed);
router.get("/purchases/raw", harmonizePurchases);
router.get("/purchases/daily", harmonizePurchasesDaily);
router.get("/purchases/compressed", harmonizePurchasesCompressed);
router.get("/requests/raw/:clinic", harmonizeRequests);
router.get("/requests/daily/:clinic", harmonizeRequestsDaily);
router.get("/requests/compressed/:clinic", harmonizeRequestsCompressed);

export default router;
