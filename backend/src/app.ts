import express = require("express");
import cors = require("cors");
import path = require("path");
import { router } from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/widget", express.static(path.resolve(__dirname, "../widget")));

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Bem-vindo à API do AvaliaPro.",
  });
});

app.use("/api", router);

export { app };
