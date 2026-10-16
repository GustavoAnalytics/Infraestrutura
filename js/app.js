(function(){
  const data=window.GTO_DATA;
  const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const app=document.querySelector('#app-content');
  const nav=document.querySelector('#side-nav');
  const scenarioButtons=document.querySelectorAll('button[data-scenario]');
  const state={view:'overview',scenario:'ASIS',blockGroup:'A',subblock:'A1'};

  const routes=[
    ['overview','Visão Geral','⌂'],['digitaltwin','Digital Twin','✦'],['blocks','Blocos detalhados','▦'],['wifi','Wi-Fi','◉'],['cftv','CFTV','▲'],
    ['network','Rede / Fibra','⇄'],['risks','Riscos / SPOF','!'],['improvements','TO BE / Melhorias','→'],
    ['premises','Premissas','≡'],['sources','Fontes','▧'],['report','Relatório','▤']
  ];
  nav.innerHTML=routes.map(([id,label,icon])=>`<button class="nav-item ${id==='overview'?'active':''}" data-route="${id}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join('');

  function metric(label,value,sub,cls=''){return `<div class="metric-card ${cls}"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`;}
  function cftvTable(){return Object.entries(data.cctv).map(([k,s])=>`<tr><td>${k==='PARKING'?'Estacionamento Caminhões':'Bloco '+k}</td><td>${s.ok}</td><td>${s.maintenance}</td><td>${s.inactive}</td><td>${s.ok+s.maintenance+s.inactive}</td></tr>`).join('');}
  function wifiBreakdown(){return Object.entries(data.stats.wifiBreakdown).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td><td>${['A5','A6'].includes(k)?'Grandstream':k==='F'?'19 Aruba + 10 UniFi':'UniFi'}</td><td>${['G1','G2','G3','G4','G5'].includes(k)?'Quantidade confirmada; posição a validar':'Diagrama / informação fornecida'}</td></tr>`).join('');}

  function renderOverview(){
    const isToBe=state.scenario==='TOBE';
    app.innerHTML=`
      <section class="hero-section ${isToBe?'tobe-hero':''}">
        <div class="hero-copy"><span class="eyebrow">${isToBe?'CENÁRIO RECOMENDADO - TO BE':'CENÁRIO ATUAL - AS IS'}</span><h1>Digital Twin simplificado da infraestrutura</h1><p>${isToBe?'Prioriza reaproveitamento, validação de campo, correção dos pontos críticos e evolução para operação 24x7.':'Consolida plantas, Wi-Fi, CFTV, core, GPON, links e riscos com rastreabilidade de origem.'}</p><div class="hero-tags"><span>Rede</span><span>Wi-Fi</span><span>CFTV</span><span>GPON</span><span>24x7</span></div></div>
        <div class="hero-visual"><img src="assets/cftv/page-01.png" alt="Projeto CFTV Centro Logístico"><div class="hero-overlay"><b>${data.meta.revision}</b><span>${isToBe?'Diretriz: corrigir → validar → redundar → homologar':'Base: fontes fornecidas + inferências claramente marcadas'}</span></div></div>
      </section>
      <div class="metric-strip overview-metrics">
        ${metric('APs com quantidade conhecida',data.stats.wifiKnownTotal,'A5, A6, F, A10 e G1-G5','accent')}
        ${metric('Pontos CFTV',data.stats.cftvTotal,'134 OK · 40 M · 23 N','good')}
        ${metric('Pontos CFTV em manutenção',data.stats.cftvMaintenance,'F e G concentram 22','warning')}
        ${metric('ONUs GPON',data.network.olt.onuCount,'OLT principal documentada','neutral')}
      </div>
      <div class="split-2">
        <section class="panel executive-card">
          <div class="panel-title-row"><h3>${isToBe?'Objetivo técnico TO BE':'Leitura executiva AS IS'}</h3><span class="badge ${isToBe?'blue':'green'}">${isToBe?'24x7':'CONSOLIDADO'}</span></div>
          ${isToBe?`<div class="executive-points"><article><b>1</b><div><strong>Corrigir críticos</strong><span>40 pontos CFTV M; ONU-G-REDE1; failover e SPOFs.</span></div></article><article><b>2</b><div><strong>Otimizar antes de comprar</strong><span>Site Survey no F/A5/A6/G; canal, potência, roaming e reposicionamento.</span></div></article><article><b>3</b><div><strong>Redundância real</strong><span>Validar rotas físicas, energia e dependências comuns.</span></div></article><article><b>4</b><div><strong>Homologar</strong><span>Testes de RF, throughput, failover, gravação, retenção e OTDR.</span></div></article></div>`:
          `<div class="executive-points"><article><b>1</b><div><strong>Rede central identificada</strong><span>ALTLink 1 Gbps + Desktop 600 Mbps convergem no RB5009.</span></div></article><article><b>2</b><div><strong>Camada óptica estruturada</strong><span>OLT GPON com 33 ONUs; uma ONU do G aparece crítica.</span></div></article><article><b>3</b><div><strong>Wi-Fi heterogêneo</strong><span>A5/A6 Grandstream; F Aruba + UniFi; G/A10 UniFi.</span></div></article><article><b>4</b><div><strong>CFTV exige intervenção</strong><span>40 pontos M; prioridade evidente em F e G.</span></div></article></div>`}
        </section>
        <section class="panel confidence-card">
          <div class="panel-title-row"><h3>Transparência técnica</h3><span class="badge neutral">OBRIGATÓRIO</span></div>
          <div class="confidence-list"><div><i class="conf confirmed"></i><b>CONFIRMADO</b><span>Presente em planta, diagrama ou levantamento.</span></div><div><i class="conf estimated"></i><b>ESTIMADO</b><span>Modelagem geométrica / inferência explicitamente identificada.</span></div><div><i class="conf field"></i><b>VALIDAÇÃO EM CAMPO</b><span>RF, lente/FOV, rota física, PoE, energia, configuração.</span></div></div>
          <div class="alert-box warning"><strong>Regra do projeto</strong><span>${data.meta.disclaimer}</span></div>
        </section>
      </div>
      <div class="split-2">
        <section class="panel"><div class="panel-title-row"><h3>Wi-Fi - inventário conhecido</h3><button class="text-button" data-go="wifi">Abrir mapa →</button></div><div class="table-scroll"><table><thead><tr><th>Área</th><th>APs</th><th>Fabricante</th><th>Confiança</th></tr></thead><tbody>${wifiBreakdown()}</tbody></table></div></section>
        <section class="panel"><div class="panel-title-row"><h3>CFTV - matriz por área</h3><button class="text-button" data-go="cftv">Abrir CFTV →</button></div><div class="table-scroll"><table><thead><tr><th>Área</th><th>OK</th><th>M</th><th>N</th><th>Total</th></tr></thead><tbody>${cftvTable()}</tbody></table></div></section>
      </div>
      <section class="panel risk-highlight"><div><span class="eyebrow">TOP 5 PONTOS DE ATENÇÃO</span><h3>O que deve ser validado primeiro</h3></div><div class="risk-mini-grid">${data.risks.slice(0,5).map(r=>`<article><span class="severity ${r.criticality.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}">${r.criticality}</span><b>${r.id} · ${r.local}</b><p>${r.problem}</p></article>`).join('')}</div></section>`;
    bindGoButtons();
  }

  function renderBlocks(){
    const groups=['A','B','C','D','E','F','G','H'];
    if(!groups.includes(state.blockGroup))state.blockGroup='A';
    const blocks=data.subblocks.filter(b=>b.group===state.blockGroup);
    if(!blocks.find(b=>b.id===state.subblock))state.subblock=blocks[0]?.id;
    const current=blocks.find(b=>b.id===state.subblock)||blocks[0];
    const wifi=data.wifiProfiles[current.id];
    const cftv=data.cctv[current.group];
    let toBe='Levantamento e Site Survey antes de definir compra.';
    if(data.proposalDraft[current.id])toBe=`Rascunho anterior: ${data.proposalDraft[current.id].aps} ${data.proposalDraft[current.id].model} (${data.proposalDraft[current.id].state}).`;
    else if(wifi&&wifi.inventoryKnown!==false)toBe=`Reaproveitar ${wifi.aps.length} APs conhecidos; otimizar posição/canais antes de aquisição.`;
    app.innerHTML=`
      <section class="view-head"><div><span class="eyebrow">PLANTAS TÉCNICAS</span><h1>Visão por bloco</h1><p>Área, fonte visual, infraestrutura conhecida e lacunas de levantamento.</p></div><div class="status-pill">${state.scenario==='ASIS'?'AS IS':'TO BE'}</div></section>
      <div class="block-tabs">${groups.map(g=>`<button data-group="${g}" class="${g===state.blockGroup?'active':''}">Bloco ${g}</button>`).join('')}</div>
      <div class="block-workspace">
        <aside class="panel block-list">${blocks.map(b=>`<button data-subblock="${b.id}" class="${b.id===state.subblock?'active':''}"><span>${b.id}</span><b>${b.area?b.area.toLocaleString('pt-BR')+' m²':'área N/D'}</b><small>${b.status}</small></button>`).join('')}</aside>
        <main class="panel block-detail">
          <div class="panel-title-row"><div><span class="eyebrow">${current.status}</span><h2>${current.id}</h2><p>${current.area?`${current.area.toLocaleString('pt-BR')} m²`:''} ${current.extra?'· '+current.extra:''}</p></div><span class="badge ${current.status.includes('CONFIRMADO')?'green':'orange'}">${current.group==='H'?'SEM CFTV NO PDF':'BLOCO '+current.group}</span></div>
          <div class="plant-view"><img src="${current.image}" alt="Planta ${current.id}"></div>
          <div class="block-info-grid">
            <div><span>Área</span><b>${current.area?current.area.toLocaleString('pt-BR')+' m²':'Necessita validação'}</b></div>
            <div><span>Dimensão física</span><b>${current.widthM&&current.heightM?`${current.widthM} × ${current.heightM} m`:'Não estruturada'}</b></div>
            <div><span>Wi-Fi atual conhecido</span><b>${wifi&&wifi.inventoryKnown!==false?`${wifi.aps.length} APs`:'Não confirmado'}</b></div>
            <div><span>CFTV do grupo</span><b>${cftv?`${cftv.ok} OK · ${cftv.maintenance} M · ${cftv.inactive} N`:'Não disponível'}</b></div>
          </div>
          <div class="scenario-note ${state.scenario==='TOBE'?'tobe':''}"><strong>${state.scenario==='ASIS'?'AS IS':'TO BE'}</strong><span>${state.scenario==='ASIS'?(wifi?wifi.note:'Sem inventário Wi-Fi detalhado para este subbloco nas fontes atuais.'):toBe}</span></div>
        </main>
      </div>`;
    app.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{state.blockGroup=b.dataset.group;renderBlocks();}));
    app.querySelectorAll('[data-subblock]').forEach(b=>b.addEventListener('click',()=>{state.subblock=b.dataset.subblock;renderBlocks();}));
  }

  function renderRisks(){
    const counts=data.risks.reduce((a,r)=>(a[r.criticality]=(a[r.criticality]||0)+1,a),{});
    app.innerHTML=`
      <section class="view-head"><div><span class="eyebrow">DIAGNÓSTICO</span><h1>Matriz de risco e pontos únicos de falha</h1><p>Criticidade técnica sem nota arbitrária; cada item traz ação de validação/correção.</p></div><div class="status-pill danger">${counts['CRÍTICO']||0} CRÍTICOS</div></section>
      <div class="metric-strip">${metric('Críticos',counts['CRÍTICO']||0,'interrupção/segurança','danger')}${metric('Altos',counts['ALTO']||0,'prioridade elevada','warning')}${metric('Médios',counts['MÉDIO']||0,'organização/validação','neutral')}${metric('Riscos mapeados',data.risks.length,'matriz atual','accent')}</div>
      <div class="panel"><div class="table-scroll"><table class="risk-table"><thead><tr><th>ID</th><th>Categoria</th><th>Local</th><th>Prob.</th><th>Impacto</th><th>Criticidade</th><th>Problema</th><th>Ação</th></tr></thead><tbody>${data.risks.map(r=>`<tr><td>${r.id}</td><td>${r.category}</td><td>${r.local}</td><td>${r.probability}</td><td>${r.impact}</td><td><span class="severity ${r.criticality.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}">${r.criticality}</span></td><td>${r.problem}</td><td>${r.action}</td></tr>`).join('')}</tbody></table></div></div>
      <section class="panel spof-panel"><div class="panel-title-row"><h3>SPOF - leitura arquitetural</h3><span class="badge orange">VALIDAR EM CAMPO</span></div><div class="spof-flow"><div><b>Links</b><span>2 operadoras</span></div><i>→</i><div class="critical-box"><b>RB5009</b><span>core/firewall central</span></div><i>→</i><div><b>Distribuição</b><span>Aruba / OLT / CFTV</span></div><i>→</i><div class="critical-box"><b>OLT GPON</b><span>33 ONUs</span></div></div><p class="micro-copy">Ter um RB2011 como reserva é positivo, mas a documentação não demonstra HA automático. Da mesma forma, dois links não significam redundância física se compartilharem duto, poste, energia ou core.</p></section>`;
  }

  function renderImprovements(){
    const phases=['FASE 1','FASE 2','FASE 3','FASE 4'];
    app.innerHTML=`
      <section class="view-head"><div><span class="eyebrow">CENÁRIO RECOMENDADO - TO BE</span><h1>Plano de melhorias e roadmap 24x7</h1><p>Reaproveitar, reposicionar e reconfigurar antes de comprar.</p></div><div class="status-pill good">REAPROVEITAMENTO PRIMEIRO</div></section>
      <div class="roadmap">${['Diagnóstico','Validação em campo','Críticos','Infraestrutura','Wi-Fi','CFTV','Redundância','Testes','Homologação'].map((x,i)=>`<div><span>${i+1}</span><b>${x}</b></div>${i<8?'<i>→</i>':''}`).join('')}</div>
      <div class="phase-grid">${phases.map(p=>`<section class="panel phase-card"><span class="eyebrow">${p}</span><h3>${p==='FASE 1'?'CRÍTICOS':p==='FASE 2'?'ALTA PRIORIDADE':p==='FASE 3'?'OTIMIZAÇÃO':'EVOLUÇÃO'}</h3>${data.improvements.filter(x=>x.phase===p).map(x=>`<article><span class="severity ${x.priority.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}">${x.priority}</span><b>${x.id} · ${x.scope}</b><p>${x.action}</p><small>${x.reuse}</small></article>`).join('')}</section>`).join('')}</div>
      <div class="panel"><div class="panel-title-row"><h3>Lista para cotação / contratação</h3><span class="badge neutral">Sem inventar preço</span></div><div class="table-scroll"><table><thead><tr><th>Item</th><th>Qtd.</th><th>Escopo</th><th>Motivo</th><th>Classificação</th></tr></thead><tbody>
        <tr><td>Intervenções CFTV em pontos M</td><td>40 pontos</td><td>A-G + estacionamento</td><td>Restaurar os pontos classificados como manutenção; não implica 40 câmeras novas.</td><td>REPARAR / REAPROVEITAR</td></tr>
        <tr><td>Site Survey Wi-Fi profissional</td><td>1 projeto</td><td>A5, A6, F, G e demais blocos</td><td>Validar RSSI/SNR/interferência/capacidade/roaming.</td><td>SERVIÇO</td></tr>
        <tr><td>Diagnóstico óptico / OTDR</td><td>1 campanha</td><td>GPON/fibras críticas</td><td>ONU-G-REDE1 e rotas sem documentação completa.</td><td>SERVIÇO</td></tr>
        <tr><td>Switches PoE gerenciáveis</td><td>VALOR/QTD A VALIDAR</td><td>Onde auditoria indicar</td><td>Substituir apenas equipamentos sem capacidade, gestão ou PoE suficientes.</td><td>ADQUIRIR SE NECESSÁRIO</td></tr>
        <tr><td>Nobreaks / baterias</td><td>A VALIDAR</td><td>Racks críticos</td><td>Dimensionar após medir carga e autonomia atual.</td><td>REPARAR / ADQUIRIR</td></tr>
        <tr><td>Fibra / UTP / conectividade</td><td>MEDIR EM CAMPO</td><td>Pontos CFTV e uplinks</td><td>PDF orienta nova fibra onde inexistente e troca de UTP comprometido.</td><td>ADQUIRIR CONFORME MEDIÇÃO</td></tr>
      </tbody></table></div></div>`;
  }

  function renderPremises(){
    app.innerHTML=`<section class="view-head"><div><span class="eyebrow">PREMISSAS / DADOS AUSENTES</span><h1>Checklist para transformar estimativa em projeto executivo</h1><p>O sistema separa o que está confirmado do que ainda exige campo.</p></div><div class="status-pill warning">NÃO HOMOLOGADO</div></section>
      <div class="split-2"><section class="panel"><div class="panel-title-row"><h3>Princípios usados</h3><span class="badge green">Rastreabilidade</span></div><ul class="check-list"><li><b>Não inventar ativos.</b> Quantidades sem fonte ficam “N/D”.</li><li><b>Cobertura Wi-Fi é estimada.</b> Os raios são ajustáveis e não representam RSSI medido.</li><li><b>FOV de câmera não é assumido.</b> A simulação ilustrativa fica desativada por padrão.</li><li><b>Reaproveitamento primeiro.</b> Compra só depois de testar capacidade/estado.</li><li><b>AS IS separado de TO BE.</b> Propostas não entram nos totais atuais.</li></ul></section>
      <section class="panel"><div class="panel-title-row"><h3>Informações a levantar</h3><span class="badge orange">CAMPO</span></div><ol class="number-list">${data.missing.map(x=>`<li>${x}</li>`).join('')}</ol></section></div>
      <section class="panel"><div class="panel-title-row"><h3>Checklist de homologação</h3><span class="badge blue">24x7</span></div><div class="test-grid"><div><h4>Rede</h4><label>□ Ping / latência / perda</label><label>□ Throughput</label><label>□ Failover</label><label>□ VLAN / STP / uplinks</label></div><div><h4>Wi-Fi</h4><label>□ RSSI / SNR</label><label>□ Channel utilization</label><label>□ Roaming</label><label>□ Capacidade</label></div><div><h4>CFTV</h4><label>□ FOV / foco / IR</label><label>□ Gravação / playback</label><label>□ Retenção</label><label>□ Horário / alarmes</label></div><div><h4>Infra</h4><label>□ OTDR / fibra</label><label>□ Certificação UTP</label><label>□ Nobreak</label><label>□ Rack / temperatura</label></div></div></section>`;
  }

  function renderSources(){
    const cftvPages=[4,5,6,7,8,9,10,11].map((p,i)=>({title:['Bloco A','Bloco B','Bloco C','Bloco D','Bloco E','Bloco F','Bloco G','Estacionamento Caminhões'][i],img:`assets/cftv/page-${String(p).padStart(2,'0')}.png`,type:'CFTV'}));
    const plans=data.subblocks.filter((b,i,arr)=>arr.findIndex(x=>x.image===b.image)===i).map(b=>({title:`Planta ${b.id}${data.subblocks.filter(x=>x.image===b.image).length>1?' + conjunto':''}`,img:b.image,type:'Planta'}));
    const sources=[...data.sourceGallery,...cftvPages,...plans];
    app.innerHTML=`<section class="view-head"><div><span class="eyebrow">FONTES DO PROJETO</span><h1>Galeria documental</h1><p>As imagens abaixo permanecem disponíveis para conferência visual.</p></div><div class="status-pill">${sources.length} REFERÊNCIAS VISUAIS</div></section><div class="source-gallery">${sources.map(s=>`<figure class="panel"><div class="source-thumb"><img src="${s.img}" alt="${esc(s.title)}"></div><figcaption><span class="badge neutral">${s.type}</span><b>${esc(s.title)}</b><button class="text-button" data-open-image="${s.img}" data-title="${esc(s.title)}">Ampliar</button></figcaption></figure>`).join('')}</div>`;
    app.querySelectorAll('[data-open-image]').forEach(btn=>btn.addEventListener('click',()=>openImage(btn.dataset.openImage,btn.dataset.title)));
  }

  function renderReport(){
    app.innerHTML=`<section class="view-head no-print"><div><span class="eyebrow">RELATÓRIO EXECUTIVO</span><h1>Resumo para impressão / PDF</h1><p>Use o botão para imprimir pelo navegador.</p></div><button id="print-report" class="btn primary">Imprimir / Gerar PDF</button></section>
      <article class="print-report">
        <header><span>Centro Logístico Rio Claro</span><h1>Infraestrutura de Rede, Wi-Fi e CFTV</h1><p>${data.meta.revision}</p></header>
        <section><h2>1. Situação atual</h2><p>Foram consolidados ${data.stats.wifiKnownTotal} APs com quantidade conhecida nas áreas A5, A6, F, A10 e G1-G5. O levantamento CFTV registra ${data.stats.cftvTotal} pontos: ${data.stats.cftvOk} OK, ${data.stats.cftvMaintenance} em manutenção e ${data.stats.cftvInactive} desativados/não necessários. A camada GPON documenta ${data.network.olt.onuCount} ONUs.</p></section>
        <section><h2>2. Principais riscos</h2><table><thead><tr><th>ID</th><th>Local</th><th>Criticidade</th><th>Problema</th></tr></thead><tbody>${data.risks.map(r=>`<tr><td>${r.id}</td><td>${r.local}</td><td>${r.criticality}</td><td>${r.problem}</td></tr>`).join('')}</tbody></table></section>
        <section><h2>3. Prioridades</h2><ol>${data.improvements.map(x=>`<li><b>${x.id} - ${x.scope}:</b> ${x.action}</li>`).join('')}</ol></section>
        <section><h2>4. Dados pendentes</h2><ul>${data.missing.slice(0,8).map(x=>`<li>${x}</li>`).join('')}</ul></section>
        <footer>${data.meta.disclaimer}</footer>
      </article>`;
    app.querySelector('#print-report').addEventListener('click',()=>window.print());
  }

  function openImage(src,title){
    const dlg=document.querySelector('#image-dialog');
    dlg.querySelector('img').src=src;dlg.querySelector('img').alt=title;dlg.querySelector('h3').textContent=title;dlg.showModal();
  }
  function bindGoButtons(){app.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));}
  function navigate(view){
    state.view=view;
    nav.querySelectorAll('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===view));
    if(view==='overview')renderOverview();
    else if(view==='blocks')window.DigitalTwinModule.render(app);
    else if(view==='digitaltwin')window.DigitalTwinModule.render(app);
    else if(view==='wifi')window.WifiModule.render(app);
    else if(view==='cftv')window.CftvModule.render(app);
    else if(view==='network')window.TopologyModule.render(app);
    else if(view==='risks')renderRisks();
    else if(view==='improvements')renderImprovements();
    else if(view==='premises')renderPremises();
    else if(view==='sources')renderSources();
    else if(view==='report')renderReport();
    window.scrollTo({top:0,behavior:'instant'});
  }

  nav.addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(b)navigate(b.dataset.route);});
  scenarioButtons.forEach(b=>b.addEventListener('click',()=>{
    state.scenario=b.dataset.scenario;
    scenarioButtons.forEach(x=>x.classList.toggle('active',x===b));
    document.body.dataset.scenario=state.scenario.toLowerCase();
    if(state.view==='overview')renderOverview();else if(state.view==='blocks')window.DigitalTwinModule.render(app);
  }));
  document.querySelector('#dialog-close').addEventListener('click',()=>document.querySelector('#image-dialog').close());
  document.querySelector('#mobile-nav-toggle').addEventListener('click',()=>document.body.classList.toggle('nav-open'));
  document.querySelector('#sidebar-backdrop').addEventListener('click',()=>document.body.classList.remove('nav-open'));
  navigate('overview');
})();
