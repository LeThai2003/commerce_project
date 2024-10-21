import express, {Router } from "express"
import * as controller from "../../controllers/admin/chartReport.controller";

const router : Router = express.Router();

// router.get("/total-revenue", controller.totalRevenue);

router.get("/get-year", controller.getYears);

router.get("/total-revenue/:year", controller.totalRevenueWithYear);

export const chartReportRoute : Router = router;