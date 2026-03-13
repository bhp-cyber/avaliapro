"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
var express = require("express");
var healthRouter = express.Router();
exports.healthRouter = healthRouter;
healthRouter.get("/", function (_req, res) {
    return res.status(200).json({
        success: true,
        message: "API do AvaliaPro está online.",
        timestamp: new Date().toISOString(),
    });
});
