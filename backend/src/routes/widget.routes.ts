import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/reviews", async (req, res) => {
  try {
    const { apiKey, sku } = req.query;

    if (!apiKey || !sku) {
      return res.status(400).json({
        error: "apiKey e sku são obrigatórios",
      });
    }

    const company = await prisma.company.findUnique({
      where: {
        apiKey: String(apiKey),
      },
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa não encontrada",
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        sku: String(sku),
        companyId: company.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Produto não encontrado",
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        companyId: company.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const average =
      reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        : 0;

    return res.json({
      company: {
        id: company.id,
        name: company.name,
      },
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
      },
      summary: {
        averageRating: average,
        totalReviews: reviews.length,
      },
      reviews,
    });
  } catch (error) {
    console.error("Erro ao buscar reviews do widget:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const { apiKey, sku, rating, comment, authorName, verifiedPurchase } =
      req.body;

    if (!apiKey || !sku || !rating) {
      return res.status(400).json({
        error: "apiKey, sku e rating são obrigatórios",
      });
    }

    const company = await prisma.company.findUnique({
      where: {
        apiKey: String(apiKey),
      },
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa não encontrada",
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        sku: String(sku),
        companyId: company.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Produto não encontrado",
      });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        authorName,
        verifiedPurchase: Boolean(verifiedPurchase),
        productId: product.id,
        companyId: company.id,
      },
    });

    return res.status(201).json({
      message: "Review criada com sucesso",
      review,
    });
  } catch (error) {
    console.error("Erro ao criar review pelo widget:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
