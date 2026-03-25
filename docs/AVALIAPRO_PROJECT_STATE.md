AvaliaPro — Estado Atual do Projeto

Objetivo

Estamos desenvolvendo um SaaS de avaliações para e-commerce, com widget embedável via script, semelhante a Trustpilot / Yotpo, começando por Nuvemshop, mas preparado para outras plataformas.

Caminho do Projeto  
cd ~/Documents/Programas/AvaliaPro

Script de Instalação

<script
  src="https://avaliapro-api.onrender.com/widget/widget.js?v=3"
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

Captura correta de variante amigável no widget do site real  
✅

Campo Product.variantLabel criado e integrado ao fluxo  
✅

Sync local e produção da Nuvemshop salvando variantLabel  
✅

Exibição de variante amigável correta no widget e admin  
✅

Criação manual no admin enviando SKU real da variante  
✅

Leitura do widget agrupando reviews por produto base  
✅

List pdp exibindo todas as avaliações do produto em qualquer variante  
✅

Bloqueio do widget fora da página de produto no site real  
✅

Modo local isolado para página teste do widget  
✅

Widget UX / Conversão

Modal funcional de avaliação  
✅

Sistema de estrelas interativas (hover + clique)  
✅

Estrelas alinhadas (SVG unificado)  
✅

Remoção da avaliação em destaque  
✅

Envio com feedback visual  
✅

Micro-animações  
✅

Select substituído por estrelas  
✅

Validação de formulário corrigida  
✅

Layout premium do modal  
✅

CTA otimizado  
✅

Reposicionamento do botão  
✅

Separação visual header/conteúdo  
✅

Pluralização corrigida  
✅

Exibição “Baseado em X avaliações”  
✅

Label qualitativo  
✅

Renderização de estrelas precisa  
✅

Meia estrela com SVG  
✅

Correção de escape HTML  
✅

Trava visual de imagens no widget/modal  
✅

Avaliação anônima no Modal pdp  
✅

Formatação textual de data na list pdp  
✅

Resumo visual de avaliações refinado  
✅

Feedback de sucesso centralizado no modal de envio  
✅

Tela de sucesso substituindo o formulário após envio  
✅

Header do modal “Todas as avaliações” com média + estrelas + contagem  
✅

Botão de fechar do modal “Todas as avaliações” refinado  
✅

Botão principal do widget refinado para visual outline premium  
✅

Botão “Ver todas as avaliações” alinhado ao mesmo padrão visual  
✅

Botão “Carregar mais” alinhado ao mesmo padrão visual  
✅

Linha extra abaixo das reviews removida  
✅

Modal de avaliação em 2 etapas  
⏳

Primeira etapa do modal reestruturada com pergunta + estrelas + nome  
⏳

Validação específica para anônimo sem nome  
⏳

Sistema de avatar movido para a primeira etapa  
⏳

Seletor de avatar em popover 3x3  
⏳

Fechamento do popover ao clicar fora  
⏳ pendente de correção final

Sistema de Reviews (Avançado)

Insights (keywords)  
✅

Chips interativos  
✅

Filtro dinâmico  
✅

Layout clean moderno  
✅

Lista horizontal de características  
✅

Exibição completa dos chips sem limite artificial de 4 itens  
✅

Preview enxuto de reviews na PDP  
✅

Botão “Ver todas as avaliações” na PDP  
✅

Modal de listagem completa das avaliações  
✅

Carregar mais dentro do modal de avaliações  
✅ validado em produção

Widget — Avanços Recentes

Paginação local antiga da PDP substituída por preview fixo  
✅

Estado global persistente  
✅

Correção de reset de página  
✅

Remoção do highlight  
✅

Render estável  
✅

Normalização de avatar no fluxo do widget  
✅

Imagens travadas para não clicar/arrastar  
✅

Avatares públicos reais no widget  
✅

Avatar padrão público (avatar-default.png)  
✅

Preview grande de avatar no modal do widget  
✅

Fallback de avatar agora manual no widget  
✅

Regra de avatar aleatório removida do widget  
✅

Avaliação anônima com nome mascarado no Modal pdp  
✅

