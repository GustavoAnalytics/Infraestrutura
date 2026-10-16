(function(){
  'use strict';
  const STORAGE='CLRC_BLOCK_TWIN_V17';
  const NS='http://www.w3.org/2000/svg';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const now=()=>new Date().toISOString();
  const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const svgEl=(tag,attrs={},text='')=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>v!==undefined&&v!==null&&n.setAttribute(k,String(v)));if(text)n.textContent=text;return n;};

  const TYPES={
    ap:{label:'Access Point',icon:'◉',color:'#22d3ee'},
    camera:{label:'Câmera adicional',icon:'◢',color:'#a78bfa'},
    alarm:{label:'Alarme / Sensor',icon:'◆',color:'#fb7185'},
    rack:{label:'Rack',icon:'▥',color:'#f59e0b'},
    switch:{label:'Switch PoE',icon:'⇄',color:'#34d399'},
    onu:{label:'ONU',icon:'◎',color:'#38bdf8'},
    ups:{label:'Nobreak',icon:'▰',color:'#fde047'},
    internet:{label:'Entrada Internet',icon:'⊕',color:'#60a5fa'}
  };

  // Os mapas abaixo foram gerados diretamente dos PDFs enviados pelo usuário.
  // A navegação é por BLOCO, e não por subbloco A1/A2 etc.
  const MAPS={
    GERAL:{label:'Centro Logístico - Geral',image:'assets/maps/block-level/geral.png',pdf:'assets/source-pdfs/CL-Model.pdf',width:2000,height:960,safe:{x:.03,y:.05,w:.94,h:.90},area:null,sourceCameras:null,sourceType:'Mapa mestre CLRC'},
    A:{label:'Bloco A',image:'assets/maps/block-level/bloco-a.png',pdf:'assets/source-pdfs/CL%20-%20BLOCO%20A.pdf',width:1531,height:768,safe:{x:.08,y:.05,w:.84,h:.76},area:17550,sourceCameras:37,sourceDigital:16,sourceAnalog:21,apCount:80,alarmCount:18},
    B:{label:'Bloco B',image:'assets/maps/block-level/bloco-b.png',pdf:'assets/source-pdfs/CL%20-%20BLOCO%20B.pdf',width:1637,height:855,safe:{x:.08,y:.08,w:.84,h:.78},area:8880,sourceCameras:12,sourceDigital:0,sourceAnalog:12,apCount:34,alarmCount:10},
    C:{label:'Bloco C',image:'assets/maps/block-level/bloco-c.png',pdf:'assets/source-pdfs/CL%20-%20BLOCO%20C.pdf',width:1457,height:775,safe:{x:.05,y:.04,w:.83,h:.83},area:12495,sourceCameras:7,sourceDigital:0,sourceAnalog:7,apCount:48,alarmCount:12},
    D:{label:'Bloco D',image:'assets/maps/block-level/bloco-d.png',pdf:'assets/source-pdfs/CL%20-%20BLOCO%20D.pdf',width:1536,height:857,safe:{x:.07,y:.04,w:.85,h:.82},area:9326,sourceCameras:27,sourceDigital:27,sourceAnalog:0,apCount:35,alarmCount:11},
    E:{label:'Bloco E',image:'assets/maps/block-level/bloco-e.png',pdf:'assets/source-pdfs/CL%20-%20BLOCO%20E.pdf',width:1722,height:782,safe:{x:.04,y:.08,w:.91,h:.78},area:17669,sourceCameras:33,sourceDigital:33,sourceAnalog:0,apCount:69,alarmCount:18},
    F:{label:'Bloco F',image:'assets/maps/block-level/bloco-f.png',pdf:'assets/source-pdfs/CL%20-%20BLOCO%20F.pdf',width:1861,height:527,safe:{x:.05,y:.05,w:.89,h:.72},area:12504,sourceCameras:27,sourceDigital:27,sourceAnalog:0,apCount:51,alarmCount:14},
    AREA_COMUM:{label:'Área Comum',image:'assets/maps/block-level/area-comum.png',pdf:'assets/source-pdfs/CL%20-%20AREA%20COMUM.pdf',width:1421,height:860,safe:{x:.22,y:.10,w:.64,h:.78},area:null,sourceCameras:27,sourceDigital:27,sourceAnalog:0,apCount:12,alarmCount:10},
    PORTARIA:{label:'Portaria',image:'assets/maps/block-level/portaria.png',pdf:'assets/source-pdfs/CL%20-%20PORTARIA.pdf',width:989,height:859,safe:{x:.18,y:.05,w:.55,h:.86},area:null,sourceCameras:15,sourceDigital:15,sourceAnalog:0,apCount:4,alarmCount:6}
  };

  const state={mapId:'A',mode:'all',selected:null,tool:null,fiberDraft:[],fiberKind:'primary',showCoverage:true,showLabels:false,heatmap:false};
  let root=null,mapApi=null,db=load();

  function safeRect(map){return {x:map.width*map.safe.x,y:map.height*map.safe.y,w:map.width*map.safe.w,h:map.height*map.safe.h};}
  function load(){try{const d=JSON.parse(localStorage.getItem(STORAGE)||'null');if(d?.maps)return d;}catch(e){}const maps={};Object.keys(MAPS).forEach(id=>maps[id]={equipment:[],fibers:[],updatedAt:now()});return {version:1,maps};}
  function save(){localStorage.setItem(STORAGE,JSON.stringify(db));}
  function current(){return db.maps[state.mapId];}
  function mapDef(){return MAPS[state.mapId];}
  function visibleEq(){return current().equipment.filter(e=>state.mode==='all'||e.lifecycle===state.mode);}
  function count(type){return visibleEq().filter(e=>e.type===type).length;}

  function render(container){
    root=container;
    root.innerHTML=`
      <section class="view-head twin-head"><div><span class="eyebrow">DIGITAL TWIN POR BLOCO · PDF TÉCNICO</span><h1>Infraestrutura detalhada por bloco</h1><p>Os mapas agora utilizam as imagens completas fornecidas por bloco, preservando a planta inteira. O zoom foi ajustado para enquadrar o desenho completo sem cortes, mantendo a nitidez e o contexto visual.</p></div><div class="twin-head-actions"><button class="btn" id="export-block-json">Exportar JSON</button><label class="btn file-btn">Importar JSON<input id="import-block-json" type="file" accept="application/json"></label></div></section>
      <section class="panel twin-commandbar"><div class="twin-filters"><label>Mapa / Bloco<select id="block-map-select">${Object.entries(MAPS).map(([id,m])=>`<option value="${id}" ${id===state.mapId?'selected':''}>${m.label}</option>`).join('')}</select></label><label>Visualizar<select id="block-mode"><option value="all">Tudo</option><option value="installed">Instalado</option><option value="projected">Projetado</option><option value="disabled">Desativado</option></select></label><label class="layer-inline"><input id="block-coverage" type="checkbox" checked> Coberturas</label><label class="layer-inline"><input id="block-labels" type="checkbox"> Nomes</label><label class="layer-inline"><input id="block-heatmap" type="checkbox"> Heatmap</label></div></section>
      <div class="block-kpis" id="block-kpis"></div>
      <div class="twin-map-layout block-detail-layout">
        <aside class="panel twin-toolbox block-toolbox"><div class="panel-title-row"><div><h3>Adicionar infraestrutura</h3><p class="subtle-note">Os pontos ficam limitados à área útil do desenho e são redimensionados automaticamente para cada bloco, respeitando a proporção do mapa completo.</p></div></div>
          <div class="twin-tools">${Object.entries(TYPES).map(([k,t])=>`<button data-add-type="${k}"><i style="--tool-color:${t.color}">${t.icon}</i><span>${t.label}</span></button>`).join('')}</div>
          <div class="twin-tool-group"><h4>Fibra</h4><button class="btn full" data-fiber="primary">━ Fibra principal</button><button class="btn full" data-fiber="redundant">┄ Fibra redundante</button><button class="btn full" id="finish-block-fiber" disabled>Concluir traçado</button></div>
          <div class="twin-tool-group"><h4>Cenário previsto</h4><button class="btn primary full" id="apply-block-scenario">Gerar cenário do bloco</button><button class="btn full" id="clear-block-scenario">Limpar projetados</button><div id="scenario-block-summary"></div></div>
          <div class="twin-tool-group"><h4>Fonte técnica</h4><a class="btn full" id="source-pdf-link" target="_blank" rel="noopener">Abrir PDF original</a><p class="subtle-note">Os pontos de câmera já existentes permanecem visíveis no próprio desenho PDF.</p></div>
        </aside>
        <section class="panel twin-map-panel block-map-panel"><div class="twin-map-top"><div><span class="eyebrow" id="block-map-eyebrow"></span><h3 id="block-map-title"></h3><p id="block-map-meta" class="subtle-note"></p></div><div class="map-actions"><button id="block-fit">Enquadrar</button><button id="block-zoom-in">＋</button><button id="block-zoom-out">－</button></div></div><div id="block-map-canvas" class="twin-map-canvas block-level-canvas"></div><div class="twin-map-note"><span>Mapa técnico completo do bloco, sem cortes.</span><b>O enquadramento inicial mostra a imagem inteira; o zoom preserva o bloco completo e a navegação mantém o mapa dentro da área visível.</b></div></section>
        <aside class="panel twin-inspector block-inspector"><div id="block-inspector-content"></div><div class="source-inventory" id="source-inventory"></div></aside>
      </div>`;
    bindShell();renderMap();
  }

  function bindShell(){
    $('#block-map-select',root).addEventListener('change',e=>{state.mapId=e.target.value;state.selected=null;state.tool=null;renderMap();});
    $('#block-mode',root).value=state.mode;$('#block-mode',root).addEventListener('change',e=>{state.mode=e.target.value;mapApi?.redraw();renderKpis();});
    $('#block-coverage',root).checked=state.showCoverage;$('#block-coverage',root).addEventListener('change',e=>{state.showCoverage=e.target.checked;mapApi?.redraw();});
    $('#block-labels',root).checked=state.showLabels;$('#block-labels',root).addEventListener('change',e=>{state.showLabels=e.target.checked;mapApi?.redraw();});
    $('#block-heatmap',root).checked=state.heatmap;$('#block-heatmap',root).addEventListener('change',e=>{state.heatmap=e.target.checked;mapApi?.redraw();});
    $('#export-block-json',root).addEventListener('click',()=>download('CLRC_Blocos_DigitalTwin.json',JSON.stringify(db,null,2),'application/json'));
    $('#import-block-json',root).addEventListener('change',importJson);
  }

  function renderMap(){
    const m=mapDef();
    $('#block-map-title',root).textContent=m.label;
    $('#block-map-eyebrow',root).textContent=state.mapId==='GERAL'?'VISÃO GERAL':'DETALHE POR BLOCO';
    $('#block-map-meta',root).textContent=m.area?`${m.area.toLocaleString('pt-BR')} m² aproximados · planta completa do bloco`:'Planta completa da área';
    $('#source-pdf-link',root).href=m.pdf;
    renderKpis();renderScenarioSummary();renderSourceInventory();renderInspector();bindTools();mountMap();
  }

  function renderKpis(){
    const m=mapDef();
    $('#block-kpis',root).innerHTML=`<div><span>Mapa</span><b>${esc(m.label)}</b><small>Visão consolidada</small></div><div><span>CFTV no PDF</span><b>${m.sourceCameras??'—'}</b><small>${m.sourceCameras!=null?`${m.sourceDigital||0} digitais · ${m.sourceAnalog||0} analógicas`:'Mapa geral'}</small></div><div><span>APs projetados</span><b>${count('ap')}</b><small>SSID WMS / coletores</small></div><div><span>Racks</span><b>${count('rack')}</b><small>${count('switch')} switch(es) · ${count('onu')} ONU(s)</small></div><div><span>Rotas de fibra</span><b>${current().fibers.length}</b><small>principal + redundância</small></div>`;
  }

  function renderSourceInventory(){
    const m=mapDef();
    $('#source-inventory',root).innerHTML=`<h4>Informação do desenho</h4>${m.sourceCameras==null?'<p>Mapa geral do Centro Logístico.</p>':`<div class="source-stat"><span>Total de câmeras</span><b>${m.sourceCameras}</b></div><div class="source-stat"><span>Digitais</span><b>${m.sourceDigital||0}</b></div><div class="source-stat"><span>Analógicas</span><b>${m.sourceAnalog||0}</b></div>`}<div class="source-stat"><span>Área aproximada</span><b>${m.area?m.area.toLocaleString('pt-BR')+' m²':'N/D'}</b></div><p class="subtle-note">As marcações originais de CFTV fazem parte do PDF base e não são duplicadas como pontos artificiais.</p>`;
  }

  function scenarioSpec(){
    const m=mapDef();if(state.mapId==='GERAL')return null;
    const endpoints=(m.apCount||0)+(m.sourceDigital||0);
    const rect=safeRect(m);const aspect=Math.max(rect.w/rect.h,rect.h/rect.w);
    const capacityRacks=Math.max(1,Math.ceil(endpoints/40));
    const distanceRacks=Math.max(1,Math.ceil(aspect/1.8));
    const rackCount=Math.min(6,Math.max(capacityRacks,distanceRacks));
    const switchCount=Math.max(rackCount,Math.ceil(endpoints/40));
    const onuCount=rackCount;
    return {apCount:m.apCount||0,alarmCount:m.alarmCount||0,rackCount,switchCount,onuCount,endpoints};
  }

  function renderScenarioSummary(){
    const s=scenarioSpec();const host=$('#scenario-block-summary',root);
    if(!s){host.innerHTML='<p class="subtle-note">Na visão geral, use os pontos manualmente. O cenário automático é aplicado nos mapas de bloco.</p>';$('#apply-block-scenario',root).disabled=true;return;}
    $('#apply-block-scenario',root).disabled=false;
    host.innerHTML=`<div class="scenario-summary compact"><div class="scenario-grid"><div><span>APs</span><b>${s.apCount}</b></div><div><span>Racks</span><b>${s.rackCount}</b></div><div><span>Switches</span><b>${s.switchCount}</b></div><div><span>ONUs</span><b>${s.onuCount}</b></div><div><span>Alarmes</span><b>${s.alarmCount}</b></div><div><span>Fibra</span><b>${s.rackCount*2}</b></div></div><p>Dimensionamento editável, distribuído pelo mapa completo do bloco.</p></div>`;
  }

  function bindTools(){
    $$('[data-add-type]',root).forEach(btn=>btn.onclick=()=>{state.tool={kind:'add',type:btn.dataset.addType};$$('[data-add-type]',root).forEach(x=>x.classList.toggle('active',x===btn));});
    $$('[data-fiber]',root).forEach(btn=>btn.onclick=()=>{state.tool={kind:'fiber'};state.fiberKind=btn.dataset.fiber;state.fiberDraft=[];$('#finish-block-fiber',root).disabled=false;});
    $('#finish-block-fiber',root).onclick=finishFiber;
    $('#apply-block-scenario',root).onclick=applyScenario;
    $('#clear-block-scenario',root).onclick=clearProjected;
    $('#block-fit',root).onclick=()=>mapApi?.fit();$('#block-zoom-in',root).onclick=()=>mapApi?.zoom(.8);$('#block-zoom-out',root).onclick=()=>mapApi?.zoom(1.25);
  }

  function gridPoints(rect,count,pad){
    if(!count)return[];const cols=Math.ceil(Math.sqrt(count*rect.w/Math.max(rect.h,1))),rows=Math.ceil(count/cols),pts=[];
    const px=Math.min(rect.w*.14,Math.max(pad,8)),py=Math.min(rect.h*.14,Math.max(pad,8));
    for(let i=0;i<count;i++){const c=i%cols,r=Math.floor(i/cols);const x=rect.x+px+(cols===1?(rect.w-2*px)/2:c*(rect.w-2*px)/(cols-1));const y=rect.y+py+(rows===1?(rect.h-2*py)/2:r*(rect.h-2*py)/(rows-1));pts.push({x,y});}
    return pts;
  }

  function perimeterPoints(rect,count,pad){
    if(!count)return[];const x0=rect.x+pad,y0=rect.y+pad,w=Math.max(1,rect.w-2*pad),h=Math.max(1,rect.h-2*pad),per=2*(w+h),pts=[];
    for(let i=0;i<count;i++){let t=i/count*per,x=x0,y=y0;if(t<w){x=x0+t;}else if(t<w+h){x=x0+w;y=y0+t-w;}else if(t<2*w+h){x=x0+w-(t-w-h);y=y0+h;}else{x=x0;y=y0+h-(t-2*w-h);}pts.push({x,y});}
    return pts;
  }

  function applyScenario(){
    const s=scenarioSpec();if(!s)return;clearProjected(false);
    const m=mapDef(),rect=safeRect(m),base=Math.max(5,Math.min(m.width,m.height)/65);
    const apRadius=Math.max(base*2.5,Math.min(rect.w,rect.h)/(Math.sqrt(Math.max(s.apCount,1))+2)*.65);
    const apPts=gridPoints(rect,s.apCount,apRadius*1.15);
    apPts.forEach((p,i)=>current().equipment.push({id:`AP-${state.mapId}-${String(i+1).padStart(2,'0')}`,type:'ap',name:`AP-${state.mapId}-${String(i+1).padStart(2,'0')}`,x:p.x,y:p.y,lifecycle:'projected',manufacturer:'Ubiquiti / Grandstream',model:'A definir por homologação',ssid:'WMS-COLETORES',vlan:'40',graphRadius:apRadius,operationalRadiusM:20,scenario:true,createdAt:now()}));
    const rackPts=gridPoints(rect,s.rackCount,base*4);
    rackPts.forEach((p,i)=>{
      const rackId=`RACK-${state.mapId}-${String(i+1).padStart(2,'0')}`;
      current().equipment.push({id:rackId,type:'rack',name:rackId,x:p.x,y:p.y,lifecycle:'projected',model:s.endpoints>40?'Rack 16U':'Rack 12U',scenario:true,createdAt:now()});
      current().equipment.push({id:`ONU-${state.mapId}-${String(i+1).padStart(2,'0')}`,type:'onu',name:`ONU-${state.mapId}-${String(i+1).padStart(2,'0')}`,x:clamp(p.x-base*1.8,rect.x,rect.x+rect.w),y:clamp(p.y+base*1.5,rect.y,rect.y+rect.h),lifecycle:'projected',model:'Parks / Datacom GPON',scenario:true,createdAt:now()});
      current().equipment.push({id:`UPS-${state.mapId}-${String(i+1).padStart(2,'0')}`,type:'ups',name:`UPS-${state.mapId}-${String(i+1).padStart(2,'0')}`,x:clamp(p.x+base*1.8,rect.x,rect.x+rect.w),y:clamp(p.y+base*1.5,rect.y,rect.y+rect.h),lifecycle:'projected',model:'Nobreak senoidal',scenario:true,createdAt:now()});
    });
    const swPts=gridPoints(rect,s.switchCount,base*4);
    swPts.forEach((p,i)=>current().equipment.push({id:`SW-${state.mapId}-${String(i+1).padStart(2,'0')}`,type:'switch',name:`SW-${state.mapId}-${String(i+1).padStart(2,'0')}`,x:clamp(p.x+base*.9,rect.x,rect.x+rect.w),y:clamp(p.y-base*1.2,rect.y,rect.y+rect.h),lifecycle:'projected',model:'PoE gerenciável 48p',vlan:'40/134',scenario:true,createdAt:now()}));
    const alarmPts=perimeterPoints(rect,s.alarmCount,base*2);
    alarmPts.forEach((p,i)=>current().equipment.push({id:`ALM-${state.mapId}-${String(i+1).padStart(2,'0')}`,type:'alarm',name:`ALM-${state.mapId}-${String(i+1).padStart(2,'0')}`,x:p.x,y:p.y,lifecycle:'projected',model:'Sensor a validar',graphRadius:base*3,scenario:true,createdAt:now()}));
    // Cada rack recebe uma rota principal e uma rota de contingência, ambas internas ao mapa.
    rackPts.forEach((p,i)=>{
      const entryA={x:rect.x+base,y:rect.y+base*(2+i%3)},entryB={x:rect.x+rect.w-base,y:rect.y+rect.h-base*(2+i%3)};
      current().fibers.push({id:`FIB-${state.mapId}-P-${i+1}`,kind:'primary',points:[entryA,{x:(entryA.x+p.x)/2,y:p.y},p],scenario:true});
      current().fibers.push({id:`FIB-${state.mapId}-R-${i+1}`,kind:'redundant',points:[entryB,{x:(entryB.x+p.x)/2,y:p.y+base},p],scenario:true});
    });
    current().updatedAt=now();save();state.mode='all';$('#block-mode',root).value='all';mapApi?.redraw();renderKpis();renderInspector();
  }

  function clearProjected(redraw=true){current().equipment=current().equipment.filter(e=>!e.scenario);current().fibers=current().fibers.filter(f=>!f.scenario);save();if(redraw){mapApi?.redraw();renderKpis();renderInspector();}}

  function defaultEquipment(type,p){const i=current().equipment.filter(x=>x.type===type).length+1,m=mapDef(),base=Math.max(5,Math.min(m.width,m.height)/65);return {id:`${type.toUpperCase()}-${state.mapId}-${String(i).padStart(2,'0')}`,type,name:`${TYPES[type].label} ${i}`,x:p.x,y:p.y,lifecycle:'installed',manufacturer:'',model:'',ip:'',mac:'',vlan:'',ssid:'',notes:'',graphRadius:type==='ap'?base*5:type==='camera'?base*6:type==='alarm'?base*3:null,direction:0,angle:70,irM:type==='camera'?30:null,createdAt:now()};}

  function mountMap(){mapApi=createMap($('#block-map-canvas',root),mapDef(),current(),{select:selectItem,click:canvasClick});}

  function createMap(host,m,data,cb){
    host.replaceChildren();const rect=safeRect(m);let view=[0,0,m.width,m.height],drag=null,selected=state.selected;
    const svg=svgEl('svg',{viewBox:view.join(' '),class:'digital-twin-svg block-svg',preserveAspectRatio:'xMidYMid meet'});svg.append(svgEl('image',{href:m.image,x:0,y:0,width:m.width,height:m.height,preserveAspectRatio:'xMidYMid meet',class:'twin-base-image'}));
    const heat=svgEl('g'),fib=svgEl('g'),cov=svgEl('g'),marks=svgEl('g'),labels=svgEl('g'),draft=svgEl('g');svg.append(heat,fib,cov,marks,labels,draft);host.append(svg);
    const coord=e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse());};
    const base=()=>clamp(Math.min(m.width,m.height)/55,5,15);
    const home=[0,0,m.width,m.height];
    const minZoom=.32,maxZoom=6;
    function clampView(v){
      let [x,y,w,h]=v;
      const minW=home[2]*minZoom,minH=home[3]*minZoom,maxW=home[2],maxH=home[3];
      w=clamp(w,minW,maxW);h=clamp(h,minH,maxH);
      x=clamp(x,0,Math.max(0,m.width-w));
      y=clamp(y,0,Math.max(0,m.height-h));
      return [x,y,w,h];
    }
    function setView(v){view=clampView(v);svg.setAttribute('viewBox',view.join(' '));}
    function inside(p){return {x:clamp(p.x,rect.x,rect.x+rect.w),y:clamp(p.y,rect.y,rect.y+rect.h)};}
    function redraw(){
      [heat,fib,cov,marks,labels,draft].forEach(g=>g.replaceChildren());const s=base();
      if(state.heatmap)visibleEq().filter(e=>['ap','camera','alarm'].includes(e.type)).forEach(e=>{const r=e.graphRadius||s*4;heat.append(svgEl('circle',{cx:e.x,cy:e.y,r,class:`heatmap-shape ${e.type}`}));});
      data.fibers.forEach(f=>{const pts=f.points.map(p=>`${p.x},${p.y}`).join(' ');const g=svgEl('g',{'data-fid':f.id,class:`fiber-route ${f.kind}`});g.append(svgEl('polyline',{points:pts,class:'fiber-halo'}),svgEl('polyline',{points:pts,class:'fiber-line'}));fib.append(g);});
      if(state.fiberDraft.length)draft.append(svgEl('polyline',{points:state.fiberDraft.map(p=>`${p.x},${p.y}`).join(' '),class:`fiber-line draft ${state.fiberKind}`}));
      visibleEq().forEach(e=>{const t=TYPES[e.type];if(!t)return;const scale=(m.height<350||m.width<450)?.62:1;
        if(state.showCoverage&&['ap','camera','alarm'].includes(e.type)){const r=Math.min(e.graphRadius||s*4,Math.min(e.x-rect.x,rect.x+rect.w-e.x,e.y-rect.y,rect.y+rect.h-e.y));if(r>2){if(e.type==='camera'){const a=(e.angle||70)*Math.PI/180,d=(e.direction||0)*Math.PI/180,p1={x:e.x+r*Math.cos(d-a/2),y:e.y+r*Math.sin(d-a/2)},p2={x:e.x+r*Math.cos(d+a/2),y:e.y+r*Math.sin(d+a/2)};cov.append(svgEl('path',{d:`M ${e.x} ${e.y} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`,class:'camera-fov'}));}else{[1,.65].forEach((k,i)=>cov.append(svgEl('circle',{cx:e.x,cy:e.y,r:r*k,class:e.type==='ap'?`coverage-ring ring-${i}`:`alarm-ring ring-${i}`})));}}}
        const g=svgEl('g',{'data-eid':e.id,class:`twin-marker type-${e.type} life-${e.lifecycle} ${selected===e.id?'selected':''}`});g.append(svgEl('circle',{cx:e.x,cy:e.y,r:s*.9*scale,class:'marker-hit'}));g.append(svgEl('circle',{cx:e.x,cy:e.y,r:s*.55*scale,fill:t.color,class:'marker-core'}));g.append(svgEl('text',{x:e.x,y:e.y+s*.17*scale,'text-anchor':'middle',class:'marker-icon','font-size':`${Math.max(5,9*scale)}px`},t.icon));marks.append(g);if(state.showLabels||selected===e.id)labels.append(svgEl('text',{x:e.x+s*.65,y:e.y-s*.65,class:'twin-label','font-size':`${Math.max(5,s*.55)}px`},e.name||e.id));
      });
    }
    svg.addEventListener('pointerdown',e=>{const item=e.target.closest('[data-eid]');if(item){selected=item.dataset.eid;state.selected=selected;cb.select(selected);drag={kind:'item',id:selected};svg.setPointerCapture(e.pointerId);redraw();return;}const p=coord(e);drag={kind:'pan',start:p,origin:[...view],moved:false};svg.setPointerCapture(e.pointerId);});
    svg.addEventListener('pointermove',e=>{if(!drag)return;const p=coord(e);if(drag.kind==='item'){const item=data.equipment.find(x=>x.id===drag.id);if(item){const q=inside(p);item.x=q.x;item.y=q.y;redraw();}}else{const dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;setView([drag.origin[0]-dx,drag.origin[1]-dy,drag.origin[2],drag.origin[3]]);}});
    svg.addEventListener('pointerup',e=>{const d=drag;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(d?.kind==='item'){save();renderKpis();return;}if(d?.kind==='pan'&&!d.moved)cb.click(inside(coord(e)));});
    redraw();return {redraw,select(id){selected=id;redraw();},fit(){setView(home);},zoom(f){const [x,y,w,h]=view,nw=w*f,nh=h*f;setView([x+(w-nw)/2,y+(h-nh)/2,nw,nh]);}};
  }

  function canvasClick(p){if(!state.tool){state.selected=null;mapApi?.select(null);renderInspector();return;}if(state.tool.kind==='add'){const e=defaultEquipment(state.tool.type,p);current().equipment.push(e);state.selected=e.id;state.tool=null;$$('[data-add-type]',root).forEach(x=>x.classList.remove('active'));save();mapApi.redraw();mapApi.select(e.id);renderKpis();renderInspector();}else if(state.tool.kind==='fiber'){state.fiberDraft.push(p);mapApi.redraw();}}
  function finishFiber(){if(state.fiberDraft.length<2)return;current().fibers.push({id:`FIB-${state.mapId}-${Date.now()}`,kind:state.fiberKind,points:[...state.fiberDraft],scenario:false});state.fiberDraft=[];state.tool=null;$('#finish-block-fiber',root).disabled=true;save();mapApi.redraw();renderKpis();}
  function selectItem(id){state.selected=id;renderInspector();}

  function renderInspector(){const host=$('#block-inspector-content',root);const e=current().equipment.find(x=>x.id===state.selected);if(!e){host.innerHTML='<div class="empty-inspector"><div class="empty-orbit">◎</div><h3>Selecione um equipamento</h3><p>Você pode mover qualquer ponto arrastando-o. O sistema impede que ele ultrapasse a área útil do mapa.</p></div>';return;}host.innerHTML=`<div class="inspector-head"><div><span class="badge">${TYPES[e.type]?.label||e.type}</span><h3>${esc(e.name||e.id)}</h3><small>${esc(e.id)}</small></div></div><div class="inspector-form">${field('Nome','name',e.name)}${selectField('Situação','lifecycle',e.lifecycle)}${field('Fabricante','manufacturer',e.manufacturer)}${field('Modelo','model',e.model)}${field('IP','ip',e.ip)}${field('MAC','mac',e.mac)}${field('VLAN','vlan',e.vlan)}${e.type==='ap'?field('SSID','ssid',e.ssid)+field('Raio gráfico','graphRadius',Math.round(e.graphRadius||0),'number'):''}${e.type==='camera'?field('Direção (graus)','direction',e.direction,'number')+field('Ângulo','angle',e.angle,'number')+field('IR (m)','irM',e.irM,'number')+field('Raio gráfico','graphRadius',Math.round(e.graphRadius||0),'number'):''}${e.type==='alarm'?field('Raio gráfico','graphRadius',Math.round(e.graphRadius||0),'number'):''}<label class="field full"><span>Observações</span><textarea data-prop="notes">${esc(e.notes||'')}</textarea></label></div><div class="inspector-actions"><button class="btn primary" id="save-block-item">Salvar</button><button class="btn danger" id="delete-block-item">Remover</button></div>`;$('#save-block-item',host).onclick=()=>{$$('[data-prop]',host).forEach(i=>e[i.dataset.prop]=i.type==='number'?(i.value===''?null:Number(i.value)):i.value);save();mapApi.redraw();renderInspector();};$('#delete-block-item',host).onclick=()=>{current().equipment=current().equipment.filter(x=>x.id!==e.id);state.selected=null;save();mapApi.redraw();renderKpis();renderInspector();};}
  function field(label,prop,value,type='text'){return `<label class="field"><span>${label}</span><input data-prop="${prop}" type="${type}" value="${esc(value??'')}"></label>`;}
  function selectField(label,prop,value){return `<label class="field"><span>${label}</span><select data-prop="${prop}"><option value="installed" ${value==='installed'?'selected':''}>Instalado</option><option value="projected" ${value==='projected'?'selected':''}>Projetado</option><option value="disabled" ${value==='disabled'?'selected':''}>Desativado</option></select></label>`;}
  function importJson(ev){const f=ev.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.maps)throw new Error('Formato inválido');db=d;Object.keys(MAPS).forEach(id=>db.maps[id]||(db.maps[id]={equipment:[],fibers:[],updatedAt:now()}));save();renderMap();}catch(e){alert(e.message);}};r.readAsText(f);}
  function download(name,content,type){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}

  window.DigitalTwinModule={render,reset(){localStorage.removeItem(STORAGE);db=load();if(root)render(root);}};
})();
