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
✅

Sistema de estrelas interativas (hover + clique)
✅

Envio com feedback visual (loading + sucesso)
✅

Micro-animações (hover + click feedback)
✅

Select substituído por estrelas (UX moderno)
✅

Correção de validação de formulário (campos obrigatórios)
✅

Melhoria visual do modal (layout premium)
✅

CTA otimizado (Escrever avaliação)
✅

Reposicionamento do botão (topo do widget)
✅

Separação visual (header vs conteúdo)
✅

Correção de pluralização e estados vazios
✅

Exibição “Baseado em X avaliações”
✅

Label qualitativo (Excelente, Bom, etc.)
✅

Renderização de estrelas com precisão (floor)
✅

Sistema de meia estrela com CSS (visual profissional)
✅

Correção de escape HTML nas estrelas
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

Estado:

sincronização com Nuvemshop funcionando

persistência correta

identificação via platformVariantId

fallback por SKU

Paginação:

limit (máx 100)

offset

Nuvemshop

GET /api/nuvemshop/install
GET /api/nuvemshop/callback
POST /api/nuvemshop/sync-products

Funcionalidades:

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

envio via modal

estrelas dinâmicas (full + half + empty)

label qualitativo (Excelente, etc.)

cache local inteligente

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

UX premium (modal + estrelas + animações)

meia estrela funcional (nível marketplace)

feedback visual de envio (loading + sucesso)

SISTEMAS IMPLEMENTADOS

Sistema de Moderação
✅

Sistema de Edição
✅

Sistema de Produtos
✅

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

render incorreto de estrelas (safeText)

pluralização incorreta (“avaliaçãoões”)

timeout curto no fetch (Render cold start)

PROBLEMAS ATUAIS

ausência de paginação no widget

ausência de ranking visual completo

ausência de prova social avançada

ausência de distribuição persistida no backend

dependência de cold start da API (Render)

PRÓXIMOS PASSOS
PRIORIDADE MÁXIMA 🚨

Sistema de coleta automática pós-compra

integração com pedidos

envio de email automático

link direto para avaliação

marcação de “Compra verificada”

PRIORIDADE ALTA

score agregado persistido

distribuição de avaliações (backend)

paginação no widget

layout estilo Trustpilot completo

badges (Compra verificada, Top review)

sistema de reputação por produto

PRIORIDADE MÉDIA

dashboard avançado

filtros e relatórios

exportação de dados

notificações (email / webhook)

PRIORIDADE FUTURA

Shopify

WooCommerce

sistema anti-spam

CDN para widget

upload de imagens avançado

analytics de conversão

A/B testing do widget

MELHORIAS ESTRATÉGICAS SUGERIDAS

widget com foco extremo em conversão (CRO)

lazy loading de reviews

carregamento parcial (above the fold)

schema.org (rich snippets ⭐)

prova social dinâmica

fallback inteligente em caso de API lenta

pré-carregamento de avaliações

cache distribuído (edge/CDN)

RESUMO EXECUTIVO

AvaliaPro já possui:

integração real com e-commerce

ingestão confiável de dados

persistência estruturada

API robusta

widget altamente otimizado

sistema de reviews completo

UX premium (nível marketplace)

arquitetura SaaS pronta para escala

STATUS FINAL

👉 MVP avançado, validado, com UX premium e pronto para escala e monetização
```
