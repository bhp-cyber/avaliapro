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

# ROADMAP TÉCNICO ATUALIZADO

Widget estável  
✅

Sistema de reviews  
✅

Sistema de moderação  
✅

Sistema de edição  
✅

Painel conectado à API  
✅

Tela de produtos básica  
✅

Sincronização de produtos (Nuvemshop)  
✅ **IMPLEMENTADO E FUNCIONAL**

Cadastro automático via SKU  
✅ **IMPLEMENTADO (via sync + identificação no widget)**

Paginação de produtos (API SaaS)  
✅

Integração oficial com Nuvemshop (OAuth completo)  
✅

Dashboard SaaS completo  
⏳

Sistema de avaliações com média por produto  
⏳

Widget embedável avançado (UX + performance)  
⏳

Sistema de coleta automática de reviews (pós-compra)  
🚨 PRIORIDADE ALTA

Sistema de notificações (email / webhook)  
⏳

Multi-plataforma (Shopify / WooCommerce)  
⏳

---

# ESTADO ATUAL DA ARQUITETURA

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
│ ├ nuvemshop.routes.ts
│ └ health.routes.ts
└ lib
  └ prisma.ts
```

---

## Inicialização do servidor

Arquivo:

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

## Prefixo geral

```
/api
```

---

## Health

```
GET /api/health
```

Verificação de saúde da API.

---

## Companies

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
- resumo estatístico

Resumo retorna:

- productsCount
- reviewsCount
- customersCount
- averageRating

---

## Products

```
GET /api/products?companyId=&limit=&offset=
POST /api/products
GET /api/products/sku/:sku
GET /api/products/sku/:sku/reviews
GET /api/products/:productId/reviews
```

### Estado atual:

- sincronização automática com Nuvemshop IMPLEMENTADA
- produtos reais sendo persistidos no banco
- identificação via `platformVariantId` (único)
- suporte completo a SKU

### Paginação:

- `limit` (máx 100)
- `offset`

Resposta:

```json
{
  "total": 941,
  "limit": 20,
  "offset": 0,
  "products": []
}
```

---

## Nuvemshop

```
GET /api/nuvemshop/install
GET /api/nuvemshop/callback
POST /api/nuvemshop/sync-products
```

### Funcionalidades:

- OAuth completo funcionando
- token salvo no banco
- storeId persistido
- sincronização completa de produtos

### Sync:

- paginação implementada (page + per_page)
- suporte a lojas grandes (300+ produtos)
- prevenção de duplicação via `platformVariantId`
- upsert funcionando corretamente

Exemplo de retorno:

```json
{
  "message": "Produtos sincronizados 🚀",
  "totalReceived": 341,
  "totalSaved": 941
}
```

---

## Reviews (painel SaaS)

```
GET /api/reviews?companyId=&status=
POST /api/reviews
PATCH /api/reviews/:reviewId
PATCH /api/reviews/:reviewId/status
```

### Características:

- isolamento por companyId
- paginação (limit / offset)
- limite máximo de 50
- validações completas

### Status:

- pending
- approved
- rejected

---

## Widget

```
GET /api/widget/reviews
POST /api/widget/reviews
```

### Funções:

- buscar avaliações
- criar avaliações
- identificar produto automaticamente

---

# Widget Frontend

Arquivo:

```
backend/widget/widget.js
```

### Funcionalidades:

- carregamento automático
- média de avaliações
- renderização
- envio de review
- prevenção de duplicação
- reload automático

---

# Estabilização SPA

Implementado:

- MutationObserver
- eventos de navegação
- proteção contra loops
- prevenção de múltiplos listeners

---

# Identificação de Produto

Prioridade:

1. platformProductId + platformVariantId
2. platformProductId
3. sku + variantId
4. sku

Observação:

- SKU continua sendo fallback mais confiável
- integração com Nuvemshop prioriza variantId

---

# Cache

## Widget

- memória local
- TTL: 60s
- limite: 20 produtos

## Backend

- Map em memória
- TTL: 60s
- limite: 100

---

# Segurança Multi-Tenant

- isolamento por companyId
- validação de empresa
- validação de produto
- validação de cliente
- payload reduzido

---

# Schema Prisma

Modelos:

- User
- Company
- Product
- Customer
- Review

### Índices importantes:

Product:

- companyId
- companyId + sku
- companyId + platformProductId
- companyId + platformVariantId (único lógico)

Review:

- productId + variantId
- companyId

---

# Estado Atual do Sistema

Situação atual:

- widget funcional
- API funcional
- sincronização automática ativa
- banco populado (centenas de produtos)
- paginação implementada
- cache ativo
- suporte a variantes
- arquitetura SaaS pronta

---

# Sistema de Moderação

Status:

IMPLEMENTADO

---

# Sistema de Edição

Status:

IMPLEMENTADO

---

# Sistema de Produtos

Status:

✅ COMPLETO

Situação:

- produtos sincronizados automaticamente
- não depende mais de cadastro manual
- integração real com loja
- preparado para escala

---

# Frontend Admin

Stack:

- React
- TypeScript
- Vite

Status:

FUNCIONAL

---

# Problemas Resolvidos Recentemente

- paginação da API Nuvemshop
- duplicação de produtos
- conflito TS/Prisma
- leitura incompleta no Thunder
- cache de arquivos JS antigos
- falta de paginação na API interna

---

# Próximos Passos (ATUAL)

## PRIORIDADE MÁXIMA

1. Sistema de avaliações por produto (média + contagem)
2. Exibição no widget (UX real de prova social)
3. Vincular avaliações ao produto correto (variantId)

## PRIORIDADE ALTA

4. Widget visual profissional (estilo Trustpilot)
5. Score agregado por produto
6. Paginação no widget

## PRIORIDADE MÉDIA

7. Dashboard SaaS completo
8. Filtros avançados (produto, nota, status)
9. Relatórios

## PRIORIDADE FUTURA

10. Envio automático de review (pós-compra)
11. Webhooks Nuvemshop
12. Integração Shopify
13. Sistema de reputação
14. Anti-spam avançado
15. CDN para widget

---

# Situação Atual (Resumo Executivo)

AvaliaPro já possui:

- integração real com plataforma
- ingestão de dados
- persistência estruturada
- API paginada
- widget funcional
- sistema de reviews completo

Estado:

👉 **MVP funcional de SaaS pronto para evolução e monetização**