Envio de isAnonymous pelo widget  
✅

Resumo do topo da list pdp refinado visualmente  
✅

Correção de captura do productId real no widget  
✅

Remoção do fallback incorreto de slug/pathname no widget  
✅

List pdp agora mostra reviews do produto base em qualquer variante  
✅

Variante continua visível no card da avaliação  
✅

Separador visual entre nome e data no card  
✅

Espaçamento visual do card refinado  
✅

Feedback de envio mais elegante no modal  
✅

Widget não aparece mais em categoria/listagem no site real  
✅

Página teste local voltou a funcionar sem depender de produção  
✅

Página teste local isolada de POST/GET reais  
✅

Reviews locais de teste persistidas em localStorage apenas para UI  
✅

Modal “Ver todas as avaliações” centralizado no site real  
✅

Modal ampliado para ocupar melhor a viewport  
✅

Travamento do fundo ao abrir modal de avaliações  
✅

Lista interna rolável dentro do modal  
✅

Botão “Carregar mais” no modal validado no site real  
✅

Refino visual do header do modal “Todas as avaliações”  
✅

Refino visual do botão “Carregar mais”  
✅

Refino visual do botão de fechar do modal completo  
✅

Alinhamento do bloco superior de média do widget  
✅ salvo

Alinhamento do título “Avaliações” com o eixo do resumo  
✅ salvo

Refino visual do botão “Deixe sua avaliação”  
✅

Remoção da linha extra abaixo da list pdp  
✅

Modal de avaliação migrado de tela única para fluxo em 2 etapas  
⏳ em refinamento

Avatar da primeira etapa convertido em seletor com popover  
⏳ em refinamento

Admin — Avanços Recentes

Formulário de review manual estável  
✅

Correção de perda de authorName  
✅

Correção de envio de avatar para backend  
✅

Padronização de avatarType  
✅

Rollback seguro após instabilidade de avatar  
✅

Fluxo de avatar entre admin/backend/widget estabilizado  
✅

Imagens travadas no admin e NewReview  
✅

Nova avaliação via modal popup no painel  
✅

Reutilização segura do NewReviewPage dentro de modal  
✅

Avatar padrão visual no modal do admin  
✅

Avatar padrão manual no admin (avatar-default.png)  
✅

Regra de avatar aleatório removida do admin  
✅

Avatar reposicionado no topo do formulário  
✅

Fundo do modal refinado para visual mais limpo  
✅

Fluxo em 2 etapas no admin: produto base → variante  
✅

Envio de sku da variante selecionada no fluxo manual  
✅

EM ANDAMENTO

Dashboard SaaS completo  
⏳

Sistema de agregação persistida  
⏳

Widget avançado  
⏳

Sistema pós-compra automático  
⏳

PRIORIDADE MÁXIMA 🚨

Sistema pós-compra automático  
integração com pedidos  
email automático  
link de avaliação  
“Compra verificada”

ESTADO ATUAL DA ARQUITETURA

Backend API

Stack  
Node.js  
Express  
Prisma  
PostgreSQL (Supabase)

Deploy  
Render

Regra crítica de deploy / validação real

Toda alteração que precisa aparecer no site real exige commit + push na branch de deploy (atualmente `main`), porque o Render só atualiza a produção após deploy.

Consequências operacionais:

- editar localmente não altera o site real
- teste visual local pode ser feito sem deploy
- teste funcional no site real sempre depende de commit + push
- quando a validação for no site real, considerar o deploy como parte obrigatória do teste

Regra crítica de salvamento antes de mudanças arriscadas

Qualquer alteração visual que mexa em blocos acoplados do topo do widget, resumo, chips, botão principal ou alinhamentos horizontais deve ser tratada como mudança com risco real.

Regras operacionais obrigatórias:

- nunca commitar layout quebrado
- antes de mudança arriscada, criar checkpoint
- se o layout quebrar, restaurar para o último commit estável em vez de remendar em cima da quebra
- mudanças isoladas e pequenas podem ser testadas antes do commit, mas essa decisão deve ser técnica e cautelosa
- salvar antes sempre que houver chance de perder alinhamentos já aprovados

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

