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

# Proteções adicionais

- validação da resposta da API
- prevenção de widget duplicado
- refresh global seguro
- debug opcional via:

```javascript
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

## 4. Cache de produto no backend

⏳ PENDENTE

## 5. Coleta automática de reviews por email

⏳ PENDENTE

## 6. Painel SaaS para lojistas

⏳ PENDENTE

## 7. Moderação de avaliações

⏳ PENDENTE

## 8. Sistema de reputação e helpful votes

⏳ PENDENTE

---

# Próximo Passo Técnico Planejado

Implementar suporte a:

```
platformVariantId
```

## Objetivo

- suportar avaliações por variante
- permitir avaliações separadas por:

  - cor
  - tamanho
  - modelo

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
- cache implementado
- suporte a avaliações por variante (platformVariantId)
- fallback automático para reviews do produto
- arquitetura preparada para SaaS

O sistema já se comporta como **primeira versão funcional de um produto SaaS de avaliações embedáveis**.
