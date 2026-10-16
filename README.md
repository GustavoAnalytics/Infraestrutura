# Centro Logístico Rio Claro — Digital Twin por Bloco (v1.7)

# Centro Logístico Rio Claro — Digital Twin Simplificado

Aplicação estática offline em HTML5/CSS3/JavaScript/SVG para consolidar infraestrutura de rede, Wi-Fi, CFTV e GPON.

## Arquivos principais

- `index.html` — entrada da aplicação.
- `css/style.css` — design responsivo e impressão.
- `js/data.js` — dados consolidados e premissas.
- `js/map.js` — SVG/heatmap geométrico de Wi-Fi.
- `js/wifi.js` — módulo Wi-Fi e inventário de APs.
- `js/cftv.js` — CFTV, status e simulação ilustrativa de FOV.
- `js/topology.js` — topologia de rede/GPON.
- `js/app.js` — navegação, blocos, riscos, roadmap e relatório.
- `assets/maps/` — plantas/screen captures fornecidos.
- `assets/cftv/` — páginas renderizadas do PDF de CFTV.
- `assets/diagrams/` — diagramas de A5/A6, F, Core e GPON.
- `ANALISE_TECNICA.md` — diagnóstico consolidado.

## Uso

1. Extraia a pasta inteira.
2. Abra `index.html` no Chrome/Edge/Firefox.
3. Para ambiente corporativo, publique a pasta sem alterar os caminhos relativos.

## Importante

Cobertura Wi-Fi e FOV ilustrativo não substituem Site Survey, Spectrum Analysis, vistoria de CFTV, OTDR ou certificação de cabeamento.

## Revisão 0.2 — campos de visão sobre a planta

Abra **CFTV**, escolha a área e clique nos pontos. A planta e os cones agora usam
um único SVG; pan e zoom mantêm o alinhamento. A imagem original não foi alterada.
O bloco A usa a planta anexada pelo usuário. Demais áreas usam a região da planta
nas páginas originais do PDF, sem deformação.

- Cones, marcas e IDs têm controles independentes; “Só selecionada” isola um FOV.
- Direção, abertura e extensão podem ser ajustadas no painel. Extensão usa unidades
  da imagem (u.g.), **não metros**; não há escala calibrada disponível.
- Para corrigir posição, marque “Permitir arrastar marca”. Para completar a leitura,
  use “Adicionar marca na planta”. “Desfazer ajuste” reverte a última alteração.
- Ajustes são salvos no navegador. Exporte o JSON para transferir para outra máquina
  ou conservar fora do navegador; importe-o no mesmo projeto.
- “Imprimir mapa / PDF” enquadra a área inteira e inclui a legenda e as premissas.
- O status individual começa como “A validar”: a digitalização não atribui os totais
  OK/M/N do documento a câmeras específicas por suposição.
- Bloco B: planta disponível, sem digitalização inicial de câmeras, porque a fonte
  não permite reconhecer posições com segurança. Não há geração automática em grade.
- A leitura é parcial nas demais plantas. Quantidade digitalizada não substitui o
  inventário documental. IDs REF são locais da interface, não patrimoniais.
- As camadas são as mesmas nos cenários atual/proposto: não há reposicionamento ou
  aquisição presumidos. Editar o desenho não modifica os indicadores do inventário.

Arquivos novos: `js/cftv-coordinates.js` (coordenadas e fontes), `js/cftv-map.js`
(SVG e interação). `js/cftv.js` contém a tela e a persistência dos ajustes.

Os cones são hipóteses geométricas editáveis: não calculam oclusão, DORI, lente,
IR ou pontos cegos reais. Validar posições, direções e lente em campo antes de
usar o desenho para dimensionar ou comprar equipamentos.

## Revisão 0.3 — Wi-Fi sobre as plantas

Na aba **Wi-Fi**, as áreas A5, A6, F, A10 e G1–G5 agora mostram os APs e faixas
sobre a imagem de origem, no mesmo sistema de coordenadas. Foram preservados o
inventário (87 APs nessas áreas), IPs, MACs e controladores e toda a revisão CFTV.

