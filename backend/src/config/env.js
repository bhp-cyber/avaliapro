"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var dotenv = require("dotenv");
dotenv.config();
exports.env = {
    PORT: Number(process.env.PORT || 4000),
    NODE_ENV: process.env.NODE_ENV || "development",
    APP_NAME: process.env.APP_NAME || "AvaliaPro API",
};