Products  
GET /api/products  
POST /api/products  
GET /api/products/sku/:sku  
GET /api/products/:productId/reviews

Reviews  
GET /api/reviews  
POST /api/reviews  
PATCH /api/reviews/:reviewId  
PATCH /api/reviews/:reviewId/status  
DELETE /api/reviews/:reviewId

Widget API  
GET /api/widget/reviews  
POST /api/widget/reviews

WIDGET FRONTEND

Arquivo  
backend/widget/widget.js

Funcionalidades  
render automático  
reviews dinâmicos  
média + contagem  
envio via modal  
estrelas SVG  
label qualitativo  
cache local  
SPA ready  
trava visual das imagens  
fallback de avatar  
avatares públicos  
avatar padrão público  
preview grande de avatar no modal  
regra manual para avatar quando nenhum for selecionado  
avaliação anônima no Modal pdp  
máscara de nome no fluxo anônimo do widget  
formatação textual de data na list pdp  
resumo visual refinado no topo da list pdp  
chips de insights exibindo todos os itens disponíveis  
leitura por produto base em vez de filtrar a list pdp pela variante ativa  
bloqueio de renderização fora da PDP no site real  
modo local de teste isolado para página teste  
POST local de reviews no modo teste  
GET local de reviews no modo teste  
persistência local via localStorage no modo teste  
feedback de sucesso centralizado no modal após envio  
preview fixo de reviews na PDP  
botão “Ver todas as avaliações”  
modal de listagem completa de avaliações  
travamento de fundo ao abrir o modal  
lista interna rolável dentro do modal  
carregar mais no modal validado em produção  
header do modal completo refinado com média + estrelas + contagem  
botão fechar do modal completo refinado  
refino de alinhamento do topo do widget  
alinhamento do título “Avaliações” salvo  
botão principal “Deixe sua avaliação” em estilo outline premium  
botão “Ver todas as avaliações” no mesmo padrão visual  
botão “Carregar mais” no mesmo padrão visual  
remoção da linha extra abaixo da list pdp  
modal de avaliação em 2 etapas  
validação de anônimo exigindo nome com mensagem específica  
avatar movido para a primeira etapa  
seletor de avatar em popover 3x3 com botão de remoção  
pendência atual: fechar o popover de avatar corretamente ao clicar fora

Arquivo auxiliar de laboratório visual  
teste-widget-v2.html

Observação operacional importante

No momento, o widget em produção já possui:

- preview de reviews na PDP
- botão “Ver todas as avaliações”
- modal centralizado de listagem completa
- scroll interno do modal
- botão “Carregar mais” validado no site real
- botão principal refinado em estilo mais premium

Importante sobre o modal novo em 2 etapas:

- a evolução atual do modal está em refinamento local
- nem todo ajuste recente foi validado no site real
- só considerar como comportamento final de produção após commit + push + validação real

SEGURANÇA MULTI-TENANT

isolamento por companyId  
apiKey vinculada  
queries protegidas

Status:  
✅ funcional

SCHEMA PRISMA

User  
Company  
Product  
Customer  
Review

ESTADO ATUAL DO SISTEMA

Situação

API estável  
widget estável  
admin estável  
integração ativa  
banco consistente  
multi-tenant seguro  
cache ativo  
avatar estabilizado  
travas visuais de imagem aplicadas  
modal de nova avaliação estável no admin  
avatar padrão manual estável no admin e widget  
resumo visual do widget estabilizado  
fluxo anônimo no Modal pdp funcionando  
reviews do admin e do site aparecendo corretamente na list pdp do produto base  
widget bloqueado corretamente fora da PDP no site real  
página teste local funcional novamente  
página teste local isolada da produção para testes de UI/lista de reviews  
navegação de reviews na PDP evoluiu para um padrão mais premium  
modal de reviews completo já abre no centro e ocupa melhor a tela no site real  
carregamento incremental no modal já validado no site real  
topo do widget com alinhamento principal salvo  
título “Avaliações” alinhado com o eixo do resumo e salvo  
botões principais do widget refinados e visualmente padronizados  
linha extra abaixo da list pdp removida  
fluxo novo do modal em 2 etapas em refinamento  
seletor de avatar em popover já implementado localmente  
pendência aberta imediata no modal: o balão de avatar ainda não está fechando corretamente ao clicar fora