- A5/A6/G: plantas originais; F/A10: região da planta nos diagramas fornecidos.
- A5/A6/G: distribuição estimada. Em F/A10, leitura aproximada dos ícones numerados;
  o Aruba 14 em F foi estimado porque não está legível no desenho.
- Selecione um AP; permita arrastar ou use “Posicionar AP selecionado” para ajustar.
  Essas ações não adicionam APs nem mudam a contagem do inventário.
- Camadas de faixas, heatmap, área fora dos raios, IDs e AP selecionado; zoom, pan,
  tela cheia e impressão/PDF com premissas visíveis.
- Sem calibração, raios em **u.g. (unidades gráficas)**, nunca metros presumidos.
- Para calibrar: clique “Marcar dois pontos”, marque as duas extremidades de uma
  dimensão conhecida na planta, informe o comprimento em metros e “Aplicar escala”.
  A conversão usa escala uniforme; confirme que a fonte não está deformada. Os raios
  gráficos não mudam ao calibrar: passam a ser expressos em metros. Ajuste-os em
  “Aplicar raios” depois. Valores devem ser positivos e crescentes.
- Ajustes são salvos no navegador; exporte/importe **CLRC_Ajustes_WiFi.json** para
  transferir. JSON Wi-Fi e JSON CFTV são distintos. “Desfazer ajuste” reverte edições.

Percentuais são a proporção de amostras dentro da região tracejada em cada faixa
de distância. São geométricos, sem RSSI, SNR, capacidade ou propagação por obstáculos.
A região de análise não é uma barreira de RF; em G suas divisões internas são
estimadas. O desenho não comprova cobertura ou pontos cegos e não substitui survey.

Arquivos: `js/wifi-plans.js` (fontes, regiões, posições), `js/map.js` (SVG e modelo
geométrico), `js/wifi.js` (controles, escala, persistência e inventário).

## Revisão 0.4 — novas plantas do Bloco A (03/10/2026)

- As sete imagens fornecidas (A1–A7) estão em `assets/maps/bloco-a/` e são
  compartilhadas pelas telas Wi-Fi, CFTV e Plantas / Blocos. As imagens não foram
  redesenhadas nem alteradas. `js/bloco-a-plans.js` centraliza dimensões e contornos.
- As áreas exibidas em Plantas / Blocos acompanham os rótulos novos: A1 1.656 m²,
  A2 2.354 m², A3 3.872 m², A4 3.070 m², A5 2.550 m², A6 3.690 m² e A7 2.200 m².
  A5 passa a indicar 50 × 64,5 m. Valores são transcrições da fonte; divergências
  entre área escrita e produto de cotas não foram resolvidas por suposição.
- Wi-Fi: mantidos os 15 APs A5 e 17 APs A6, com IDs, IPs e MACs anteriores.
  As posições estimadas e o contorno de análise foram reajustados. Os inventários
  de A1–A4 e A7 não foram fornecidos: a tela informa N/D e não simula cobertura.
- Ajustes Wi-Fi antigos de A5/A6 não são aplicados às novas imagens. O campo
  `mapRevision` protege contra reutilizar coordenadas, raios e calibrações antigas.
  Ajustes das demais áreas continuam compatíveis. JSON antigo é aceito, mas suas
  áreas com revisão de mapa incompatível são ignoradas; a base nova é mantida.
- CFTV: selecione Bloco A e uma planta A1–A7. Essas novas fontes não contêm
  marcações de câmera e abrem sem posições presumidas. O “Levantamento anterior”
  conserva a planta e suas 36 referências gráficas, inclusive ajustes locais.
  Para reaproveitar uma referência, escolha seu ID na lateral, clique “Posicionar
  referência nesta planta” e clique no local conferido. Ajuste direção, abertura
  e extensão. O mesmo ID fica indisponível para nova associação em outro galpão;
  seu desenho histórico permanece no levantamento anterior. Desfazer reverte a
  associação. As novas posições são salvas e exportadas no JSON CFTV.
