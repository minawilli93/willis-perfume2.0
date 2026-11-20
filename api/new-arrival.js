const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const {list,put}=require('@vercel/blob');
const queue=require('../arrival-queue');
const DATA='data/new-arrival.json';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function send(res,status,obj,headers={}){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');for(const [k,v]of Object.entries(headers))res.setHeader(k,v);res.end(JSON.stringify(obj));}
async function read(){const {blobs}=await list({prefix:DATA,limit:10});const b=blobs.find(x=>x.pathname===DATA);if(b){const r=await fetch(b.url,{cache:'no-store'});if(!r.ok)throw Error('Queue read failed');return r.text();}const seed=path.join(process.cwd(),'new-arrival-seed.json');
if(!fs.existsSync(seed))return JSON.stringify({version:1,entries:[]});
const initial=JSON.parse(fs.readFileSync(seed,'utf8'));
if(initial.startOnFirstVisit&&initial.entries.length){
 initial.entries=queue.schedule(initial.entries.map(e=>e.id),null,Date.now());
 initial.launchedAt=initial.entries[0].startsAt;delete initial.startOnFirstVisit;
 const txt=JSON.stringify(initial,null,2)+'\n';
 // One-time bootstrap of the approved seed only. Later changes always require PIN.
 if(process.env.VERCEL_ENV!=='preview')await put(DATA,txt,{access:'public',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true});
 return txt;
}
return JSON.stringify(initial);}
async function body(req){let s='';for await(const c of req){s+=c;if(Buffer.byteLength(s)>100000)throw Error('Request too large');}return JSON.parse(s);}
module.exports=async(req,res)=>{try{
 if(process.env.VERCEL_ENV==='preview'&&req.method==='POST')return send(res,403,{error:'Preview queue is read-only. Use your live Dashboard.'});
 if(req.method==='POST'&&(!process.env.ADMIN_PIN||req.headers['x-admin-pin']!==process.env.ADMIN_PIN))return send(res,401,{error:'Unauthorized'});
 const raw=await read();const prior=JSON.parse(raw);
 if(req.method==='GET')return send(res,200,prior,{'X-Queue-Hash':hash(raw)});
 if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
 // Unlike legacy optional product protection, queue writes require a configured PIN.

 if(!req.headers['x-base-hash']||req.headers['x-base-hash']!==hash(raw))return send(res,409,{error:'Queue changed. Reload before saving.'});
 const data=await body(req);
 if(!Array.isArray(data.ids)||data.ids.length<1||data.ids.length>200||new Set(data.ids).size!==data.ids.length||data.ids.some(id=>typeof id!=='string'||!/^[a-z0-9][a-z0-9-]{0,99}$/.test(id)))return send(res,400,{error:'Choose 1 to 200 unique product IDs.'});
 const updated={version:1,exhaustion:'hold-last',updatedAt:new Date().toISOString(),entries:queue.schedule(data.ids,prior,Date.now())};
 const text=JSON.stringify(updated,null,2)+'\n';
 await put(DATA,text,{access:'public',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true});
 return send(res,200,{ok:true,config:updated,hash:hash(text)});
 }catch(e){console.error('New Arrival:',e.message);return send(res,500,{error:'Could not read or save New Arrival. Try again; no product data was changed.'});}};
