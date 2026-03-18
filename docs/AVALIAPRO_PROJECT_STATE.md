# AvaliaPro — Estado Atual do Projeto

## Objetivo

Criar um SaaS de avaliações para e-commerce, com widget embedável via script, semelhante a Trustpilot / Yotpo, começando por Nuvemshop, mas preparado para outras plataformas.

Caminho da pasta raiz do projeto:

```bash
cd ~/Documents/Programas/AvaliaPro

Script atual de instalação:

<script
  src="https://avaliapro-api.onrender.com/widget/widget.js"
  data-api-key="API_KEY"
></script>
ROADMAP TÉCNICO ATUALIZADO

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
✅ RECENTEMENTE CORRIGIDO E VALIDADO

Validação de produto por company no widget
✅ IMPLEMENTADO (CRÍTICO PARA SAAS)

Correção de inconsistência de múltiplas companies
✅

Limpeza de banco (dados inválidos / duplicados)
✅

Widget funcionando com produto real da loja
✅

Widget com cache inteligente (TTL + limite)
✅

Dashboard SaaS completo
⏳

Sistema de média e agregação por produto
⏳

Widget embedável avançado (UX + conversão)
⏳

Sistema de coleta automática de reviews (pós-compra)
🚨 PRIORIDADE MÁXIMA

Sistema de notificações (email / webhook)
⏳

Multi-plataforma (Shopify / WooCommerce)
⏳

ESTADO ATUAL DA ARQUITETURA
Backend API

Stack atual:

Node.js

Express

Prisma

PostgreSQL (Supabase)

Deploy:

Render

Estrutura principal:

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
Inicialização do servidor

Arquivo:

backend/src/app.ts

Responsável por:

configurar Express

habilitar CORS

JSON parser

servir widget estático

registrar rotas /api

Rotas da API
Prefixo geral
/api
Health
GET /api/health

Verificação de saúde da API.

Companies
GET /api/companies
POST /api/companies
GET /api/companies/:companyId
GET /api/companies/:companyId/summary

Funções:

criação de empresas

listagem de empresas

busca individual

resumo estatístico

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
Estado atual:

sincronização automática com Nuvemshop IMPLEMENTADA

produtos reais sendo persistidos no banco

identificação via platformVariantId

fallback por SKU

queries corrigidas para multi-tenant

Paginação:

limit (máx 100)

offset

Resposta:

{
  "total": 941,
  "limit": 20,
  "offset": 0,
  "products": []
}
Nuvemshop
GET /api/nuvemshop/install
GET /api/nuvemshop/callback
POST /api/nuvemshop/sync-products
Funcionalidades:

OAuth completo funcionando

token salvo no banco

storeId persistido

sincronização completa de produtos

Sync:

paginação implementada (page + per_page)

suporte a lojas grandes

upsert via platformVariantId

evita duplicação

Reviews (painel SaaS)
GET /api/reviews?companyId=&status=
POST /api/reviews
PATCH /api/reviews/:reviewId
PATCH /api/reviews/:reviewId/status
DELETE /api/reviews/:reviewId
Características:

isolamento por companyId

paginação (limit / offset)

limite máximo de 50

validações completas

Status:

pending

approved

rejected

Widget
GET /api/widget/reviews
POST /api/widget/reviews
Funções:

buscar avaliações

criar avaliações

identificar produto automaticamente

validação por apiKey → companyId

proteção multi-tenant completa

Widget Frontend

Arquivo:

backend/widget/widget.js
Funcionalidades:

carregamento automático

renderização de reviews

média e contagem

destaque de review

envio de review

cache local inteligente

reload automático

compatível com SPA

Estabilização SPA

Implementado:

MutationObserver

interceptação de history (pushState / replaceState)

polling leve

prevenção de loops

Identificação de Produto

Prioridade:

platformProductId + platformVariantId

platformProductId

sku + variantId

sku

Observação:

SKU = fallback

variantId = mais preciso

sistema já preparado para múltiplas plataformas

Cache
Widget

memória local

TTL: 60s

limite: 20 produtos

Backend

Map em memória

TTL: 60s

limite: 100

Segurança Multi-Tenant

Estado atual:

isolamento por companyId

apiKey vinculada à company

validação de produto por company

validação de review por company

remoção de companies inválidas

queries protegidas contra vazamento

Status:

👉 100% funcional e validado

Schema Prisma

Modelos:

User

Company

Product

Customer

Review

Índices importantes:

Product:

companyId

companyId + sku

companyId + platformProductId

companyId + platformVariantId

Review:

companyId

productId

Estado Atual do Sistema

Situação atual:

widget funcional

API funcional

integração com Nuvemshop ativa

banco consistente

multi-tenant seguro

cache ativo

produto real validado

estrutura pronta para escalar

Sistema de Moderação

Status:

IMPLEMENTADO

Sistema de Edição

Status:

IMPLEMENTADO

Sistema de Produtos

Status:

✅ COMPLETO

Situação:

sincronização automática

dados reais

sem dependência manual

preparado para escala

Frontend Admin

Stack:

React

TypeScript

Vite

Status:

FUNCIONAL

Problemas Resolvidos Recentemente

produtos não carregando corretamente

inconsistência entre local e produção

duplicação de companies

uso incorreto de apiKey

widget não carregando produto correto

falha de isolamento multi-tenant

limpeza de banco

erro de leitura da API de produtos

falha de sincronização parcial

Problemas Atuais

botão "Avaliar produto" não abre modal

formulário popup ainda não implementado corretamente

Próximos Passos (ATUAL)
PRIORIDADE MÁXIMA

Implementar modal de avaliação (popup real)

Conectar botão "Avaliar produto" ao modal

Melhorar UX de envio de review

PRIORIDADE ALTA

Sistema de média por produto persistido

Exibição de score agregado

Paginação no widget

layout profissional (Trustpilot-like)

PRIORIDADE MÉDIA

Dashboard SaaS completo

filtros avançados

relatórios

PRIORIDADE FUTURA

envio automático pós-compra

webhooks Nuvemshop

integração Shopify

sistema anti-spam

reputação por loja

CDN para widget

sistema de imagens em reviews

analytics de conversão (impacto das avaliações)

Situação Atual (Resumo Executivo)

AvaliaPro já possui:

integração real com plataforma

ingestão de dados confiável

persistência estruturada

API robusta e paginada

widget funcional e isolado

sistema de reviews completo

base pronta para escalar SaaS

Estado:

👉 MVP funcional, seguro e pronto para evolução e monetização
```
