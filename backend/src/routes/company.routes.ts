import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        domain: true,
        apiKey: true,
        nuvemshopStoreId: true,
        createdAt: true,
      },
    });

    return res.json(companies);
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (_req, res) => {
  return res.status(403).json({
    error: "Criação manual de empresa temporariamente desabilitada",
  });
});

router.get("/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        name: true,
        domain: true,
        apiKey: true,
        nuvemshopStoreId: true,
        createdAt: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa não encontrada",
      });
    }

    return res.json(company);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/:companyId/summary", async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        name: true,
        domain: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa não encontrada",
      });
    }

    const normalizedCompanyId = String(companyId);

    const [productsCount, reviewsCount, customersCount, reviewsAggregate] =
      await Promise.all([
        prisma.product.count({
          where: {
            companyId: normalizedCompanyId,
          },
        }),
        prisma.review.count({
          where: {
            companyId: normalizedCompanyId,
          },
        }),
        prisma.customer.count({
          where: {
            companyId: normalizedCompanyId,
          },
        }),
        prisma.review.aggregate({
          where: {
            companyId: normalizedCompanyId,
          },
          _avg: {
            rating: true,
          },
        }),
      ]);

    const averageRating = Number(
      Number(reviewsAggregate._avg.rating ?? 0).toFixed(1)
    );

    return res.json({
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
      },
      companyId: normalizedCompanyId,
      summary: {
        productsCount,
        reviewsCount,
        customersCount,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar resumo da empresa:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
