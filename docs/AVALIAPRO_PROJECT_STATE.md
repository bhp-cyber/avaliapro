# AvaliaPro — Estado Atual do Projeto

## Objetivo

Criar um SaaS de avaliações para e-commerce, com widget embedável via script, semelhante a Trustpilot / Yotpo, começando por Nuvemshop, mas preparado para outras plataformas.

---

## Caminho do Projeto

```bash
cd ~/Documents/Programas/AvaliaPro
Script de Instalação
<script
  src="https://avaliapro-api.onrender.com/widget/widget.js"
  data-api-key="API_KEY"
></script>
ROADMAP TÉCNICO ATUALIZADO
Núcleo do Sistema

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
✅

Cadastro automático via SKU / platformId
✅

Paginação de produtos (API SaaS)
✅

Integração oficial com Nuvemshop (OAuth completo)
✅

Isolamento multi-tenant (companyId + apiKey)
✅

Validação de produto por company no widget
✅

Correção de inconsistência de múltiplas companies
✅

Limpeza de banco (dados inválidos / duplicados)
✅

Widget funcionando com produto real da loja
✅

Widget com cache inteligente (TTL + limite)
✅

Widget UX / Conversão

Modal funcional de avaliação
✅ IMPLEMENTADO

Sistema de estrelas interativas (hover + clique)
✅ IMPLEMENTADO

Experiência de envio (UX melhorado)
✅

Micro-animações (hover + click feedback)
✅

Select substituído por estrelas (UX moderno)
✅

Em Andamento

Dashboard SaaS completo
⏳

Sistema de média e agregação por produto
⏳

Widget embedável avançado (layout e conversão)
⏳

Sistema de coleta automática de reviews (pós-compra)
🚨 PRIORIDADE MÁXIMA

Sistema de notificações (email / webhook)
⏳

Multi-plataforma (Shopify / WooCommerce)
⏳

ESTADO ATUAL DA ARQUITETURA
Backend API
Stack

Node.js

Express

Prisma

PostgreSQL (Supabase)

Deploy

Render

Estrutura
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
Inicialização

Arquivo:

backend/src/app.ts

Responsável por:

configurar Express

habilitar CORS

JSON parser

servir widget estático

registrar rotas /api

ROTAS DA API
Prefixo
/api
Health
GET /api/health
Companies
GET /api/companies
POST /api/companies
GET /api/companies/:companyId
GET /api/companies/:companyId/summary

Resumo retorna:

productsCount

reviewsCount

customersCount

averageRating

Products
GET /api/products?companyId=&limit=&offset=
POST /api/products
GET /api/products/sku/:sku
GET /api/products/sku/:sku/reviews
GET /api/products/:productId/reviews
Estado

sincronização com Nuvemshop funcionando

persistência correta

identificação via platformVariantId

fallback por SKU

Paginação
limit (máx 100)
offset
Nuvemshop
GET /api/nuvemshop/install
GET /api/nuvemshop/callback
POST /api/nuvemshop/sync-products
Funcionalidades

OAuth completo

token persistido

storeId salvo

sync completo

Reviews (Painel)
GET /api/reviews
POST /api/reviews
PATCH /api/reviews/:reviewId
PATCH /api/reviews/:reviewId/status
DELETE /api/reviews/:reviewId

Status:

pending

approved

rejected

Widget API
GET /api/widget/reviews
POST /api/widget/reviews
WIDGET FRONTEND

Arquivo:

backend/widget/widget.js
Funcionalidades

carregamento automático

renderização de reviews

média e contagem

destaque de review

envio de review via modal

estrelas interativas

cache local

compatível com SPA

SPA Handling

MutationObserver

interceptação de history

polling leve

prevenção de loops

Identificação de Produto

Prioridade:

platformProductId + platformVariantId

platformProductId

sku + variantId

sku

Cache
Widget

memória local

TTL: 60s

limite: 20

Backend

Map em memória

TTL: 60s

limite: 100

SEGURANÇA MULTI-TENANT

Estado:

isolamento por companyId

apiKey vinculada à company

validação completa no widget

queries protegidas

Status:

👉 100% funcional

SCHEMA PRISMA

Modelos:

User

Company

Product

Customer

Review

Índices:

companyId

companyId + sku

companyId + platformProductId

companyId + platformVariantId

ESTADO ATUAL DO SISTEMA

Situação:

widget funcional

API estável

integração ativa

banco consistente

multi-tenant seguro

cache ativo

UX moderna com estrelas

modal funcional

SISTEMAS IMPLEMENTADOS

Sistema de Moderação
✅

Sistema de Edição
✅

Sistema de Produtos
✅ COMPLETO

FRONTEND ADMIN

Stack:

React

TypeScript

Vite

Status:

✅ funcional

PROBLEMAS RESOLVIDOS RECENTEMENTE

duplicação de produtos

inconsistência local vs produção

erro de API

multi-tenant falho

widget não identificando produto

problemas de SKU vs variantId

modal quebrado

conflito de scripts duplicados

estrelas não funcionando

UX ruim do formulário

PROBLEMAS ATUAIS

layout do widget ainda simples

ausência de paginação no widget

ausência de ranking visual (ex: barras de avaliação)

ausência de prova social forte (ex: “X pessoas compraram”)

PRÓXIMOS PASSOS
PRIORIDADE MÁXIMA 🚨

Sistema de coleta automática pós-compra

integração com pedidos

envio de email automático

link direto para avaliação

PRIORIDADE ALTA

score agregado persistido

distribuição de avaliações (5⭐ → 1⭐)

paginação no widget

layout estilo Trustpilot

badges (Compra verificada, Top review)

PRIORIDADE MÉDIA

dashboard avançado

filtros e relatórios

exportação de dados

PRIORIDADE FUTURA

Shopify

WooCommerce

sistema anti-spam

reputação por loja

CDN para widget

upload de imagens em reviews (expandido)

analytics de conversão

A/B testing de widget

MELHORIAS ESTRATÉGICAS SUGERIDAS

widget com foco em conversão (CRO)

lazy loading de reviews

carregamento parcial (primeira dobra)

schema.org (SEO rich snippets ⭐)

heatmap de avaliações

prova social dinâmica

RESUMO EXECUTIVO

AvaliaPro já possui:

integração real com e-commerce

ingestão confiável de dados

persistência estruturada

API robusta

widget funcional e inteligente

sistema de reviews completo

UX moderna (modal + estrelas)

arquitetura SaaS pronta

STATUS FINAL

👉 MVP avançado, validado, pronto para escala e monetização
```
