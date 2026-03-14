# AVALIAPRO_PROJECT_STATE.MD

# AvaliaPro — Estado Atual do Projeto

## Objetivo

Criar um SaaS de avaliações para e-commerce, com widget embedável via script, semelhante a Trustpilot / Yotpo, começando por Nuvemshop, mas preparado para outras plataformas.

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
- Deploy: Render

Endpoints principais já funcionando:

GET

```
/api/widget/reviews
```

POST

```
/api/widget/reviews
```

Funções do endpoint:

- buscar avaliações de um produto
- calcular média de avaliação
- retornar resumo (`summary`)
- retornar lista de reviews
- criar nova avaliação

Validações implementadas:

- `apiKey` obrigatório
- `rating` obrigatório
- produto deve existir
- suporte a identificação por:

- `platformProductId`
- `sku` (fallback)

Proteções implementadas:

- rating limitado entre **1 e 5**
- normalização de `verifiedPurchase`
- validação da resposta antes de renderizar no widget
- normalização de `rating` para número inteiro

---

# Widget

Arquivo:

```
backend/widget/widget.js
```

O widget já possui:

## Detecção automática de produto na página via:

- `data-product-sku`
- `data-sku`
- `data-variant-sku`
- `.product-sku`
- `#product-sku`
- meta tags

## Identificação de produto via:

1️⃣ `platformProductId`  
2️⃣ fallback para `sku`

## Recursos implementados

- carregamento automático de avaliações
- cálculo de média
- renderização de reviews
- formulário de envio de avaliação
- envio de review para API
- prevenção de múltiplos envios
- reload automático após avaliação
- detecção de mudança de produto
- suporte a navegação SPA
- observação de DOM via `MutationObserver`
- fallback por polling

---

# Sistema de cache no widget

- cache em memória por produto
- chave baseada em `platformProductId` ou `sku`
- limite de **20 produtos** no cache
- TTL de **60 segundos**
- invalidação de cache ao criar review

---

# Sistema de cache no backend

Arquivo:

```
backend/src/routes/widget.routes.ts
```

Características implementadas:

- cache de produto em memória (`Map`)
- chave baseada em `companyId + productIdentifier`
- TTL de **60 segundos**
- limite máximo de **100 produtos em cache**
- remoção automática do item mais antigo ao atingir limite
- proteção contra chave `null`
- invalidação automática após criação de review
- limpeza de entradas expiradas

Objetivo:

- reduzir consultas repetidas ao banco
- melhorar performance do endpoint
- preparar arquitetura para alto volume de tráfego SaaS

---

# Otimizações do Endpoint de Reviews

## Limite de reviews retornadas

O endpoint retorna no máximo:

```
50 reviews
```

Constante utilizada:

```
REVIEWS_LIMIT = 50
```

Isso evita:

- payload excessivo
- lentidão do widget
- consultas pesadas

---

## Agregação no banco

O cálculo de média e total de avaliações foi movido para o banco usando:

```
prisma.review.aggregate()
```

Isso evita:

- cálculo em memória
- transferência de milhares de registros
- sobrecarga no Node.js

O endpoint agora retorna:

```
averageRating
totalReviews
```

calculados diretamente no PostgreSQL.

---

## Redução de payload

As consultas `findMany` retornam apenas campos necessários:

```
id
rating
comment
authorName
verifiedPurchase
createdAt
variantId
```

Isso reduz:

- tamanho da resposta
- tempo de renderização do widget

---

# Proteções adicionais

- validação da resposta da API
- prevenção de widget duplicado
- refresh global seguro
- debug opcional via:

```
window.AVALIAPRO_DEBUG = true;
```

---

# Roadmap Técnico

## 1. Identidade de produto estável (não depender só de SKU)

✅ IMPLEMENTADO

## 2. Suporte a platformProductId

✅ IMPLEMENTADO

## 3. Suporte a platformVariantId

✅ IMPLEMENTADO

Implementado em:

- `schema.prisma`
- `widget.routes.ts`
- `widget.routes.js`
- `widget.js`

Agora o sistema suporta:

- envio de `platformVariantId`
- armazenamento em `variantId`
- fallback automático para reviews do produto

---

## 4. Cache de produto no backend

✅ IMPLEMENTADO

Arquivo:

```
backend/src/routes/widget.routes.ts
```

Componentes:

- `productCache`
- `PRODUCT_CACHE_TTL`
- `PRODUCT_CACHE_LIMIT`
- `getCachedProduct()`
- `setCachedProduct()`

---

## 5. Otimização de consultas de reviews

✅ IMPLEMENTADO

- agregação de média no banco
- limite de 50 reviews
- redução de payload
- reutilização de filtro (`reviewsWhere`)
- média padronizada com 1 casa decimal

---

## 6. Coleta automática de reviews por email

⏳ PENDENTE

---

## 7. Painel SaaS para lojistas

⏳ PENDENTE

---

## 8. Moderação de avaliações

⏳ PENDENTE

---

## 9. Sistema de reputação e helpful votes

⏳ PENDENTE

---

# Estrutura futura

Produto

```
product
```

Variante

```
variant
```

Review poderá ser associada a:

```
productId
ou
variantId
```

Isso permitirá:

- reviews por variante
- média por variante
- fallback para média do produto

---

# Estado do Sistema

Situação atual:

- widget funcional
- API funcional
- criação de review funcional
- renderização funcional
- cache no widget implementado
- cache de produto no backend implementado
- suporte a avaliações por variante (`platformVariantId`)
- fallback automático para reviews do produto
- agregação de média no banco
- limite de reviews retornadas
- redução de payload do endpoint
- arquitetura preparada para SaaS

O sistema já se comporta como **primeira versão funcional de um produto SaaS de avaliações embedáveis**.

---

# Último Passo Executado

PASSO 128

Padronização da média de avaliações para **uma casa decimal**.

Exemplo:

```
4.666 → 4.7
4.333 → 4.3
```

Implementado em:

```
backend/src/routes/widget.routes.ts
```

---

# Próximo Passo

PASSO 129

Arquivo:

```
backend/widget/widget.js
```

Objetivo:

Auditar e estabilizar o fluxo de inicialização do widget para sites SPA (Nuvemshop, Shopify, etc.).

Serão analisados:

- detecção de produto
- detecção de mudança de página
- inicialização do widget
- prevenção de múltiplas execuções do script
- prevenção de múltiplos requests duplicados
