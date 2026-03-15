# AvaliaPro — Estado Atual do Projeto

## Objetivo

Criar um SaaS de avaliações para e-commerce, com widget embedável via script, semelhante a Trustpilot / Yotpo, começando por Nuvemshop, mas preparado para outras plataformas.

Script atual de instalação:

```html
<script
  src="https://avaliapro-api.onrender.com/widget/widget.js"
  data-api-key="API_KEY"
></script>
Estado Atual da Arquitetura Backend API Stack atual: Node.js Express Prisma
PostgreSQL Deploy: Render Estrutura principal: backend/src ├ app.ts ├ routes │ ├
index.ts │ ├ widget.routes.ts │ ├ review.routes.ts │ ├ company.routes.ts │ ├
product.routes.ts │ └ health.routes.ts └ lib └ prisma.ts Inicialização do
servidor: backend/src/app.ts Responsável por: configurar Express habilitar CORS
JSON parser servir widget estático registrar rotas /api Rotas da API Prefixo
geral: /api Health GET /api/health Verificação de saúde da API. Companies GET
/api/companies POST /api/companies GET /api/companies/:companyId GET
/api/companies/:companyId/summary Funções: criação de empresas listagem de
empresas busca individual resumo estatístico da empresa Resumo retorna:
productsCount reviewsCount customersCount averageRating Products GET
/api/products POST /api/products Gestão de produtos da empresa. Reviews (painel
SaaS) GET /api/reviews?companyId= POST /api/reviews Características: isolamento
por companyId paginação via limit e offset limite máximo de 50 reviews payload
otimizado validação de existência da empresa validação de produto pertencente à
empresa validação de cliente pertencente à empresa Resposta padronizada: {
"companyId": "...", "total": 50, "limit": 50, "offset": 0, "reviews": [...] }
Cada review retorna: id rating title comment authorName verifiedPurchase
createdAt product customer Campos filtrados para evitar exposição excessiva de
dados. Remoções de segurança: email do customer não é retornado Validações
implementadas: rating inteiro rating entre 1 e 5 title limitado a 120 caracteres
comment limitado a 2000 caracteres normalização de rating normalização de
companyId Proteções adicionais: normalização de limit normalização de offset
limite máximo de offset limite máximo de limit Widget Endpoints: GET
/api/widget/reviews POST /api/widget/reviews Responsável por: buscar avaliações
de produto criar nova avaliação via widget Validações: apiKey obrigatório rating
obrigatório produto deve existir Suporte a identificação de produto:
platformProductId platformVariantId sku Proteções: rating limitado entre 1 e 5
normalização de verifiedPurchase validação da resposta antes de renderizar no
widget normalização de rating para inteiro Widget Frontend Arquivo principal:
backend/widget/widget.js O widget já possui: carregamento automático de
avaliações cálculo de média renderização de reviews formulário de envio de
avaliação envio de review para API prevenção de múltiplos envios reload
automático após avaliação Estabilização SPA do Widget Sistema completamente
estabilizado para SPA. Implementações: detecção de mudança de produto suporte a
navegação SPA observação de DOM via MutationObserver fallback por polling
Eventos monitorados: popstate hashchange history.pushState history.replaceState
Proteções: evitar múltiplos MutationObserver evitar múltiplos setInterval evitar
múltiplos listeners evitar render duplicado evitar render atrasado ignorar
mutações do próprio widget prevenir loops de refresh Identificação de Produto
Detecção automática via: data-product-sku data-sku data-variant-sku .product-sku
#product-sku meta tags data-product-id data-platform-variant-id Fallbacks
adicionais: meta tags: meta[name="sku"] meta[name="variant-sku"]
meta[name="product-sku"] meta[name="platform-product-id"]
meta[property="platform-product-id"] Prioridade: platformProductId +
platformVariantId platformProductId sku + platformVariantId sku Cache no Widget
Implementado em: backend/widget/widget.js Características: cache em memória
chave composta por: platformProductId platformVariantId sku Configuração:
limite: 20 produtos TTL: 60 segundos Invalidação: ao enviar review ao mudar
produto ao expirar TTL Funções de suporte: removeReviewsCacheKey()
invalidateReviewsCache() Cache no Backend Arquivo:
backend/src/routes/widget.routes.ts Características: cache em memória (Map)
Chave baseada em: companyId + productIdentifier Configuração: TTL: 60 segundos
limite: 100 produtos Proteções: remoção automática do item mais antigo
invalidação após criação de review limpeza automática de entradas expiradas
Otimizações Implementadas Endpoint de reviews do widget: agregação de média via:
prisma.review.aggregate() Limite: 50 reviews Média padronizada com: 1 casa
decimal Campos retornados: id rating comment authorName verifiedPurchase
createdAt variantId Segurança Multi-Tenant O backend garante isolamento entre
empresas. Medidas: companyId obrigatório em endpoints SaaS validação da
existência da empresa filtragem por companyId em queries validação de produto
pertencente à empresa validação de cliente pertencente à empresa payload
limitado para evitar vazamento de dados Schema Prisma Atual Modelos principais:
User Company Product Customer Review Indexações importantes: Product
@@index([companyId]) @@index([companyId, sku]) @@index([companyId,
platformProductId]) @@index([companyId, platformVariantId]) Review
@@index([productId, variantId]) @@index([companyId]) Estado Atual do Sistema
Situação atual: widget funcional API funcional criação de review funcional
renderização funcional cache no widget implementado cache no backend
implementado suporte a avaliações por variante fallback automático para reviews
do produto arquitetura preparada para SaaS widget estabilizado para navegação
SPA endpoints SaaS iniciais implementados isolamento de dados por empresa
payloads otimizados paginação implementada no painel SaaS validações robustas na
criação de reviews Roadmap Técnico Identidade de produto estável ✅ IMPLEMENTADO
Suporte a platformProductId ✅ IMPLEMENTADO Suporte a platformVariantId ✅
IMPLEMENTADO Cache de produto no backend ✅ IMPLEMENTADO Otimização de consultas
de reviews ✅ IMPLEMENTADO Estabilização do widget para sites SPA ✅
IMPLEMENTADO Coleta automática de reviews por email ⏳ PENDENTE Painel SaaS para
lojistas 🔄 EM DESENVOLVIMENTO Moderação de avaliações ⏳ PENDENTE Sistema de
reputação e helpful votes ⏳ PENDENTE Commits e Tags Importantes
v0.1.0-widget-spa-stable Estabilização completa do widget SPA.
v0.1.1-widget-spa-lifecycle-stable Refinamentos de ciclo de vida do container.
v0.1.2-widget-spa-observer-stable Correções no MutationObserver.
v0.1.3-widget-cache-stable Estabilização definitiva do cache do widget. Último
Passo Executado PASSO 45 Arquivo: backend/widget/widget.js Alteração executada:
ampliação da detecção de SKU via meta tags no widget Próximo Passo PASSO 46
Arquivo: backend/widget/widget.js Alteração planejada: adicionar credentials:
"omit" e cache: "no-store" na requisição fetch do widget para evitar cache
incorreto do navegador/CDN e garantir atualização imediata das avaliações.
```
