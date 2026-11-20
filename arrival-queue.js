/* Seven-day queue helpers. No timers, paid scheduler or catalog-order inference. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WillisArrival=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const WEEK=7*24*60*60*1000;
  function valid(s){return typeof s==='string'&&Number.isFinite(Date.parse(s));}
  function schedule(ids,previous,now){
    now=now===undefined?Date.now():now;
    const old=(previous&&Array.isArray(previous.entries))?previous.entries:[];
    
    let cursor=now;
    return ids.map((id,i)=>{
      const found=old.find(e=>e.id===id);
      // Preserve already-running or historical slot when its prefix stays in place.
      const samePrefix=old.slice(0,i+1).every((e,j)=>ids[j]===e.id)&&old[i]&&old[i].id===id;
      let start=(samePrefix&&found&&valid(found.startsAt))?Date.parse(found.startsAt):Math.max(cursor,now);
      if(i>0)start=Math.max(start,cursor);
      // When adding after a held final slot, begin the new scent now, not in the past.
      if(i>0&&i>=old.length&&start<now)start=now;
      const item={id,startsAt:new Date(start).toISOString()}; cursor=start+WEEK;return item;
    });
  }
  function current(config,now){
    now=now===undefined?Date.now():now;
    const es=(config&&Array.isArray(config.entries)?config.entries:[]).filter(e=>e&&typeof e.id==='string'&&valid(e.startsAt));
    if(!es.length)return null;
    let i=0;for(let j=0;j<es.length;j++){if(Date.parse(es[j].startsAt)<=now)i=j;else break;}
    const e=es[i],end=Date.parse(e.startsAt)+WEEK;
    return {...e,index:i,endsAt:new Date(end).toISOString(),held:i===es.length-1&&now>=end};
  }
  return {WEEK,schedule,current};
});
