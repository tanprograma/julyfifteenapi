import Express from "express";
import {
	saleStatus,
	harmonizeSales,
	harmonizeSalesDaily,
	harmonizeSalesCompressed,
	reset,
} from "../controllers/sales.controller.mjs";
const router = Express.Router();

// router.get("/indexes", createIndexes);
router.get("/reset", reset);
router.get("/sales/status", saleStatus);

router.get("/sales/raw", harmonizeSales);
router.get("/sales/daily", harmonizeSalesDaily);
router.get("/sales/compressed", harmonizeSalesCompressed);
router.get("/sales/compressed", harmonizeSalesCompressed);
// router.get("/purchases/raw", harmonizePurchases);
// router.get("/purchases/daily", harmonizePurchasesDaily);
// router.get("/purchases/compressed", harmonizePurchasesCompressed);
// router.get("/requests/raw/:clinic", harmonizeRequests);
// router.get("/requests/daily/:clinic", harmonizeRequestsDaily);
// router.get("/requests/compressed/:clinic", harmonizeRequestsCompressed);
// router.get("/requests/status", requestStatus);
// router.get("/purchases/status", purchaseStatus);

export default router;
