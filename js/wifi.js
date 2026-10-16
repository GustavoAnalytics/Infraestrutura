(function(){
 const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const clone=v=>JSON.parse(JSON.stringify(v)),storageKey='clrc-wifi-plants-v1';
 let current='A5';
 const brands=['Grandstream','UniFi','Aruba'],brandColors={Grandstream:'#0891b2',UniFi:'#2563eb',Aruba:'#ea580c'};
 const validColor=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
 function validate(payload){
  if(!payload||![1,2].includes(payload.version)||payload.kind!=='wifi-plans'||!payload.areas||Array.isArray(payload.areas))throw Error('Use um JSON de ajustes Wi-Fi deste projeto.');
  const result={};
  for(const [key,v] of Object.entries(payload.areas)){
   const plan=window.WIFI_PLANS[key];if(!plan||!v||!Array.isArray(v.points)||v.points.length>500)throw Error('Área ou quantidade de APs incompatível.');
   if((v.mapRevision||null)!==(plan.revision||null))continue;
   const ids=new Set(),position=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<=plan.width&&p.y<=plan.height;
   const unique=p=>{if(!p||typeof p.id!=='string'||!p.id||p.id.length>80||ids.has(p.id))throw Error('Identificação inválida ou repetida.');ids.add(p.id);};
   const points=v.points.map(p=>{
    unique(p);if(!position(p))throw Error('Coordenada de AP inválida.');
    const base=window.GTO_DATA.wifiProfiles[key].aps.find(a=>a.id===p.id);
    if(payload.version===1&&!base)throw Error('AP antigo não reconhecido.');
    const brand=p.brand||base?.brand;if(!brands.includes(brand))throw Error('Marca de AP inválida.');
    if(p.radius!==undefined&&(!Number.isFinite(p.radius)||p.radius<=0||p.radius>Math.hypot(plan.width,plan.height)))throw Error('Raio inválido.');
    if(p.color!==undefined&&!validColor(p.color))throw Error('Cor inválida.');
    return {id:p.id,x:p.x,y:p.y,evidence:String(p.evidence||'Posição manual; validar.').slice(0,250),brand,model:String(p.model||base?.model||'').slice(0,120),color:p.color||brandColors[brand],...(p.radius!==undefined?{radius:p.radius}:{}),custom:!base};
   });
   if(!Array.isArray(v.radii)||v.radii.length!==3||v.radii.some(n=>!Number.isFinite(n)||n<=0||n>Math.hypot(plan.width,plan.height))||!(v.radii[0]<v.radii[1]&&v.radii[1]<v.radii[2]))throw Error('Raios devem ser positivos e crescentes.');
   let calibration=null;
   if(v.calibration){const c=v.calibration;if(![c.a,c.b].every(position)||!Number.isFinite(c.metres)||c.metres<=0||c.metres>10000)throw Error('Calibração inválida.');const distance=Math.hypot(c.a.x-c.b.x,c.a.y-c.b.y);if(distance<5)throw Error('Referências próximas demais.');calibration={a:c.a,b:c.b,metres:c.metres,pixelsPerMetre:distance/c.metres};}
   for(const k of ['racks','fibers'])if(v[k]!==undefined&&(!Array.isArray(v[k])||v[k].length>500))throw Error('Infraestrutura inválida.');
   const racks=(v.racks||[]).map(r=>{unique(r);if(!position(r)||!validColor(r.color))throw Error('Rack inválido.');return {id:r.id,x:r.x,y:r.y,color:r.color,label:String(r.label||r.id).slice(0,80)};});
   const fibers=(v.fibers||[]).map(f=>{unique(f);if(!validColor(f.color)||!Array.isArray(f.points)||f.points.length<2||f.points.length>200||!f.points.every(position))throw Error('Trajeto de fibra inválido.');return {id:f.id,label:String(f.label||f.id).slice(0,80),color:f.color,points:f.points.map(p=>({x:p.x,y:p.y}))};});
   result[key]={points,racks,fibers,radii:v.radii,calibration,mapRevision:plan.revision||null};
  }
  return result;
 }
 function render(root){
  const data=window.GTO_DATA,plans=window.WIFI_PLANS,keys=Object.keys(plans);
  let all=Object.fromEntries(keys.map(k=>[k,{points:clone(plans[k].points).map(p=>({...p,brand:data.wifiProfiles[k].aps.find(a=>a.id===p.id).brand})),racks:[],fibers:[],radii:[...plans[k].radii],calibration:null,mapRevision:plans[k].revision||null}])),badSaved=false;
  try{const saved=localStorage.getItem(storageKey);if(saved)Object.assign(all,validate(JSON.parse(saved)));}catch(e){badSaved=true;}
  let engine,active=null,infraActive=null,undo=[],pendingCalibration=null,pendingItem=null,fiberDraft=[],redrawFiber=null;
  root.innerHTML=`
   <section class="view-head"><div><span class="eyebrow">WI-FI / PLANTAS E ABRANGÊNCIA</span><h1>Cobertura Wi-Fi sobre a planta</h1><p>Monte a infraestrutura sobre a planta: APs, racks e trajetos de fibra.</p></div><span class="status-pill warning">ESTIMATIVA GRÁFICA · NÃO É SITE SURVEY</span></section>
   <div id="wifi-metrics" class="metric-strip"></div>
   <section class="panel wifi-workbench">
    <div class="wifi-area-tabs cftv-area-tabs" role="group" aria-label="Selecionar área Wi-Fi">${keys.map(k=>`<button class="btn secondary" data-wifi-area="${k}">${esc(data.wifiProfiles[k].label)}</button>`).join('')}</div>
    <div class="panel-title-row plan-heading"><div><h2 id="wifi-title"></h2><p class="micro-copy" id="wifi-sub"></p></div><div class="toolbar-group"><a class="btn secondary" id="wifi-source-map" target="_blank" rel="noopener">Planta original ↗</a><a class="btn secondary" id="wifi-source-data" target="_blank" rel="noopener">Fonte do inventário ↗</a></div></div>
    <div class="plan-toolbar">
     <div class="toolbar-group"><button class="btn" id="wifi-out" aria-label="Diminuir zoom Wi-Fi">−</button><button class="btn" id="wifi-in" aria-label="Aumentar zoom Wi-Fi">+</button><button class="btn secondary" id="wifi-fit">Enquadrar</button><button class="btn secondary" id="wifi-full">Tela cheia</button></div>
     <div class="toolbar-group">${[['good','Interna'],['medium','Intermediária'],['weak','Externa'],['outside','Fora dos raios'],['heatmap','Heatmap'],['labels','IDs'],['onlySelected','Só selecionado']].map(([key,label])=>`<label><input type="checkbox" data-wifi-layer="${key}" ${['good','medium','weak'].includes(key)?'checked':''}> ${label}</label>`).join('')}</div>
     <label class="opacity-control">Opacidade <input id="wifi-opacity" type="range" min="4" max="35" value="16" aria-label="Opacidade da cobertura Wi-Fi"></label>
    </div>
    <div class="infra-toolbar"><strong>Montar infraestrutura</strong><button class="btn" id="infra-new-ap">+ AP</button><button class="btn secondary" id="infra-add-rack">+ Rack</button><button class="btn secondary" id="infra-fiber">Desenhar fibra</button><button class="btn secondary" id="infra-finish" disabled>Concluir fibra</button><button class="btn secondary" id="infra-cancel">Cancelar / selecionar</button><span id="infra-mode" role="status">Selecione um item para editar.</span></div>
    <div class="wifi-map-layout">
     <div class="wifi-plan-stage"><div id="wifi-map"></div><div class="plan-caption"><span id="wifi-caption"></span><span>Arraste o fundo para navegar · + / − para ampliar</span></div></div>
     <aside class="wifi-map-inspector">
      <section class="infra-editor"><h3>Tipo de AP e alcance</h3><p class="micro-copy">Escolha a marca, defina o raio e clique em “Inserir AP no mapa”. Para editar, selecione um AP existente.</p>
      <label>Marca<select id="ap-brand" class="field-select"><option value="Grandstream">Grandstream · ciano</option><option value="UniFi">UniFi / Ubiquiti · azul</option><option value="Aruba">Aruba · laranja</option></select></label>
      <label>Modelo / identificação<input id="ap-model" maxlength="120" placeholder="Modelo exato (opcional)"></label>
      <label>Raio externo <span id="ap-radius-unit">(u.g.)</span><input id="ap-radius" type="number" min="0.1" step="any"></label>
      <label>Cor do AP e do alcance<input id="ap-color" type="color" value="#0891b2"></label>
      <div class="infra-actions"><button class="btn" id="ap-insert">Inserir AP no mapa</button><button class="btn secondary" id="ap-update" disabled>Aplicar ao selecionado</button><button class="btn secondary" id="ap-delete" disabled>Remover do mapa</button></div>
      <p class="micro-copy">Raio manual, não alcance garantido da marca. Calibre a planta para informar metros. Faixas internas: 50% e 75% do raio externo.</p></section>
      <span class="eyebrow">ACCESS POINT</span><select class="field-select" id="wifi-ap-select" aria-label="Selecionar AP"></select><div id="wifi-inspector" class="micro-copy">Clique em um AP no mapa.</div>
      <label class="check-row"><input type="checkbox" id="wifi-edit"><span>Permitir arrastar AP e rack</span></label><button class="btn secondary" id="wifi-place" disabled>Posicionar AP selecionado</button>
      <section class="infra-editor"><h3>Racks e fibra</h3><select id="infra-select" class="field-select" aria-label="Selecionar rack ou fibra"></select><label>Nome<input id="infra-name" maxlength="80" placeholder="Rack / trajeto"></label><label>Cor<input id="infra-color" type="color" value="#7c3aed"></label><p class="micro-copy" id="infra-info">Racks em violeta. Fibra em rosa com contorno branco.</p><div class="infra-actions"><button class="btn secondary" id="infra-update" disabled>Salvar item</button><button class="btn secondary" id="infra-move" disabled>Reposicionar / redesenhar</button><button class="btn secondary" id="infra-delete" disabled>Remover item</button></div></section>
      <hr><h3>Raios padrão da área <small id="wifi-unit"></small></h3>
      <p class="micro-copy">Aplicados somente aos APs sem raio individual. O heatmap usa as faixas geométricas de cada AP.</p>
      <div class="wifi-radius-fields">${['Interna','Intermediária','Externa'].map((v,i)=>`<label>${v}<input type="number" id="wifi-radius-${i}" min="0.1" step="any" aria-label="Raio ${v.toLowerCase()}"></label>`).join('')}</div>
      <button class="btn" id="wifi-apply-radii">Aplicar padrão</button>
      <hr><h3>Escala do mapa</h3><p id="wifi-scale-info" class="micro-copy"></p>
      <label class="wifi-distance-label">Distância conhecida (m)<input id="wifi-known-distance" type="number" min="0.01" max="10000" step="any" value="10"></label>
      <button class="btn secondary" id="wifi-calibrate">Marcar dois pontos</button><button class="btn" id="wifi-apply-calibration" disabled>Aplicar escala</button><button class="btn secondary" id="wifi-clear-calibration">Remover / cancelar escala</button>
      <button class="btn secondary" id="wifi-undo" disabled>Desfazer ajuste</button><p class="micro-copy" id="wifi-save-status" role="status"></p>
     </aside>
    </div>
    <div class="plan-legend"><span><i style="background:#0891b2"></i>Grandstream</span><span><i style="background:#2563eb"></i>UniFi / Ubiquiti</span><span><i style="background:#ea580c"></i>Aruba</span><span><i style="background:#7c3aed"></i>Rack</span><span><i style="background:#db2777"></i>Fibra</span><span>Alcance: cor do AP, editável · heatmap: verde / amarelo / laranja · vermelho: fora dos raios</span></div>
    <div class="plan-evidence"><strong>Premissas e fonte</strong><p id="wifi-evidence"></p><p>O contorno tracejado delimita a região de análise e não representa uma barreira de sinal. Os círculos de alcance aparecem em toda a imagem; os percentuais e o heatmap analisam a região tracejada; paredes, docas, metal, mercadorias, altura, canais e potência não são modelados. Não há medição de RSSI, SNR, interferência, capacidade ou comprovação de pontos cegos.</p><p id="wifi-print-settings"></p><p>Ao calibrar, use dois pontos de uma dimensão conhecida da própria planta. A conversão passa a usar os metros informados; a calibração não transforma a simulação em medição de RF.</p></div>
    <div class="plan-footer"><div><button class="btn" id="wifi-export">Exportar ajustes JSON</button><button class="btn secondary" id="wifi-import">Importar ajustes</button><input type="file" id="wifi-file" accept="application/json,.json" hidden></div><button class="btn secondary" id="wifi-print">Imprimir mapa / PDF</button></div>
   </section>
   <section class="panel table-panel wifi-inventory"><div class="panel-title-row"><h3>APs no mapa · cadastro editável</h3><span id="wifi-ap-count" class="badge blue"></span></div><div class="table-scroll"><table><thead><tr><th>ID</th><th>Marca</th><th>Modelo</th><th>IP</th><th>MAC</th><th>Controlador</th><th>Posição no mapa</th></tr></thead><tbody id="wifi-table"></tbody></table></div></section>`;
  const $=s=>root.querySelector(s),message=s=>$('#wifi-save-status').textContent=s;
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify({version:2,kind:'wifi-plans',areas:all}));message('Ajustes salvos neste navegador. Exporte o JSON para conservar em outro local.');}catch(e){message('Salvamento local indisponível. Exporte seus ajustes em JSON.');}}
  function snapshot(){undo.push({area:current,state:clone(all[current])});if(undo.length>30)undo.shift();$('#wifi-undo').disabled=false;}
  function metrics(model,count){const p=data.wifiProfiles[current],s=all[current];const metric=(label,value,note,cls='')=>`<div class="metric-card ${cls}"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
   $('#wifi-metrics').innerHTML=[metric('APs no mapa',s.points.length,p.inventoryKnown===false?'Inventário original N/D · cadastro editável':p.aps.length+' APs no levantamento original','accent'),metric('Escala',s.calibration?'Calibrada':'Não calibrada',s.calibration?'Distância informada pelo usuário':'Extensão em unidades da imagem'),metric('Na faixa interna',(!count||model.good===null)?'N/D':model.good+'%',`Modelo geométrico · ${count} APs exibidos`,'good'),metric('Fora dos raios',(!count||model.outside===null)?'N/D':model.outside+'%','Hipótese geométrica, não falha medida','warning')].join('');
  }
  function settings(){const s=all[current],scale=s.calibration?.pixelsPerMetre||1,unit=s.calibration?'m':'u.g.';
   $('#wifi-unit').textContent='('+unit+')';$('#ap-radius-unit').textContent='('+unit+')';if(active)$('#ap-radius').value=((active.radius||s.radii[2])/scale).toFixed(2);else $('#ap-radius').value=(s.radii[2]/scale).toFixed(2);s.radii.forEach((r,i)=>$('#wifi-radius-'+i).value=(r/scale).toFixed(2));
   $('#wifi-scale-info').textContent=s.calibration?`${s.calibration.metres} m entre A/B · ${s.calibration.pixelsPerMetre.toFixed(3)} unidades por metro. Referência do usuário, a conferir.`:'Sem escala métrica: u.g. são unidades gráficas da imagem. Não equivalem a metros.';
   $('#wifi-print-settings').textContent=`Raios padrão (APs com raio individual usam seus próprios valores): ${s.radii.map(r=>(r/scale).toFixed(2)).join(' / ')} ${unit}. ${s.calibration?'Escala definida pelo usuário.':'Escala não calibrada.'} Percentuais referem-se somente à região tracejada e aos APs exibidos na simulação.`;
  }
  function inspect(point){active=point;$('#ap-update').disabled=!point;$('#ap-delete').disabled=!point;$('#wifi-ap-select').value=point?.id||'';$('#wifi-place').disabled=!point;
   if(!point){$('#wifi-inspector').textContent='Clique em um AP para ver os dados e ajustar a posição.';return;}
   const ap=inventory().find(a=>a.id===point.id);
   $('#ap-brand').value=ap.brand;$('#ap-model').value=ap.model||'';$('#ap-color').value=point.color||brandColors[ap.brand];$('#ap-radius').value=((point.radius||all[current].radii[2])/(all[current].calibration?.pixelsPerMetre||1)).toFixed(2);
   $('#wifi-inspector').innerHTML=`<b>${esc(ap.id)} · ${esc(ap.brand)}</b><dl><dt>Modelo</dt><dd>${esc(ap.model||'Não informado')}</dd><dt>IP</dt><dd>${esc(ap.ip||'Não informado')}</dd><dt>MAC</dt><dd>${esc(ap.mac||'Não informado')}</dd><dt>Controlador</dt><dd>${esc(ap.controller||ap.controllerIp||'Não informado')}</dd></dl><p>${esc(point.evidence)}</p><p>x ${point.x.toFixed(1)} · y ${point.y.toFixed(1)} u.g.</p>`;
  }
  function table(){const profile=data.wifiProfiles[current];$('#wifi-table').innerHTML=inventory().map(ap=>{const p=all[current].points.find(p=>p.id===ap.id);return `<tr><td><button class="text-button wifi-ap-row" data-id="${esc(ap.id)}">${esc(ap.id)}</button></td><td>${esc(ap.brand)}</td><td>${esc(ap.model||'N/D')}</td><td>${esc(ap.ip||'N/D')}</td><td>${esc(ap.mac||'N/D')}</td><td>${esc(ap.controller||ap.controllerIp||'N/D')}</td><td>${esc(p.evidence)}</td></tr>`;}).join('')||'<tr><td colspan="7">Inventário de APs não fornecido para esta área.</td></tr>';root.querySelectorAll('.wifi-ap-row').forEach(b=>b.onclick=()=>{engine.select(b.dataset.id);$('#wifi-map').scrollIntoView({block:'center'});});}
  function draw(){const plan=plans[current],profile=data.wifiProfiles[current];pendingItem=null;fiberDraft=[];redrawFiber=null;$('#infra-finish').disabled=true;$('#infra-mode').textContent='Selecione um item para editar.';pendingCalibration=null;$('#wifi-apply-calibration').disabled=true;
   root.querySelectorAll('[data-wifi-area]').forEach(b=>b.classList.toggle('active',b.dataset.wifiArea===current));
   $('#wifi-title').textContent='Wi-Fi · '+profile.label;$('#wifi-sub').textContent=profile.inventoryKnown===false?'Inventário Wi-Fi não fornecido · nova planta disponível':`${profile.aps.length} APs · posições estimadas / leitura de diagrama · ${current==='F'||current==='A10'?'planta do diagrama fornecido':'planta original'}`;
   $('#wifi-source-map').href=plan.image;$('#wifi-source-data').href=profile.background;$('#wifi-evidence').textContent=(all[current].points.length&&profile.inventoryKnown===false?'Planta '+current+' com APs cadastrados manualmente no editor. O inventário original desta área não foi fornecido; a abrangência exibida é uma simulação geométrica.':plan.note)+' Itens inseridos e alterações neste editor são cadastros manuais. Os totais do levantamento original permanecem como referência.';
   $('#wifi-caption').textContent=`${all[current].points.length} APs no mapa · ${all[current].racks.length} racks · ${all[current].fibers.length} trajetos de fibra · cadastro manual`;
   $('#wifi-ap-count').textContent=all[current].points.length+' APs no mapa';$('#wifi-ap-select').innerHTML='<option value="">Selecione um AP</option>'+inventory().map(a=>`<option value="${esc(a.id)}">${esc(a.id)} · ${esc(a.brand)}</option>`).join('');
   $('#wifi-place').textContent='Posicionar AP selecionado';inspect(null);settings();table();infraList();inspectInfra(null);
   engine=window.MapModule.mount($('#wifi-map'),plan,all[current],inventory(),{onTool:handleTool,onInfraSelect:inspectInfra,onSelect:inspect,onMetrics:metrics,onMessage:message,onBeforeChange:snapshot,onChange:()=>{table();infraList();persist();},onPlace:p=>{
     if(!active)return;snapshot();active.x=Math.round(p.x*10)/10;active.y=Math.round(p.y*10)/10;active.evidence='Posição definida pelo usuário; validar em campo.';engine.draw();inspect(active);table();$('#wifi-place').textContent='Posicionar AP selecionado';persist();
    },onCalibrate:points=>{pendingCalibration=points;$('#wifi-apply-calibration').disabled=false;message('Referência A/B marcada. Informe a distância real e clique em Aplicar escala.');}});
   root.querySelectorAll('[data-wifi-layer]').forEach(c=>engine.setLayer(c.dataset.wifiLayer,c.checked));engine.setEdit($('#wifi-edit').checked);engine.setOpacity(Number($('#wifi-opacity').value)/100);
  }
  root.querySelectorAll('[data-wifi-area]').forEach(b=>b.onclick=()=>{current=b.dataset.wifiArea;draw();});
  $('#wifi-in').onclick=()=>engine.zoom(.8);$('#wifi-out').onclick=()=>engine.zoom(1.25);$('#wifi-fit').onclick=()=>engine.fit();
  $('#wifi-full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.wifi-workbench').requestFullscreen();}catch(e){message('Tela cheia indisponível; use o zoom do mapa.');}};
  root.querySelectorAll('[data-wifi-layer]').forEach(c=>c.onchange=()=>engine.setLayer(c.dataset.wifiLayer,c.checked));
  $('#wifi-opacity').oninput=e=>engine.setOpacity(Number(e.target.value)/100);$('#wifi-edit').onchange=e=>engine.setEdit(e.target.checked);
  $('#wifi-ap-select').onchange=e=>engine.select(e.target.value);
  $('#wifi-place').onclick=()=>{if(!active)return;const adding=engine.place();$('#wifi-place').textContent=adding?'Cancelar posicionamento':'Posicionar AP selecionado';message(adding?'Clique na posição do AP na planta.':'Posicionamento cancelado.');};
  $('#wifi-apply-radii').onclick=()=>{
   const s=all[current],scale=s.calibration?.pixelsPerMetre||1,values=[0,1,2].map(i=>Number($('#wifi-radius-'+i).value)*scale);
   if(values.some(v=>!Number.isFinite(v)||v<=0||v>Math.hypot(plans[current].width,plans[current].height))||!(values[0]<values[1]&&values[1]<values[2])){message('Use raios positivos e crescentes: interna < intermediária < externa, dentro do tamanho da imagem.');return;}
   snapshot();s.radii=values;settings();engine.draw();persist();
  };
  $('#wifi-calibrate').onclick=()=>{pendingCalibration=null;$('#wifi-apply-calibration').disabled=true;engine.calibrate();message('Clique no primeiro ponto de uma dimensão conhecida na planta.');};
  $('#wifi-apply-calibration').onclick=()=>{
   const metres=Number($('#wifi-known-distance').value);if(!pendingCalibration||!Number.isFinite(metres)||metres<=0||metres>10000){message('Marque dois pontos e informe uma distância real positiva (até 10.000 m).');return;}
   const [a,b]=pendingCalibration,d=Math.hypot(a.x-b.x,a.y-b.y);if(d<5){message('Os pontos estão próximos demais; marque uma referência maior.');return;}
   snapshot();all[current].calibration={a,b,metres,pixelsPerMetre:d/metres};pendingCalibration=null;$('#wifi-apply-calibration').disabled=true;engine.cancelCalibration();settings();engine.draw();persist();
  };
  $('#wifi-clear-calibration').onclick=()=>{if(all[current].calibration){snapshot();all[current].calibration=null;persist();}pendingCalibration=null;$('#wifi-apply-calibration').disabled=true;engine.cancelCalibration();settings();engine.draw();};
  $('#wifi-undo').onclick=()=>{const previous=undo.pop();if(!previous)return;all[previous.area]=previous.state;current=previous.area;draw();persist();$('#wifi-undo').disabled=!undo.length;};
  $('#wifi-export').onclick=()=>{const blob=new Blob([JSON.stringify({version:2,kind:'wifi-plans',exportedAt:new Date().toISOString(),areas:all},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='CLRC_Ajustes_WiFi.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('#wifi-import').onclick=()=>$('#wifi-file').click();$('#wifi-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>2*1024*1024)throw Error('Arquivo excede 2 MB.');const next=validate(JSON.parse(await f.text()));Object.entries(next).forEach(([area,s])=>{undo.push({area,state:clone(all[area])});all[area]=s;});$('#wifi-undo').disabled=!undo.length;draw();persist();}catch(err){message('Importação recusada: '+err.message);}e.target.value='';};
  function inventory(){return all[current].points.map(p=>({...data.wifiProfiles[current].aps.find(a=>a.id===p.id),...p}));}
  function nextId(prefix){const s=all[current],ids=new Set([...s.points,...s.racks,...s.fibers].map(p=>p.id));let i=1;while(ids.has(prefix+i))i++;return prefix+i;}
  function infraList(){$('#infra-select').innerHTML='<option value="">Selecione rack ou fibra</option>'+[...all[current].racks,...all[current].fibers].map(r=>`<option value="${esc(r.id)}">${esc(r.label||r.id)}</option>`).join('');}
  function inspectInfra(item){infraActive=item;$('#infra-select').value=item?.id||'';['infra-update','infra-move','infra-delete'].forEach(id=>$('#'+id).disabled=!item);$('#infra-name').value=item?.label||'';$('#infra-color').value=item?.color||'#7c3aed';
   if(!item){$('#infra-info').textContent='Selecione um rack ou um trajeto. As rotas são desenhos manuais.';return;}
   if(item.points){const d=item.points.slice(1).reduce((v,p,i)=>v+Math.hypot(p.x-item.points[i].x,p.y-item.points[i].y),0),scale=all[current].calibration?.pixelsPerMetre||1;$('#infra-info').textContent=`${item.points.length} vértices · ${(d/scale).toFixed(1)} ${all[current].calibration?'m':'u.g.'} de trajeto desenhado, sem folga técnica.`;}else $('#infra-info').textContent=`${item.id} · arraste com edição habilitada ou use Reposicionar.`;
  }
  function apFields(){const radius=Number($('#ap-radius').value)*(all[current].calibration?.pixelsPerMetre||1);if(!Number.isFinite(radius)||radius<=0||radius>Math.hypot(plans[current].width,plans[current].height)){message('Informe um raio positivo dentro do tamanho da planta. Calibre para usar metros.');return null;}return {brand:$('#ap-brand').value,model:$('#ap-model').value.trim(),radius,color:$('#ap-color').value};}
  function cancelTool(){pendingItem=null;fiberDraft=[];redrawFiber=null;engine.setTool(null);engine.setDraft([]);$('#infra-finish').disabled=true;$('#infra-mode').textContent='Selecione um item para editar.';}
  function beginFiber(existing=null){if(!existing&&all[current].fibers.length>=500){message('Limite de 500 trajetos por planta.');return;}cancelTool();redrawFiber=existing;engine.setTool('fiber');$('#infra-mode').textContent='Clique nos vértices do trajeto e depois em Concluir fibra.';}
  function handleTool(tool,p){const s=all[current];if((tool==='ap'&&s.points.length>=500)||(tool==='rack'&&s.racks.length>=500)){message('Limite de 500 itens deste tipo por planta.');return;}if(tool==='fiber'){if(fiberDraft.length>=200){message('Limite de 200 vértices por trajeto.');return;}fiberDraft.push(p);engine.setDraft(fiberDraft);$('#infra-finish').disabled=fiberDraft.length<2;$('#infra-mode').textContent=fiberDraft.length+' vértices · clique em Concluir fibra para salvar.';return;}
   snapshot();let id;
   if(tool==='ap'){id=nextId('AP-'+current+'-NOVO-');s.points.push({id,...p,...pendingItem,custom:true,evidence:'AP cadastrado manualmente; posição e alcance a validar.'});}
   else if(tool==='rack'){id=nextId('RACK-'+current+'-');s.racks.push({id,label:id,...p,color:'#7c3aed'});}
   else if(tool==='moveRack'){id=pendingItem.id;const r=s.racks.find(r=>r.id===id);Object.assign(r,p);}
   draw();if(tool==='ap')engine.select(id);else engine.selectInfra(id);persist();
  }
  $('#ap-brand').onchange=()=>{$('#ap-color').value=brandColors[$('#ap-brand').value];};
  $('#infra-new-ap').onclick=()=>{cancelTool();engine.select(null);$('#ap-model').value='';$('#ap-color').value=brandColors[$('#ap-brand').value];settings();$('.infra-editor').scrollIntoView({block:'nearest'});$('#ap-brand').focus();message('Escolha a marca e o raio, depois clique em Inserir AP no mapa.');};
  $('#ap-insert').onclick=()=>{const fields=apFields();if(!fields)return;cancelTool();pendingItem=fields;engine.setTool('ap');$('#infra-mode').textContent='Clique na planta para inserir '+fields.brand+'.';};
  $('#ap-update').onclick=()=>{if(!active)return;const fields=apFields();if(!fields)return;const id=active.id;snapshot();Object.assign(active,fields);draw();engine.select(id);persist();};
  $('#ap-delete').onclick=()=>{if(!active)return;snapshot();all[current].points=all[current].points.filter(p=>p.id!==active.id);draw();persist();};
  $('#infra-add-rack').onclick=()=>{cancelTool();engine.setTool('rack');$('#infra-mode').textContent='Clique na planta para inserir o rack.';};
  $('#infra-fiber').onclick=()=>beginFiber();$('#infra-cancel').onclick=cancelTool;
  $('#infra-finish').onclick=()=>{if(fiberDraft.length<2)return;snapshot();const id=redrawFiber?.id||nextId('FIBRA-'+current+'-'),f={id,label:redrawFiber?.label||id,color:redrawFiber?.color||'#db2777',points:clone(fiberDraft)};if(redrawFiber)all[current].fibers=all[current].fibers.map(x=>x.id===id?f:x);else all[current].fibers.push(f);draw();engine.selectInfra(id);persist();};
  $('#infra-select').onchange=e=>engine.selectInfra(e.target.value);
  $('#infra-update').onclick=()=>{if(!infraActive)return;const id=infraActive.id;snapshot();infraActive.label=$('#infra-name').value.trim()||id;infraActive.color=$('#infra-color').value;draw();engine.selectInfra(id);persist();};
  $('#infra-delete').onclick=()=>{if(!infraActive)return;const id=infraActive.id;snapshot();all[current].racks=all[current].racks.filter(p=>p.id!==id);all[current].fibers=all[current].fibers.filter(p=>p.id!==id);draw();persist();};
  $('#infra-move').onclick=()=>{if(!infraActive)return;if(infraActive.points)beginFiber(infraActive);else{cancelTool();pendingItem=infraActive;engine.setTool('moveRack');$('#infra-mode').textContent='Clique na nova posição do rack.';}};
  root.addEventListener('keydown',e=>{if(e.key==='Escape')cancelTool();});
  $('#wifi-print').onclick=()=>engine.print();draw();message(badSaved?'Ajustes anteriores indisponíveis; carregada a base original.':'Editor pronto. Escolha a marca e o raio para inserir APs; adicione racks e desenhe fibra por cliques. Exporte o JSON para guardar sua infraestrutura.');
 }
 window.WifiModule={render};
})();
