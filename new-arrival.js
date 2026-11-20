/* New Arrival. Approved scroll paths; scene data comes only from catalog notes. */
(function(){
'use strict';
const section=document.getElementById('newArrival');if(!section)return;
let products=[],config=null,shownId=null,loopStarted=false;
const palettes={
 fresh:['#e0e3d3','#c4ceba','#e9e7d9','#24382b'],
 floral:['#eee1e3','#d8c7d9','#f3e9e3','#49334c'],
 gourmand:['#eee0ca','#d8b994','#f3e5d1','#4c3426'],
 woody:['#dedccf','#b9c4ae','#ece9d9','#2c3d2e'],
 fruity:['#f3e1d4','#d9c4b8','#f4e9dd','#533b35']};
function palette(p){const n=JSON.stringify(p.notes||{}).toLowerCase();if(/chocolate|cacao|vanilla|caramel|tonka/.test(n))return'gourmand';if(/rose|iris|tuberose/.test(n))return'floral';if(/cherry|raspberry/.test(n))return'fruity';if(/pine tree|vetiver/.test(n))return'woody';return'fresh';}
function assets(p){const notes=Object.values(p.notes||{}).flat().map(x=>x.toLowerCase());return Object.entries(window.WillisArrivalAssets.notes).filter(([k,v])=>v.matches.some(m=>notes.some(n=>n===m||n.includes(m)))).map(([key])=>key);}
const preset={'birch-peak':['note-lemon','note-apple','note-currant','note-jasmine','note-pepper','note-wood']};
function localized(p,key){return document.documentElement.lang==='ar'&&p.ar&&p.ar[key]?p.ar[key]:p[key];}
function render(){
 if(!config||!products.length)return;
 const slot=WillisArrival.current(config);if(!slot)return;
 let p=products.find(x=>x.id===slot.id&&x.visible!==false);
 // Hidden/deleted products never leak back onto the storefront. Use last visible queued scent.
 if(!p){const candidates=config.entries.slice(0,slot.index+1).reverse();for(const e of candidates){p=products.find(x=>x.id===e.id&&x.visible!==false);if(p)break;}}
 if(!p){section.hidden=true;return;}
 const ar=document.documentElement.lang==='ar';
 section.querySelector('.na-eyebrow').textContent=ar?'وصل حديثًا':'JUST LANDED';
 section.querySelector('.na-title').textContent=ar?'عطر جديد':'New Arrival';
 section.querySelector('.na-name').textContent=p.brand_name;
 section.querySelector('.na-insp').textContent=(ar?'مستوحى من ':'Inspired by ')+p.inspired_by;
 const chips=section.querySelector('.na-chips');chips.replaceChildren();(localized(p,'profile')||localized(p,'short_profile')||p.short_profile||[]).slice(0,3).forEach(t=>{const el=document.createElement('span');el.textContent=t;chips.append(el);});
 const prices=Object.values(p.sizes||{}).map(Number).filter(v=>Number.isFinite(v)&&v>0);
 const price=section.querySelector('.na-price');price.replaceChildren(document.createTextNode(ar?'يبدأ من ':'Starts from '));const strong=document.createElement('strong');strong.textContent=prices.length?Math.min(...prices)+' '+(ar?'جنيه':'EGP'):'';price.append(strong);
 const cta=section.querySelector('.na-cta');cta.textContent=ar?'شوف التفاصيل':'View details';cta.href='#product='+encodeURIComponent(p.id);cta.onclick=e=>{if(typeof openProductModal==='function'){e.preventDefault();openProductModal(p);}};
 const keys=preset[p.id]||assets(p).slice(0,6),nodes=[...section.querySelectorAll('.na-note')];
 nodes.forEach((node,i)=>{const key=keys[i];node.hidden=!key;const img=node.querySelector('img');if(key){img.src=WillisArrivalAssets.notes[key].src;img.alt='';}});
 section.querySelector('.na-bottle').src=WillisArrivalAssets.bottle;
 const ps=palettes[palette(p)];section.style.background='radial-gradient(ellipse 72% 37% at 53% 39%, #f2f0e4 0%, transparent 100%),linear-gradient(150deg,'+ps[0]+' 0%,'+ps[1]+' 53%,'+ps[2]+' 100%)';
 section.querySelectorAll('.na-title,.na-name').forEach(el=>el.style.color=ps[3]);
 section.hidden=false;section.classList.add('na-in');shownId=p.id;
 if(!loopStarted){loopStarted=true;animate();}
}
function animate(){
 const parallax=document.getElementById('naParallax');
 const notes=[...section.querySelectorAll('.na-note')];
 let target=0,smoothP=0,noteP=notes.map(()=>0);
 const MAX_Y=150,MAX_X=92,MAX_R=26;
 function clamp(v,m){return Math.max(-m,Math.min(m,v));}
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 function loop(){
  const r=section.getBoundingClientRect(),vh=window.innerHeight;
  target=Math.max(-1,Math.min(1,((vh/2)-(r.top+r.height/2))/vh));
  if(reduce.matches){parallax.style.transform='none';notes.forEach(n=>n.style.transform='none');requestAnimationFrame(loop);return;}
  smoothP+=(target-smoothP)*.06;if(Math.abs(target-smoothP)<.0004)smoothP=target;
  const y=clamp(smoothP*-52,55),rot=clamp(smoothP*7,7);
  parallax.style.transform='translateY('+y.toFixed(1)+'px) rotate('+rot.toFixed(2)+'deg)';
  notes.forEach((n,i)=>{const e=parseFloat(n.dataset.ease||'.06');noteP[i]+=(target-noteP[i])*e;if(Math.abs(target-noteP[i])<.0004)noteP[i]=target;
   const p=noteP[i],s=parseFloat(n.dataset.speed||0),dx=parseFloat(n.dataset.dx||0),nr=parseFloat(n.dataset.rot||0),sc=parseFloat(n.dataset.sc||0);
   // Preserve approved v9 clamp semantics and travel exactly.
   n.style.transform='translate('+clamp(p*dx,MAX_X).toFixed(1)+'px,'+clamp(p*s,MAX_Y).toFixed(1)+'px) rotate('+clamp(p*nr,MAX_R).toFixed(2)+'deg) scale('+clamp(1+p*sc,.9).toFixed(3)+')';
  });requestAnimationFrame(loop);
 }loop();
}
async function load(){try{const r=await fetch('/api/new-arrival',{cache:'no-store'});if(!r.ok)throw Error('queue');config=await r.json();render();}catch(e){try{const r=await fetch('/new-arrival-seed.json',{cache:'no-store'});config=await r.json();render();}catch(ignore){section.hidden=true;}}}
document.addEventListener('willis-products-loaded',e=>{products=e.detail;render();});
document.addEventListener('langchange',render);
if(typeof state!=='undefined'&&Array.isArray(state.products))products=state.products;
load();setInterval(render,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
})();
