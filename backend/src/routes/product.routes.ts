import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const companyIdParam = req.query.companyId;

    const companyId = Array.isArray(companyIdParam)
      ? companyIdParam[0]
      : companyIdParam;

    const normalizedCompanyId =
      typeof companyId === "string" ? companyId.trim() : "";

    if (!normalizedCompanyId) {
      return res.status(400).json({
        error: "companyId é obrigatório",
      });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: normalizedCompanyId,
      },
      select: {
        id: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa não encontrada",
      });
    }

    const limitParam = req.query.limit;
    const offsetParam = req.query.offset;

    const limit = Math.min(
      Math.max(
        Number(Array.isArray(limitParam) ? limitParam[0] : limitParam) || 50,
        1
      ),
      100
    );

    const offset = Math.max(
      Number(Array.isArray(offsetParam) ? offsetParam[0] : offsetParam) || 0,
      0
    );

    const where = {
      companyId: normalizedCompanyId,
      platform: "nuvemshop",
    };

    const total = await prisma.product.count({
      where,
    });

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return res.json({
      total,
      limit,
      offset,
      products,
    });
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

router.get("/:productId/rating-summary", async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: "approved",
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    return res.json({
      productId,
      totalReviews,
      averageRating: Number(averageRating.toFixed(2)),
    });
  } catch (error) {
    console.error("Erro ao buscar resumo de avaliações do produto:", error);
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

router.get("/sku/:sku/rating-summary", async (req, res) => {
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

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        status: "approved",
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    return res.json({
      productId: product.id,
      sku: product.sku,
      totalReviews,
      averageRating: Number(averageRating.toFixed(2)),
    });
  } catch (error) {
    console.error("Erro ao buscar resumo de avaliações por SKU:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});
