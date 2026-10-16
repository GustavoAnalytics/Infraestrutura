# Centro Logístico Rio Claro — Auditoria e Projeto de Infraestrutura

**Revisão:** 0.1 — 02/10/2026  
**Escopo:** Rede, Wi-Fi, CFTV, GPON/fibra, alta disponibilidade e documentação.  
**Regra de interpretação:** informações sem evidência suficiente são classificadas como **ESTIMADO** ou **NECESSITA VALIDAÇÃO EM CAMPO**.

## 1. Inventário encontrado

### Wi-Fi com quantidade conhecida

| Área | Fabricante | Quantidade | Situação da posição |
|---|---|---:|---|
| A5 | Grandstream | 15 | Diagrama disponível; overlay do sistema é normalizado/estimado |
| A6 | Grandstream | 17 | Diagrama disponível; overlay do sistema é normalizado/estimado |
| F | Aruba | 19 | Diagrama disponível |
| F | UniFi | 10 | Diagrama disponível |
| A10 Administrativo | UniFi | 9 | Diagrama 3 × 3 disponível |
| G1 | UniFi | 6 | Quantidade informada; coordenadas faltantes |
| G2 | UniFi | 3 | Quantidade informada; coordenadas faltantes |
| G3 | UniFi | 2 | Quantidade informada; coordenadas faltantes |
| G4 | UniFi | 3 | Quantidade informada; coordenadas faltantes |
| G5 | UniFi | 3 | Quantidade informada; coordenadas faltantes |

**Total com quantidade conhecida: 87 APs.**

### CFTV — matriz do levantamento

| Área | OK | M | N | Total | % M |
|---|---:|---:|---:|---:|---:|
| Bloco A | 36 | 2 | 4 | 42 | 4,8% |
| Bloco B | 18 | 0 | 1 | 19 | 0,0% |
| Bloco C | 13 | 4 | 0 | 17 | 23,5% |
| Bloco D | 20 | 5 | 0 | 25 | 20,0% |
| Bloco E | 18 | 5 | 1 | 24 | 20,8% |
| Bloco F | 15 | 11 | 0 | 26 | 42,3% |
| Bloco G | 6 | 11 | 2 | 19 | 57,9% |
| Estacionamento Caminhões | 8 | 2 | 15 | 25 | 8,0% |
| **TOTAL** | **134** | **40** | **23** | **197** | **20,3%** |

O levantamento orienta concentrar o orçamento na ativação/restauração dos **40 pontos M**, sem assumir que isso significa comprar 40 câmeras novas.

### Core, rede e fibra identificados nos diagramas

- ALTLink — 1 Gbps, principal, IP dedicado no diagrama.
- Desktop Telecom — 600 Mbps, secundário, IP dedicado no diagrama; failover deve ser testado.
- MikroTik RB5009 — Core / Firewall / VPN.
- MikroTik RB2011 — indicado como reserva.
- VLAN Gerência — 10.132.0.0/16.
- VLAN Dados — 10.130.0.0/16.
- VLAN Guest — 10.131.0.0/16.
- VLAN CFTV Nova — 10.134.0.0/16.
- VLAN CFTV Legada — 192.168.10.0/23.
- OLT Datacom DM4612 — gerenciamento 10.133.12.5 no diagrama da camada óptica.
- Total de 33 ONUs na camada GPON documentada.
- ONU-G-REDE1 aparece marcada como **crítica**.
- Outros diagramas citam Datacom DM-S300/DM4270; a relação entre os modelos deve ser confirmada em campo.
- Rack 1: switches Aruba, conversores Intelbras, OLT, NVR 1 a NVR 6.
- Rack 2: links, RB5009, Aruba/HP, Cisco SPA8000, Synology 40 TB, servidores HP/Dell e UPS/PDU.

## 2. Blocos identificados e áreas visíveis

Foram estruturados **45 subblocos com área legível**, somando **84.186 m²** apenas nas plantas/imagens onde a metragem aparece claramente. Esse valor **não representa a área total do Centro Logístico**.

### Bloco A
A1 1.450 m²; A2 2.250 m²; A3 3.200 m²; A4 2.300 m² + mezanino 700 m²; A5 2.550 m²; A6 3.690 m².

### Bloco B
B1 2.270 m²; B2 1.470 m²; B3 1.470 m²; B4 1.470 m²; B5 2.270 m².

