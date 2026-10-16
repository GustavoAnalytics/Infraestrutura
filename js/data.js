(function () {
  const pct = (value) => Math.round(value * 10) / 10;
  const grid = (prefix, count, cols, options = {}) => {
    const rows = Math.ceil(count / cols);
    const x0 = options.x0 ?? 12;
    const x1 = options.x1 ?? 88;
    const y0 = options.y0 ?? 18;
    const y1 = options.y1 ?? 84;
    const result = [];
    for (let i = 0; i < count; i += 1) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = cols === 1 ? 50 : x0 + (c * (x1 - x0)) / (cols - 1);
      const y = rows === 1 ? 50 : y0 + (r * (y1 - y0)) / (rows - 1);
      result.push({
        id: `${prefix}-${String(i + 1).padStart(2, '0')}`,
        x: pct(x), y: pct(y),
        confidence: options.confidence || 'ESTIMADO',
        brand: options.brand || 'A validar',
        model: options.model || 'A validar',
        controller: options.controller || 'A validar',
        technology: options.technology || 'A validar',
        bands: options.bands || 'A validar',
        status: options.status || 'Ativo - informado',
        source: options.source || 'Informação fornecida'
      });
    }
    return result;
  };

  const a5MacIp = [
    ['EC:74:D7:AA:30:F0','10.135.100.213'],['EC:74:D7:AA:38:A2','10.135.100.204'],
    ['EC:74:D7:AA:32:56','10.135.100.206'],['EC:74:D7:AA:36:4A','10.135.100.205'],
    ['EC:74:D7:AA:38:B0','10.135.100.214'],['EC:74:D7:CA:49:B8','10.135.100.216'],
    ['EC:74:D7:AA:35:60','10.135.100.211'],['EC:74:D7:AA:38:E6','10.135.100.210'],
    ['EC:74:D7:CA:66:98','10.135.100.218'],['EC:74:D7:AA:35:1E','10.135.100.212'],
    ['EC:74:D7:CA:2E:BA','10.135.100.208'],['EC:74:D7:AA:38:98','10.135.100.207'],
    ['EC:74:D7:AA:37:46','10.135.100.215'],['EC:74:D7:AA:35:36','10.135.100.217'],
    ['EC:74:D7:AA:31:8C','10.135.100.235']
  ];
  const a6MacIp = [
    ['EC:74:D7:CA:39:1E','10.135.102.246'],['EC:74:D7:CA:7F:D4','10.135.102.241'],
    ['EC:74:D7:CA:50:5A','10.135.102.244'],['EC:74:D7:CA:3D:52','10.135.102.245'],
    ['EC:74:D7:CA:74:92','10.135.102.248'],['EC:74:D7:CA:36:B0','10.135.102.243'],
    ['EC:74:D7:CA:9E:66','10.135.102.249'],['EC:74:D7:CA:37:EC','10.135.102.242'],
    ['EC:74:D7:CA:82:C4','10.135.102.247'],['EC:74:D7:CA:46:16','10.135.102.250'],
    ['EC:74:D7:CA:97:40','10.135.102.237'],['EC:74:D7:AA:35:08','10.135.102.238'],
    ['EC:74:D7:AA:32:F2','10.135.102.240'],['EC:74:D7:AA:35:4C','10.135.102.239'],
    ['EC:74:D7:CA:57:70','10.135.100.71'],['EC:74:D7:CA:3F:EC','10.135.100.209'],
    ['EC:74:D7:AA:35:4A','10.135.102.236']
  ];

  const a5 = grid('AP-A5', 15, 5, {
    brand: 'Grandstream', model: 'Não informado', technology: 'A validar',
    source: 'Diagrama Wi-Fi A5/A6', confidence: 'ESTIMADO - posição gráfica'
  }).map((ap, i) => ({...ap, mac: a5MacIp[i][0], ip: a5MacIp[i][1]}));

  const a6 = grid('AP-A6', 17, 5, {
    brand: 'Grandstream', model: 'Não informado', technology: 'A validar',
    source: 'Diagrama Wi-Fi A5/A6', confidence: 'ESTIMADO - posição gráfica'
  }).map((ap, i) => ({...ap, mac: a6MacIp[i][0], ip: a6MacIp[i][1]}));

  const fArubaPositions = [
    [12,20],[31,20],[50,20],[69,20],[88,20],
    [12,34],[31,34],[50,34],[69,34],[88,34],
    [12,48],[31,48],[50,48],[69,48],[88,48],
    [12,61],[37,61],[62,61],[88,61]
  ];
  const fUnifiPositions = [
    [12,75],[31,75],[50,75],[69,75],[88,75],
    [12,88],[31,88],[50,88],[69,88],[88,88]
  ];
  const fAruba = fArubaPositions.map((p,i)=>({
    id:`AP-F-A${String(i+1).padStart(2,'0')}`,x:p[0],y:p[1],brand:'Aruba',model:'Não informado',
    controller:'AP17-MASTER / Aruba Virtual Controller',controllerIp:'10.139.0.17',
    confidence:'CONFIRMADO (quantidade) / ESTIMADO (posição normalizada)',status:'Ativo - informado',
    source:'Diagrama Barracão F'
  }));
  const fUnifi = fUnifiPositions.map((p,i)=>({
    id:`AP-F-U${String(i+1).padStart(2,'0')}`,x:p[0],y:p[1],brand:'UniFi',model:'Não informado',
    controller:'UniFi Network Controller',controllerIp:'10.130.1.66:8443',
    confidence:'CONFIRMADO (quantidade) / ESTIMADO (posição normalizada)',status:'Ativo - informado',
    source:'Diagrama Barracão F'
  }));

  const a10 = grid('AP-A10',9,3,{
    brand:'UniFi',model:'Não informado',controller:'UniFi Network Controller',source:'Diagrama A10/Core',
    confidence:'CONFIRMADO - disposição 3x3 no diagrama'
  });

  const gProfiles = {
    G1: grid('AP-G1',6,3,{brand:'UniFi',source:'Levantamento informado',confidence:'ESTIMADO - coordenadas não fornecidas'}),
    G2: grid('AP-G2',3,3,{brand:'UniFi',source:'Levantamento informado',confidence:'ESTIMADO - coordenadas não fornecidas'}),
    G3: grid('AP-G3',2,2,{brand:'UniFi',source:'Levantamento informado',confidence:'ESTIMADO - coordenadas não fornecidas'}),
    G4: grid('AP-G4',3,3,{brand:'UniFi',source:'Levantamento informado',confidence:'ESTIMADO - coordenadas não fornecidas'}),
    G5: grid('AP-G5',3,3,{brand:'UniFi',source:'Levantamento informado',confidence:'ESTIMADO - coordenadas não fornecidas'})
  };

  const subblocks = [
    {id:'A1',group:'A',area:1656,image:'assets/maps/bloco-a/A1.png',status:'CONFIRMADO'},
    {id:'A2',group:'A',area:2354,image:'assets/maps/bloco-a/A2.png',status:'CONFIRMADO'},
    {id:'A3',group:'A',area:3872,image:'assets/maps/bloco-a/A3.png',status:'CONFIRMADO'},
    {id:'A4',group:'A',area:3070,extra:'Mezanino 700 m²',image:'assets/maps/bloco-a/A4.png',status:'CONFIRMADO'},
    {id:'A5',group:'A',area:2550,widthM:50,heightM:64.5,image:'assets/maps/bloco-a/A5.png',status:'CONFIRMADO'},
    {id:'A6',group:'A',area:3690,widthM:45.5,heightM:80,image:'assets/maps/bloco-a/A6.png',status:'CONFIRMADO'},
    {id:'A7',group:'A',area:2200,extra:'Mezanino 72 m²',image:'assets/maps/bloco-a/A7.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'B1',group:'B',area:2345,image:'assets/maps/bloco-b/B1.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'B2',group:'B',area:1605,image:'assets/maps/bloco-b/B2.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'B3',group:'B',area:1605,image:'assets/maps/bloco-b/B3.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'B4',group:'B',area:1605,image:'assets/maps/bloco-b/B4.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'B5',group:'B',area:2275,image:'assets/maps/bloco-b/B5.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'C1',group:'C',area:4495,image:'assets/maps/bloco-c/C1.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'C2',group:'C',area:2000,image:'assets/maps/bloco-c/C2_C3.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'C3',group:'C',area:2000,image:'assets/maps/bloco-c/C2_C3.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'C4',group:'C',area:2000,image:'assets/maps/bloco-c/C4_C5.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'C5',group:'C',area:2000,image:'assets/maps/bloco-c/C4_C5.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'D1',group:'D',area:1594,image:'assets/maps/bloco-d/D1.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'D2',group:'D',area:1441,image:'assets/maps/bloco-d/D2.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'D3',group:'D',area:1441,image:'assets/maps/bloco-d/D3.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'D4',group:'D',area:1688,image:'assets/maps/bloco-d/D4.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'D5',group:'D',area:2580,image:'assets/maps/bloco-d/D5.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E1',group:'E',area:2000,image:'assets/maps/bloco-e/E1.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E2',group:'E',area:1570,image:'assets/maps/bloco-e/E2.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E3',group:'E',area:1570,image:'assets/maps/bloco-e/E3.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E4',group:'E',area:1570,image:'assets/maps/bloco-e/E4.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E5',group:'E',area:1570,image:'assets/maps/bloco-e/E5.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E6',group:'E',area:1570,image:'assets/maps/bloco-e/E6.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E7',group:'E',area:1570,image:'assets/maps/bloco-e/E7.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E8',group:'E',area:1570,image:'assets/maps/bloco-e/E8.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E9',group:'E',area:1570,image:'assets/maps/bloco-e/E9.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E10',group:'E',area:1570,image:'assets/maps/bloco-e/E10.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'E11',group:'E',area:1680,image:'assets/maps/bloco-e/E11.png',status:'INFORMADO - planta 03/10/2026'},
    {id:'F1',group:'F',area:1512,image:'assets/maps/bloco-f/F1.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'F2',group:'F',area:1052,image:'assets/maps/bloco-f/F2.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'F3',group:'F',area:1242,image:'assets/maps/bloco-f/F3.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'F4',group:'F',area:1372,image:'assets/maps/bloco-f/F4.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'F5',group:'F',area:1537,image:'assets/maps/bloco-f/F5.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'F6',group:'F',area:1526,image:'assets/maps/bloco-f/F6.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'F7',group:'F',area:1526,image:'assets/maps/bloco-f/F7.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'F8',group:'F',area:2880,image:'assets/maps/bloco-f/F8.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'G1',group:'G',area:1506,image:'assets/maps/bloco-g/G1.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'G2',group:'G',area:1040,image:'assets/maps/bloco-g/G2.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'G3',group:'G',area:1218,image:'assets/maps/bloco-g/G3.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'G4',group:'G',area:1620,image:'assets/maps/bloco-g/G4.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'G5',group:'G',area:1873,image:'assets/maps/bloco-g/G5.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'G6',group:'G',area:2075,image:'assets/maps/bloco-g/G6.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'G7',group:'G',area:2075,image:'assets/maps/bloco-g/G7.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'H1',group:'H',area:2572,image:'assets/maps/bloco-h/H1.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'H2',group:'H',area:1510,image:'assets/maps/bloco-h/H2.png',status:'INFORMADO - planta 04/10/2026'},
    {id:'H3',group:'H',area:1150,image:'assets/maps/bloco-h/H3.png',status:'INFORMADO - planta 04/10/2026'}
  ];

  const cctv = {
    A:{ok:36,maintenance:2,inactive:4,page:'assets/cftv/page-04.png'},
    B:{ok:18,maintenance:0,inactive:1,page:'assets/cftv/page-05.png'},
    C:{ok:13,maintenance:4,inactive:0,page:'assets/cftv/page-06.png'},
    D:{ok:20,maintenance:5,inactive:0,page:'assets/cftv/page-07.png'},
    E:{ok:18,maintenance:5,inactive:1,page:'assets/cftv/page-08.png'},
    F:{ok:15,maintenance:11,inactive:0,page:'assets/cftv/page-09.png'},
    G:{ok:6,maintenance:11,inactive:2,page:'assets/cftv/page-10.png'},
    PARKING:{ok:8,maintenance:2,inactive:15,page:'assets/cftv/page-11.png'}
  };

  const wifiProfiles = {
    A5:{label:'A5',aps:a5,widthM:50,heightM:64.5,area:2550,background:'assets/diagrams/wifi_A5_A6.jpeg',note:'15 APs Grandstream. Posição do overlay é modelagem normalizada a partir do diagrama; validar em campo.'},
    A6:{label:'A6',aps:a6,widthM:45.5,heightM:80,area:3690,background:'assets/diagrams/wifi_A5_A6.jpeg',note:'17 APs Grandstream. Posição do overlay é modelagem normalizada a partir do diagrama; validar em campo.'},
    F:{label:'F · inventário geral',aps:[...fAruba,...fUnifi],widthM:50,heightM:80,area:4000,background:'assets/diagrams/wifi_F.jpeg',note:'19 Aruba + 10 UniFi. O diagrama informa 50 x 80 m. Sobreposição e canais exigem Site Survey.'},
    A10:{label:'A10 Administrativo',aps:a10,widthM:null,heightM:null,area:null,background:'assets/diagrams/core_A10.jpeg',note:'9 APs UniFi, disposição 3 x 3 confirmada no diagrama. Dimensões físicas não fornecidas.'},
    G1:{label:'G1',aps:gProfiles.G1,widthM:null,heightM:null,area:1506,background:'assets/maps/G1_G2.png',note:'6 APs UniFi informados. Coordenadas reais ainda não fornecidas.'},
    G2:{label:'G2',aps:gProfiles.G2,widthM:null,heightM:null,area:1040,background:'assets/maps/G1_G2.png',note:'3 APs UniFi informados. Coordenadas reais ainda não fornecidas.'},
    G3:{label:'G3',aps:gProfiles.G3,widthM:null,heightM:null,area:1218,background:'assets/maps/G3_G5.png',note:'2 APs UniFi informados. Coordenadas reais ainda não fornecidas.'},
    G4:{label:'G4',aps:gProfiles.G4,widthM:null,heightM:null,area:1620,background:'assets/maps/G3_G5.png',note:'3 APs UniFi informados. Coordenadas reais ainda não fornecidas.'},
    G5:{label:'G5',aps:gProfiles.G5,widthM:null,heightM:null,area:1873,background:'assets/maps/G3_G5.png',note:'3 APs UniFi informados. Coordenadas reais ainda não fornecidas.'}
  };

  const network = {
    links:[
      {name:'ALTLink',speed:'1 Gbps',role:'Principal',ip:'IP dedicado',status:'CONFIRMADO - diagrama'},
      {name:'Desktop Telecom',speed:'600 Mbps',role:'Secundário',ip:'IP dedicado no diagrama',status:'CONFIRMADO - diagrama / testar failover'}
    ],
    core:{device:'MikroTik RB5009',role:'Core / Firewall / VPN',backup:'MikroTik RB2011 indicado como reserva'},
    vlans:[
      {name:'Gerência',subnet:'10.132.0.0/16',purpose:'Gerenciamento L2/L3'},
      {name:'Dados',subnet:'10.130.0.0/16',purpose:'Dados / A10 / demais'},
      {name:'Guest',subnet:'10.131.0.0/16',purpose:'Wi-Fi visitantes / UniFi'},
      {name:'CFTV Nova',subnet:'10.134.0.0/16',purpose:'Câmeras via GPON / Aruba'},
      {name:'CFTV Legada',subnet:'192.168.10.0/23',purpose:'Câmeras / fibra antiga'}
    ],
    olt:{
      primarySource:'Datacom DM4612 8GPON+2GT+2XS',managementIp:'10.133.12.5',onuCount:33,
      uplink:'2/10G a partir do Switch Aruba 1930',
      note:'Outros diagramas citam DM-S300/DM4270. Confirmar em campo se são modelos anteriores, componentes distintos ou documentação desatualizada.'
    },
    gponDistribution:[
      {port:'GPON 1/1/1',onus:4,scope:'A10 / Administrativo'},
      {port:'GPON 1/1/2',onus:4,scope:'Setor B / C e anexos'},
      {port:'GPON 1/1/3',onus:3,scope:'Barracão C / Nestlé'},
      {port:'GPON 1/1/4',onus:20,scope:'Entrada, Light Wall, E, G e outros'},
      {port:'GPON 1/1/7',onus:2,scope:'Barracão A - A5/A6 rede'}
    ],
    criticalOnu:'ONU-G-REDE1 aparece como CRÍTICO no diagrama da camada óptica.'
  };

  const risks = [
    {id:'R-01',category:'CFTV',local:'Blocos F e G',probability:'Alta',impact:'Alto',criticality:'CRÍTICO',problem:'22 pontos classificados como manutenção nos blocos F/G (11 + 11).',action:'Vistoria técnica, orçamento e restauração priorizada; validar lente, alimentação, fibra e gravação.'},
    {id:'R-02',category:'CFTV',local:'Geral',probability:'Alta',impact:'Alto',criticality:'ALTO',problem:'40 pontos M no total exigem intervenção.',action:'Criar plano por lote, evidência antes/depois e teste de gravação/retensão.'},
    {id:'R-03',category:'Rede',local:'Core A10',probability:'Média',impact:'Crítico',criticality:'CRÍTICO',problem:'RB5009 é mostrado como core/firewall central; HA ativo não está documentado.',action:'Validar arquitetura de alta disponibilidade, alimentação e procedimento de failover.'},
    {id:'R-04',category:'Fibra',local:'Camada GPON',probability:'Alta',impact:'Alto',criticality:'CRÍTICO',problem:'ONU-G-REDE1 aparece como crítica.',action:'Testar nível óptico, conectores, splitter, alimentação, porta GPON e substituir somente se diagnóstico indicar.'},
    {id:'R-05',category:'Wi-Fi',local:'Barracão F',probability:'Média',impact:'Alto',criticality:'ALTO',problem:'Alta densidade (29 APs / ~4.000 m²), com Aruba e UniFi coexistindo.',action:'Site Survey, plano de canais, potência, roaming e validação de interferência antes de adicionar APs.'},
    {id:'R-06',category:'Switch',local:'Barracão F',probability:'Média',impact:'Alto',criticality:'ALTO',problem:'Diagrama informa switch Hikvision PoE não gerenciável atendendo UniFi.',action:'Validar PoE budget, uplink, loops e necessidade de switch gerenciável sem substituir automaticamente.'},
    {id:'R-07',category:'Redundância',local:'Internet',probability:'Média',impact:'Crítico',criticality:'CRÍTICO',problem:'Há dois links lógicos, mas diversidade física de rota não está documentada.',action:'Confirmar entrada física, postes/dutos, energia, rack, equipamento comum e executar teste de failover.'},
    {id:'R-08',category:'Documentação',local:'OLT/Core',probability:'Alta',impact:'Médio',criticality:'MÉDIO',problem:'Fontes citam modelos Datacom diferentes (DM4612 e DM-S300/DM4270).',action:'Inventário presencial com foto, serial, modelo, firmware e função.'},
    {id:'R-09',category:'Wi-Fi',local:'A1-A4/B/C/D/E/H',probability:'Alta',impact:'Alto',criticality:'ALTO',problem:'Não há contagem/posição de AP atual confirmada nas fontes fornecidas para várias áreas.',action:'Levantamento bloco a bloco e Site Survey antes de concluir pontos cegos.'},
    {id:'R-10',category:'Energia',local:'Racks/ONUs/Switches',probability:'Média',impact:'Alto',criticality:'ALTO',problem:'Autonomia e capacidade de nobreaks não foram fornecidas.',action:'Inventariar VA/W, carga real, bateria, autonomia e teste sob falta de energia.'}
  ];

  const improvements = [
    {id:'M-01',phase:'FASE 1',category:'CFTV',scope:'F/G + pontos M',priority:'CRÍTICO',action:'Restaurar os 40 pontos M por diagnóstico, começando F e G.',reuse:'Priorizar manutenção/reposicionamento antes de troca.'},
    {id:'M-02',phase:'FASE 1',category:'Fibra',scope:'Setor G',priority:'CRÍTICO',action:'Diagnosticar ONU-G-REDE1 e caminho óptico.',reuse:'Manter ONU se níveis/porta/alimentação forem corrigíveis.'},
    {id:'M-03',phase:'FASE 1',category:'Redundância',scope:'Core / Internet',priority:'CRÍTICO',action:'Testar failover dos links e mapear diversidade física.',reuse:'Reaproveitar ALTLink/Desktop se independência e SLA forem adequados.'},
    {id:'M-04',phase:'FASE 2',category:'Wi-Fi',scope:'F',priority:'ALTO',action:'Executar Site Survey e otimizar 29 APs existentes.',reuse:'Reconfigurar canal/potência/posição antes de aquisição.'},
    {id:'M-05',phase:'FASE 2',category:'Wi-Fi',scope:'A5/A6',priority:'ALTO',action:'Survey e validação de roaming/capacidade dos 32 Grandstream.',reuse:'Manter os APs se capacidade e cobertura forem aprovadas.'},
    {id:'M-06',phase:'FASE 2',category:'Wi-Fi',scope:'G1-G5',priority:'ALTO',action:'Cadastrar posição real dos 17 UniFi e validar cobertura.',reuse:'Reposicionar conforme heatmap real.'},
    {id:'M-07',phase:'FASE 2',category:'Rede',scope:'F/A5/A6',priority:'ALTO',action:'Validar switches, PoE budget, uplinks, VLANs e UPS.',reuse:'Preservar equipamentos que cumprirem capacidade e gestão necessárias.'},
    {id:'M-08',phase:'FASE 3',category:'Documentação',scope:'Todos os blocos',priority:'MÉDIO',action:'Etiquetar racks, ONUs, switches, APs, câmeras, portas e fibras.',reuse:'Sem aquisição obrigatória.'},
    {id:'M-09',phase:'FASE 3',category:'CFTV',scope:'Geral',priority:'MÉDIO',action:'Levantamento de lente/FOV/altura/IR e retenção por câmera.',reuse:'Ajustar ângulo e lente antes de adicionar pontos.'},
    {id:'M-10',phase:'FASE 4',category:'24x7',scope:'Core',priority:'MÉDIO',action:'Projetar HA de core/firewall/energia após inventário e testes.',reuse:'RB2011 pode permanecer como reserva somente se capacidade e procedimento forem validados.'}
  ];

  const missing = [
    'Posição física exata de APs em G1-G5 e em áreas sem inventário Wi-Fi.',
    'Altura, orientação, potência e canal de cada AP; RSSI, SNR e channel utilization.',
    'Modelo e especificações de Grandstream, Aruba e UniFi instalados.',
    'Lente, distância focal, resolução, altura, direção e alcance IR por câmera.',
    'Coordenadas digitais das câmeras do levantamento; o PDF contém marcações visuais, mas não tabela georreferenciada.',
    'Retenção, bitrate, capacidade e distribuição das câmeras por NVR.',
    'Rotas físicas dos dois links de internet e da fibra interna.',
    'PoE budget, portas usadas/livres, firmware e configuração dos switches.',
    'Autonomia/carga real dos nobreaks e existência de gerador/ATS nos racks críticos.',
    'Dimensões físicas completas de B, C, D, E, G e A10; algumas áreas têm somente m².',
    'Confirmação presencial do modelo da OLT e relação entre DM4612 vs DM-S300/DM4270.'
  ];

  window.GTO_DATA = {
    meta:{
      title:'Centro Logístico Rio Claro - Digital Twin Simplificado',
      revision:'Rev. 1.0 - 14/10/2026',
      disclaimer:'Coberturas e campos de visão simulados são estimativas e não substituem Site Survey, teste de RF, vistoria CFTV ou certificação de rede.'
    },
    subblocks,cctv,wifiProfiles,network,risks,improvements,missing,
    sourceGallery:[
      {title:'CFTV - matriz global',img:'assets/cftv/page-03.png',type:'CFTV'},
      {title:'Topologia A10/Core',img:'assets/diagrams/core_A10.jpeg',type:'Rede'},
      {title:'Camada óptica GPON',img:'assets/diagrams/gpon.jpeg',type:'Fibra'},
      {title:'Wi-Fi A5/A6',img:'assets/diagrams/wifi_A5_A6.jpeg',type:'Wi-Fi'},
      {title:'Wi-Fi Barracão F',img:'assets/diagrams/wifi_F.jpeg',type:'Wi-Fi'}
    ],
    stats:{
      cftvTotal:197,cftvOk:134,cftvMaintenance:40,cftvInactive:23,
      wifiKnownTotal:87,
      wifiBreakdown:{A5:15,A6:17,F:29,A10:9,G1:6,G2:3,G3:2,G4:3,G5:3},
      knownSubblocks:subblocks.length
    },
    proposalDraft:{
      note:'Rascunho de planejamento anterior, NÃO classificado como infraestrutura atual.',
      A1:{aps:6,model:'U7 Lite',state:'PROPOSTO / VALIDAR'},
      A2:{aps:12,model:'U7 Lite',state:'PROPOSTO / VALIDAR'},
      A3:{aps:12,model:'U7 Lite',state:'PROPOSTO / VALIDAR'},
      A4:{aps:8,model:'U7 Lite',state:'PROPOSTO / VALIDAR'}
    }
  };
})();
