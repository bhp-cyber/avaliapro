import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: "companyId é obrigatório",
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        companyId: String(companyId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: true,
        customer: true,
      },
    });

    return res.json(reviews);
  } catch (error) {
    console.error("Erro ao buscar reviews:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { rating, title, comment, productId, companyId, customerId } =
      req.body;

    if (!rating || !productId || !companyId) {
      return res.status(400).json({
        error: "rating, productId e companyId são obrigatórios",
      });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        title,
        comment,
        productId,
        companyId,
        customerId,
      },
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error("Erro ao criar review:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
