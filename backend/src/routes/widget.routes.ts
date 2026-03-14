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
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa não encontrada",
      });
    }

    const cacheId = platformProductId || sku;

    const productCacheKey = cacheId ? `${company.id}:${cacheId}` : null;
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

      return res.json({
        company: {
          id: company.id,
          name: company.name,
        },
        product: null,
        summary: {
          averageRating: 0,
          totalReviews: 0,
        },
        reviews: [],
      });
    }

    let reviews;

    if (variantId) {
      reviews = await prisma.review.findMany({
        where: {
          productId: product.id,
          companyId: company.id,
          variantId: variantId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (reviews.length === 0) {
        reviews = await prisma.review.findMany({
          where: {
            productId: product.id,
            companyId: company.id,
            variantId: null,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }
    } else {
      reviews = await prisma.review.findMany({
        where: {
          productId: product.id,
          companyId: company.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

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
        platformProductId: product.platformProductId,
        platformVariantId: variantId,
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

    const normalizedRating = Number(rating);

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

    const productCacheKey = cacheId ? `${company.id}:${cacheId}` : null;
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
        productVariant: sku || null,
        variantId: variantId || null,
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
