"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var express = require("express");
var cors = require("cors");
var routes_1 = require("./routes");
var app = express();
exports.app = app;
app.use(cors());
app.use(express.json());
app.get("/", function (_req, res) {
    return res.status(200).json({
        success: true,
        message: "Bem-vindo à API do AvaliaPro.",
    });
});
app.use("/api", routes_1.router);
