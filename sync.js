// Merker – Abgleich zwischen Geräten über das eigene Google-Skript (Daten in deinem Google Drive)
(function(){
const KEYS=['tasks','profileData','areas','cats','chat','calSent','cfg','groqKey'];
const LS=window.localStorage;
const rawSet=Storage.prototype.setItem;
let applying=false,pushTimer=null,busy=false;
const conf=()=>{try{const c=JSON.parse(LS.getItem('cfg')||'{}');return {u:c.gmailUrl||'',t:c.gmailToken||''}}catch(e){return {u:'',t:''}}};
const localTs=()=>Number(LS.getItem('syncTs')||0);
function setTs(v){rawSet.call(LS,'syncTs',String(v))}

// jede Änderung an Merker-Daten merken und kurz danach hochladen
Storage.prototype.setItem=function(k,v){
  const old=this===LS?LS.getItem(k):null;
  rawSet.call(this,k,v);
  if(this===LS&&!applying&&KEYS.includes(k)&&old!==String(v)){setTs(Date.now());schedulePush()}
};
function schedulePush(){clearTimeout(pushTimer);pushTimer=setTimeout(push,1500)}

function collect(){const d={};for(const k of KEYS){const v=LS.getItem(k);if(v!=null)d[k]=v}return d}

async function push(){
  const {u,t}=conf();if(!u||!t||busy)return;busy=true;
  try{
    const r=await fetch(u,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'push',token:t,ts:localTs(),data:collect()})});
    const j=await r.json();
    if(j.error)throw new Error(j.error);
    if(j.newer){busy=false;await pull(true);return}
    status('✓ synchronisiert');
  }catch(e){status('⚠️ Abgleich: '+e.message)}
  busy=false;
}

async function pull(force){
  const {u,t}=conf();if(!u||!t)return;
  try{
    const r=await fetch(u+'?action=pull&token='+encodeURIComponent(t)+'&x='+Date.now());
    const j=await r.json();if(j.error)throw new Error(j.error);
    const rts=Number(j.ts||0);
    if(rts===0){if(LS.getItem('tasks')||LS.getItem('profileData')){setTs(Date.now());schedulePush()}return}   // erstes Gerät: Stand hochladen
    if(rts>localTs()||(force&&localTs()===0)){
      applying=true;
      const d=j.data||{};
      for(const k of KEYS){if(d[k]!=null)rawSet.call(LS,k,d[k])}
      // Verbindung (URL/Geheimwort) dieses Geräts nie verlieren
      try{const c=JSON.parse(LS.getItem('cfg')||'{}');if(!c.gmailUrl){c.gmailUrl=u;c.gmailToken=t;rawSet.call(LS,'cfg',JSON.stringify(c))}}catch(e){}
      setTs(rts);applying=false;
      if(!sessionStorage.getItem('syncReload')||Date.now()-Number(sessionStorage.getItem('syncReload'))>5000){
        sessionStorage.setItem('syncReload',String(Date.now()));location.reload();}
      return;
    }
    if(localTs()>rts)schedulePush();
  }catch(e){status('⚠️ Abgleich: '+e.message)}
}

function status(msg){const el=document.getElementById('syncStatus');if(el)el.textContent=msg}

// ---------- Gerät verbinden ----------
function code(){const {u,t}=conf();return u&&t?btoa(unescape(encodeURIComponent(JSON.stringify({u,t})))):''}
function connectWith(c){
  try{const o=JSON.parse(decodeURIComponent(escape(atob(c.trim()))));if(!o.u||!o.t)throw 0;
    const cf=JSON.parse(LS.getItem('cfg')||'{}');cf.gmailUrl=o.u;cf.gmailToken=o.t;
    applying=true;rawSet.call(LS,'cfg',JSON.stringify(cf));setTs(0);applying=false;
    toast('Verbunden – lade deine Daten …');sessionStorage.removeItem('syncReload');pull(true);return true}
  catch(e){toast('Code ungültig');return false}
}
// Link mit #verbinden=… öffnen
const m=location.hash.match(/verbinden=([^&]+)/);
if(m){history.replaceState(null,'',location.pathname);connectWith(decodeURIComponent(m[1]))}

// Bereich in den Einstellungen
{const sheet=document.querySelector('#mSettings .sheet');const anchor=document.getElementById('sSave');
 if(sheet&&anchor){const box=document.createElement('div');
  box.innerHTML=`<label>📲 Geräte-Abgleich</label>
   <div class="hint" id="syncStatus">${conf().u?'aktiv (über dein Google-Skript)':'Erst Gmail-Skript-URL und Geheimwort eintragen'}</div>
   <button class="secondary" id="syncShare" type="button">Anderes Gerät verbinden (Code/Link teilen)</button>
   <input id="syncCode" placeholder="Verbindungscode hier einfügen" autocomplete="off" style="margin-top:8px">
   <button class="secondary" id="syncJoin" type="button">Mit Code verbinden</button>
   <button class="secondary" id="syncNow" type="button">Jetzt abgleichen</button>`;
  anchor.before(box);
  document.getElementById('syncShare').onclick=async()=>{const c=code();if(!c){toast('Erst Gmail-Skript-URL und Geheimwort speichern');return}
    const link=location.origin+location.pathname+'#verbinden='+encodeURIComponent(c);
    const text='Merker verbinden:\n'+link+'\n\nOder Code in den Einstellungen einfügen:\n'+c;
    try{if(navigator.share){await navigator.share({title:'Merker verbinden',text});return}}catch(e){}
    try{await navigator.clipboard.writeText(text);toast('Link + Code kopiert – schick ihn dir aufs andere Gerät',4500)}catch(e){prompt('Kopiere diesen Code:',c)}};
  document.getElementById('syncJoin').onclick=()=>{const v=document.getElementById('syncCode').value;if(v)connectWith(v)};
  document.getElementById('syncNow').onclick=async()=>{status('gleiche ab …');await pull(true);await push()};
 }}

// Start: holen, dann regelmäßig beim Öffnen/Zurückkehren
pull(false);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)pull(false)});
setInterval(()=>{if(!document.hidden)pull(false)},60000);
})();
