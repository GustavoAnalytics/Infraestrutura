/* Plantas de origem intactas. Coordenadas em pixels da imagem, não GPS.
 * Distribuições sem vínculo cadastral confiável são ESTIMADAS e editáveis.
 * Polígonos delimitam a área de análise; não modelam obstáculos de RF.
 */
(function(){
  const plans={
    A5:{image:'assets/maps/A5.png',width:561,height:693,view:[0,0,561,693],
      polygon:[[40,23],[293,23],[293,374],[543,374],[543,670],[40,670]],
      positions:[[100,598],[230,598],[360,598],[483,598],[483,420],[100,485],[232,485],[360,485],[483,510],[100,370],[215,370],[100,265],[100,170],[250,295],[115,80]],
      evidence:'Posição estimada sobre a planta A5; associação entre ID e posição não confirmada.',
      note:'Planta A5 original, com a região em L delimitada para simulação. Os 15 APs do inventário são mantidos; a distribuição sobre o desenho é estimada. O diagrama contém rótulos de AP repetidos e dimensões/áreas divergentes, impedindo associação e escala automática confiáveis.'},
    A6:{image:'assets/maps/A6.png',width:322,height:547,view:[0,0,322,547],
      polygon:[[22,13],[301,13],[301,512],[22,512]],
      positions:[[52,465],[104,465],[156,465],[208,465],[260,465],[52,404],[104,404],[208,404],[260,404],[52,311],[260,311],[52,239],[156,239],[260,239],[260,141],[52,141],[156,141]],
      evidence:'Posição estimada sobre a planta A6; associação entre ID e posição a validar.',
      note:'Planta A6 original com 17 APs do inventário. As posições são uma distribuição estimada, pois o diagrama apresenta rótulos repetidos/ambíguos. As áreas de 3.650 m², 3.690 m² e o produto das dimensões não coincidem; calibrar antes de interpretar distâncias em metros.'},
    F:{image:'assets/diagrams/wifi_F.jpeg',width:1536,height:1024,view:[1035,72,370,515],
      polygon:[[1098,102],[1369,102],[1369,569],[1098,569]],
      positions:[[1326,385],[1267,385],[1194,385],[1135,385],[1341,322],[1287,322],[1234,322],[1179,322],[1127,322],[1326,267],[1267,267],[1194,267],[1130,267],[1234,238],[1335,208],[1285,208],[1234,208],[1182,208],[1130,208],
        [1341,489],[1289,489],[1238,489],[1186,489],[1134,489],[1341,438],[1289,438],[1238,438],[1186,438],[1134,438]],
      evidence:'Leitura aproximada da posição numerada no diagrama F; instalação física a validar.',
      note:'Recorte da planta presente no diagrama fornecido, com 19 Aruba e 10 UniFi. Não há vínculo comprovado desta área de 50 × 80 m com um subbloco F específico. A posição do Aruba 14 foi estimada, pois seu rótulo não é legível; as demais foram aproximadas dos números desenhados. A cor dos APs 11/12 diverge da legenda: conferir em campo.'},
    A10:{image:'assets/diagrams/core_A10.jpeg',width:1536,height:1024,view:[1111,276,408,292],
      polygon:[[1123,288],[1503,288],[1503,554],[1123,554]],
      positions:[[1211,333],[1318,333],[1428,333],[1207,409],[1327,409],[1428,409],[1211,487],[1321,487],[1428,487]],
      evidence:'Posição aproximada do AP numerado na planta ilustrada do diagrama A10; não é levantamento em campo.',
      note:'Planta ilustrada do diagrama A10 original com 9 UniFi em disposição 3 × 3. Coordenadas aproximadas dos ícones numerados. Planta arquitetônica e escala métrica não foram fornecidas.'},
    G1:{image:'assets/maps/G1_G2.png',width:1036,height:693,view:[0,0,1036,693],
      polygon:[[0,44],[480,20],[477,489],[338,497],[332,364],[6,383]],
      positions:[[100,115],[255,95],[408,95],[105,280],[257,270],[400,360]],
      evidence:'Posição estimada; apenas quantidade de 6 UniFi informada para G1.',
      note:'Planta compartilhada G1/G2. A região de análise G1 e a distribuição de 6 APs são estimadas. Não há divisória interna ou coordenadas de APs confirmadas na fonte. Os símbolos já impressos na imagem não foram tratados automaticamente como APs.'},
    G2:{image:'assets/maps/G1_G2.png',width:1036,height:693,view:[0,0,1036,693],
      polygon:[[480,20],[978,0],[1008,596],[680,606],[672,475],[477,489]],
      positions:[[590,140],[842,165],[858,445]],evidence:'Posição estimada; apenas quantidade de 3 UniFi informada para G2.',
      note:'Planta compartilhada G1/G2. Região de análise G2 e posições estimadas; conferir a divisão física e os locais de instalação. Os símbolos existentes da imagem não têm associação confirmada ao inventário Wi-Fi.'},
    G3:{image:'assets/maps/G3_G5.png',width:755,height:659,view:[0,0,755,659],
      polygon:[[13,36],[228,24],[244,487],[39,502]],positions:[[115,165],[155,370]],evidence:'Posição estimada; apenas quantidade de 2 UniFi informada para G3.',
      note:'Planta compartilhada G3/G4/G5. A região de análise G3 e seus 2 APs são estimados; a divisão interna não está cotada. Símbolos originais preservados sem atribuir tipo de equipamento.'},
    G4:{image:'assets/maps/G3_G5.png',width:755,height:659,view:[0,0,755,659],
      polygon:[[228,24],[453,11],[491,551],[255,565],[244,487]],positions:[[328,135],[351,303],[380,478]],evidence:'Posição estimada; apenas quantidade de 3 UniFi informada para G4.',
      note:'Planta compartilhada G3/G4/G5. Região de análise G4 e distribuição estimadas; não interpretar os limites da simulação como paredes existentes.'},
    G5:{image:'assets/maps/G3_G5.png',width:755,height:659,view:[0,0,755,659],
      polygon:[[453,11],[696,0],[729,633],[498,646],[491,551]],positions:[[570,145],[589,335],[617,525]],evidence:'Posição estimada; apenas quantidade de 3 UniFi informada para G5.',
      note:'Planta compartilhada G3/G4/G5. Região de análise G5 e distribuição estimadas; limites físicos, posições e escala precisam de levantamento.'}
  };
  // Novas plantas A/B/C/D/E/F/G/H: preserva IDs e inventários; posições continuam estimadas.
  const newer={};
  Object.entries({...window.BLOCO_A_PLANS,...window.BLOCO_B_PLANS,...window.BLOCO_C_PLANS,...window.BLOCO_D_PLANS,...window.BLOCO_E_PLANS,...window.BLOCO_F_PLANS,...window.BLOCO_G_PLANS,...window.BLOCO_H_PLANS}).forEach(([key,source])=>{
    const old=plans[key];
    if(!window.GTO_DATA.wifiProfiles[key])window.GTO_DATA.wifiProfiles[key]={label:key,aps:[],inventoryKnown:false,background:key.startsWith('F')?window.GTO_DATA.wifiProfiles.F.background:source.image,note:key.startsWith('F')?source.sharedNote:'Inventário Wi-Fi não fornecido.'};
    let positions=[];
    if(key==='A5')positions=[[73,680],[192,680],[311,680],[426,680],[426,515],[73,576],[194,576],[312,576],[426,598],[73,440],[180,440],[73,344],[73,260],[211,367],[87,202]];
    if(key==='A6')positions=old.positions.map(([x,y])=>[109+(x-22)*416/279,82+(y-13)*741/499]);
    const gPositions={"G1": [[250, 180], [470, 155], [680, 145], [275, 350], [555, 350], [700, 455]], "G2": [[200, 125], [230, 330], [270, 520]], "G3": [[180, 200], [230, 505]], "G4": [[185, 155], [205, 370], [240, 600]], "G5": [[150, 125], [170, 350], [210, 565]]};
    if(gPositions[key])positions=gPositions[key];
    newer[key]={...source,positions,evidence:`Posição estimada reajustada à planta de ${source.sourceDate||'03/10/2026'}; validar em campo.`,note:positions.length?`Nova planta ${key} fornecida em ${source.sourceDate||'03/10/2026'}. Inventário preservado; distribuição gráfica estimada e editável. Raios e escala anteriores não são reaplicados à nova imagem. As cotas e áreas impressas devem ser conferidas antes de calibrar.`:`Nova planta ${key} fornecida em ${source.sourceDate||'03/10/2026'}. Inventário e posições dos APs não fornecidos para esta área. Ausência de marcações não significa ausência de Wi-Fi; abrangência não calculada. ${source.sharedNote||''}`};
  });
  // Referência anterior F preservada para os 29 APs sem divisão confirmada por galpão.
  plans.F.note='Referência anterior e inventário consolidado do Bloco F. '+plans.F.note;
  Object.keys(plans).filter(k=>!newer[k]).forEach(k=>newer[k]=plans[k]);
  Object.keys(plans).forEach(k=>delete plans[k]);Object.assign(plans,newer);
  Object.entries(plans).forEach(([key,p])=>{
    const xs=p.polygon.map(q=>q[0]),ys=p.polygon.map(q=>q[1]);
    p.bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];
    const short=Math.min(p.bounds[2],p.bounds[3]);p.radii=[.16,.24,.32].map(v=>Math.round(short*v));
    p.points=window.GTO_DATA.wifiProfiles[key].aps.map((ap,i)=>({id:ap.id,x:p.positions[i][0],y:p.positions[i][1],evidence:key==='F'&&i===13?'Posição estimada: AP Aruba 14 não legível na fonte.':p.evidence}));
  });
  window.WIFI_PLANS=plans;
})();
