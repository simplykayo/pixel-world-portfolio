const enc = new TextEncoder();
const b64 = bytes => { let s=""; for(const b of bytes)s+=String.fromCharCode(b); return btoa(s); };
const hex = bytes => Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
document.addEventListener("DOMContentLoaded", () => {
 const button=document.getElementById("make");
 button.addEventListener("click", async () => {
  const status=document.getElementById("status");
  const password=document.getElementById("pw").value;
  if(password.length<14){status.textContent="Use a password with at least 14 characters.";return;}
  if(!window.crypto || !crypto.subtle){status.textContent="Secure browser cryptography is unavailable. Open this page on your HTTPS Cloudflare website.";return;}
  button.disabled=true; status.textContent="Generating securely in this browser…";
  try {
   const salt=crypto.getRandomValues(new Uint8Array(16));
   const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);
   const bits=new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations:310000},key,256));
   const session=crypto.getRandomValues(new Uint8Array(32));
   document.getElementById("hash").value=["pbkdf2",310000,b64(salt),b64(bits)].join("$");
   document.getElementById("session").value=hex(session);
   document.getElementById("pw").value="";
   status.textContent="Done. Copy both values into Cloudflare Secrets. Keep them private.";
  } catch(e) { status.textContent="Generation failed in this browser. Reload the page and try again."; }
  finally {button.disabled=false;}
 });
});