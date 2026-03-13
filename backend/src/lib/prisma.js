"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pg_1 = require("pg");
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL não foi definida no arquivo .env");
}
var pool = new pg_1.Pool({
    connectionString: connectionString,
});
var adapter = new adapter_pg_1.PrismaPg(pool);
var prisma = new client_1.PrismaClient({
    adapter: adapter,
});
exports.default = prisma;