### Bloco C
C1 4.186 m²; C2 2.000 m²; C3 2.000 m²; C4 2.000 m²; C5 2.000 m².

### Bloco D
D1 1.594 m²; D2 1.441 m²; D3 1.441 m²; D4 1.310 m²; D5 2.580 m².

### Bloco E
E1 2.000 m²; E2–E10 1.570 m² cada; E11 1.680 m² (rótulos das plantas de 03/10/2026).  
Plantas individuais E1–E11 disponíveis; E6, E7 e E8 incluídos na revisão 0.7.

### Bloco F
F1 1.512 m²; F2 1.052 m²; F3 1.242 m²; F4 1.372 m²; F5 1.537 m²; F6 1.526 m²; F7 1.526 m²; F8 2.880 m² (rótulos das plantas de 04/10/2026).

### Bloco G
G1 1.506 m²; G2 1.040 m²; G3 1.218 m²; G4 1.620 m²; G5 1.873 m²; G6 2.075 m²; G7 2.075 m² (áreas impressas nas plantas de 04/10/2026).

### Bloco H
H1 2.572 m²; H2 1.510 m²; H3 1.150 m² (áreas impressas nas plantas de 04/10/2026).

## 3. APs por bloco — situação confirmada

- A5: 15 Grandstream.
- A6: 17 Grandstream.
- F: 19 Aruba + 10 UniFi = 29 APs.
- G1: 6 UniFi.
- G2: 3 UniFi.
- G3: 2 UniFi.
- G4: 3 UniFi.
- G5: 3 UniFi.
- A10 Administrativo: 9 UniFi.
- A1-A4, B, C, D, E, G6-G7 e H: quantidade atual de APs não confirmada nas fontes consolidadas.

O sistema guarda A1-A4 como um **rascunho TO BE anterior** (6/12/12/8 U7 Lite), sem misturar esses números no inventário atual.

## 4. Câmeras por bloco

O PDF fornece quantidade por **macrobloco**, não por subbloco. A aplicação mantém os mapas originais do documento para preservar as marcações. As coordenadas das anotações não foram automaticamente convertidas em pontos digitais para evitar falsa precisão.

## 5. Informações confirmadas

1. Quantidades CFTV OK/M/N por macrobloco e estacionamento.
2. 40 pontos CFTV classificados como manutenção e foco do orçamento.
3. Quantidades de APs informadas em A5, A6, F, A10 e G1-G5.
4. Dimensão 50 × 80 m do Barracão F no diagrama Wi-Fi.
5. A5 com referência de 50 × 80 m em bounding box e área de 2.550 m²; A6 com 80 m de comprimento e área 3.690 m².
6. Dois links de internet no diagrama de A10/Core.
7. RB5009 como core/firewall/VPN e RB2011 como reserva.
8. Redes/VLANs documentadas.
9. Camada GPON com 33 ONUs e OLT 10.133.12.5.
10. ONU-G-REDE1 sinalizada crítica.

## 6. Informações faltantes

- Altura, canal, potência e orientação de APs.
- RSSI, SNR, utilização de canal, roaming e capacidade real.
- Modelos exatos de vários APs e switches.
- Posição exata dos APs do setor G.
- Lente, distância focal, altura, direção e IR de cada câmera.
- Coordenadas estruturadas das câmeras.
- Capacidade, retenção, bitrate e distribuição por NVR.
- Rotas físicas de ALTLink/Desktop e das fibras internas.
- Portas usadas/livres e PoE budget dos switches.
- Carga e autonomia dos nobreaks.
- Modelos/seriais/firmware de ativos centrais.
- Conferir em campo as cotas e áreas impressas nas novas plantas E1–E11.

## 7. Premissas adotadas

- Círculos de cobertura Wi-Fi são apenas simulação geométrica ajustável.
- A cobertura não é apresentada como RSSI real.
- Para áreas com largura/altura conhecidas, o sistema calcula uma cobertura geométrica de referência; em áreas sem escala, o indicador fica N/D.
- O campo de visão de câmeras reais fica **desativado por padrão**. Existe uma simulação ilustrativa apenas para demonstrar como a ferramenta funcionará depois do cadastramento de lente/ângulo/altura/direção.
- Rascunhos de melhoria não alteram os números do AS IS.

## 8. Possíveis falhas identificadas