Terminologia operacional adotada

Modal pdp = criar avaliação na página do produto  
list pdp = lista de avaliações da página do produto  
Modal adm = criar avaliação no painel de gestão  
list adm = lista de avaliações no painel de gestão  
Modal all reviews = popup de listagem completa das avaliações aberto a partir da PDP

Regra operacional da página teste

A página teste local não deve ser usada como prova funcional de produção.

Uso correto:

- página teste local = validação visual / UI / lista local / layout / espaçamento / comportamento visual do widget
- site real = validação funcional real (criação, aprovação no admin, retorno, produto base, variantes, produção)

Decisão consolidada:

- não vale insistir em igualar perfeitamente o shell da página local ao shell visual do site real
- a página local serve apenas para validar a UI interna do widget
- a validação visual final deve sempre ser feita no site real

PROBLEMAS RESOLVIDOS RECENTEMENTE

duplicação de produtos  
erro de API  
multi-tenant inconsistente  
problemas SKU vs variantId  
modal quebrado  
render de estrelas  
pluralização  
remoção do highlight  
correção de authorName  
correção de fluxo de aprovação  
normalização do fluxo de avatar  
proteção de avatarUrl pública  
consistência entre POST/PATCH de reviews  
trava de arraste/clique visual das imagens  
avatar preset público no widget  
fallback aleatório removido do admin  
fallback aleatório removido do widget  
padronização do avatar-default.png  
nova avaliação via modal no painel admin  
avaliação anônima no widget  
formato de data refinado na list pdp  
limite artificial de 4 chips removido dos insights  
refino visual do resumo de avaliações no widget  
captura errada de platformProductId por item de carrossel/lista no site real  
fallback incorreto de slug/pathname para platformProductId removido  
poluição de productVariant no site real corrigida lendo apenas grupos de variante visíveis  
confirmação de que admin localhost chama backend local  
confirmação de que backend local e produção usam o mesmo projeto Supabase  
criação manual no admin agora envia sku  
serviço/contexto/admin ajustados para aceitar e enviar sku  
leitura da variante ativa no widget corrigida com base em data-variants  
list pdp unificada por produto base  
reviews do admin agora aparecem no site junto com as demais reviews do produto  
comportamento final validado: qualquer variante selecionada mostra todas as avaliações do produto, com a variante exibida no card  
widget aparecendo indevidamente em categoria/listagem no site real  
página teste local parando de funcionar após endurecimento de detecção de PDP  
mistura entre reviews reais e testes locais na página teste  
refino visual fino do card da review  
separador nome | data no card  
modal de sucesso elegante após envio da review  
substituição da paginação antiga da PDP por preview + botão “Ver todas as avaliações”  
modal de listagem completa de reviews no widget  
modal de listagem completa validado visualmente no site real  
botão “Carregar mais” validado em produção  
alinhamento do topo do resumo salvo  
alinhamento do título “Avaliações” salvo  
botão “Deixe sua avaliação” refinado  
botão “Ver todas as avaliações” refinado  
botão “Carregar mais” refinado  
remoção da linha extra abaixo da list pdp  
mensagem específica para avaliação anônima sem nome  
remoção de redundância visual no seletor de avatar  
cursor do bloco de anônimo restringido ao label e checkbox

PROBLEMA CRÍTICO ANTERIOR — STATUS

Problema que existia

Reviews criadas no admin não apareciam corretamente no site/widget para todas as variantes.

Status atual

✅ RESOLVIDO

Solução consolidada

Foi corrigido o fluxo completo para que:

- o admin envie o sku da variante selecionada
- o backend aceite e salve corretamente esse vínculo
- o widget consiga mapear a variante ativa real da página
- a list pdp deixe de filtrar por variante ativa e passe a exibir todas as reviews do produto base

Resultado final validado

Site real  
lançado no site → chega no admin → admin aprova → retorna para o site  
✅

