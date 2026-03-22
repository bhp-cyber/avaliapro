import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const companyIdParam = req.query.companyId;
    const statusParam = req.query.status;
    const limitParam = req.query.limit;
    const offsetParam = req.query.offset;

    const companyId = Array.isArray(companyIdParam)
      ? companyIdParam[0]
      : companyIdParam;

    const normalizedCompanyId =
      typeof companyId === "string" ? companyId.trim() : "";

    const normalizedStatus =
      typeof statusParam === "string" ? statusParam.trim().toLowerCase() : "";

    if (
      normalizedStatus &&
      normalizedStatus !== "pending" &&
      normalizedStatus !== "approved" &&
      normalizedStatus !== "rejected"
    ) {
      return res.status(400).json({
        error: "status deve ser pending, approved ou rejected",
      });
    }

    const parsedLimit = Math.floor(
      Number(Array.isArray(limitParam) ? limitParam[0] : limitParam)
    );

    const parsedOffset = Math.floor(
      Number(Array.isArray(offsetParam) ? offsetParam[0] : offsetParam)
    );

    const normalizedLimit = Number.isFinite(parsedLimit)
      ? Math.min(50, Math.max(1, parsedLimit))
      : 50;

    // proteção extra para evitar offset inútil quando não há limite
    const effectiveLimit = normalizedLimit || 50;

    const normalizedOffset = Number.isFinite(parsedOffset)
      ? Math.min(10000, Math.max(0, parsedOffset))
      : 0;

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

    const reviewsWhere: any = {
      companyId: normalizedCompanyId,
    };

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "approved" ||
      normalizedStatus === "rejected"
    ) {
      reviewsWhere.status = normalizedStatus;
    }

    const reviews = await prisma.review.findMany({
      where: reviewsWhere,

      orderBy: {
        createdAt: "desc",
      },
      take: effectiveLimit,
      skip: normalizedOffset,

      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        authorName: true,
        verifiedPurchase: true,
        status: true,
        createdAt: true,

        avatarType: true,
        avatarPreset: true,
        avatarUrl: true,

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

    const reviewsResponse = reviews.map((review) => ({
      id: review.id,
      rating: Math.max(1, Math.min(5, review.rating)),
      title: review.title,
      comment: review.comment,
      authorName: review.authorName,
      verifiedPurchase: review.verifiedPurchase,
      status: review.status,
      createdAt: review.createdAt,

      avatarType: review.avatarType,
      avatarPreset: review.avatarPreset,
      avatarUrl: review.avatarUrl,
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

    const totalReviews = await prisma.review.count({
      where: reviewsWhere,
    });

    return res.json({
      companyId: normalizedCompanyId,
      status:
        normalizedStatus === "pending" ||
        normalizedStatus === "approved" ||
        normalizedStatus === "rejected"
          ? normalizedStatus
          : null,
      total: totalReviews,
      limit: normalizedLimit,
      offset: normalizedOffset,
      reviews: reviewsResponse,
    });
  } catch (error) {
    console.error("Erro ao buscar reviews:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      rating,
      title,
      comment,
      productId,
      companyId,
      customerId,
      authorName,
      avatarType,
      avatarPreset,
      avatarUrl,
      verifiedPurchase,
      productVariant,
    } = req.body;

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

    const normalizedProductVariant =
      typeof productVariant === "string" && productVariant.trim()
        ? productVariant.trim()
        : null;

    console.log("[ADMIN CREATE REVIEW productVariant]", {
      productVariant,
      normalizedProductVariant,
      productId: normalizedProductId,
      companyId: normalizedCompanyId,
      authorName,
    });

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
        platformVariantId: true,
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

    const normalizedAvatarType =
      avatarType === "preset" ||
      avatarType === "image" ||
      avatarType === "initial"
        ? avatarType
        : "initial";

    const normalizedAvatarPreset =
      normalizedAvatarType === "preset" &&
      typeof avatarPreset === "string" &&
      avatarPreset.trim()
        ? avatarPreset.trim()
        : null;

    const normalizedAvatarUrl =
      normalizedAvatarType === "image" &&
      typeof avatarUrl === "string" &&
      avatarUrl.trim().startsWith("http")
        ? avatarUrl.trim()
        : null;

    const review = await prisma.review.create({
      data: {
        rating: normalizedRating,
        title: normalizedTitle,
        comment: normalizedComment,
        status: "approved",
        productId: normalizedProductId,
        companyId: normalizedCompanyId,
        customerId: normalizedCustomerId,

        authorName:
          typeof authorName === "string" && authorName.trim()
            ? authorName.trim()
            : "Cliente",

        avatarType: normalizedAvatarType,
        avatarPreset: normalizedAvatarPreset,
        avatarUrl: normalizedAvatarUrl,
        productVariant: normalizedProductVariant,
        variantId:
          typeof product.platformVariantId === "string" &&
          product.platformVariantId.trim()
            ? product.platformVariantId.trim()
            : null,

        verifiedPurchase: Boolean(verifiedPurchase),
      },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        authorName: true,
        productVariant: true,
        verifiedPurchase: true,
        status: true,
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

router.patch("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { companyId, title, comment, avatarType, avatarPreset, avatarUrl } =
      req.body;

    const normalizedReviewId =
      typeof reviewId === "string" ? reviewId.trim() : "";

    const normalizedCompanyId =
      typeof companyId === "string" ? companyId.trim() : "";

    const normalizedTitle =
      typeof title === "string" && title.trim()
        ? title.trim().slice(0, 120)
        : null;

    const normalizedComment =
      typeof comment === "string" && comment.trim()
        ? comment.trim().slice(0, 2000)
        : null;

    if (!normalizedReviewId || !normalizedCompanyId) {
      return res.status(400).json({
        error: "reviewId e companyId são obrigatórios",
      });
    }

    const hasAvatarType = typeof avatarType === "string";
    const hasAvatarPreset = typeof avatarPreset === "string";
    const hasAvatarUrl = typeof avatarUrl === "string";

    if (
      !normalizedTitle &&
      !normalizedComment &&
      !hasAvatarType &&
      !hasAvatarPreset &&
      !hasAvatarUrl
    ) {
      return res.status(400).json({
        error: "title, comment ou avatar deve ser informado",
      });
    }

    const review = await prisma.review.findFirst({
      where: {
        id: normalizedReviewId,
        companyId: normalizedCompanyId,
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review não encontrada para esta empresa",
      });
    }

    const updateData: any = {};

    if (typeof title === "string") {
      updateData.title = normalizedTitle;
    }

    if (typeof comment === "string") {
      updateData.comment = normalizedComment;
    }

    let normalizedAvatarTypeForUpdate: string | undefined = undefined;

    if (typeof avatarType === "string") {
      if (
        avatarType === "preset" ||
        avatarType === "image" ||
        avatarType === "initial"
      ) {
        normalizedAvatarTypeForUpdate = avatarType;
      } else {
        normalizedAvatarTypeForUpdate = "initial";
      }
    }

    const normalizedAvatarPresetForUpdate =
      typeof avatarPreset === "string"
        ? avatarPreset.trim() || null
        : undefined;

    const normalizedAvatarUrlForUpdate =
      typeof avatarUrl === "string"
        ? avatarUrl.trim().startsWith("http")
          ? avatarUrl.trim()
          : null
        : undefined;

    if (normalizedAvatarTypeForUpdate !== undefined) {
      updateData.avatarType = normalizedAvatarTypeForUpdate;

      if (normalizedAvatarTypeForUpdate === "preset") {
        updateData.avatarPreset = normalizedAvatarPresetForUpdate ?? null;
        updateData.avatarUrl = null;
      } else if (normalizedAvatarTypeForUpdate === "image") {
        updateData.avatarUrl = normalizedAvatarUrlForUpdate ?? null;
        updateData.avatarPreset = null;
      } else {
        updateData.avatarPreset = null;
        updateData.avatarUrl = null;
      }
    } else {
      if (normalizedAvatarPresetForUpdate !== undefined) {
        updateData.avatarPreset = normalizedAvatarPresetForUpdate;
      }

      if (normalizedAvatarUrlForUpdate !== undefined) {
        updateData.avatarUrl = normalizedAvatarUrlForUpdate;
      }
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: normalizedReviewId,
      },
      data: updateData,
      select: {
        id: true,
        title: true,
        comment: true,
        companyId: true,
        createdAt: true,
      },
    });

    return res.json(updatedReview);
  } catch (error) {
    console.error("Erro ao atualizar review:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.patch("/:reviewId/status", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { companyId, status } = req.body;

    const normalizedReviewId =
      typeof reviewId === "string" ? reviewId.trim() : "";

    const normalizedCompanyId =
      typeof companyId === "string" ? companyId.trim() : "";

    const normalizedStatus =
      typeof status === "string" ? status.trim().toLowerCase() : "";

    if (!normalizedReviewId || !normalizedCompanyId || !normalizedStatus) {
      return res.status(400).json({
        error: "reviewId, companyId e status são obrigatórios",
      });
    }

    if (
      normalizedStatus !== "pending" &&
      normalizedStatus !== "approved" &&
      normalizedStatus !== "rejected"
    ) {
      return res.status(400).json({
        error: "status deve ser pending, approved ou rejected",
      });
    }

    const review = await prisma.review.findFirst({
      where: {
        id: normalizedReviewId,
        companyId: normalizedCompanyId,
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review não encontrada para esta empresa",
      });
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: normalizedReviewId,
      },
      data: {
        status: normalizedStatus,
      },
      select: {
        id: true,
        status: true,
        companyId: true,
        createdAt: true,
      },
    });

    return res.json(updatedReview);
  } catch (error) {
    console.error("Erro ao atualizar status da review:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const companyIdParam = req.body?.companyId ?? req.query?.companyId;

    const normalizedReviewId =
      typeof reviewId === "string" ? reviewId.trim() : "";

    const normalizedCompanyId =
      typeof companyIdParam === "string" ? companyIdParam.trim() : "";

    if (!normalizedReviewId || !normalizedCompanyId) {
      return res.status(400).json({
        error: "reviewId e companyId são obrigatórios",
      });
    }

    const review = await prisma.review.findFirst({
      where: {
        id: normalizedReviewId,
        companyId: normalizedCompanyId,
      },
      select: {
        id: true,
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review não encontrada para esta empresa",
      });
    }

    await prisma.review.delete({
      where: {
        id: normalizedReviewId,
      },
    });

    return res.json({
      success: true,
      deletedReviewId: normalizedReviewId,
    });
  } catch (error) {
    console.error("Erro ao excluir review:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