### Críticas

- F e G somam 22 pontos CFTV em manutenção; G tem 57,9% dos pontos classificados como M.
- ONU-G-REDE1 marcada crítica no diagrama GPON.
- RB5009 aparece como ponto central de firewall/core; HA automático não está documentado.
- A existência de dois links lógicos não comprova diversidade física de rota, energia ou equipamento.

### Altas

- Barracão F possui 29 APs em aproximadamente 4.000 m², com Aruba e UniFi coexistindo; há risco de sobreposição/interferência se canal/potência não estiverem otimizados.
- Switch Hikvision PoE do F aparece como não gerenciável no diagrama.
- Há grandes áreas sem inventário Wi-Fi atual confirmado nas fontes.
- Autonomia de nobreaks não foi fornecida.

### Médias

- Modelos Datacom divergentes entre diagramas precisam ser reconciliados.
- Documentação de portas, uplinks e rotas ópticas ainda não está completa.

## 9. Plano de análise

1. Inventário presencial de rack, switch, ONU, AP, câmera, NVR e UPS.
2. Identificação/etiquetagem física e lógica.
3. Site Survey Wi-Fi passivo + ativo + análise de espectro.
4. Leitura de RSSI/SNR/channel utilization e testes de roaming.
5. Levantamento de cada câmera: lente, FOV, altura, direção, IR, gravação e retenção.
6. Diagnóstico óptico/OTDR e níveis por ONU.
7. Teste de failover dos links e análise de diversidade física.
8. Teste de PoE budget, uplinks, VLANs e STP.
9. Teste de autonomia de nobreaks e dependência elétrica.
10. Atualização do Digital Twin com coordenadas reais.

# CENÁRIO ATUAL — AS IS

O ambiente possui uma base significativa de infraestrutura reaproveitável: 87 APs com quantidade conhecida, dois links de internet, core RB5009, rede GPON com 33 ONUs, switches distribuídos, CFTV com 197 pontos mapeados e seis NVRs indicados no rack central.

O principal problema não é simplesmente “falta de equipamento”. Há lacunas de documentação, necessidade de manutenção CFTV, uma ONU crítica, ausência de comprovação de redundância física e falta de medição RF que permita afirmar onde há cobertura adequada ou pontos cegos de Wi-Fi com confiança.

# DIAGNÓSTICO TÉCNICO

## Wi-Fi

A5, A6 e F possuem densidade relevante de APs. O Barracão F, em particular, combina 19 Aruba e 10 UniFi no mesmo perímetro de 50 × 80 m. Antes de adicionar novos APs, é tecnicamente mais seguro validar canalização, potência, interferência, roaming e capacidade. No setor G, a quantidade é conhecida, mas a posição real ainda precisa ser cadastrada.

## CFTV

O levantamento já dá uma prioridade objetiva: os 40 pontos M. F e G são os maiores focos de manutenção. O estacionamento possui 15 pontos N, que o documento classifica como desativados/não necessários; por isso, não devem ser tratados automaticamente como falhas ou necessidade de compra.

## Rede / fibra

O desenho apresenta duas operadoras, mas a redundância física deve ser comprovada. O core RB5009 e a OLT são dependências centrais. A ONU-G-REDE1 requer diagnóstico prioritário. OLT/modelos divergentes entre documentos devem ser reconciliados no inventário.

# CENÁRIO RECOMENDADO — TO BE

1. Restaurar os pontos críticos/altos antes de expandir.
2. Reaproveitar APs, switches, ONUs e câmeras que passarem nos testes.
3. Reposicionar/reconfigurar APs antes de aquisição adicional.
4. Comprovar a redundância física dos links e eliminar dependências comuns onde necessário.
5. Definir estratégia de HA do core baseada em capacidade, SLA e RTO/RPO.
6. Formalizar VLANs, inventário, backups de configuração e monitoramento.
7. Atualizar o Digital Twin com posição real dos equipamentos.
8. Homologar a infraestrutura com testes documentados.

# PLANO DE MELHORIAS

## FASE 1 — CRÍTICOS

- Restaurar os 40 pontos CFTV M, priorizando F e G.
- Diagnosticar ONU-G-REDE1.
- Executar teste de failover e verificar diversidade física dos links.
- Confirmar dependências de energia dos racks centrais.

## FASE 2 — ALTA PRIORIDADE