lançado no admin → aparece corretamente no site  
✅

ao trocar de variante, a list pdp continua mostrando todas as avaliações do produto  
✅

cada card mantém a informação textual da variante comprada  
✅

Localhost  
continua útil apenas para validações básicas  
não usar localhost como prova final de múltiplas variantes reais

PENDÊNCIAS VISUAIS NÃO CRÍTICAS

Widget

Pontos já estáveis no widget:

- topo do resumo principal salvo
- título “Avaliações” alinhado e salvo
- modal all reviews funcional e visualmente refinado
- carregar mais validado no site real
- botão principal do widget refinado
- botão “Ver todas as avaliações” refinado
- botão “Carregar mais” refinado
- linha extra abaixo da list pdp removida

Pontos abertos imediatos no widget:

- fechar corretamente o popover de avatar ao clicar fora
- validar visualmente o modal em 2 etapas após os últimos ajustes
- decidir se a segunda etapa receberá depois um bloco opcional de foto/vídeo com incentivo
- manter o campo de e-mail opcional fora do fluxo até existir necessidade real de persistência/backend

Status:  
⏳ pendência visual/imediata, sem bloqueio funcional crítico no fluxo principal atual

Admin

Validar em cenário com poucas avaliações se o menu de ações do painel admin deixou de ser cortado no topo da tabela após ajuste de overflow em frontend/admin/src/pages/ReviewsPage.tsx

Status:  
⏳ pendente visual não crítica

STATUS

✅ avatar estabilizado em modo manual  
✅ admin e widget alinhados no uso de avatar-default.png  
✅ resumo visual de avaliações salvo no widget  
✅ productVariant do site real corrigido e validado  
✅ retorno site → admin → site funcionando  
✅ retorno admin → site funcionando  
✅ list pdp unificada por produto base funcionando  
✅ widget não aparece mais fora da PDP no site real  
✅ página teste local isolada da produção para testes de UI  
✅ navegação da PDP evoluiu de paginação antiga para preview premium + modal  
✅ modal “Ver todas as avaliações” funcional no site real  
✅ botão “Carregar mais” funcional e validado no site real  
✅ header do modal completo refinado  
✅ botão fechar do modal completo refinado  
✅ alinhamento principal do topo do widget salvo  
✅ título “Avaliações” alinhado e salvo  
✅ botão principal do widget refinado e salvo  
✅ botão “Ver todas as avaliações” refinado e salvo  
✅ botão “Carregar mais” refinado e salvo  
✅ linha extra abaixo da list pdp removida  
⏳ fluxo novo do modal em 2 etapas ainda em refinamento  
⏳ popover de avatar ainda precisa fechar corretamente ao clicar fora  
⏳ foco macro do roadmap continua sendo pós-compra automático

ÚLTIMO PASSO EXECUTADO

Tentativa de corrigir o fechamento do popover de avatar ao clicar fora dele

Arquivos:

- backend/widget/widget.js

Objetivo:

- manter o novo seletor de avatar em formato premium
- preservar o popover 3x3 ancorado no avatar grande
- fazer o balão fechar quando o usuário clicar fora da área do seletor
- estabilizar a primeira etapa do novo modal antes de avançar

Resultado:

- o popover de avatar continua implementado
- abrir e selecionar avatar continuam como base do fluxo novo
- o fechamento ao clicar fora ainda não ficou confiável
- o ponto permanece aberto e deve ser o primeiro ajuste do próximo chat

Status:
⏳ parcialmente avançado
⏳ ainda não concluído
✅ ponto exato de retomada definido

CHECKPOINTS SALVOS

commit:  
estabiliza avatars preset públicos no admin e widget

tag:  
v0.4.2-avatars-preset-publicos

commit:  
adiciona modal de nova avaliação e fallback de avatar no widget

tag:  
v0.4.3-modal-nova-avaliacao

commit:  
remove avatar aleatório no admin e define avatar padrão manual

tag:  
v0.4.4-avatar-manual-admin

commit:  
remove avatar aleatório no widget e define avatar padrão manual

tag:  
v0.4.5-avatar-manual-widget

