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

Endpoints principais funcionando:

GET

```
/api/widget/reviews
```

POST

```
/api/widget/reviews
```

O endpoint já faz:

- buscar avaliações de um produto
- calcular média
- retornar `summary`
- retornar lista de reviews
- criar nova avaliação

Validações e proteções já implementadas:

- `apiKey` obrigatório
- `rating` obrigatório
- produto deve existir
- suporte a:
  - `platformProductId`
  - `sku` (fallback)
- suporte a `platformVariantId`
- rating limitado entre **1 e 5**
- normalização de `verifiedPurchase`
- validação da resposta antes de renderizar no widget
- normalização de `rating` para inteiro

---

# Widget

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
- detecção de mudança de produto
- suporte a navegação SPA
- observação de DOM via `MutationObserver`
- fallback por polling

Detecção automática de produto via:

- `data-product-sku`
- `data-sku`
- `data-variant-sku`
- `.product-sku`
- `#product-sku`
- meta tags

Identificação atual:

1. `platformProductId`
2. fallback para `sku`

---

# Cache no Widget

Implementado em:

```
backend/widget/widget.js
```

Estado atual:

- cache em memória por produto
- chave baseada em `platformProductId` ou `sku`
- limite de **20 produtos**
- TTL de **60 segundos**
- invalidação de cache ao criar review

---

# Cache no Backend

Arquivo:

```
backend/src/routes/widget.routes.ts
```

Estado atual:

- cache de produto em memória (`Map`)
- chave baseada em `companyId + productIdentifier`
- TTL de **60 segundos**
- limite máximo de **100 produtos**
- remoção automática do item mais antigo ao atingir limite
- proteção contra chave `null`
- invalidação automática após criação de review
- limpeza de entradas expiradas

---

# Otimizações já implementadas

## Endpoint de reviews

- agregação de média e total no banco com `prisma.review.aggregate()`
- limite de **50 reviews**
- redução de payload
- média padronizada com **1 casa decimal**

Campos retornados no `findMany`:

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

# Estabilização SPA já executada

Arquivo:

```
backend/widget/widget.js
```

Entre os passos **129 ao 35** foi feita a estabilização do widget para SPA.

Principais pontos já resolvidos:

- prevenção de múltiplas execuções do script
- controle de concorrência via `requestToken`
- scheduler centralizado via `scheduleRefresh`
- detecção de navegação por:
  - `popstate`
  - `hashchange`
  - `history.pushState`
  - `history.replaceState`
- prevenção de múltiplos `MutationObserver`
- prevenção de múltiplos `setInterval`
- prevenção de múltiplos listeners
- remoção segura do widget ao sair de página de produto
- reinicialização segura ao voltar para página de produto
- proteção contra render atrasado
- proteção contra render em container removido
- proteção contra reutilização de container fora do DOM
- ignorar mutações do próprio widget
- prevenção de loops de refresh/render
- prevenção de render duplicado na inicialização
- sincronização correta de:
  - `sku`
  - `platformProductId`
  - `platformVariantId`

---

# Roadmap Técnico

## 1. Identidade de produto estável

✅ IMPLEMENTADO

## 2. Suporte a platformProductId

✅ IMPLEMENTADO

## 3. Suporte a platformVariantId

✅ IMPLEMENTADO

## 4. Cache de produto no backend

✅ IMPLEMENTADO

## 5. Otimização de consultas de reviews

✅ IMPLEMENTADO

## 6. Estabilização do widget para sites SPA

✅ IMPLEMENTADO

## 7. Coleta automática de reviews por email

⏳ PENDENTE

## 8. Painel SaaS para lojistas

⏳ PENDENTE

## 9. Moderação de avaliações

⏳ PENDENTE

## 10. Sistema de reputação e helpful votes

⏳ PENDENTE

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

---

# Commits e Tags já criados

```bash
git commit -m "Estabilização completa do widget SPA (MutationObserver, history API, request token, cache e scheduler de refresh)"
git tag v0.1.0-widget-spa-stable
```

```bash
git commit -m "Refinamentos de estabilidade do widget SPA e ciclo de vida do container"
git tag v0.1.1-widget-spa-lifecycle-stable
```

```bash
git commit -m "Aprimora watcher SPA e evita refresh causado por mutações do próprio widget"
git tag v0.1.2-widget-spa-observer-stable
```

---

# Último Passo Executado

PASSO 35

Arquivo:

```
backend/widget/widget.js
```

Alteração executada:

- a inicialização do widget passou a usar o mesmo pipeline de refresh do SPA

Trecho final ajustado em `init()`:

```js
startSkuWatcher();
scheduleRefresh(0);
```

---

# Próximo Passo

PASSO 36

Arquivo:

```
backend/widget/widget.js
```

Objetivo:

Auditar e estabilizar definitivamente o sistema de **cache de reviews no widget**, garantindo:

- consistência entre `sku`, `platformProductId` e `platformVariantId`
- invalidação correta após envio de review
- eliminação de cache incorreto em navegação SPA
