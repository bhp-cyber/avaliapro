const API_BASE_URL = "https://avaliapro-api.onrender.com/api";

export async function fetchProducts(companyId: string, search?: string) {
  const query = new URLSearchParams({
    companyId,
  });

  if (search && search.trim()) {
    query.set("search", search.trim());
  }

  const response = await fetch(`${API_BASE_URL}/products?${query.toString()}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar produtos");
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  return [];
}

export async function createProduct(data: { name: string; sku?: string; companyId: string }) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      sku: data.sku || null,
      companyId: data.companyId,
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar produto");
  }

  return response.json();
}
