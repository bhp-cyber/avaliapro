import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

const productCache = new Map<
  string,
  {
    product: any;
    timestamp: number;
  }
>();

const PRODUCT_CACHE_TTL = 60 * 1000;
const PRODUCT_CACHE_LIMIT = 100;
const REVIEWS_LIMIT = 50;

function getCachedProduct(key: string) {
  const entry = productCache.get(key);

  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > PRODUCT_CACHE_TTL;

  if (isExpired) {
    productCache.delete(key);
    return null;
  }

  return entry.product;
}

function setCachedProduct(key: string, product: any) {
  if (productCache.size >= PRODUCT_CACHE_LIMIT) {
    const firstKey = productCache.keys().next().value;

    if (firstKey) {
      productCache.delete(firstKey);
    }
  }

  productCache.set(key, {
    product,
    timestamp: Date.now(),
  });
}

router.get("/reviews", async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });

    const { apiKey, sku, platformProductId, platformVariantId } = req.query;
    const variantId = platformVariantId ? String(platformVariantId) : null;

    if (!apiKey || (!sku && !platformProductId)) {
      return res.status(400).json({
        error: "apiKey e sku ou platformProductId são obrigatórios",
      });
    }

    const company = await prisma.company.findUnique({
      where: {
        apiKey: String(apiKey),
      },
      select: {
        id: true,
        name: true,
        apiKey: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa não encontrada para esta apiKey",
      });
    }

    const cacheId = platformProductId || sku;
    const cacheVariantPart = variantId ? `:variant:${variantId}` : "";

    const productCacheKey = cacheId
      ? `${company.id}:${cacheId}${cacheVariantPart}`
      : null;
    let product = productCacheKey ? getCachedProduct(productCacheKey) : null;

    if (!product) {
      product = await prisma.product.findFirst({
        where: {
          companyId: company.id,
          ...(platformProductId && {
            platformProductId: String(platformProductId),
          }),
          ...(sku && {
            sku: String(sku),
          }),
        },
      });

      if (product) {
        if (productCacheKey) {
          setCachedProduct(productCacheKey, product);
        }
      }
    }

    if (!product) {
      if (productCacheKey) {
        productCache.delete(productCacheKey);
      }

      const summary = {
        averageRating: 0,
        totalReviews: 0,
      };

      return res.json({
        company: {
          id: company.id,
          name: company.name,
        },
        product: null,
        summary,
        reviews: [],
      });
    }

    let reviews: any[] = [];

    let reviewsWhere: any = {
      productId: product.id,
      companyId: company.id,
      status: "approved",
    };

    if (variantId) {
      reviewsWhere.variantId = variantId;
    }

    reviews = await prisma.review.findMany({
      where: reviewsWhere,
      orderBy: {
        createdAt: "desc",
      },
      take: REVIEWS_LIMIT,
      select: {
        id: true,
        rating: true,
        comment: true,
        authorName: true,
        verifiedPurchase: true,
        createdAt: true,
        variantId: true,
      },
    });

    if (variantId && reviews.length === 0) {
      reviewsWhere = {
        productId: product.id,
        companyId: company.id,
        variantId: null,
        status: "approved",
      };

      reviews = await prisma.review.findMany({
        where: reviewsWhere,
        orderBy: {
          createdAt: "desc",
        },
        take: REVIEWS_LIMIT,
        select: {
          id: true,
          rating: true,
          comment: true,
          authorName: true,
          verifiedPurchase: true,
          createdAt: true,
          variantId: true,
        },
      });
    }

    let summaryWhere: any = {
      productId: product.id,
      companyId: company.id,
      status: "approved",
    };

    if (variantId) {
      const hasVariantSpecificReviews = reviews.some((review) => {
        return review && review.variantId === variantId;
      });

      summaryWhere.variantId = hasVariantSpecificReviews ? variantId : null;
    }

    const reviewsSummary = await prisma.review.aggregate({
      where: summaryWhere,
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const average = Number((reviewsSummary._avg.rating ?? 0).toFixed(1));
    const totalReviews = reviewsSummary._count.rating ?? 0;

    const productResponse = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      platformProductId: product.platformProductId,
      platformVariantId: variantId,
    };

    const summary = {
      averageRating: average,
      totalReviews,
    };

    return res.json({
      company: {
        id: company.id,
        name: company.name,
      },
      product: productResponse,
      summary,
      reviews,
    });
  } catch (error) {
    console.error("Erro ao buscar reviews do widget:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const {
      apiKey,
      sku,
      rating,
      comment,
      authorName,
      verifiedPurchase,
      platformProductId,
      platformVariantId,
    } = req.body;
    const variantId = platformVariantId ? String(platformVariantId) : null;

    if (!apiKey || (!sku && !platformProductId) || rating === undefined) {
      return res.status(400).json({
        error: "apiKey, sku ou platformProductId, e rating são obrigatórios",
      });
    }

    const normalizedRating = Math.round(Number(rating));

    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      return res.status(400).json({
        error: "rating deve ser um número entre 1 e 5",
      });
    }

    const normalizedVerifiedPurchase =
      verifiedPurchase === true ||
      verifiedPurchase === "true" ||
      verifiedPurchase === 1 ||
      verifiedPurchase === "1";

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

    const cacheId = platformProductId || sku;
    const cacheVariantPart = variantId ? `:variant:${variantId}` : "";

    const productCacheKey = cacheId
      ? `${company.id}:${cacheId}${cacheVariantPart}`
      : null;
    let product = productCacheKey ? getCachedProduct(productCacheKey) : null;

    if (!product) {
      product = await prisma.product.findFirst({
        where: {
          companyId: company.id,
          OR: [
            ...(platformProductId
              ? [{ platformProductId: String(platformProductId) }]
              : []),
            ...(sku ? [{ sku: String(sku) }] : []),
          ],
        },
      });

      if (product) {
        if (productCacheKey) {
          setCachedProduct(productCacheKey, product);
        }
      }
    }

    if (!product) {
      if (productCacheKey) {
        productCache.delete(productCacheKey);
      }

      const baseCacheId = platformProductId || sku;
      const baseProductCacheKey = baseCacheId
        ? `${company.id}:${baseCacheId}`
        : null;

      if (baseProductCacheKey) {
        productCache.delete(baseProductCacheKey);
      }

      return res.status(404).json({
        error: "Produto não encontrado",
      });
    }

    const review = await prisma.review.create({
      data: {
        rating: normalizedRating,
        comment,
        authorName,
        verifiedPurchase: normalizedVerifiedPurchase,
        status: "pending",
        productVariant: sku || null,
        variantId: variantId || null,
        productId: product.id,
        companyId: company.id,
      },
    });

    if (productCacheKey) {
      productCache.delete(productCacheKey);
    }

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