commit:  
corrige captura do product id real no widget

tag:  
v0.1.6-widget-productid-priority-fix

commit:  
remove fallback incorreto de slug no product id do widget

tag:  
v0.1.8-widget-real-review-return-fixed

commit:  
corrige fluxo de reviews entre admin e widget por produto base

tag:  
v0.1.9-widget-reviews-por-produto-base

commit:  
remove log temporário do refresh do widget

tag:  
v0.1.10-widget-estavel-reviews-produto-base

commit:  
isola widget local de teste sem afetar producao

tag:  
v0.1.11-widget-teste-local-isolado

commit:  
substitui paginacao por preview com botao ver todas no widget

tag:  
v0.1.14-widget-preview-ver-todas

commit:  
adiciona modal de ver todas avaliacoes no widget

tag:  
v0.1.15-widget-modal-ver-todas

commit:  
salva alinhamento do resumo de avaliacoes no widget

tag:  
⏳ ainda não criada para este checkpoint

commit:  
refina botoes do widget e remove linha extra abaixo das reviews

tag:  
v0.1.17-widget-botoes-premium

commit local:  
salva checkpoint antes de mover avatar para primeira etapa do modal

tag:  
sem tag

commit local:  
salva checkpoint antes de transformar seletor de avatar em popover 3x3

tag:  
sem tag

RESULTADO

✔ avatar estabilizado em fluxo manual  
✔ avatar-default.png padronizado  
✔ widget preservado  
✔ admin preservado  
✔ modal de nova avaliação ativo no painel  
✔ avaliação anônima funcional no Modal pdp  
✔ resumo visual de avaliações estabilizado no widget  
✔ reviews do admin integradas corretamente ao site  
✔ list pdp mostrando todas as avaliações do produto em qualquer variante  
✔ variante continua informada no card da review  
✔ widget não aparece mais em categoria/listagem no site real  
✔ página teste local voltou a ser útil sem contaminar produção  
✔ núcleo do sistema segue estável  
✔ card da review refinado visualmente  
✔ feedback de sucesso no modal refinado  
✔ preview premium na PDP implantado  
✔ modal “Ver todas as avaliações” implantado e validado no site real  
✔ carregamento incremental implantado e validado no site real  
✔ topo do widget com alinhamento principal salvo  
✔ título “Avaliações” alinhado e salvo  
✔ botões principais do widget refinados e salvos  
✔ linha extra abaixo das reviews removida  
✔ modal novo em 2 etapas já existe como base local de evolução  
✔ avatar já foi movido para a primeira etapa  
✔ seletor de avatar em popover 3x3 já foi implantado localmente  
✖ fechamento do popover ao clicar fora ainda precisa de correção final

PRÓXIMO PASSO DEFINIDO

Passo imediato do próximo chat

Arquivo:  
backend/widget/widget.js

Ação:  
corrigir de forma confiável o fechamento do popover de avatar ao clicar fora dele

Objetivo:

- manter o popover 3x3 no avatar grande
- fechar o balão em qualquer clique fora do seletor
- não quebrar a abertura do popover
- não quebrar a seleção do avatar
- não quebrar a primeira etapa do modal novo
- estabilizar esse comportamento antes de seguir para refinamentos adicionais

Forma de execução desejada no próximo chat:
1 passo por vez  
sem refatoração grande  
ler sempre o bloco real atual antes de sugerir correção  
não inventar código não visto  
se houver risco médio, salvar antes  
testar localmente após a correção  
só depois decidir o próximo refinamento do modal

Depois desse passo:

- validar a experiência do modal em 2 etapas
- decidir se a segunda etapa receberá bloco opcional de foto/vídeo com incentivo
- retomar o roadmap principal de pós-compra automático + compra verificada

PRÓXIMOS PASSOS

PRIORIDADE ALTA
corrigir o fechamento do popover de avatar ao clicar fora  
estabilizar visual e interação do novo modal em 2 etapas  
integrar pedidos da Nuvemshop  
marcação de compra verificada  
link individual de avaliação  
agregação persistida  
distribuição de estrelas  
insights no backend  
badges reais baseados em regra  
reputação por produto

