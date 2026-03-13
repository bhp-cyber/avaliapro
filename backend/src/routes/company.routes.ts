import { Router } from "express";
import prisma from "../lib/prisma";
import * as crypto from "crypto";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(companies);
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, domain } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome da empresa é obrigatório" });
    }

    const company = await prisma.company.create({
      data: {
        name,
        domain,
        apiKey: crypto.randomUUID(),
      },
    });

    return res.status(201).json(company);
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
