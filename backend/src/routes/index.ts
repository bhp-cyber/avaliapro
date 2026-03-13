import express = require("express");
import { healthRouter } from "./health.routes";
import companyRoutes from "./company.routes";
import productRoutes from "./product.routes";
import reviewRoutes from "./review.routes";
import widgetRoutes from "./widget.routes";

const router = express.Router();

router.use("/health", healthRouter);
router.use("/companies", companyRoutes);
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/widget", widgetRoutes);

export { router };