- O inventário documental de 42 câmeras do Bloco A não foi dividido por galpão.
  O total do projeto continua 197 câmeras e 87 APs conhecidos.

Verificação: navegação das sete plantas em ambos os módulos, APs dentro dos
contornos, preservação do inventário, posicionamento de referência CFTV,
edição de direção, persistência após recarga, exportação/importação JSON,
consulta às demais áreas, largura de tablet e ausência de erros JavaScript.

## Revisão 0.5 — plantas B1–B5 (03/10/2026)

As cinco imagens enviadas substituem as plantas do Bloco B em Wi-Fi, CFTV e
Plantas / Blocos. Os arquivos originais estão em `assets/maps/bloco-b/` e a
configuração compartilhada em `js/bloco-b-plans.js`. Cotas, docas, marquises,
administração e sanitários permanecem visíveis no raster original.

Áreas transcritas dos rótulos: B1 2.345 m²; B2, B3 e B4 1.605 m² cada;
B5 2.275 m². Não foi inferida escala automática nem reconciliada a divergência
entre áreas escritas e produtos das cotas.

- Wi-Fi: seletores B1–B5, inventário N/D e cobertura não calculada, porque não
  foram fornecidos inventário ou posições de APs. Não significa ausência de Wi-Fi.
- CFTV: ao escolher Bloco B, abre B1; selecione B2–B5 na segunda linha.
  As fontes novas não têm marcações de câmera. Adicione marcas após conferência.
  O levantamento anterior continua acessível; eventuais referências cadastradas
  pelo usuário nele podem ser posicionadas nas novas plantas pelo ID.
- Mantido o inventário consolidado B: 18 OK, 0 M, 1 N, total 19. Nenhuma divisão
  por galpão foi presumida. Preservados os mapas A, os ajustes existentes e os
  totais do projeto: 87 APs conhecidos e 197 câmeras no inventário documental.

Validação: B1–B5 em ambos os módulos, cadastro e persistência de marca CFTV,
exportação/importação de ajustes, zoom, impressão, layout de tablet e regressão A.

## Revisão 0.6 — plantas dos Blocos C e D (03/10/2026)

As oito imagens recebidas substituem os mapas C/D nas telas Wi-Fi, CFTV e
Plantas / Blocos. Há seletores individuais C1–C5 e D1–D5. As imagens C2/C3 e
C4/C5 são compartilhadas: C2 e C4 ficam abaixo; C3 e C5 ficam acima. A fonte
completa é preservada e a região de análise Wi-Fi distingue cada galpão.
As imagens inclinadas de D mantêm a orientação original.

- Arquivos originais em `assets/maps/bloco-c/` e `assets/maps/bloco-d/`.
  As configurações compartilhadas ficam em `js/bloco-c-plans.js` e
  `js/bloco-d-plans.js`.
- Áreas transcritas dos rótulos: C1 4.495 m²; C2–C5 2.000 m² cada;
  D1 1.594 m²; D2/D3 1.441 m² cada; D4 1.688 m²; D5 2.580 m².
  Divergências entre área escrita e produto das cotas não foram reconciliadas.
- Wi-Fi: inventário N/D e cobertura não calculada em C/D, pois essas fontes
  não fornecem APs nem posições. Não implica ausência física de Wi-Fi.
- CFTV: as novas plantas abrem sem marcações presumidas. O “Levantamento
  anterior” conserva os mapas e as 13 referências gráficas C e 25 D, incluindo
  eventuais ajustes já salvos. Selecione um ID e use “Posicionar referência nesta
  planta” para conferir seu local no novo mapa. Direção/abertura/extensão são
  ajustáveis; referências históricas continuam preservadas na imagem anterior.
