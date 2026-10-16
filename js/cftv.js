(function(){
  const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const total=s=>s.ok+s.maintenance+s.inactive;
  const storageKey='clrc-cftv-map-v1';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const statusNames={unknown:'A validar',ok:'OK informado',maintenance:'M informado',inactive:'N informado'};
  let selectedArea='A1';
  const planGroups={A:window.BLOCO_A_PLANS,B:window.BLOCO_B_PLANS,C:window.BLOCO_C_PLANS,D:window.BLOCO_D_PLANS,E:window.BLOCO_E_PLANS,F:window.BLOCO_F_PLANS,G:window.BLOCO_G_PLANS,H:window.BLOCO_H_PLANS};
  const group=key=>Object.keys(planGroups).find(g=>Object.hasOwn(planGroups[g],key))||key;
  const subplans=key=>planGroups[group(key)]||{};
  function validate(payload){
    if(!payload||payload.version!==1||!payload.areas||Array.isArray(payload.areas))throw Error('Formato incompatível. Importe o JSON exportado por este mapa.');
    const result={};
    Object.entries(payload.areas).forEach(([key,list])=>{
      const map=window.CFTV_MAPS[key];if(!map||!Array.isArray(list)||list.length>500)throw Error('Área ou quantidade inválida.');
      const ids=new Set();
      result[key]=list.map(p=>{
        if(!p||typeof p.id!=='string'||p.id.length>80||ids.has(p.id)||!Object.hasOwn(statusNames,p.status))throw Error('Identificação ou status inválido.');
        for(const [k,min,max] of [['x',0,map.width],['y',0,map.height],['angle',0,360],['fov',5,170],['range',5,Math.max(map.width,map.height)]]){
          if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw Error('Coordenadas ou parâmetros inválidos.');
        }
        ids.add(p.id);
        return {id:p.id,x:p.x,y:p.y,angle:p.angle,fov:p.fov,range:p.range,status:p.status,source:String(p.source||'Importação do usuário').slice(0,200),positionEvidence:String(p.positionEvidence||'Importado; validar').slice(0,200),directionEvidence:String(p.directionEvidence||'Importado; validar').slice(0,200)};
      });
    });
    return result;
  }
  function render(root){
    const data=window.GTO_DATA,keys=[...new Set([...Object.keys(planGroups),...Object.keys(data.cctv)])];
    let saved={},storageError=false;
    try{const text=localStorage.getItem(storageKey);if(text)saved=validate(JSON.parse(text));}catch(e){storageError=true;}
    const allPoints=Object.fromEntries(Object.keys(window.CFTV_MAPS).map(k=>[k,clone(saved[k]||window.CFTV_MAPS[k].points)]));
    let engine,active=null,adding=false,referenceId=null,undo=[];
    root.innerHTML=`
      <section class="view-head"><div><span class="eyebrow">CFTV / PLANTAS E CAMPOS DE VISÃO</span><h1>Abrangência diretamente na planta</h1><p>Selecione uma marca para ajustar o cone sobre o mapa original.</p></div><span class="status-pill warning">FOV ESTIMADO · VALIDAR EM CAMPO</span></section>
      <div class="metric-strip">
        <div class="metric-card accent"><span>Pontos no levantamento</span><strong>${data.stats.cftvTotal}</strong><small>Inventário documental</small></div>
        <div class="metric-card good"><span>OK</span><strong>${data.stats.cftvOk}</strong><small>Conforme documento</small></div>
        <div class="metric-card warning"><span>Manutenção</span><strong>${data.stats.cftvMaintenance}</strong><small>Escopo de intervenção</small></div>
        <div class="metric-card neutral"><span>N / desativado</span><strong>${data.stats.cftvInactive}</strong><small>Conforme documento</small></div>
      </div>
      <section class="panel cftv-workbench">
        <div class="cftv-area-tabs" role="group" aria-label="Selecionar área">${keys.map(k=>`<button class="btn secondary" data-cftv="${k}">${k==='PARKING'?'Estacionamento':'Bloco '+k}</button>`).join('')}</div>
        <div id="cftv-a-tabs" class="cftv-area-tabs" role="group" aria-label="Plantas do bloco selecionado"></div>
        <div class="panel-title-row plan-heading"><div><h2 id="cftv-title"></h2><p id="cftv-sub" class="micro-copy"></p></div><a id="cftv-original" class="btn secondary" target="_blank" rel="noopener">Fonte completa ↗</a></div>
        <div class="plan-toolbar">
          <div class="toolbar-group"><button class="btn" id="plan-out" aria-label="Diminuir zoom">−</button><button class="btn" id="plan-in" aria-label="Aumentar zoom">+</button><button class="btn secondary" id="plan-fit">Enquadrar</button><button class="btn secondary" id="plan-full">Tela cheia</button></div>
          <div class="toolbar-group"><label><input type="checkbox" data-map-layer="cones" checked> Cones</label><label><input type="checkbox" data-map-layer="markers" checked> Câmeras</label><label><input type="checkbox" data-map-layer="labels"> IDs</label><label><input type="checkbox" data-map-layer="onlySelected"> Só selecionada</label></div>
          <label class="opacity-control">Transparência <input id="cone-opacity" type="range" min="5" max="50" value="20" aria-label="Opacidade dos cones"></label>
        </div>
        <div class="cftv-map-layout">
          <div class="plan-stage"><div id="cftv-map"></div><div class="plan-caption"><span id="map-caption"></span><span>Arraste o fundo para navegar · + / − para ampliar</span></div></div>
          <aside class="plan-inspector">
            <span class="eyebrow">MARCA SELECIONADA</span><h3 id="camera-title">Selecione uma câmera</h3>
            <select id="camera-select" class="field-select" aria-label="Selecionar marca"><option value="">Escolha no mapa</option></select>
            <div id="camera-empty" class="micro-copy">Clique em um ponto azul sobre a planta. As posições são aproximações das marcações visíveis.</div>
            <fieldset id="camera-fields" disabled>
              <label>Direção estimada <span><input id="camera-angle" type="number" min="0" max="360" step="1"> °</span></label>
              <label>Abertura estimada <span><input id="camera-fov" type="number" min="5" max="170" step="1"> °</span></label>
              <label>Extensão gráfica <span><input id="camera-range" type="number" min="5" step="1"> u.g.</span></label>
              <label>Status individual<select id="camera-status"><option value="unknown">A validar</option><option value="ok">OK informado</option><option value="maintenance">M informado</option><option value="inactive">N informado</option></select></label>
              <p class="micro-copy" id="camera-evidence"></p>
            </fieldset>
            <p class="micro-copy">0° → direita · 90° ↓ baixo.<br>u.g. = unidades da imagem, sem equivalência em metros. Lente e escala ainda não aferidas.</p>
            <label class="check-row"><input id="edit-position" type="checkbox"><span>Permitir arrastar marca</span></label>
            <div id="camera-reference-controls"><label for="camera-reference">Referência do levantamento anterior</label><select id="camera-reference" class="field-select"></select><button id="place-reference" class="btn secondary" disabled>Posicionar referência nesta planta</button></div>
            <button id="add-camera" class="btn secondary">Adicionar marca na planta</button><button id="undo-camera" class="btn secondary" disabled>Desfazer ajuste</button>
            <p id="save-status" class="micro-copy" role="status"></p>
          </aside>
        </div>
        <div class="plan-legend"><span><i style="background:#087e9b"></i>Status a validar</span><span><i style="background:#168343"></i>OK informado</span><span><i style="background:#d46b00"></i>M: hipótese de FOV</span><span><i style="background:#64748b"></i>N: sem cone</span><span>Contorno tracejado = abrangência estimada</span></div>
        <div class="plan-evidence"><strong>Como ler este mapa</strong><p id="map-evidence"></p><p>No levantamento anterior, posições e direções foram aproximadas das marcas legíveis. Nas novas plantas A1–A7, B1–B5, C1–C5, D1–D5, E1–E11, F1–F8, G1–G7 e H1–H3, o posicionamento depende de conferência; referências ainda não posicionadas permanecem disponíveis no levantamento anterior. IDs REF são referências de interface, não números patrimoniais. Os totais OK/M/N do documento não foram distribuídos por suposição entre os pontos.</p><p>Cones geométricos não representam cobertura comprovada: não calculam oclusão por paredes, alcance IR, identificação de pessoas ou pontos cegos. Ausência de cone não comprova ausência de cobertura.</p></div>
        <div class="plan-footer"><div><button class="btn" id="export-cameras">Exportar ajustes JSON</button><button class="btn secondary" id="import-cameras">Importar ajustes</button><input type="file" id="camera-file" accept="application/json,.json" hidden></div><button class="btn secondary" id="print-cameras">Imprimir mapa / PDF</button></div>
      </section>
      <section class="panel table-panel cftv-summary"><div class="panel-title-row"><h3>Inventário documental por área</h3><span class="badge neutral">Não alterado por ajustes gráficos</span></div><div class="table-scroll"><table><thead><tr><th>Área</th><th>OK</th><th>M</th><th>N</th><th>Total</th><th>Fonte</th></tr></thead><tbody>${keys.map(k=>{const s=data.cctv[k];if(!s)return `<tr><td>Bloco ${k}</td><td>N/D</td><td>N/D</td><td>N/D</td><td>N/D</td><td>Inventário não fornecido</td></tr>`;return `<tr><td>${k==='PARKING'?'Estacionamento':'Bloco '+k}</td><td>${s.ok}</td><td>${s.maintenance}</td><td>${s.inactive}</td><td>${total(s)}</td><td><a href="${s.page}" target="_blank" rel="noopener">Planta / levantamento ↗</a></td></tr>`;}).join('')}</tbody></table></div></section>
      <section class="panel budget-callout cftv-summary"><div><span class="eyebrow">DIRETRIZ DO LEVANTAMENTO</span><h3>Restaurar os 40 pontos classificados como M.</h3><p>Preservadas as diretrizes originais: conferir fibra, UTP e alimentação elétrica. No Bloco G, validar os pontos “Comando” e “Chegada Link/Fibra”.</p></div><img src="assets/cftv/page-12.png" alt="Diretrizes do orçamento CFTV"></section>`;
    const $=s=>root.querySelector(s);
    function message(text){$('#save-status').textContent=text;}
    function persist(){
      try{localStorage.setItem(storageKey,JSON.stringify({version:1,areas:allPoints}));message('Ajustes salvos neste navegador. Exporte o JSON para levar a outro computador.');}
      catch(e){message('Não foi possível salvar neste navegador. Exporte os ajustes em JSON.');}
    }
    function beforeChange(){undo.push({area:selectedArea,points:clone(allPoints[selectedArea])});if(undo.length>30)undo.shift();$('#undo-camera').disabled=false;}
    function inspect(p){
      active=p||null;$('#camera-fields').disabled=!p;$('#camera-title').textContent=p?p.id:'Selecione uma câmera';$('#camera-select').value=p?p.id:'';$('#camera-empty').hidden=!!p;
      if(!p){['#camera-angle','#camera-fov','#camera-range'].forEach(id=>$(id).value='');$('#camera-status').value='unknown';$('#camera-evidence').textContent='';return;}
      $('#camera-angle').value=p.angle;$('#camera-fov').value=p.fov;$('#camera-range').value=p.range;$('#camera-status').value=p.status;
      $('#camera-evidence').textContent=`${p.positionEvidence}. x=${p.x}; y=${p.y}. ${p.directionEvidence}.`;
    }
    function updateList(){
      const pts=allPoints[selectedArea];$('#camera-select').innerHTML='<option value="">Escolha no mapa</option>'+pts.map(c=>`<option value="${esc(c.id)}">${esc(c.id)} · ${statusNames[c.status]}</option>`).join('');
      $('#map-caption').textContent=`${pts.length} marcas digitalizadas · ${data.cctv[group(selectedArea)]?total(data.cctv[group(selectedArea)])+' pontos no documento'+(Object.hasOwn(planGroups,group(selectedArea))?' para todo o Bloco '+group(selectedArea):''):'Inventário CFTV do Bloco '+group(selectedArea)+' não informado (N/D)'}`;
    }
    function draw(){
      const s=data.cctv[group(selectedArea)],map=window.CFTV_MAPS[selectedArea];
      adding=false;referenceId=null;$('#add-camera').textContent='Adicionar marca na planta';
      $('#cftv-title').textContent=selectedArea==='PARKING'?'Estacionamento de caminhões':'Bloco '+selectedArea;
      $('#cftv-a-tabs').hidden=!Object.hasOwn(planGroups,group(selectedArea));
      $('#cftv-a-tabs').innerHTML=[...Object.keys(subplans(selectedArea)),...(window.CFTV_MAPS[group(selectedArea)]?[group(selectedArea)]:[])].map(k=>`<button class="btn secondary" data-cftv-plan="${k}">${k===group(selectedArea)?'Levantamento anterior':k}</button>`).join('');
      root.querySelectorAll('[data-cftv-plan]').forEach(b=>b.onclick=()=>{selectedArea=b.dataset.cftvPlan;draw();});
      root.querySelectorAll('[data-cftv-plan]').forEach(b=>b.classList.toggle('active',b.dataset.cftvPlan===selectedArea));
      $('#camera-reference-controls').hidden=!Object.hasOwn(subplans(selectedArea),selectedArea)||!window.CFTV_MAPS[group(selectedArea)];
      const placed=new Set(Object.keys(subplans(selectedArea)).flatMap(k=>allPoints[k].map(p=>p.id)));
      $('#camera-reference').innerHTML='<option value="">Escolha uma referência existente</option>'+(allPoints[group(selectedArea)]||[]).filter(p=>!placed.has(p.id)).map(p=>`<option value="${esc(p.id)}">${esc(p.id)}</option>`).join('');
      $('#place-reference').disabled=true;
      $('#place-reference').textContent='Posicionar referência nesta planta';
      $('#camera-empty').textContent=map.points.length?'Clique em uma câmera sobre a planta.':(window.CFTV_MAPS[group(selectedArea)]?'Planta sem marcações na fonte. Posicione uma referência existente ou adicione uma marca após conferência.':'Planta sem marcações e sem levantamento anterior de câmeras. Adicione uma marca após conferência em campo.');
      $('#cftv-sub').textContent=s?`${s.ok} OK · ${s.maintenance} M · ${s.inactive} N no levantamento${Object.hasOwn(planGroups,group(selectedArea))?' do Bloco '+group(selectedArea)+' completo':''} · planta original preservada`:'Inventário CFTV não fornecido para o Bloco '+group(selectedArea)+' · planta original preservada';
      $('#cftv-original').href=map.image;$('#map-evidence').textContent=map.note;
      root.querySelectorAll('[data-cftv]').forEach(b=>b.classList.toggle('active',b.dataset.cftv===group(selectedArea)));
      $('#camera-range').max=Math.max(map.width,map.height);
      engine=window.CftvMap.mount($('#cftv-map'),map,allPoints[selectedArea],{
        onSelect:inspect,onBeforeChange:beforeChange,onChange:persist,
        onAdd:p=>{
          beforeChange();const pts=allPoints[selectedArea];let i=1;while(pts.some(c=>c.id===`REF-${selectedArea}-NOVO-${i}`))i++;
          const point={id:`REF-${selectedArea}-NOVO-${i}`,x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,angle:0,fov:55,range:map.range,status:'unknown',source:'Cadastro manual',positionEvidence:'Posição inserida pelo usuário; validar em campo',directionEvidence:'Direção definida pelo usuário; validar'};
          if(referenceId){const source=allPoints[group(selectedArea)].find(c=>c.id===referenceId);point.id=source.id;point.status=source.status;point.source='Referência do levantamento anterior do Bloco '+group(selectedArea);point.directionEvidence='Nova orientação a conferir; ajuste direção, abertura e extensão';}
          pts.push(point);referenceId=null;adding=false;engine.setAdding(false);$('#add-camera').textContent='Adicionar marca na planta';draw();engine.select(point.id);persist();
        }
      });
      root.querySelectorAll('[data-map-layer]').forEach(c=>engine.setLayer(c.dataset.mapLayer,c.checked));
      engine.setEdit($('#edit-position').checked);engine.setOpacity(Number($('#cone-opacity').value)/100);updateList();inspect(null);
    }
    root.querySelectorAll('[data-cftv]').forEach(b=>b.addEventListener('click',()=>{selectedArea=Object.hasOwn(planGroups,b.dataset.cftv)?b.dataset.cftv+'1':b.dataset.cftv;draw();}));
    root.querySelectorAll('[data-cftv-plan]').forEach(b=>b.onclick=()=>{selectedArea=b.dataset.cftvPlan;draw();});
    $('#camera-reference').onchange=e=>{$('#place-reference').disabled=!e.target.value;};
    $('#place-reference').onclick=()=>{referenceId=$('#camera-reference').value;if(!referenceId)return;adding=true;engine.setAdding(true);$('#add-camera').textContent='Cancelar inclusão';message('Clique no local correspondente a '+referenceId+' na nova planta. Ajuste a direção após posicionar.');};
    $('#plan-in').onclick=()=>engine.zoom(.8);$('#plan-out').onclick=()=>engine.zoom(1.25);$('#plan-fit').onclick=()=>engine.fit();
    $('#plan-full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.cftv-workbench').requestFullscreen();}catch(e){message('Tela cheia indisponível neste navegador. Use o zoom do mapa.');}};
    root.querySelectorAll('[data-map-layer]').forEach(c=>c.onchange=()=>engine.setLayer(c.dataset.mapLayer,c.checked));
    $('#cone-opacity').oninput=e=>engine.setOpacity(Number(e.target.value)/100);
    $('#edit-position').onchange=e=>engine.setEdit(e.target.checked);
    $('#camera-select').onchange=e=>engine.select(e.target.value);
    [['angle','camera-angle'],['fov','camera-fov'],['range','camera-range']].forEach(([key,id])=>{
      $('#'+id).onchange=e=>{if(!active)return;const input=e.target,value=Number(input.value);if(input.value===''||!input.checkValidity()||!Number.isFinite(value)){inspect(active);message('Informe um valor dentro dos limites do campo.');return;}if(active[key]===value)return;beforeChange();active[key]=value;active.directionEvidence='Parâmetros ajustados pelo usuário; validar';engine.draw();inspect(active);persist();};
    });
    $('#camera-status').onchange=e=>{if(!active||active.status===e.target.value)return;beforeChange();active.status=e.target.value;updateList();engine.draw();inspect(active);persist();};
    $('#add-camera').onclick=()=>{referenceId=null;adding=!adding;engine.setAdding(adding);$('#add-camera').textContent=adding?'Cancelar inclusão':'Adicionar marca na planta';message(adding?'Clique no local da câmera na planta.':'Inclusão cancelada.');};
    $('#undo-camera').onclick=()=>{const previous=undo.pop();if(!previous)return;allPoints[previous.area]=previous.points;selectedArea=previous.area;draw();persist();$('#undo-camera').disabled=!undo.length;};
    $('#export-cameras').onclick=()=>{
      const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),coordinateSystem:'Imagem por área; consulte js/cftv-coordinates.js. Sem escala métrica.',areas:allPoints},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='CLRC_Ajustes_CFTV.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    $('#import-cameras').onclick=()=>$('#camera-file').click();
    $('#camera-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{
      if(file.size>2*1024*1024)throw Error('Arquivo excede 2 MB.');const imported=validate(JSON.parse(await file.text()));
      Object.entries(imported).forEach(([area,points])=>{undo.push({area,points:clone(allPoints[area])});allPoints[area]=points;});
      $('#undo-camera').disabled=!undo.length;draw();persist();
    }catch(err){message('Importação recusada: '+err.message);}e.target.value='';};
    $('#print-cameras').onclick=()=>engine.print();
    draw();message(storageError?'Ajustes anteriores indisponíveis; carregada a base original.':'Base carregada. Edições são salvas neste navegador.');
  }
  window.CftvModule={render};
})();
