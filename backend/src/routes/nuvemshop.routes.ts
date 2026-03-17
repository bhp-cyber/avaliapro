import { Router } from "express";
import prisma from "../lib/prisma";
import * as crypto from "crypto";

const router = Router();

router.get("/install", async (req, res) => {
  const { store } = req.query;

  if (!store) {
    return res.status(400).send("Parâmetro store é obrigatório");
  }

  const clientId = "27901"; // ⚠️ coloque aqui
  const redirectUri = "http://localhost:4000/api/nuvemshop/callback";

  const authUrl = `https://${store}/admin/apps/${clientId}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  return res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        error: "code é obrigatório",
      });
    }

    const clientId = "27901";
    const clientSecret = "f1643e479d2b2043f60c574df6ba4216a52eb53df3c3465d";

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
    });

    const response = await fetch(
      "https://www.tiendanube.com/apps/authorize/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const data = await response.json();

    if (!data.user_id) {
      return res.status(400).json({
        error: "user_id não retornado pela Nuvemshop",
        details: data,
      });
    }

    console.log("Resposta token Nuvemshop:", data);

    if (!response.ok) {
      return res.status(502).json({
        error: "Erro ao trocar code por token",
        details: data,
      });
    }

    // salva ou atualiza empresa
    // salva ou atualiza empresa
    const company = await prisma.company.upsert({
      where: {
        nuvemshopStoreId: String(data.user_id),
      },
      update: {
        nuvemshopToken: data.access_token,
      },
      create: {
        name: `Loja ${data.user_id}`,
        apiKey: crypto.randomUUID(),
        nuvemshopStoreId: String(data.user_id),
        nuvemshopToken: data.access_token,
      },
    });

    return res.json({
      message: "Token salvo com sucesso",
      companyId: company.id,
      storeId: company.nuvemshopStoreId,
    });
  } catch (error) {
    console.error("Erro no callback da Nuvemshop:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

// 🔽 Sync manual (primeira versão segura)
router.post("/sync-products", async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        error: "companyId é obrigatório",
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa não encontrada",
      });
    }

    if (!company.nuvemshopStoreId || !company.nuvemshopToken) {
      return res.status(400).json({
        error: "Empresa não configurada com Nuvemshop",
      });
    }
    let page = 1;
    const perPage = 200;
    const products: any[] = [];

    while (true) {
      const response = await fetch(
        `https://api.nuvemshop.com.br/v1/${company.nuvemshopStoreId}/products?page=${page}&per_page=${perPage}`,
        {
          method: "GET",
          headers: {
            Authentication: `bearer ${company.nuvemshopToken}`,
            "Content-Type": "application/json",
            "User-Agent": "AvaliaPro (contato@avaliapro.com)",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Erro Nuvemshop:", errorText);

        return res.status(502).json({
          error: "Erro ao buscar produtos na Nuvemshop",
          details: errorText,
        });
      }

      const pageProducts = await response.json();

      if (!Array.isArray(pageProducts) || pageProducts.length === 0) {
        break;
      }

      products.push(...pageProducts);

      if (pageProducts.length < perPage) {
        break;
      }

      page++;
    }

    let saved = 0;

    for (const product of products) {
      const name = product.name?.pt || "Sem nome";

      if (!product.variants || product.variants.length === 0) continue;

      for (const variant of product.variants) {
        await prisma.product.upsert({
          where: {
            platformVariantId: String(variant.id),
          },
          update: {
            name,
            sku: variant.sku || null,
          },
          create: {
            companyId: company.id,
            platform: "nuvemshop",
            platformProductId: String(product.id),
            platformVariantId: String(variant.id),
            name,
            sku: variant.sku || null,
          },
        });

        saved++;
      }
    }

    return res.json({
      message: "Produtos sincronizados 🚀",
      totalReceived: products.length,
      totalSaved: saved,
    });
  } catch (error) {
    console.error("Erro ao sincronizar produtos:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

export default router;