PRIORIDADE MÉDIA
dashboard avançado  
relatórios  
exportação  
notificações  
fila segura para emails pós-compra  
ambiente de testes mais controlado para widget sem impacto em produção  
aproximação mais fiel da página teste local ao layout real somente quando realmente útil  
bloco opcional de foto/vídeo com incentivo no fluxo do modal  
campo de e-mail opcional apenas se houver necessidade real de persistência

PRIORIDADE FUTURA
Shopify  
WooCommerce  
anti-spam  
CDN widget  
upload de imagens  
analytics  
A/B testing

MELHORIAS ESTRATÉGICAS
lazy loading  
pré-carregamento  
render parcial  
schema.org ⭐  
fallback API lenta  
cache CDN  
redução de egress  
persistência de agregados por produto

NOVAS IDEIAS
resumo automático (IA leve)  
ranking de características  
heatmap de sentimento  
detecção de fake review  
score de confiabilidade

RESUMO EXECUTIVO

AvaliaPro possui:
integração real  
dados confiáveis  
persistência estruturada  
API robusta  
widget premium  
UX avançada  
arquitetura SaaS escalável  
modal de nova avaliação no admin  
avatar público e manual padronizado entre admin e widget  
avaliação anônima funcional no widget  
resumo visual refinado e salvo no topo da list pdp  
list pdp consolidada por produto base  
checkpoint estável salvo após correção do fluxo admin ↔ widget  
ambiente local de teste do widget isolado da produção  
preview premium de avaliações na PDP  
modal de listagem completa de avaliações funcional e validado no site real  
carregamento incremental funcional e validado no site real  
topo do widget alinhado e salvo  
botões do widget refinados para visual mais discreto e premium  
nova base de modal em 2 etapas já iniciada localmente  
seletor de avatar já evoluiu para popover 3x3 ancorado no avatar principal  
pendência imediata clara e isolada no popover de avatar

Situação executiva real do momento

O sistema não possui bloqueador funcional crítico no fluxo de reviews entre admin e site.

O estado atual consolidado é:

- site real funcional
- categoria/listagem protegida contra render indevido do widget
- página teste local isolada para UI
- fluxo admin ↔ site preservado
- fluxo local ↔ produção separado
- navegação da PDP muito mais premium do que a paginação antiga
- modal de avaliações completo funcional no real
- botão “Carregar mais” validado no real
- topo do widget alinhado e salvo
- botões do widget refinados e salvos
- nova arquitetura do modal em andamento localmente
- ponto técnico imediato aberto: popover de avatar não fecha corretamente ao clicar fora

O ponto aberto principal no exato momento é:

- estabilizar o popover de avatar na primeira etapa do modal
- depois validar a experiência completa do modal em 2 etapas
- em seguida retomar o roadmap principal de pós-compra automático + compra verificada

STATUS FINAL

👉 fluxo admin → site corrigido  
👉 fluxo site → admin → site preservado  
👉 list pdp mostra todas as avaliações do produto em qualquer variante  
👉 variante comprada continua visível no card  
👉 widget não aparece mais em categoria/listagem no site real  
👉 página teste local está isolada da produção para UI  
👉 sistema está funcionalmente estabilizado  
👉 nova navegação de reviews já mudou a PDP para um padrão premium  
👉 modal “Ver todas as avaliações” funciona no site real  
👉 botão “Carregar mais” já foi validado em produção  
👉 alinhamento principal do topo do widget foi salvo  
👉 título “Avaliações” foi alinhado e salvo  
👉 botões principais do widget foram refinados e salvos  
👉 linha extra abaixo das reviews foi removida  
👉 novo modal em 2 etapas já foi iniciado localmente  
👉 avatar foi movido para a primeira etapa do modal  
👉 seletor de avatar em popover 3x3 já existe  
👉 próximo chat deve começar lendo o bloco real atual do seletor de avatar no backend/widget/widget.js  
👉 o primeiro objetivo do próximo chat é corrigir o fechamento do popover ao clicar fora  
👉 depois disso, validar o modal novo e só então seguir para os próximos refinamentos
