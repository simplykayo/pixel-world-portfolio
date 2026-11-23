const COOKIE = "__Host-pixel_session";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), {status, headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...headers}});
}
function bytesToB64(bytes) { let s=""; for (const b of bytes) s+=String.fromCharCode(b); return btoa(s); }
function b64ToBytes(value) { return Uint8Array.from(atob(value), c=>c.charCodeAt(0)); }
async function digest(value) { return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))); }
async function hmac(value, secret) {
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(value)));
}
function equal(a,b) { if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a[i]^b[i];return n===0; }
function cookie(value,maxAge=SESSION_SECONDS) { return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`; }
function getCookie(request) { return (request.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1)||""; }
function sameOrigin(request) { const origin=request.headers.get("Origin"); return !!origin && origin===new URL(request.url).origin; }
async function authorized(request,env) {
  const token=getCookie(request); if(!token||!env.SESSION_SECRET)return false;
  const [payload,signature]=token.split("."); if(!payload||!signature)return false;
  try {
    const data=JSON.parse(atob(payload.replace(/-/g,"+").replace(/_/g,"/")));
    if(!data.exp||data.exp<Date.now()/1000)return false;
    const expected=await hmac(payload,env.SESSION_SECRET);
    return equal(expected,b64ToBytes(signature));
  } catch { return false; }
}
async function makeSession(env) {
  const payload=bytesToB64(encoder.encode(JSON.stringify({exp:Math.floor(Date.now()/1000)+SESSION_SECONDS}))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const sig=bytesToB64(await hmac(payload,env.SESSION_SECRET)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  return payload+"."+sig;
}
async function verifyPassword(password,encoded) {
  const [kind,iterationsText,saltText,hashText]=String(encoded||"").split("$");
  const iterations=Number(iterationsText);
  if(kind!=="pbkdf2"||!Number.isInteger(iterations)||iterations<100000||iterations>1000000||!saltText||!hashText)return false;
  try {
    const key=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);
    const actual=new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:b64ToBytes(saltText),iterations},key,256));
    return equal(actual,b64ToBytes(hashText));
  } catch { return false; }
}
function safeUrl(value) {
  const v=String(value||"").trim();
  if(!v||v==="#")return "#";
  if(v.startsWith("mailto:"))return v.slice(7).includes("@")?"mailto:"+v.slice(7):"#";
  try { const u=new URL(v); return ["https:","http:"].includes(u.protocol)?u.href:"#"; } catch { return "#"; }
}
function cleanContent(input) {
  if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("Invalid content.");
  const text=(v,max=500)=>String(v??"").trim().slice(0,max);
  const arr=(v,max=40)=>Array.isArray(v)?v.slice(0,max):[];
  return {
    name:text(input.name,80)||"Your name",
    role:text(input.role,140),
    intro:text(input.intro,400),
    about:text(input.about,1600),
    skills:arr(input.skills,40).map(x=>text(x,60)).filter(Boolean),
    projects:arr(input.projects,30).map(p=>({title:text(p?.title,100),description:text(p?.description,600),tags:arr(p?.tags,12).map(x=>text(x,40)).filter(Boolean),link:safeUrl(p?.link)})),
    journey:arr(input.journey,30).map(j=>({year:text(j?.year,30),title:text(j?.title,100),description:text(j?.description,600)})),
    socials:arr(input.socials,20).map(s=>({label:text(s?.label,50),url:safeUrl(s?.url)})),
    theme:"meadow"
  };
}
async function readContent(env) {
  const row=await env.DB.prepare("SELECT published_json,draft_json,updated_at FROM site_content WHERE id=1").first();
  if(!row)return null;
  return {published:JSON.parse(row.published_json),draft:row.draft_json?JSON.parse(row.draft_json):null,updatedAt:row.updated_at};
}
async function bodyJson(request,max=100000) {
  const length=Number(request.headers.get("Content-Length")||0);
  if(length>max)throw new Error("Request is too large.");
  const raw=await request.text(); if(raw.length>max)throw new Error("Request is too large.");
  return JSON.parse(raw);
}
async function login(request,env) {
  if(!sameOrigin(request))return json({error:"Request origin rejected."},403);
  if(!env.ADMIN_PASSWORD_HASH||!env.SESSION_SECRET||!env.DB)return json({error:"Admin setup is incomplete."},503);
  const ip=request.headers.get("CF-Connecting-IP")||"unknown";
  const ipHash=bytesToB64(await digest(ip+"|"+env.SESSION_SECRET));
  const now=Math.floor(Date.now()/1000);
  let row=await env.DB.prepare("SELECT attempts,window_started FROM login_attempts WHERE ip_hash=?").bind(ipHash).first();
  if(row&&now-row.window_started<900&&row.attempts>=8)return json({error:"Too many attempts. Try again in 15 minutes."},429);
  if(!row||now-row.window_started>=900) {
    await env.DB.prepare("INSERT OR REPLACE INTO login_attempts(ip_hash,attempts,window_started) VALUES(?,0,?)").bind(ipHash,now).run();
    row={attempts:0,window_started:now};
  }
  let data; try { data=await bodyJson(request,4096); } catch { return json({error:"Invalid request."},400); }
  const valid=typeof data.password==="string"&&data.password.length<=256&&await verifyPassword(data.password,env.ADMIN_PASSWORD_HASH);
  if(!valid) {
    await env.DB.prepare("UPDATE login_attempts SET attempts=attempts+1 WHERE ip_hash=?").bind(ipHash).run();
    return json({error:"That password didn't match."},401);
  }
  await env.DB.prepare("DELETE FROM login_attempts WHERE ip_hash=?").bind(ipHash).run();
  return json({ok:true},{status:200,headers:{"Set-Cookie":cookie(await makeSession(env))}});
}
export async function onRequest({request,env}) {
  const path=new URL(request.url).pathname;
  if(!path.startsWith("/api/"))return new Response("Not found",{status:404});
  if(request.method==="OPTIONS")return new Response(null,{status:405});
  if(path==="/api/content"&&request.method==="GET") {
    try { const data=await readContent(env); return json(data?.published||{}); } catch { return json({error:"Content unavailable."},500); }
  }
  if(path==="/api/admin/login"&&request.method==="POST")return login(request,env);
  if(path==="/api/admin/session"&&request.method==="GET")return json({authenticated:await authorized(request,env)});
  if(path==="/api/admin/logout"&&request.method==="POST") {
    if(!sameOrigin(request))return json({error:"Request origin rejected."},403);
    return json({ok:true},{headers:{"Set-Cookie":cookie("",0)}});
  }
  if(path.startsWith("/api/admin/")) {
    if(!await authorized(request,env))return json({error:"Please sign in again."},401);
    if(!env.DB)return json({error:"Database is not configured."},503);
    if(path==="/api/admin/content"&&request.method==="GET") {
      try { const data=await readContent(env); return json(data||{}); } catch { return json({error:"Could not load content."},500); }
    }
    if(path==="/api/admin/content"&&request.method==="PUT") {
      if(!sameOrigin(request))return json({error:"Request origin rejected."},403);
      try {
        const clean=cleanContent(await bodyJson(request));
        await env.DB.prepare("UPDATE site_content SET draft_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=1").bind(JSON.stringify(clean)).run();
        return json({ok:true});
      } catch(e) { return json({error:e.message==="Invalid content."?e.message:"Could not save draft."},400); }
    }
    if(path==="/api/admin/publish"&&request.method==="POST") {
      if(!sameOrigin(request))return json({error:"Request origin rejected."},403);
      try {
        const clean=cleanContent(await bodyJson(request));
        await env.DB.prepare("UPDATE site_content SET published_json=?,draft_json=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=1").bind(JSON.stringify(clean)).run();
        return json({ok:true});
      } catch { return json({error:"Could not publish changes."},400); }
    }
  }
  return json({error:"Not found."},404);
}
