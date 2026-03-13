import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, sku, companyId } = req.body;

    if (!name || !companyId) {
      return res.status(400).json({
        error: "name e companyId são obrigatórios",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        companyId,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;

router.get("/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(reviews);
  } catch (error) {
    console.error("Erro ao buscar reviews do produto:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/sku/:sku", async (req, res) => {
  try {
    const { sku } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        sku,
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Produto não encontrado",
      });
    }

    return res.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto por SKU:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});
