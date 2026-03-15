import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const companyIdParam = req.query.companyId;
    const limitParam = req.query.limit;

    const companyId = Array.isArray(companyIdParam)
      ? companyIdParam[0]
      : companyIdParam;

    const normalizedCompanyId =
      typeof companyId === "string" ? companyId.trim() : "";

    const normalizedLimit = Math.min(
      50,
      Math.max(
        1,
        Number(Array.isArray(limitParam) ? limitParam[0] : limitParam) || 50
      )
    );

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

    const reviews = await prisma.review.findMany({
      where: {
        companyId: normalizedCompanyId,
      },

      orderBy: {
        createdAt: "desc",
      },
      take: normalizedLimit,
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
            avatar: true,
          },
        },
      },
    });

    const totalReviews = reviews.length;

    const reviewsResponse = reviews.map((review) => ({
      id: review.id,
      rating: Math.max(1, Math.min(5, review.rating)),
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
            avatar: review.customer.avatar,
          }
        : null,
    }));

    return res.json({
      companyId: normalizedCompanyId,
      total: totalReviews,
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

    const normalizedCompanyId =
      typeof companyId === "string" ? companyId.trim() : "";

    const normalizedProductId =
      typeof productId === "string" ? productId.trim() : "";

    const normalizedCustomerId =
      typeof customerId === "string" && customerId.trim()
        ? customerId.trim()
        : null;

    const normalizedTitle =
      typeof title === "string" && title.trim()
        ? title.trim().slice(0, 120)
        : null;

    const normalizedComment =
      typeof comment === "string" && comment.trim()
        ? comment.trim().slice(0, 2000)
        : null;

    const normalizedRating = Math.floor(Number(rating));

    if (
      !normalizedCompanyId ||
      !normalizedProductId ||
      Number.isNaN(normalizedRating)
    ) {
      return res.status(400).json({
        error: "rating, productId e companyId são obrigatórios",
      });
    }

    if (
      !Number.isInteger(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      return res.status(400).json({
        error: "rating deve ser um inteiro entre 1 e 5",
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

    const product = await prisma.product.findUnique({
      where: {
        id: normalizedProductId,
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!product || product.companyId !== normalizedCompanyId) {
      return res.status(404).json({
        error: "Produto não encontrado para esta empresa",
      });
    }

    if (!product) {
      return res.status(404).json({
        error: "Produto não encontrado para esta empresa",
      });
    }

    if (normalizedCustomerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: normalizedCustomerId,
          companyId: normalizedCompanyId,
        },
        select: {
          id: true,
        },
      });

      if (!customer) {
        return res.status(404).json({
          error: "Cliente não encontrado para esta empresa",
        });
      }
    }

    const review = await prisma.review.create({
      data: {
        rating: normalizedRating,
        title: normalizedTitle,
        comment: normalizedComment,
        productId: normalizedProductId,
        companyId: normalizedCompanyId,
        customerId: normalizedCustomerId,
      },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        authorName: true,
        verifiedPurchase: true,
        createdAt: true,
        productId: true,
        companyId: true,
        customerId: true,
      },
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error("Erro ao criar review:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