- Mantidos os totais documentais: C = 13 OK + 4 M + 0 N = 17;
  D = 20 OK + 5 M + 0 N = 25. Não há divisão confirmada por galpão.
  O projeto mantém 197 câmeras e 87 APs conhecidos; mapas A/B preservados.

Verificação: dez seletores C/D nos dois módulos, referências CFTV históricas,
associação/edição/desfazer, persistência, JSON, imagens compartilhadas, regiões
Wi-Fi, impressão, layout de tablet e navegação dos mapas A/B.

## Revisão 0.7 — plantas E1–E11 (03/10/2026)

As onze imagens fornecidas substituem os mapas do Bloco E nas telas Wi-Fi,
CFTV e Plantas / Blocos. Cada galpão possui seletor próprio, inclusive E10/E11.
Foram preservados os arquivos originais, suas inclinações, cotas, docas,
marquises, rampas, sanitários e administração.

- Arquivos em `assets/maps/bloco-e/`; configuração compartilhada em
  `js/bloco-e-plans.js`. Áreas transcritas: E1 2.000 m², E2–E10 1.570 m²
  cada e E11 1.680 m². Removida a pendência antiga de plantas ausentes E6–E8.
  Não foi presumida equivalência entre a área impressa e o produto das cotas.
- Wi-Fi: inventário N/D e abrangência não calculada para E, porque as fontes
  não indicam APs nem posições. Isso não significa ausência física de Wi-Fi.
- CFTV: as novas plantas não contêm marcações. O seletor “Levantamento anterior”
  conserva a planta E e suas 24 referências gráficas, incluindo ajustes locais.
  Selecione uma referência existente, clique “Posicionar referência nesta planta”
  e indique o local conferido; ajuste direção, abertura e extensão do cone.
- O inventário documental E continua 18 OK, 5 M e 1 N = 24 pontos no grupo.
  Não há distribuição confirmada por galpão. Mantidos 197 pontos CFTV e 87 APs
  conhecidos no projeto; mapas A–D preservados.

Verificação: navegação E1–E11 em Wi-Fi/CFTV/Plantas, identidade das imagens,
associação de referência em E10/E11, edição/desfazer/persistência/JSON,
impressão, layout de tablet e preservação dos mapas A–D.

## Revisão 0.8 — plantas F1–F8 (04/10/2026)

As oito plantas enviadas passam a ser exibidas individualmente em Wi-Fi, CFTV
 e Plantas / Blocos. Os arquivos de imagem foram preservados integralmente em
`assets/maps/bloco-f/`; a configuração comum está em `js/bloco-f-plans.js`.

Áreas transcritas dos rótulos novos: F1 1.512 m², F2 1.052 m², F3 1.242 m²,
F4 1.372 m², F5 1.537 m², F6/F7 1.526 m² cada e F8 2.880 m². As cotas e
áreas escritas continuam sujeitas a conferência; não houve escala automática.

- Wi-Fi: os 19 Aruba e 10 UniFi continuam em “F · inventário geral”, com o
  diagrama e ajustes anteriores. Essa fonte de 50 × 80 m não foi vinculada por
  suposição a F1, F2 ou outro galpão. As novas plantas F1–F8 informam inventário
  individual N/D e não simulam cobertura sem a distribuição confirmada dos APs.
  Não foram duplicados APs nem alterado o total conhecido do projeto (87).
- CFTV: novas plantas F1–F8 sem posições presumidas. “Levantamento anterior”
  conserva o mapa F e suas 21 referências gráficas, incluindo ajustes locais.
  As referências podem ser posicionadas individualmente nas novas plantas;
  direções, aberturas e extensões dos cones precisam de conferência.
- Inventário documental F mantido: 15 OK + 11 M + 0 N = 26 pontos no grupo,
  sem divisão confirmada por galpão. Projeto mantém 197 pontos documentais.
- Preservados os mapas A–E, as demais áreas e o inventário existente.

Verificação: oito plantas F nos três módulos, inventário geral com 29 APs,
referências históricas CFTV, associação de marca, salvamento e JSON, impressão,
layout de tablet e navegação dos blocos anteriores.


