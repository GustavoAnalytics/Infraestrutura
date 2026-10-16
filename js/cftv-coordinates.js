/* Coordenadas de leitura visual, não levantamento cadastral.
 * x/y usam o sistema da imagem exibida, sem alterar o arquivo raster.
 * Pontos são aproximações das marcas visíveis; IDs são referências da interface.
 * Não completamos a quantidade do inventário com posições artificiais.
 * Direções são inferidas das setas. FOV/alcance são premissas editáveis.
 * status desconhecido permanece unknown, sem repartir os totais por suposição.
 */
(function () {
  const maps = {
    A: {image:'assets/cftv/planta-A-original.png',width:909,height:473,view:[0,0,909,473],range:68,
      note:'Planta original anexada. Pontos aproximados das marcações manuscritas; algumas marcas estão sobrepostas ou ilegíveis.',
      points:[
        [145,40,220],[222,56,0],[348,53,0],[508,57,180],[589,87,0],
        [667,55,90],[720,55,180],[754,59,90],[877,58,90],[896,164,180],
        [753,267,90],[820,312,0],[775,313,180],[748,313,180],[826,364,180],
        [672,198,90],[581,271,180],[593,284,90],[509,271,0],[486,281,45],
        [479,291,180],[427,305,180],[372,305,180],[319,305,180],
        [251,399,0],[207,403,0],[150,403,0],[128,393,270],[115,397,90],
        [87,377,270],[77,352,270],[78,143,90],[70,121,225],[85,91,225],
        [159,98,180],[185,114,90]
      ]},
    B: {image:'assets/cftv/page-05.png',width:2048,height:1280*2048/2294,view:[85,285,1380,700],range:115,
      note:'A página B informa 19 pontos, mas não permite associar posições de câmera com segurança. Use “Adicionar marca” para registrar os pontos após conferência; nenhum ponto foi distribuído automaticamente.',points:[]},
    C: {image:'assets/cftv/page-06.png',width:2048,height:1280*2048/2294,view:[370,215,615,835],range:85,
      note:'Leitura parcial das setas visíveis da página 6. O total do inventário permanece separado dos pontos digitalizados.',
      points:[[457,254,90],[627,254,90],[740,310,180],[740,451,180],[758,512,90],[468,550,270],[466,612,270],[739,600,180],[761,637,110],[606,651,0],[744,770,180],[466,903,270],[735,1032,270]]},
    D: {image:'assets/cftv/page-07.png',width:2048,height:1280*2048/2294,view:[95,290,1280,710],range:105,
      note:'Pontos aproximados dos círculos/setas da página 7. Status individual a conferir no levantamento.',
      points:[[235,832,315],[230,849,110],[320,885,180],[335,885,0],[394,623,130],[406,609,310],[498,493,270],[517,475,300],[540,467,0],[661,469,180],[575,591,210],[738,620,230],[758,650,0],[896,704,320],[854,450,220],[920,450,0],[1145,447,220],[1166,392,180],[1200,359,180],[1294,331,135],[1280,389,90],[1262,412,90],[1241,514,270],[1262,826,270],[1000,862,0]]},
    E: {image:'assets/cftv/page-08.png',width:2048,height:1280*2048/2294,view:[120,340,1250,465],range:100,
      note:'Digitalização parcial das setas da página 8. Marcas ambíguas não foram acrescentadas para fechar o inventário.',
      points:[[260,439,0],[152,494,0],[248,559,0],[291,585,200],[306,585,20],[509,512,0],[551,581,250],[661,581,250],[706,461,180],[723,461,0],[767,565,160],[867,577,0],[867,590,0],[923,461,180],[944,461,0],[1005,459,0],[982,577,0],[982,590,0],[1104,644,270],[1244,378,0],[1341,377,180],[1346,400,180],[210,768,0],[310,768,0]]},
    F: {image:'assets/cftv/page-09.png',width:2048,height:1280*2048/2294,view:[90,440,1235,330],range:85,
      note:'Leitura parcial da página 9. As marcas sobrepostas no estacionamento precisam de conferência.',
      points:[[137,708,320],[375,524,315],[369,627,270],[372,715,250],[482,697,270],[493,707,0],[550,707,0],[576,485,220],[654,485,345],[697,707,0],[777,707,0],[804,627,30],[874,637,225],[1007,646,270],[1053,707,180],[1097,651,220],[996,499,0],[996,480,180],[1080,480,0],[1200,608,250],[1200,662,240]]},
    G: {image:'assets/cftv/page-10.png',width:2048,height:1280*2048/2294,view:[160,403,740,545],range:105,
      note:'Setas do desenho G1/G2. Pontos no mesmo suporte mantêm a mesma origem e direções distintas. Contagens de interesse do documento divergem do resumo; validar a associação.',
      points:[[203,421,65],[831,428,135],[387,561,220],[387,561,335],[387,575,145],[387,575,38],[596,549,220],[596,549,335],[596,565,145],[596,565,35],[183,677,330],[183,696,65],[610,693,5],[818,690,170],[594,806,230],[594,806,135],[610,821,335],[827,878,230],[827,884,140]]},
    PARKING: {image:'assets/cftv/page-11.png',width:2048,height:1280*2048/2294,view:[110,290,1180,660],range:105,
      note:'Leitura parcial das marcas na página 11. Não inferimos os 15 pontos N por distribuição automática.',
      points:[[341,494,340],[405,516,180],[480,523,0],[278,549,145],[530,614,180],[629,744,315],[619,752,135],[630,756,15],[934,657,285],[922,668,135],[1072,516,140],[1077,568,150],[1090,578,60],[1128,650,135],[1040,739,135]]}
  };
  Object.entries(maps).forEach(([area,map]) => {
    map.points = map.points.map(([x,y,angle],i)=>({
      id:`REF-${area}-${String(i+1).padStart(2,'0')}`,x,y,angle,
      fov:55,range:map.range,status:'unknown',
      positionEvidence:'Leitura visual aproximada da marca na planta',
      directionEvidence:'Direção inferida da seta; validar',
      source:area==='A'?'Planta A anexada em 02/10/2026':window.GTO_DATA.cctv[area].page
    }));
  });
  Object.entries({...window.BLOCO_A_PLANS,...window.BLOCO_B_PLANS,...window.BLOCO_C_PLANS,...window.BLOCO_D_PLANS,...window.BLOCO_E_PLANS,...window.BLOCO_F_PLANS,...window.BLOCO_G_PLANS,...window.BLOCO_H_PLANS}).forEach(([key,p])=>{
    if(!window.GTO_DATA.cctv[key[0]]){
      maps[key]={...p,range:Math.round(Math.min(p.width,p.height)*.15),points:[],note:`Nova planta ${key} de ${p.sourceDate}. A fonte não contém marcações de câmeras e não há inventário CFTV do Bloco ${key[0]} no levantamento anterior. Quantidades e posições não informadas (N/D). Adicione marcas após conferência em campo; ausência de marcações não significa ausência de câmeras.`};
      return;
    }
    maps[key]={...p,range:Math.round(Math.min(p.width,p.height)*.15),points:[],note:`Nova planta ${key} de ${p.sourceDate||'03/10/2026'}. A fonte não contém marcações de câmeras. Selecione uma referência do levantamento anterior e clique no local correspondente, ou adicione uma marca após conferência. O total de ${Object.values(window.GTO_DATA.cctv[key[0]]).filter(v=>typeof v==='number').reduce((sum,v)=>sum+v,0)} pontos refere-se ao Bloco ${key[0]} inteiro, sem distribuição confirmada por galpão. ${key.startsWith('F')?'':p.sharedNote||''}`};
  });
  window.CFTV_MAPS=maps;
})();
