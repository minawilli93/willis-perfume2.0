(function(){
'use strict';
let cfg=null,hash='',ids=[],edited=false;
const panel=document.getElementById('arrivalAdmin'),status=document.getElementById('arrivalStatus'),list=document.getElementById('arrivalList'),select=document.getElementById('arrivalSelect');
function name(id){const p=products.find(p=>p.id===id);return p?p.brand_name:id;}
function draw(){
 select.replaceChildren();products.filter(p=>p.visible!==false&&!ids.includes(p.id)).forEach(p=>{const op=document.createElement('option');op.value=p.id;op.textContent=p.brand_name;select.append(op);});
 list.replaceChildren();const now=Date.now(),current=WillisArrival.current(cfg,now);
 ids.forEach((id,i)=>{const row=document.createElement('li');row.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:9px 0;border-bottom:1px solid #e8dfd0';
  const label=document.createElement('span');label.style.cssText='flex:1;min-width:150px';let text=(i+1)+'. '+name(id);const e=cfg&&cfg.entries[i];
  if(!edited&&e&&e.id===id){text+=' | '+new Date(e.startsAt).toLocaleDateString('en-GB',{timeZone:'Africa/Cairo'});if(current&&current.id===id)text+=current.held?' | Still showing (waiting for next)':' | Showing now';}
  label.textContent=text;row.append(label);
  [['↑',-1],['↓',1],['Remove',0]].forEach(([label,dir])=>{const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent=label;b.setAttribute('aria-label',label+' '+name(id));b.disabled=dir===-1&&i===0||dir===1&&i===ids.length-1;b.onclick=()=>{if(!dir)ids.splice(i,1);else [ids[i],ids[i+dir]]=[ids[i+dir],ids[i]];edited=true;status.textContent='Unsaved queue changes. Reordering/removing the running slot restarts its changed part from Save time.';draw();};row.append(b);});list.append(row);
 });
}
async function loadQueue(){try{status.textContent='Loading weekly queue…';const r=await apiFetch('/api/new-arrival');const j=await r.json();if(!r.ok)throw Error(j.error||'Could not load');cfg=j;hash=r.headers.get('X-Queue-Hash')||'';ids=(cfg.entries||[]).map(e=>e.id);edited=false;draw();status.textContent='Seven days per scent, then next. Last scent stays visible when the queue ends. Dates shown in Cairo time.';}catch(e){status.textContent=e.message;}}
document.getElementById('arrivalAdd').onclick=()=>{const id=select.value;if(id&&!ids.includes(id)){ids.push(id);edited=true;draw();status.textContent='Added to draft queue. Save queue to publish.';}};
document.getElementById('arrivalReload').onclick=()=>{if(!edited||confirm('Discard unsaved queue edits?'))loadQueue();};
document.getElementById('arrivalSave').onclick=async function saveQueue(){
 if(!ids.length){status.textContent='Keep at least one fragrance in the queue.';return;}
 if(!edited){status.textContent='No queue changes to save.';return;}
 if(!confirm('Publish this queue? Every scent gets seven days. Changing the running portion restarts its changed part now; appending does not interrupt the current week.'))return;
 try{const r=await apiFetch('/api/new-arrival',{method:'POST',headers:{'Content-Type':'application/json','X-Base-Hash':hash},body:JSON.stringify({ids})});const j=await r.json();if(r.status===401){pendingAction=saveQueue;openLockScreen('Enter your current PIN to save New Arrival.');return;}if(!r.ok)throw Error(j.error||'Save failed');cfg=j.config;hash=j.hash;edited=false;draw();status.textContent='Weekly queue saved. Product catalog and prices unchanged.';}catch(e){status.textContent=e.message;}
};
document.addEventListener('willis-admin-products-loaded',()=>{draw();if(!cfg)loadQueue();});
if(products.length)loadQueue();
})();