## Revisão 0.9 — plantas G1–G7 (04/10/2026)

- As sete plantas anexadas substituem os mapas do Bloco G nas abas Wi-Fi, CFTV e Blocos. Imagens originais preservadas com suas cotas e áreas.
- Wi-Fi: preservados IDs e inventários de G1 (6 UniFi), G2 (3), G3 (2), G4 (3) e G5 (3), totalizando 17 APs. Posições reajustadas às novas plantas são estimadas e editáveis; cobertura geométrica não é medição. G6/G7 permanecem com inventário N/D e sem cobertura calculada. Total geral preservado: 87 APs.
- Ajustes de posição, raios e calibração das imagens antigas de G1–G5 não são reaplicados às novas imagens. Ajustes das demais plantas mantêm sua revisão. Calibre cada nova planta antes de interpretar distâncias em metros.
- CFTV: G1–G7 disponíveis para posicionar referências e ajustar cones. As imagens fornecidas não contêm marcações de câmeras. O levantamento anterior conserva suas 19 referências, sem atribuição presumida a cada galpão. Inventário do Bloco G preservado: 6 OK, 11 manutenção e 2 inativas, 19 no total.
- Áreas atualizadas conforme os rótulos: G1 1.506 m²; G2 1.040 m²; G3 1.218 m²; G4 1.620 m²; G5 1.873 m²; G6/G7 2.075 m² cada.
- Mantidas as atualizações dos Blocos A–F.


## Revisão 0.10 — plantas H1–H3 (04/10/2026)

- Plantas H1, H2 e H3 adicionadas às abas Wi-Fi e CFTV e atualizadas em Plantas/Blocos. Arquivos originais preservados com cotas e rótulos.
- Áreas conforme as imagens: H1 2.572 m², H2 1.510 m² e H3 1.150 m². As áreas impressas não foram recalculadas a partir das cotas.
- Wi-Fi: inventário do Bloco H não fornecido, exibido como N/D e sem cobertura calculada.
- CFTV: inventário do H não fornecido; nenhuma câmera foi presumida. A opção de adicionar marcas, ajustar cones e salvar/exportar posições está disponível nas três plantas. Não há levantamento anterior de câmeras do H para associar.
- Totais documentados preservados: 87 APs e 197 pontos CFTV. O H não é contabilizado como zero câmeras. Atualizações A–G mantidas.


## Revisão 0.11 — editor de APs, racks e fibra

Na aba **Wi-Fi**, escolha uma planta e use **Montar infraestrutura**:

1. **+ AP**: escolha Grandstream, UniFi/Ubiquiti ou Aruba; informe modelo (opcional), raio externo e cor. Clique em **Inserir AP no mapa**, depois na posição desejada.
2. Selecione um AP no mapa ou na lista para alterar marca, modelo, raio e cor. Use **Aplicar ao selecionado**. Para mover, habilite arrastar ou use **Posicionar AP selecionado**. **Remover do mapa** exclui o item do desenho; **Desfazer ajuste** recupera a ação.
3. **+ Rack**: clique na planta. Selecione para renomear, alterar a cor, reposicionar ou remover.
4. **Desenhar fibra**: clique em cada vértice do trajeto e pressione **Concluir fibra**. Selecione um trajeto para renomear, recolorir, redesenhar ou remover. **Cancelar / selecionar** ou Esc descarta o desenho ainda não concluído.
5. Calibre a planta com dois pontos e uma distância conhecida para informar raios e visualizar comprimentos em metros. Sem calibração, valores usam unidades gráficas.
6. Os ajustes são salvos no navegador por planta. Use **Exportar ajustes JSON** para guardar ou transferir o desenho e **Importar ajustes** para restaurá-lo. JSON v2 inclui APs personalizados, raios individuais, racks e fibra; JSON v1 continua aceito.

