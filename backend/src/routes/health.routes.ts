import express = require("express");

const healthRouter = express.Router();

healthRouter.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "API do AvaliaPro está online.",
    timestamp: new Date().toISOString(),
  });
});

export { healthRouter };
