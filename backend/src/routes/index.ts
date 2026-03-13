import express = require("express");
import { healthRouter } from "./health.routes";

const router = express.Router();

router.use("/health", healthRouter);

export { router };