Cores padrão: Grandstream ciano #0891b2; UniFi azul #2563eb; Aruba laranja #ea580c; racks violeta #7c3aed; fibra rosa #db2777 com contorno branco. Círculos usam a cor do AP. Faixas internas correspondem a 50% e 75% do raio externo individual. APs sem raio individual usam os três raios padrão da área. Círculos são exibidos sobre a imagem; percentuais e heatmap referem-se à região tracejada.

As três opções representam marcas; o alcance real depende do modelo, ambiente e instalação. O raio é uma hipótese manual, não um valor técnico atribuído à marca. Comprimentos de fibra são do trajeto desenhado, sem folgas de instalação. Cadastros manuais não alteram o levantamento original de 87 APs e 197 pontos CFTV. Plantas A–H preservadas.

## Revisão 1.0 — Mapa Inteligente de Infraestrutura (14/10/2026)

Foi adicionada a nova tela **Digital Twin**, integrada ao menu principal, para reunir em um único mapa por bloco:

- Access Points, câmeras, alarmes/sensores, racks, switches, ONUs, OLTs, nobreaks e entradas de internet;
- drag-and-drop de equipamentos sobre a planta;
- cobertura animada de Wi-Fi, campo de visão de câmeras, alcance noturno e área de sensores;
- heatmaps Wi-Fi, CFTV, Segurança e Integrado;
- traçado manual de fibra principal e redundante com animação de fluxo;
- camadas independentes, VLANs, nomes, coberturas e pontos cegos;
- estados Instalado, Projetado e Desativado;
- painel lateral de cadastro técnico específico por tipo de equipamento;
- rastreamento lógico da conexão até Core/Internet;
- validação do mapa, controle de versão e revisão automática após alterações;
- visão geral consolidada de todos os blocos;
- diagnóstico automático de infraestrutura e exportação CSV;
- busca global por ID, nome, IP, MAC, VLAN, patrimônio ou switch;
- persistência em `localStorage`, além de importação/exportação da base em JSON;
- modo apresentação para Diretoria, auditorias, clientes e fornecedores.

Arquivo principal da evolução: `js/digital-twin.js`.

### Como usar

1. Abra `index.html`.
2. No menu lateral, clique em **Digital Twin**.
3. Escolha o bloco.
4. Selecione um equipamento na caixa **Adicionar infraestrutura** e clique na planta para posicioná-lo.
5. Arraste qualquer equipamento para ajustar a posição.
6. Para fibra, escolha **Traçar fibra principal** ou **Traçar redundância**, clique nos vértices e finalize em **Concluir traçado**.
7. Clique em qualquer equipamento para editar seus dados técnicos.
8. Quando o mapa estiver conferido, use **Validar mapa**. Uma alteração posterior marca o mapa para revisão e inicia nova versão.

> Importante: heatmaps, raios de cobertura, campos de visão e pontos cegos continuam sendo representações geométricas para planejamento. A homologação real depende de Site Survey, medições de RF, vistoria CFTV, validação de sensores, OTDR e conferência física das rotas.


## Atualização v1.1 — Mapa Geral do Centro Logístico Rio Claro

Esta versão passou a incluir um novo bloco especial no Digital Twin:

- **Centro Logístico Rio Claro** (identificador técnico: `CLRC`)

Principais ajustes:

- utilização do **mapa aéreo geral** do complexo como base visual do bloco `CLRC`;
- possibilidade de **lançar pontos gerais** diretamente sobre o mapa completo do Centro Logístico;
- inclusão de posicionamento para **câmeras, APs, alarmes, racks, switches, OLT, ONU, nobreaks e links de internet** no mapa geral;
- suporte ao desenho de **fibra principal** e **fibra redundante** também no mapa geral;
- inclusão de uma infraestrutura macro inicial de referência (core, internet, OLT, rack, switch, nobreak, fibra e pontos de segurança) para facilitar o preenchimento;
- o Digital Twin agora abre por padrão no bloco **Centro Logístico Rio Claro**, permitindo começar pelo mapa completo do site.