- Site Survey A5, A6, F e G.
- Otimização de canal/potência/roaming.
- Auditoria de switches, PoE budget, uplinks e VLANs.
- Levantamento estruturado de lente/FOV das câmeras.

## FASE 3 — OTIMIZAÇÃO

- Etiquetagem e documentação completa.
- Organização de racks, patch panels e fibras.
- Monitoramento de ONUs, links, switches e UPS.
- Backups de configuração.

## FASE 4 — EVOLUÇÃO

- HA de core/firewall conforme resultado dos testes.
- Redundância óptica em pontos críticos onde viável.
- Padronização tecnológica gradual quando houver justificativa técnica/econômica.

# Entrega HTML/CSS/JavaScript

O diretório contém uma aplicação offline com:

- navegação por Visão Geral, Blocos, Wi-Fi, CFTV, Rede/Fibra, Riscos, Melhorias, Premissas, Fontes e Relatório;
- alternância AS IS × TO BE;
- plantas por bloco;
- mapa Wi-Fi em SVG com raios ajustáveis e estimativa de áreas descobertas;
- tooltips/inspector de AP;
- inventário A5/A6 com IP/MAC;
- matriz CFTV por bloco;
- simulação de FOV de câmera explicitamente ilustrativa e desativada por padrão;
- topologia de rede/GPON em SVG;
- matriz de riscos e SPOFs;
- roadmap 24x7;
- relatório com CSS de impressão.

## Como abrir

Abra `index.html` em um navegador moderno. Para uso corporativo, recomenda-se publicar a pasta inteira em um servidor web interno, GitHub Pages, Vercel ou equivalente, mantendo a estrutura de diretórios.

## Adendo — revisão 0.2 / representação CFTV sobre as plantas

Este adendo substitui qualquer descrição anterior de CFTV em retângulo genérico.
Os cones agora são sobrepostos aos mapas originais, em coordenadas gráficas
compartilhadas com cada imagem. O bloco A usa a planta original enviada em
02/10/2026. Nas outras áreas usa-se a região da planta nas páginas 5–11 do PDF.

A transcrição manual é aproximada e parcial; IDs REF foram criados apenas para
selecionar os elementos da interface. O status por ponto é desconhecido até
conferência. Quantidades agregadas do documento permanecem inalteradas. O bloco B
permanece sem pontos digitalizados inicialmente por falta de marcas legíveis.

Abertura inicial de 55 graus e extensão gráfica por área são **premissas visuais**,
sem calibração métrica. A direção é uma leitura aproximada das setas, sujeita à
validação. Paredes e obstáculos não são modelados no cálculo dos setores; assim,
a sobreposição não comprova cobertura nem elimina pontos cegos. O usuário pode
ajustar, salvar localmente e exportar as coordenadas em JSON para revisão de campo.

## Adendo — revisão 0.3 / Wi-Fi na planta de origem

Este adendo substitui a descrição de Wi-Fi em retângulos normalizados separados.
A5/A6/G usam suas plantas originais; F/A10 usam a região de planta existente nos
respectivos diagramas, sem identificar o desenho esquemático como as built.
Posições A5/A6/G permanecem estimadas; em F/A10 foram aproximadas das posições
numeradas. O AP Aruba 14 de F não é legível e sua posição foi estimada. A associação
física de ID, marca e posição deve ser conferida. Contagens e dados do inventário
não mudam ao ajustar o mapa.

Foi retirada a conversão automática de raios em metros baseada no retângulo:
as dimensões/áreas de A5/A6 apresentam divergências entre fontes. Inicialmente os
raios usam unidades gráficas. Uma ferramenta de referência A/B permite ao usuário
calibrar distância a partir de uma medida conhecida da própria planta. A escala
uniforme requer conferência e não corrige distorção nem converte o desenho em survey.

A simulação divide a região poligonal em amostras e usa a distância ao AP mais
próximo; faixas dependem dos três raios definidos. Sem sobreposição dupla na
contagem. A imagem e as camadas permanecem juntas em zoom/pan. Contornos delimitam
análise, não paredes/bloqueio de sinal. Obstáculos, RSSI, SNR, potência, canais e
carga não entram no cálculo. Percentuais e regiões vermelhas são hipóteses
geométricas, não conclusões de cobertura real, interferência ou capacidade.

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
