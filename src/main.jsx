import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Github, Globe2, Mail, Map, Music2, Sparkles, X, LockKeyhole, Save, Eye, LogOut, Plus, Trash2 } from "lucide-react";
import "./style.css";

const starter = {
  name: "Alex Morgan", role: "Creative developer & curious builder",
  intro: "I make thoughtful digital experiences, one little pixel at a time.",
  about: "A curious builder who loves turning ideas into useful, playful things. This world is a small map of what I do and what I am learning.",
  skills: ["JavaScript","React","UI design","CSS","Figma","Problem solving"],
  projects: [
    {title:"Little Weather",description:"A friendly weather dashboard with a calm, focused interface.",tags:["React","API"],link:"#"},
    {title:"Pixel Notes",description:"A tiny space for collecting thoughts and keeping ideas moving.",tags:["JavaScript","CSS"],link:"#"},
    {title:"Open Source",description:"Small experiments, useful fixes and things shared with the community.",tags:["GitHub","Learning"],link:"#"}
  ],
  journey: [
    {year:"2024",title:"The beginning",description:"Started exploring how the web works."},
    {year:"2025",title:"Building things",description:"Shipped small projects and learned by experimenting."},
    {year:"2026",title:"Growing forward",description:"Making more thoughtful, accessible experiences."}
  ],
  socials:[{label:"GitHub",url:"https://github.com/"},{label:"Email",url:"mailto:hello@example.com"}],
  theme:"meadow"
};

const zones = [
  {id:"spawn",name:"Spawn point",hint:"Start here",x:49,y:69,icon:"✦",desc:"A little introduction"},
  {id:"character",name:"Character hut",hint:"Who am I?",x:22,y:43,icon:"☺",desc:"A little about me"},
  {id:"inventory",name:"Inventory",hint:"My toolkit",x:75,y:40,icon:"▣",desc:"Skills & tools"},
  {id:"quests",name:"Quest board",hint:"Things I've made",x:79,y:72,icon:"▤",desc:"Selected projects"},
  {id:"journey",name:"Trail marker",hint:"The journey",x:29,y:78,icon:"⚑",desc:"Milestones & experience"},
  {id:"mailbox",name:"Mailbox",hint:"Say hello",x:52,y:25,icon:"✉",desc:"Find me elsewhere"}
];

function PixelTree({x,y,scale=1}) { return <div className="tree" style={{left:x+"%",top:y+"%",transform:"translate(-50%,-50%) scale("+scale+")"}}><i/><b/><em/></div>; }
function World({content,onZone}) {
  return <div className="world" aria-label="Interactive pixel-art world">
    <div className="sun"/><div className="cloud cloud-a"/><div className="cloud cloud-b"/>
    <div className="mountains"/><div className="water"/><div className="path"/>
    <div className="island island-a"/><div className="island island-b"/>
    <PixelTree x={12} y={56} scale={1.05}/><PixelTree x={36} y={30}/><PixelTree x={91} y={53} scale={1.2}/><PixelTree x={65} y={85} scale={.85}/><PixelTree x={12} y={85} scale={.8}/>
    <div className="flower f1">✿</div><div className="flower f2">✿</div><div className="flower f3">✿</div>
    <div className="cabin cabin-left"><span>⌂</span></div><div className="cabin cabin-right"><span>⌂</span></div>
    <div className="world-sign">WELCOME TO MY LITTLE WORLD</div>
    {zones.map(z=><button key={z.id} className={"zone zone-"+z.id} style={{left:z.x+"%",top:z.y+"%"}} onClick={()=>onZone(z.id)} aria-label={"Explore "+z.name}>
      <span className="zone-icon">{z.icon}</span><span className="zone-label">{z.name}</span><small>{z.hint}</small>
    </button>)}
    <div className="player" aria-hidden="true"><span className="player-head"/><span className="player-body"/><span className="player-shadow"/></div>
    <div className="world-coords">WORLD 01 · SUNNY MEADOW</div>
  </div>;
}