### Como usar

1. Abra **Digital Twin**.
2. No seletor de bloco, escolha **Centro Logístico Rio Claro**.
3. Use a barra lateral para adicionar:
   - Access Point
   - Câmera
   - Alarme / Sensor
   - Rack
   - Switch
   - ONU
   - OLT
   - Nobreak
   - Entrada de Internet
4. Clique no mapa para posicionar os pontos.
5. Use **Traçar fibra principal** ou **Traçar redundância** para desenhar as rotas.
6. Clique em um item para editar dados técnicos, VLAN, direção de câmera, alcance e observações.


## Atualização v1.2 — Cenário previsto automático por bloco

Foi adicionada uma camada de **planejamento previsto editável** para apoiar a definição da distribuição ideal de infraestrutura em cada galpão/bloco.

### O que o cenário previsto faz

Ao clicar em **Aplicar neste bloco** dentro do Digital Twin, o sistema gera automaticamente um cenário editável contendo:

- **APs** distribuídos em grade interna para cobertura contínua da operação de coletores;
- **câmeras** distribuídas ao redor do perímetro e pontos de circulação para redução de pontos cegos;
- **rack** técnico por bloco;
- **switch(es) PoE** dimensionados conforme o número de endpoints;
- **ONU** prevista para atendimento GPON do bloco;
- **nobreak** para a infraestrutura local;
- **fibra principal e fibra redundante** desenhadas até o rack.

### Critérios usados

- aproveitamento das **áreas dos galpões/blocos** cadastradas no projeto;
- quantidades de AP já propostas anteriormente para diversos blocos (A, B e C, quando existentes);
- distribuição com foco em **operação WMS/coletores**, priorizando cobertura contínua e estável;
- cenário gerado como **projetado**, preservando a infraestrutura instalada e permitindo ajustes manuais.

### Recursos novos

- **Aplicar neste bloco**
- **Aplicar em todos os blocos**
- **Limpar cenário deste bloco**
- quadro-resumo com:
  - quantidade de APs
  - quantidade de câmeras
  - switches previstos
  - rack
  - ONU
  - fibras previstas

> Observação: o cenário é uma base técnica editável. Todos os itens gerados podem ser reposicionados, renomeados e ajustados após vistoria, Site Survey e validação em campo.


## Atualização v1.3 — Planta Geral completa do Centro Logístico

Foi adicionada uma **segunda visão geral do Centro Logístico Rio Claro**, além da visão aérea já existente.

### Novas visões gerais

No seletor do Digital Twin agora existem:

- **Centro Logístico Rio Claro — Visão Aérea**
- **Centro Logístico Rio Claro — Planta Geral**

A nova **Planta Geral** usa a planta completa do CLRC e permite posicionar diretamente sobre ela:

- Access Points;
- Câmeras;
- Alarmes e sensores;
- Racks;
- Switches;
- ONUs;
- OLTs;
- Nobreaks;
- Entradas de internet;
- Fibra principal;
- Fibra redundante.

A visão funciona com as mesmas ferramentas do Digital Twin: drag-and-drop, camadas, coberturas, cone de câmera, alcance noturno, heatmap, validação, histórico, busca e exportação/importação JSON.

A **Planta Geral** foi mantida inicialmente sem equipamentos automáticos para que represente a infraestrutura real do complexo conforme os pontos forem confirmados e cadastrados. A distribuição prevista automática permanece disponível nas plantas individuais de cada bloco.


## Atualização v1.4 — Cenário automático também nas visões gerais

Esta versão amplia o planejamento automático para além dos blocos individuais.

### Novidade principal

Agora o botão de aplicação de cenário funciona também em:

- **Centro Logístico Rio Claro — Visão Aérea**
- **Centro Logístico Rio Claro — Planta Geral**

### O que acontece nessas visões

Ao aplicar o cenário em uma visão geral, o sistema gera automaticamente uma **distribuição miniaturizada e consolidada** de toda a infraestrutura prevista do complexo, incluindo:

- APs
- câmeras
- alarmes/sensores
- racks
- switches
- ONUs
- nobreaks
- links de internet
- fibra principal
- fibra redundante

### Características da nova lógica

- os ícones são criados em **escala menor**, para caber corretamente no mapa completo;
- a disposição é **adaptada ao tamanho da imagem**, visando leitura macro da operação;
- a visão geral passa a mostrar a infraestrutura distribuída por áreas/blocos do complexo;
- os elementos continuam **100% editáveis** após a geração.

### Novos comandos na interface

- **Aplicar nesta visão geral**
- **Aplicar em tudo**
- **Limpar esta visão**

### Objetivo

Entregar uma visão executiva e técnica do CLRC, permitindo enxergar em uma única tela a posição consolidada de rede, Wi‑Fi, CFTV, alarmes e fibra — sem perder a possibilidade de detalhamento por bloco.


## Atualização v1.5 — HTML com mapas + SVG

Esta versão incorpora o arquivo vetorial **Mapeamento de câmeras CLRC.svg** ao projeto e substitui a Planta Geral pela imagem mais recente fornecida.

### Arquivos principais

- `index.html` — aplicação completa existente.
- `mapa-mestre-clrc.html` — nova visão HTML dedicada ao mapa mestre.
- `assets/maps/planta-geral-clrc-atualizada.png` — planta geral atualizada.
- `assets/maps/mapeamento-cameras-clrc.svg` — fonte vetorial SVG original.

### Mapa Mestre

O novo HTML permite alternar a planta geral/visão aérea, sobrepor a base SVG, adicionar APs, câmeras, alarmes, racks, switches e ONUs, desenhar fibra e exportar os pontos em JSON.

## Atualização v1.6 - Mapas completos por bloco (PDF)

O Digital Twin deixou de usar A1/A2/A3 etc. como unidade principal de navegação. Agora o detalhamento é feito por **bloco completo**, utilizando os PDFs técnicos fornecidos:

- Centro Logístico - Geral (`CL-Model.pdf`)
- Bloco A
- Bloco B
- Bloco C
- Bloco D
- Bloco E
- Bloco F
- Área Comum
- Portaria

### O que mudou

- os PDFs foram renderizados em alta resolução e recortados para ampliar a área técnica útil;
- a seleção do Digital Twin agora é por bloco, e não por subbloco;
- os pontos de CFTV existentes continuam visíveis no desenho original;
- novos APs, alarmes, racks, switches, ONUs, nobreaks e fibras podem ser posicionados sobre a planta;
- equipamentos são redimensionados proporcionalmente ao tamanho de cada mapa;
- movimentação manual é limitada à área útil configurada para cada planta, evitando que os equipamentos ultrapassem o desenho;
- o cenário previsto calcula quantidade e distribuição de racks/switches/ONUs a partir do número de endpoints e da geometria do bloco;
- todas as posições geradas podem ser alteradas manualmente;
- os PDFs originais também estão incluídos em `assets/source-pdfs/`.

### Cenário previsto

O botão **Gerar cenário do bloco** cria automaticamente:

- APs para a operação de coletores/WMS;
- racks distribuídos;
- switches PoE gerenciáveis;
- ONUs GPON;
- nobreaks;
- alarmes/sensores;
- fibra principal e fibra redundante para cada rack.

A geração é uma base de engenharia editável. O projeto final deve ser validado com levantamento físico, Site Survey de RF, metragem real de cabeamento e testes de CFTV/fibra.


## Atualizações v1.7
- Substituídas as imagens dos blocos A, B, C, D, E, F, Área Comum e Portaria pelas versões completas fornecidas pelo usuário.
- Ajustado o enquadramento inicial para mostrar a imagem inteira, sem cortes.
- Navegação de zoom e pan passou a respeitar os limites do mapa.
- Mantida a edição de equipamentos com adaptação proporcional ao tamanho de cada bloco.
