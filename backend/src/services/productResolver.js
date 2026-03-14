async function resolveProductByIdentifiers(prisma, params) {
  const { companyId, sku, platform, platformProductId, platformVariantId } =
    params;

  if (!companyId) return null;

  // 1) tenta por platformVariantId
  if (platformVariantId) {
    const byVariantId = await prisma.product.findFirst({
      where: {
        companyId,
        platformVariantId: String(platformVariantId),
      },
    });

    if (byVariantId) return byVariantId;
  }

  // 2) tenta por platformProductId
  if (platformProductId) {
    const byProductId = await prisma.product.findFirst({
      where: {
        companyId,
        platformProductId: String(platformProductId),
      },
    });

    if (byProductId) return byProductId;
  }

  // 3) tenta pelo platformProductId (identidade estável)
  if (platformProductId) {
    const byPlatformId = await prisma.product.findFirst({
      where: {
        companyId,
        platformProductId: String(platformProductId),
      },
    });

    if (byPlatformId) return byPlatformId;
  }

  // 4) fallback pelo SKU atual (compatibilidade)
  if (sku) {
    const bySku = await prisma.product.findFirst({
      where: {
        companyId,
        sku: String(sku),
      },
    });

    if (bySku) return bySku;
  }

  // 4) tenta pelo histórico / alias de SKU
  if (sku) {
    const alias = await prisma.productSkuAlias.findFirst({
      where: {
        companyId,
        sku: String(sku),
      },
      include: {
        product: true,
      },
    });

    if (alias && alias.product) return alias.product;
  }

  return null;
}

module.exports = {
  resolveProductByIdentifiers,
};