function Section({id,content,onClose}) {
  const title = {spawn:"Welcome, explorer!",character:"The character",inventory:"My inventory",quests:"Quest board",journey:"The journey",mailbox:"Send a signal"}[id];
  return <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="panel-title" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <article className="panel"><button className="close" onClick={onClose} aria-label="Close"><X size={19}/></button>
      <div className="panel-kicker">✦ FIELD NOTES / {id.toUpperCase()}</div><h2 id="panel-title">{title}</h2>
      {id==="spawn"&&<><p className="lead">{content.intro}</p><p>Pick a place on the map and explore. Every little spot has something to share.</p><button className="primary" onClick={()=>onClose()}>Explore the world <ArrowDownRight size={16}/></button></>}
      {id==="character"&&<><div className="avatar">☺</div><h3>{content.name}</h3><p className="lead">{content.role}</p><p>{content.about}</p><div className="note">CURRENT STATUS <b>Curious and creating</b></div></>}
      {id==="inventory"&&<><p className="lead">Tools I reach for and skills I'm growing.</p><div className="skill-grid">{content.skills.map((s,i)=><span key={i} className="skill"><i>✦</i>{s}</span>)}</div></>}
      {id==="quests"&&<div className="project-list">{content.projects.map((p,i)=><div className="project" key={i}><div className="project-top"><span>QUEST {String(i+1).padStart(2,"0")}</span><span>✧</span></div><h3>{p.title}</h3><p>{p.description}</p><div className="tags">{(p.tags||[]).map(t=><small key={t}>{t}</small>)}</div>{p.link&&p.link!=="#"&&<a href={p.link} target="_blank" rel="noreferrer">View project <ArrowUpRight size={14}/></a>}</div>)}</div>}
      {id==="journey"&&<div className="timeline">{content.journey.map((j,i)=><div className="milestone" key={i}><b>{j.year}</b><div><h3>{j.title}</h3><p>{j.description}</p></div></div>)}</div>}
      {id==="mailbox"&&<><p className="lead">Have a question, an idea, or just want to say hello?</p><div className="social-list">{content.socials.map((s,i)=><a key={i} href={s.url} target={s.url.startsWith("mailto:")?"_self":"_blank"} rel="noreferrer"><span>{s.label==="Email"?<Mail size={17}/>:<Globe2 size={17}/>}</span>{s.label}<ArrowUpRight size={15}/></a>)}</div></>}
    </article>
  </div>;
}

function Admin() {
  const [password,setPassword]=useState(""); const [logged,setLogged]=useState(false); const [content,setContent]=useState(starter);
  const [status,setStatus]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>{fetch("/api/admin/session").then(r=>r.ok&&r.json()).then(d=>{if(d?.authenticated){setLogged(true);load()}}).catch(()=>{});},[]);
  async function load(){const r=await fetch("/api/admin/content");if(r.ok){const d=await r.json();setContent(d.draft||d.published||starter)}}
  async function login(e){e.preventDefault();setBusy(true);setStatus("");try{const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});if(!r.ok)throw new Error((await r.json()).error||"Login failed");setLogged(true);setPassword("");await load()}catch(e){setStatus(e.message)}finally{setBusy(false)}}
  async function save(publish=false){setBusy(true);setStatus("");try{const r=await fetch(publish?"/api/admin/publish":"/api/admin/content",{method:publish?"POST":"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(content)});if(!r.ok)throw new Error((await r.json()).error||"Could not save");setStatus(publish?"Published! Your live portfolio is updated.":"Draft saved.");}catch(e){setStatus(e.message)}finally{setBusy(false)}}
  async function logout(){await fetch("/api/admin/logout",{method:"POST"});setLogged(false);location.href="/"}
  const set=(key,value)=>setContent(c=>({...c,[key]:value}));
  if(!logged)return <main className="admin-shell"><form className="login-card" onSubmit={login}><a className="back-link" href="/">← Back to world</a><div className="admin-mark"><LockKeyhole/></div><div className="panel-kicker">PRIVATE AREA</div><h1>Creator's cabin</h1><p>Sign in to update this little world.</p><label>Admin password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{status&&<p className="error">{status}</p>}<button className="primary wide" disabled={busy}>{busy?"Checking…":"Unlock dashboard"}</button></form></main>;
  return <main className="admin-shell"><header className="admin-header"><a href="/" className="back-link">← View portfolio</a><button className="quiet-button" onClick={logout}><LogOut size={16}/> Sign out</button></header><div className="admin-content"><div className="panel-kicker">WORLD BUILDER / CONTROL ROOM</div><h1>Creator's cabin</h1><p className="admin-intro">Edit the words and details in your portfolio. Save a draft first, then publish when you're happy.</p>
    <section className="editor-card"><h2><span>01</span> Introduction</h2><label>Name<input value={content.name} onChange={e=>set("name",e.target.value)}/></label><label>Role<input value={content.role} onChange={e=>set("role",e.target.value)}/></label><label>Intro<textarea rows="2" value={content.intro} onChange={e=>set("intro",e.target.value)}/></label><label>About<textarea rows="4" value={content.about} onChange={e=>set("about",e.target.value)}/></label></section>
    <section className="editor-card"><h2><span>02</span> Skills & tools</h2><label>One skill per line<textarea rows="5" value={content.skills.join("\n")} onChange={e=>set("skills",e.target.value.split("\n").map(x=>x.trim()).filter(Boolean))}/></label></section>
    <section className="editor-card"><h2><span>03</span> Projects</h2>{content.projects.map((p,i)=><div className="repeat-editor" key={i}><div className="repeat-title">Quest {i+1}<button className="icon-button" onClick={()=>set("projects",content.projects.filter((_,n)=>n!==i))} aria-label="Delete project"><Trash2 size={15}/></button></div><label>Title<input value={p.title} onChange={e=>set("projects",content.projects.map((x,n)=>n===i?{...x,title:e.target.value}:x))}/></label><label>Description<textarea rows="2" value={p.description} onChange={e=>set("projects",content.projects.map((x,n)=>n===i?{...x,description:e.target.value}:x))}/></label><label>Tags (comma separated)<input value={(p.tags||[]).join(", ")} onChange={e=>set("projects",content.projects.map((x,n)=>n===i?{...x,tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)}:x))}/></label><label>Project URL<input value={p.link||""} onChange={e=>set("projects",content.projects.map((x,n)=>n===i?{...x,link:e.target.value}:x))}/></label></div>)}<button className="add-button" onClick={()=>set("projects",[...content.projects,{title:"New project",description:"A short description.",tags:[],link:""}])}><Plus size={16}/> Add project</button></section>
    <section className="editor-card"><h2><span>04</span> Journey</h2>{content.journey.map((j,i)=><div className="repeat-editor" key={i}><div className="repeat-title">Milestone {i+1}<button className="icon-button" onClick={()=>set("journey",content.journey.filter((_,n)=>n!==i))} aria-label="Delete milestone"><Trash2 size={15}/></button></div><div className="two-fields"><label>Year<input value={j.year} onChange={e=>set("journey",content.journey.map((x,n)=>n===i?{...x,year:e.target.value}:x))}/></label><label>Title<input value={j.title} onChange={e=>set("journey",content.journey.map((x,n)=>n===i?{...x,title:e.target.value}:x))}/></label></div><label>Description<textarea rows="2" value={j.description} onChange={e=>set("journey",content.journey.map((x,n)=>n===i?{...x,description:e.target.value}:x))}/></label></div>)}<button className="add-button" onClick={()=>set("journey",[...content.journey,{year:"2027",title:"New milestone",description:"What happened?"}])}><Plus size={16}/> Add milestone</button></section>
    <section className="editor-card"><h2><span>05</span> Contact links</h2>{content.socials.map((s,i)=><div className="two-fields" key={i}><label>Label<input value={s.label} onChange={e=>set("socials",content.socials.map((x,n)=>n===i?{...x,label:e.target.value}:x))}/></label><label>URL<input value={s.url} onChange={e=>set("socials",content.socials.map((x,n)=>n===i?{...x,url:e.target.value}:x))}/></label></div>)}<button className="add-button" onClick={()=>set("socials",[...content.socials,{label:"Website",url:"https://"}])}><Plus size={16}/> Add link</button></section>
    <div className="publish-bar"><span>{status||"Changes are private until published."}</span><div><button className="secondary" disabled={busy} onClick={()=>save(false)}><Save size={15}/> Save draft</button><button className="primary" disabled={busy} onClick={()=>save(true)}><Eye size={15}/> Publish live</button></div></div>
  </div></main>;
}

function App() {
  const [content,setContent]=useState(starter); const [active,setActive]=useState("spawn"); const [showPanel,setShowPanel]=useState(false);
  useEffect(()=>{fetch("/api/content").then(r=>r.ok?r.json():null).then(d=>{if(d)setContent({...starter,...d})}).catch(()=>{});},[]);
  const zoneClick=id=>{setActive(id);setShowPanel(true)};
  useEffect(()=>{const key=e=>{if(e.key==="Escape")setShowPanel(false)};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[]);
  if(location.pathname.startsWith("/admin"))return <Admin/>;
  return <main className="site-shell"><header className="topbar"><a className="brand" href="#"><span className="brand-icon">✳</span> PIXEL WORLD <small>PORTFOLIO</small></a><div className="top-status"><i/> WORLD ONLINE <span>·</span> TAKE A LOOK AROUND</div><a className="admin-link" href="/admin"><LockKeyhole size={14}/> CREATOR LOGIN</a></header>
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> A SMALL CORNER OF THE INTERNET</div><h1>Hey, I'm <em>{content.name.split(" ")[0]}.</em></h1><p>{content.role}. <span>Welcome to my world.</span></p><div className="hero-hint"><span className="hint-key">CLICK</span> any location to explore <ArrowDownRight size={16}/></div></div><div className="hero-stamp"><div>EST.</div><strong>20<br/>26</strong><small>MADE WITH<br/>CURIOSITY</small></div></section>
    <section className="map-wrap"><div className="map-heading"><div><span className="section-index">01 / THE MAP</span><h2>Explore my world</h2></div><div className="map-legend"><span><i className="legend-dot"/> INTERACTIVE LOCATIONS</span><span><Map size={14}/> 6 PLACES TO FIND</span></div></div><World content={content} onZone={zoneClick}/><div className="map-footer"><span>↳ MOVE YOUR CURSOR · FIND A PLACE · OPEN A STORY</span><span>NO WRONG WAY TO EXPLORE <b>✦</b></span></div></section>
    <footer className="footer"><span>© {new Date().getFullYear()} {content.name} · BUILT ONE PIXEL AT A TIME</span><span>HAND-CRAFTED WITH <b>♥</b> AND A LITTLE CSS</span></footer>
    {showPanel&&<Section id={active} content={content} onClose={()=>setShowPanel(false)}/>}
  </main>;
}
createRoot(document.getElementById("root")).render(<App/>);
