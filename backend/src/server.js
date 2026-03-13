"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("./app");
var env_1 = require("./config/env");
app_1.app.listen(env_1.env.PORT, function () {
    console.log("\uD83D\uDE80 ".concat(env_1.env.APP_NAME, " rodando na porta ").concat(env_1.env.PORT));
    console.log("\uD83C\uDF10 Ambiente: ".concat(env_1.env.NODE_ENV));
    console.log("\uD83D\uDD0E Health check: http://localhost:".concat(env_1.env.PORT, "/api/health"));
});
