(function(){
  const NS='http://www.w3.org/2000/svg';
  const make=(tag,attrs={},text='')=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;return e;};
  function node(svg,x,y,w,h,title,sub,cls=''){
    const g=make('g',{class:`topo-node ${cls}`});
    g.appendChild(make('rect',{x,y,width:w,height:h,rx:12}));
    g.appendChild(make('text',{x:x+w/2,y:y+27,'text-anchor':'middle',class:'topo-title'},title));
    if(sub)g.appendChild(make('text',{x:x+w/2,y:y+48,'text-anchor':'middle',class:'topo-sub'},sub));
    svg.appendChild(g);return {x,y,w,h};
  }
  function line(svg,a,b,cls=''){
    svg.appendChild(make('path',{d:`M ${a.x+a.w/2} ${a.y+a.h} C ${a.x+a.w/2} ${(a.y+a.h+b.y)/2}, ${b.x+b.w/2} ${(a.y+a.h+b.y)/2}, ${b.x+b.w/2} ${b.y}`,class:`topo-line ${cls}`}));
  }
  function drawTopology(container, data){
    container.innerHTML='';
    const svg=make('svg',{viewBox:'0 0 1180 700',class:'topology-svg'});
    const alt=node(svg,90,35,220,68,'ALTLink','1 Gbps · principal','internet primary');
    const desk=node(svg,355,35,220,68,'Desktop Telecom','600 Mbps · secundário','internet secondary');
    const core=node(svg,225,145,300,78,'MikroTik RB5009','Core · Firewall · VPN','core critical');
    const reserve=node(svg,620,145,230,78,'MikroTik RB2011','Reserva documentada','reserve');
    const dist=node(svg,150,285,250,78,'Switch Aruba 1930','Distribuição / Dados','switch');
    const olt=node(svg,465,285,250,78,'OLT Datacom DM4612','33 ONUs · 10.133.12.5','olt critical');
    const cftv=node(svg,780,285,250,78,'Switches / NVRs CFTV','Legada + GPON','cftv');
    const a=node(svg,75,470,180,72,'Barracão A','A5/A6 via GPON','endpoint');
    const bc=node(svg,280,470,180,72,'B / C','GPON + anexos','endpoint');
    const e=node(svg,485,470,180,72,'Setor E','GPON','endpoint');
    const g=node(svg,690,470,180,72,'Setor G','GPON · ONU crítica','endpoint warning');
    const a10=node(svg,895,470,180,72,'A10 / Core','Dados + Wi-Fi + CFTV','endpoint');
    line(svg,alt,core,'primary');line(svg,desk,core,'secondary');
    // reserve shown as manual/backup relation
    svg.appendChild(make('path',{d:`M ${core.x+core.w} ${core.y+core.h/2} L ${reserve.x} ${reserve.y+reserve.h/2}`,class:'topo-line reserve-line'}));
    line(svg,core,dist);line(svg,core,olt);line(svg,core,cftv);
    line(svg,olt,a);line(svg,olt,bc);line(svg,olt,e);line(svg,olt,g);line(svg,dist,a10);
    svg.appendChild(make('text',{x:590,y:635,'text-anchor':'middle',class:'map-warning'},'Topologia lógica consolidada a partir dos diagramas. Rotas físicas e HA precisam de validação em campo.'));
    container.appendChild(svg);
  }

  function render(root){
    const data=window.GTO_DATA;
    root.innerHTML=`
      <section class="view-head"><div><span class="eyebrow">REDE / FIBRA / CORE</span><h1>Topologia, dependências e SPOFs</h1><p>Consolidação dos diagramas de A10/Core, GPON e Barracão F.</p></div><div class="status-pill warning">REDUNDÂNCIA FÍSICA A VALIDAR</div></section>
      <div class="metric-strip">
        <div class="metric-card accent"><span>Link principal</span><strong>1 Gbps</strong><small>ALTLink · IP dedicado</small></div>
        <div class="metric-card accent"><span>Link secundário</span><strong>600 Mbps</strong><small>Desktop Telecom · diagrama indica IP dedicado</small></div>
        <div class="metric-card warning"><span>OLT GPON</span><strong>33 ONUs</strong><small>5 portas GPON em uso no diagrama</small></div>
        <div class="metric-card danger"><span>Alerta óptico</span><strong>1 ONU</strong><small>ONU-G-REDE1 marcada crítica</small></div>
      </div>
      <div class="panel topology-panel"><div class="panel-title-row"><h3>Topologia lógica AS IS</h3><span class="badge green">Fonte: diagramas fornecidos</span></div><div id="topology-map"></div></div>
      <div class="split-2">
        <div class="panel"><div class="panel-title-row"><h3>VLANs documentadas</h3><span class="badge blue">RB5009</span></div><div class="table-scroll"><table><thead><tr><th>VLAN / rede</th><th>Subnet</th><th>Finalidade</th></tr></thead><tbody>${data.network.vlans.map(v=>`<tr><td>${v.name}</td><td><code>${v.subnet}</code></td><td>${v.purpose}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="panel"><div class="panel-title-row"><h3>Distribuição GPON</h3><span class="badge cyan">OLT 10.133.12.5</span></div><div class="table-scroll"><table><thead><tr><th>Porta</th><th>ONUs</th><th>Escopo</th></tr></thead><tbody>${data.network.gponDistribution.map(v=>`<tr><td>${v.port}</td><td>${v.onus}</td><td>${v.scope}</td></tr>`).join('')}</tbody></table></div><div class="alert-box danger"><strong>ONU crítica</strong><span>${data.network.criticalOnu}</span></div></div>
      </div>
      <div class="split-2">
        <div class="panel source-panel"><div class="panel-title-row"><h3>A10 / Core - fonte</h3><span class="badge neutral">Original</span></div><img src="assets/diagrams/core_A10.jpeg" class="source-image" alt="Topologia A10 Core"><p class="micro-copy">O diagrama identifica RB5009 como core/firewall/VPN e RB2011 como reserva. A existência de reserva não comprova failover automático ou HA.</p></div>
        <div class="panel source-panel"><div class="panel-title-row"><h3>Camada óptica GPON - fonte</h3><span class="badge neutral">Original</span></div><img src="assets/diagrams/gpon.jpeg" class="source-image" alt="Camada óptica GPON"><p class="micro-copy">A fonte GPON identifica OLT Datacom DM4612. Outros diagramas citam DM-S300/DM4270; confirmar fisicamente os modelos e a relação entre os equipamentos.</p></div>
      </div>
      <div class="panel">
        <div class="panel-title-row"><h3>Inventário técnico consolidado - A10/Core</h3><span class="badge orange">CONFIRMAR SERIAL / MODELO</span></div>
        <div class="table-scroll"><table><thead><tr><th>Local</th><th>Equipamento</th><th>Função</th><th>Status da informação</th></tr></thead><tbody>
          <tr><td>Core</td><td>MikroTik RB5009</td><td>Core / Firewall / VPN</td><td>Confirmado no diagrama</td></tr>
          <tr><td>Core</td><td>MikroTik RB2011</td><td>Reserva</td><td>Confirmado no diagrama</td></tr>
          <tr><td>Rack 1 - 44U</td><td>Switch Aruba</td><td>VLAN câmeras / rede legada</td><td>Modelo a validar</td></tr>
          <tr><td>Rack 1 - 44U</td><td>Conversores de mídia Intelbras</td><td>Fibra antiga</td><td>Quantidade/modelos a validar</td></tr>
          <tr><td>Rack 1 - 44U</td><td>Switch Aruba</td><td>Rede de câmeras nova + OLT</td><td>Modelo a validar</td></tr>
          <tr><td>Rack 1 - 44U</td><td>Datacom OLT GPON</td><td>Distribuição GPON</td><td>Modelo divergente entre fontes</td></tr>
          <tr><td>Rack 1 - 44U</td><td>NVR 1 a NVR 6</td><td>Gravação CFTV</td><td>Capacidade/modelo/retensão a validar</td></tr>
          <tr><td>Rack 2 - 44U</td><td>Switch Aruba</td><td>Distribuição</td><td>Diagrama GPON cita Aruba 1930</td></tr>
          <tr><td>Rack 2 - 44U</td><td>Switch HP L2</td><td>Expansão de portas</td><td>Modelo a validar</td></tr>
          <tr><td>Rack 2 - 44U</td><td>Cisco SPA8000</td><td>Gateway telefonia / linhas analógicas</td><td>Confirmado no diagrama</td></tr>
          <tr><td>Rack 2 - 44U</td><td>Synology 40 TB</td><td>Storage / gravação CFTV</td><td>Modelo e RAID a validar</td></tr>
          <tr><td>Rack 2 - 44U</td><td>Servidores HP/Dell</td><td>VMs / AD / sistemas / Fawcon</td><td>Funções descritas no diagrama</td></tr>
          <tr><td>Rack 2 - 44U</td><td>UPS / PDU</td><td>Proteção elétrica</td><td>Autonomia/carga não informadas</td></tr>
        </tbody></table></div>
      </div>
      <div class="panel comparison-panel">
        <div class="scenario-column asis"><span class="eyebrow">AS IS</span><h3>Dependências centrais</h3><ul><li>Dois links convergem no RB5009.</li><li>OLT GPON concentra 33 ONUs.</li><li>Rotas físicas de internet/fibra não documentadas.</li><li>HA automático de firewall/core não demonstrado.</li><li>ONU-G-REDE1 sinalizada crítica.</li></ul></div>
        <div class="scenario-arrow">→</div>
        <div class="scenario-column tobe"><span class="eyebrow">TO BE</span><h3>24x7 recomendado</h3><ul><li>Validar diversidade física de operadoras e energia.</li><li>Definir HA/failover do core com teste documentado.</li><li>Redundar uplinks críticos quando tecnicamente viável.</li><li>Monitorar níveis ópticos/ONUs e manter documentação de splitters.</li><li>Padronizar inventário, backups de configuração e etiquetagem.</li></ul></div>
      </div>`;
    drawTopology(root.querySelector('#topology-map'),data);
  }
  window.TopologyModule={render};
})();
