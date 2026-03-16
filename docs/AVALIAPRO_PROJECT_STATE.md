# AvaliaPro — Estado Atual do Projeto

## Objetivo

Criar um SaaS de avaliações para e-commerce, com widget embedável via script, semelhante a Trustpilot / Yotpo, começando por Nuvemshop, mas preparado para outras plataformas.

Caminho da pasta raiz do projeto:

```bash
cd ~/Documents/Programas/AvaliaPro
```

Script atual de instalação:

```html
<script
  src="https://avaliapro-api.onrender.com/widget/widget.js"
  data-api-key="API_KEY"
></script>
```

---

# Estado Atual da Arquitetura

## Backend API

Stack atual:

- Node.js
- Express
- Prisma
- PostgreSQL

Deploy:

- Render

Estrutura principal:

```
backend/src
├ app.ts
├ routes
│ ├ index.ts
│ ├ widget.routes.ts
│ ├ review.routes.ts
│ ├ company.routes.ts
│ ├ product.routes.ts
│ └ health.routes.ts
└ lib
  └ prisma.ts
```

Inicialização do servidor:

```
backend/src/app.ts
```

Responsável por:

- configurar Express
- habilitar CORS
- JSON parser
- servir widget estático
- registrar rotas `/api`

---

# Rotas da API

Prefixo geral:

```
/api
```

---

# Health

```
GET /api/health
```

Verificação de saúde da API.

---

# Companies

```
GET /api/companies
POST /api/companies
GET /api/companies/:companyId
GET /api/companies/:companyId/summary
```

Funções:

- criação de empresas
- listagem de empresas
- busca individual
- resumo estatístico da empresa

Resumo retorna:

```
productsCount
reviewsCount
customersCount
averageRating
```

---

# Products

```
GET /api/products
POST /api/products
```

Gestão de produtos da empresa.

---

# Reviews (painel SaaS)

```
GET /api/reviews?companyId=
POST /api/reviews
PATCH /api/reviews/:reviewId
PATCH /api/reviews/:reviewId/status
```

Características:

- isolamento por `companyId`
- paginação via `limit` e `offset`
- limite máximo de 50 reviews
- payload otimizado
- validação de existência da empresa
- validação de produto pertencente à empresa
- validação de cliente pertencente à empresa

Filtro adicional implementado:

```
GET /api/reviews?companyId=&status=
```

Status aceitos:

```
pending
approved
rejected
```

Resposta padronizada:

```json
{
  "companyId": "...",
  "status": "pending|approved|rejected|null",
  "total": 50,
  "limit": 50,
  "offset": 0,
  "reviews": []
}
```

Cada review retorna:

```
id
rating
title
comment
authorName
verifiedPurchase
status
createdAt
product
customer
```

Campos filtrados para evitar exposição excessiva de dados.

Remoções de segurança:

- email do customer não é retornado

Validações implementadas:

- rating inteiro
- rating entre 1 e 5
- title limitado a 120 caracteres
- comment limitado a 2000 caracteres
- normalização de rating
- normalização de companyId

Proteções adicionais:

- normalização de limit
- normalização de offset
- limite máximo de offset
- limite máximo de limit

---

# Widget

Endpoints:

```
GET /api/widget/reviews
POST /api/widget/reviews
```

Responsável por:

- buscar avaliações de produto
- criar nova avaliação via widget

Validações:

- apiKey obrigatório
- rating obrigatório
- produto deve existir

Suporte a identificação de produto:

```
platformProductId
platformVariantId
sku
```

Proteções:

- rating limitado entre 1 e 5
- normalização de verifiedPurchase
- validação da resposta antes de renderizar no widget
- normalização de rating para inteiro

---

# Widget Frontend

Arquivo principal:

```
backend/widget/widget.js
```

O widget já possui:

- carregamento automático de avaliações
- cálculo de média
- renderização de reviews
- formulário de envio de avaliação
- envio de review para API
- prevenção de múltiplos envios
- reload automático após avaliação

---

# Estabilização SPA do Widget

Sistema completamente estabilizado para SPA.

Implementações:

- detecção de mudança de produto
- suporte a navegação SPA
- observação de DOM via MutationObserver
- fallback por polling

Eventos monitorados:

```
popstate
hashchange
history.pushState
history.replaceState
```

Proteções:

- evitar múltiplos MutationObserver
- evitar múltiplos setInterval
- evitar múltiplos listeners
- evitar render duplicado
- evitar render atrasado
- ignorar mutações do próprio widget
- prevenir loops de refresh
- proteção contra race condition

---

# Identificação de Produto

Detecção automática via:

```
data-product-sku
data-sku
data-variant-sku
.product-sku
#product-sku
meta tags
data-product-id
data-platform-variant-id
```

Fallbacks adicionais:

```
meta[name="sku"]
meta[name="variant-sku"]
meta[name="product-sku"]
meta[name="platform-product-id"]
meta[property="platform-product-id"]
```

Prioridade:

```
platformProductId + platformVariantId
platformProductId
sku + platformVariantId
sku
```

---

# Cache no Widget

Implementado em:

```
backend/widget/widget.js
```

Características:

- cache em memória

Chave composta por:

```
platformProductId
platformVariantId
sku
```

Configuração:

```
limite: 20 produtos
TTL: 60 segundos
```

Invalidação:

- ao enviar review
- ao mudar produto
- ao expirar TTL

Funções de suporte:

```
removeReviewsCacheKey()
invalidateReviewsCache()
```

---

# Cache no Backend

Arquivo:

```
backend/src/routes/widget.routes.ts
```

Características:

- cache em memória (`Map`)

Chave baseada em:

```
companyId + productIdentifier
```

Configuração:

```
TTL: 60 segundos
limite: 100 produtos
```

Proteções:

- remoção automática do item mais antigo
- invalidação após criação de review
- limpeza automática de entradas expiradas

---

# Otimizações Implementadas

Endpoint de reviews do widget:

Agregação de média via:

```
prisma.review.aggregate()
```

Limite:

```
50 reviews
```

Média padronizada com:

```
1 casa decimal
```

Campos retornados:

```
id
rating
comment
authorName
verifiedPurchase
createdAt
variantId
```

---

# Segurança Multi-Tenant

O backend garante isolamento entre empresas.

Medidas:

- companyId obrigatório em endpoints SaaS
- validação da existência da empresa
- filtragem por companyId em queries
- validação de produto pertencente à empresa
- validação de cliente pertencente à empresa
- payload limitado para evitar vazamento de dados

---

# Schema Prisma Atual

Modelos principais:

```
User
Company
Product
Customer
Review
```

Review possui:

```
status String @default("approved")
```

Status possíveis:

```
pending
approved
rejected
```

Indexações importantes:

### Product

```
@@index([companyId])
@@index([companyId, sku])
@@index([companyId, platformProductId])
@@index([companyId, platformVariantId])
```

### Review

```
@@index([productId, variantId])
@@index([companyId])
```

---

# Estado Atual do Sistema

Situação atual:

- widget funcional
- API funcional
- criação de review funcional
- renderização funcional
- cache no widget implementado
- cache no backend implementado
- suporte a avaliações por variante
- fallback automático para reviews do produto
- arquitetura preparada para SaaS
- widget estabilizado para navegação SPA
- endpoints SaaS iniciais implementados
- isolamento de dados por empresa
- payloads otimizados
- paginação implementada no painel SaaS
- validações robustas na criação de reviews
- edição de avaliações via painel implementada
- persistência de edição conectada à API
- endpoint `PATCH /api/reviews/:reviewId` implementado
- estado local do painel atualizado após edição
- widget ajustado para renderizar apenas em container explícito

---

# Sistema de Moderação de Avaliações

Status:

```
IMPLEMENTADO
```

Funcionalidades:

- campo `status` na model Review
- reviews do widget criadas como `pending`
- widget exibe apenas `approved`
- reviews criadas via painel entram como `approved`
- endpoint de moderação implementado

```
PATCH /api/reviews/:reviewId/status
```

Permite alterar:

```
pending
approved
rejected
```

Listagem de reviews suporta:

```
GET /api/reviews?companyId=&status=
```

---

# Sistema de Edição de Avaliação

Status:

```
IMPLEMENTADO
```

Funcionalidades:

- botão **Editar avaliação** no menu
- estado React `editingReviewId`
- abertura de **modal de edição**
- carregamento automático de:

```
title
comment
```

Campos editáveis no modal:

```
Título
Comentário
```

Persistência:

```
PATCH /api/reviews/:reviewId
```

Fluxo completo:

```
modal -> updateReview() -> API -> banco -> atualização de estado local
```

---

# Frontend Admin (Painel SaaS)

Estrutura inicial:

```
frontend/admin
├ public
├ src
│ ├ components
│ ├ context
│ ├ data
│ ├ hooks
│ ├ layouts
│ ├ pages
│ ├ services
│ ├ types
│ ├ App.tsx
│ ├ main.tsx
│ └ index.css
```

Tecnologia:

```
React
TypeScript
Vite
```

---

# Integração do Painel com API

Situação atual:

```
CONEXÃO COM API IMPLEMENTADA
```

O painel consome:

```
GET /api/reviews
PATCH /api/reviews/:reviewId
PATCH /api/reviews/:reviewId/status
```

Arquivos principais envolvidos:

```
frontend/admin/src/services/reviews.ts
frontend/admin/src/context/ReviewsContext.tsx
frontend/admin/src/pages/ReviewsPage.tsx
```

Funções implementadas:

```
fetchReviews()
approveReview()
rejectReview()
deleteReview()
updateReview()
```

Contexto React responsável por:

```
loadReviews()
approveReview()
rejectReview()
deleteReview()
addReview()
updateReview()
```

---

# Tela de Moderação

Página:

```
/reviews
```

Funcionalidades funcionando:

- listagem de reviews da API
- normalização de dados para UI
- exibição de status
- filtro por status
- aprovação de reviews
- rejeição de reviews
- exclusão de reviews
- edição de reviews
- atualização do estado local após moderação ou edição

---

# Menu de Ações (Menu Contextual)

Botão:

```
⋮
```

Menu contextual por review.

Objetivo:

substituir botões diretos por **menu estilo SaaS**.

Referência visual:

- Nuvemshop
- Shopify
- Stripe Dashboard

Estado atual:

```
IMPLEMENTADO E ESTABILIZADO
```

Características atuais:

- menu aberto via botão `⋮`
- destaque visual do botão ativo
- destaque da linha ativa
- fechamento ao clicar fora
- fechamento com tecla ESC
- layout minimalista estilo SaaS
- ícones nas ações
- separação visual da ação destrutiva

Ações atuais:

```
Editar avaliação
Aprovar avaliação
Rejeitar avaliação
------------------
Excluir avaliação
```

---

# Roadmap Técnico

Identidade de produto estável
✅ IMPLEMENTADO

Suporte a `platformProductId`
✅ IMPLEMENTADO

Suporte a `platformVariantId`
✅ IMPLEMENTADO

Cache de produto no backend
✅ IMPLEMENTADO

Otimização de consultas de reviews
✅ IMPLEMENTADO

Estabilização do widget para sites SPA
✅ IMPLEMENTADO

Sistema de moderação de avaliações
✅ IMPLEMENTADO

Sistema de edição de avaliações
✅ IMPLEMENTADO

Menu contextual profissional
✅ IMPLEMENTADO

Painel SaaS para lojistas
🔄 EM DESENVOLVIMENTO

Dashboard SaaS com métricas da empresa
⏳ PENDENTE

Sistema de reputação e helpful votes
⏳ PENDENTE

Coleta automática de reviews por email
⏳ PENDENTE

Solicitação de reviews por WhatsApp
⏳ PLANEJADO

Integração oficial com Nuvemshop App Store
⏳ PLANEJADO

Sistema de convites automáticos pós-compra
⏳ PLANEJADO

---

# Commits e Tags Importantes

```
v0.1.0-widget-spa-stable
v0.1.1-widget-spa-lifecycle-stable
v0.1.2-widget-spa-observer-stable
v0.1.3-widget-cache-stable
v0.1.4-widget-anti-cache-stable
v0.1.5-widget-spa-race-condition-stable
v0.1.6-widget-fetch-timeout-stable
v0.1.7-widget-error-logging
v0.1.8-widget-sanitization-hardening
v0.1.9-widget-render-safety
v0.1.10-widget-average-safety
v0.2.0-review-editing
```

---

# Último Passo Executado

PASSO 35

Implementações:

- criação do endpoint `PATCH /api/reviews/:reviewId`
- integração do botão **Salvar alterações** com a API
- atualização do estado local após edição
- widget ajustado para usar container explícito
- commit e tag `v0.2.0-review-editing`

---

# Próximo Passo

Estabilizar instalação do widget em lojas Nuvemshop.

Objetivo:

```
instalar AvaliaPro em loja real
validar renderização do widget
validar coleta de reviews em produção
preparar integração oficial com Nuvemshop
```
