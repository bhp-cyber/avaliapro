import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const companyIdParam = req.query.companyId;

    const companyId = Array.isArray(companyIdParam)
      ? companyIdParam[0]
      : companyIdParam;

    if (!companyId) {
      return res.status(400).json({
        error: "companyId é obrigatório",
      });
    }

    const normalizedCompanyId = String(companyId);

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

    const reviews = await prisma.review.findMany({
      where: {
        companyId: normalizedCompanyId,
      },

      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            platformProductId: true,
            platformVariantId: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    const reviewsResponse = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      authorName: review.authorName,
      verifiedPurchase: review.verifiedPurchase,
      createdAt: review.createdAt,
      product: review.product
        ? {
            id: review.product.id,
            name: review.product.name,
            sku: review.product.sku,
            platformProductId: review.product.platformProductId,
            platformVariantId: review.product.platformVariantId,
          }
        : null,
      customer: review.customer
        ? {
            id: review.customer.id,
            name: review.customer.name,
            email: review.customer.email,
            avatar: review.customer.avatar,
          }
        : null,
    }));

    return res.json({
      companyId: normalizedCompanyId,
      total: reviewsResponse.length,
      reviews: reviewsResponse,
    });
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
