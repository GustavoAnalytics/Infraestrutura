/* Image and overlays share one SVG coordinate system: zoom/pan cannot detach them. */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const el=(tag,attrs={},text)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e;};
  const colors={unknown:'#087e9b',ok:'#168343',maintenance:'#d46b00',inactive:'#64748b'};
  const names={unknown:'Status individual a validar',ok:'OK informado',maintenance:'M informado',inactive:'N informado'};
  function cone(c){
    const a=(c.angle-c.fov/2)*Math.PI/180,b=(c.angle+c.fov/2)*Math.PI/180;
    return `M${c.x},${c.y} L${c.x+Math.cos(a)*c.range},${c.y+Math.sin(a)*c.range} A${c.range},${c.range} 0 0 1 ${c.x+Math.cos(b)*c.range},${c.y+Math.sin(b)*c.range} Z`;
  }
  window.CftvMap={mount(container,map,points,options={}){
    container.innerHTML='';
    let view=[...map.view],selected=null,drag=null,edit=false,adding=false;
    let layers={cones:true,markers:true,labels:false,onlySelected:false},opacity=.20;
    const svg=el('svg',{class:'cftv-plan',viewBox:view.join(' '),preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':'Planta original com câmeras e campos de visão estimados'});
    svg.appendChild(el('image',{href:map.image,x:0,y:0,width:map.width,height:map.height,preserveAspectRatio:'xMidYMid meet'}));
    const fovs=el('g',{'pointer-events':'none'}),markers=el('g');
    svg.append(fovs,markers);container.append(svg);
    const coord=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};
    const updateView=()=>svg.setAttribute('viewBox',view.join(' '));
    function draw(){
      fovs.replaceChildren();markers.replaceChildren();
      const size=map.view[2]/160;
      points.forEach(c=>{
        const color=colors[c.status]||colors.unknown;
        const chosen=c.id===selected;
        if(layers.cones&&(!layers.onlySelected||chosen)){
          // Inactive points intentionally have no field of view.
          if(c.status!=='inactive'){
            const path=el('path',{d:cone(c),fill:color,'fill-opacity':chosen?Math.min(opacity+.14,.8):opacity,stroke:color,'stroke-width':chosen?2:1,'vector-effect':'non-scaling-stroke','stroke-dasharray':c.status==='maintenance'?'6 4':'3 3'});
            fovs.append(path);
            const a=c.angle*Math.PI/180;
            fovs.append(el('line',{x1:c.x,y1:c.y,x2:c.x+Math.cos(a)*c.range,y2:c.y+Math.sin(a)*c.range,stroke:color,'stroke-opacity':.65,'stroke-dasharray':'4 4','vector-effect':'non-scaling-stroke'}));
          }
        }
        if(!layers.markers)return;
        const g=el('g',{'data-camera':c.id,tabindex:'0',role:'button','aria-label':`${c.id}, ${names[c.status]}`,class:'plan-camera'});
        g.append(el('circle',{cx:c.x,cy:c.y,r:size*2,fill:'transparent'}));
        if(chosen)g.append(el('circle',{cx:c.x,cy:c.y,r:size*1.85,fill:'#fff','fill-opacity':.85,stroke:'#132b43','stroke-width':2,'vector-effect':'non-scaling-stroke'}));
        g.append(el('circle',{cx:c.x,cy:c.y,r:size,fill:color,stroke:'white','stroke-width':1.7,'vector-effect':'non-scaling-stroke'}));
        const a=c.angle*Math.PI/180;
        g.append(el('line',{x1:c.x,y1:c.y,x2:c.x+Math.cos(a)*size*1.7,y2:c.y+Math.sin(a)*size*1.7,stroke:color,'stroke-width':2.2,'vector-effect':'non-scaling-stroke'}));
        if(layers.labels||chosen)g.append(el('text',{x:c.x+size*1.7,y:c.y-size*1.6,'font-size':size*2.2,fill:'#102d43',stroke:'white','stroke-width':size*.75,'paint-order':'stroke','font-weight':'700'},c.id));
        g.append(el('title',{},`${c.id} · ${names[c.status]}\nPosição aproximada da marca. Direção ${c.angle}°, abertura ${c.fov}° e extensão ${c.range} unidades gráficas: estimadas.`));
        g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(c.id);}});
        markers.append(g);
      });
    }
    function select(id){selected=id;draw();options.onSelect?.(points.find(c=>c.id===id));}
    svg.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      const p=coord(e),target=e.target.closest('[data-camera]');
      if(adding&&!target){
        if(p.x<0||p.y<0||p.x>map.width||p.y>map.height)return;
        options.onAdd?.(p);return;
      }
      if(target){
        const c=points.find(c=>c.id===target.dataset.camera);
        if(edit){options.onBeforeChange?.();drag={type:'point',c,start:p};}
        select(c.id);
      }else drag={type:'pan',start:p,view:[...view]};
      if(drag)svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove',e=>{
      if(!drag)return;
      const p=coord(e);
      if(drag.type==='point'){
        drag.c.x=Math.round(Math.max(0,Math.min(map.width,p.x))*10)/10;
        drag.c.y=Math.round(Math.max(0,Math.min(map.height,p.y))*10)/10;
        drag.c.positionEvidence='Posição ajustada pelo usuário; validar em campo';draw();options.onSelect?.(drag.c);
      }else{
        view[0]+=drag.start.x-p.x;view[1]+=drag.start.y-p.y;updateView();
      }
    });
    function end(e){if(drag?.type==='point')options.onChange?.();drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}
    svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
    draw();
    return {
      select,draw,
      setPoints(next){points=next;selected=null;draw();},
      setLayer(key,val){layers[key]=val;draw();},
      setOpacity(val){opacity=val;draw();},
      setEdit(val){edit=val;svg.classList.toggle('editable',val);},
      setAdding(val){adding=val;svg.classList.toggle('adding',val);},
      zoom(factor){const next=view[2]*factor;if(next<map.view[2]/6||next>map.view[2]*1.8)return;view=[view[0]+view[2]*(1-factor)/2,view[1]+view[3]*(1-factor)/2,view[2]*factor,view[3]*factor];updateView();},
      fit(){view=[...map.view];updateView();},
      // Print always frames the full area, independent of the current pan/zoom.
      print(){const before=[...view];view=[...map.view];updateView();window.print();view=before;updateView();}
    };
  }};
})();
