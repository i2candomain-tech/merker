// Merker – Lebensbereiche, Chat mit Rückfragen, Aufgaben-Übersicht
(function(){
// ---------- Lebensbereiche (Standard neutral – eigene kommen aus dem Profil auf dem Gerät) ----------
const DEFAULT_AREAS={
  Beruf:{label:'Beruf & Weiterbildung',icon:'💼',color:'#60a5fa',subs:['Arbeit','Termine & Gespräche','Dokumentation','Weiterbildung']},
  Ehrenamt:{label:'Ehrenamt & Gemeinschaft',icon:'🤝',color:'#34d399',subs:['Organisation','Gruppenarbeit','Veranstaltungen']},
  Privat:{label:'Privat & Lebensführung',icon:'🏠',color:'#f472b6',subs:['Finanzen & Verträge','Wohnung & Haushalt','Gesundheit & Sport','Familie & Beziehungen','Freizeit']},
  Projekte:{label:'Projekte & Technik',icon:'🛠',color:'#fbbf24',subs:['Hardware','Software','Smart Home']}
};
const PALETTE2=['#60a5fa','#34d399','#f472b6','#fbbf24','#a78bfa','#fb923c','#22d3ee'];
const AREAS=(()=>{const a=store.get('areas',null);return a&&Object.keys(a).length?a:DEFAULT_AREAS})();
Object.keys(AREAS).forEach((k,i)=>{const v=AREAS[k];v.label=v.label||k;v.icon=v.icon||'•';v.color=v.color||PALETTE2[i%PALETTE2.length];v.subs=v.subs||[]});
window.AREAS=AREAS;
window.setAreas=function(a){store.set('areas',a);location.reload()};
const FALLBACK=AREAS.Privat?'Privat':Object.keys(AREAS)[0];
function areaOf(c){c=String(c||'').trim();if(!c)return '';if(AREAS[c])return c;const lc=c.toLowerCase();
  for(const [k,v] of Object.entries(AREAS))if(k.toLowerCase()===lc||v.label.toLowerCase()===lc)return k;
  for(const [k,v] of Object.entries(AREAS))if(v.label.toLowerCase().includes(lc)||lc.includes(k.toLowerCase())||v.subs.some(s=>s.toLowerCase()===lc))return k;
  const G={arbeit:'Beruf','persönlich':'Privat',persoenlich:'Privat'};if(G[lc]&&AREAS[G[lc]])return G[lc];return ''}
window.ensureCat=function(c){return areaOf(c)||FALLBACK};
CATS=Object.keys(AREAS);store.set('cats',CATS);
for(const [a,v] of Object.entries(AREAS))FIXED_COLOR[a]=v.color;
// Aufgaben mit unbekanntem Bereich zuordnen (ursprünglichen Bereich merken, falls er später wieder auftaucht)
{let ch=false;for(const t of tasks){if(AREAS[t.category]&&!t.origCat)continue;const a=areaOf(t.origCat||t.category);
  if(a){if(t.category!==a||t.origCat){t.category=a;delete t.origCat;ch=true}}else if(!t.origCat||t.category!==FALLBACK){t.origCat=t.origCat||t.category;t.category=FALLBACK;ch=true}}
 if(ch)save()}

const css=`
.nav{position:fixed;left:0;right:0;bottom:0;display:flex;background:var(--card);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom);z-index:5}
.nav button{flex:1;background:none;color:var(--muted);padding:10px 0 8px;font-size:12px;border-radius:0}
.nav button b{display:block;font-size:20px;font-weight:400}
.nav button.on{color:var(--accent)}
body.mode-chat .bar{bottom:calc(58px + env(safe-area-inset-bottom));padding-bottom:10px}
body.mode-list .bar{display:none}
.bar{align-items:center}
.bar textarea{min-height:46px;font-size:16px;line-height:1.35;padding:12px}
body{padding-bottom:calc(150px + env(safe-area-inset-bottom))}
#chat{display:none;flex-direction:column;gap:8px;padding-top:6px}
body.mode-chat #chat{display:flex}
body.mode-chat #tabs,body.mode-chat #list{display:none}
.msg{max-width:85%;padding:10px 12px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}
.msg.me{align-self:flex-end;background:var(--accent);color:#fff;border-bottom-right-radius:4px}
.msg.ai{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:4px}
.msg .acts{margin-top:8px;display:flex;flex-direction:column;gap:4px;font-size:13px}
.msg .act{background:var(--bg);border-radius:8px;padding:5px 8px}
.msg .undo{margin-top:6px;background:none;color:var(--accent);font-size:13px;padding:0}
.typing{color:var(--muted);font-size:14px;align-self:flex-start}
.imp{background:linear-gradient(135deg,rgba(248,113,113,.12),rgba(20,184,166,.08));border:1px solid var(--line);border-radius:16px;padding:4px 12px 8px;margin-top:8px}
.imp .cat-head{margin-top:10px}
.chat-clear{align-self:center;background:none;color:var(--muted);font-size:12px;padding:4px}
.sub{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:1px 7px;color:var(--muted)}
#btnSync.nogmail{display:none}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
$('btnSync').classList.toggle('nogmail',!cfg.gmailUrl);

const chatEl=document.createElement('div');chatEl.id='chat';document.getElementById('list').after(chatEl);
const nav=document.createElement('div');nav.className='nav';
nav.innerHTML='<button data-m="list"><b>📋</b>Aufgaben</button><button data-m="chat"><b>💬</b>Chat</button>';
document.body.appendChild(nav);
let mode=store.get('mode','chat');
function setMode(m){mode=m;store.set('mode',m);document.body.classList.toggle('mode-chat',m==='chat');document.body.classList.toggle('mode-list',m==='list');
  nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
  if(m==='chat'){renderChat();setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),50)}else render()}
window.setMode=setMode;
nav.onclick=e=>{const b=e.target.closest('button');if(b)setMode(b.dataset.m)};
$('input').placeholder='Nachricht an Merker…';$('input').rows=1;

// ---------- Aufgaben-Übersicht ----------
const baseRender=render;
window.render=function(){
  baseRender();
  const L=$('list');
  L.querySelectorAll('.cat-head').forEach(h=>{const tn=[...h.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
    const a=tn&&AREAS[tn.textContent.trim()];if(a)tn.textContent=a.icon+' '+a.label});
  L.querySelectorAll('.task[data-id]').forEach(el=>{const t=tasks.find(x=>x.id===el.dataset.id);const meta=el.querySelector('.t-meta');
    if(t&&meta&&(t.sub||t.type&&t.type!=='Aufgabe')){const s=document.createElement('span');s.className='sub';
      s.textContent=[t.type&&t.type!=='Aufgabe'?t.type:'',t.sub].filter(Boolean).join(' · ');meta.querySelector('.badge')?.after(s)}
    if(t&&meta&&t.until){const u=document.createElement('span');u.textContent='→ bis '+new Date(t.until+'T00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'});meta.appendChild(u)}});
  if(filter!=='Alle')return;
  const soon=new Date(Date.now()+2*864e5).toISOString().slice(0,10);
  const imp=tasks.filter(t=>!t.done&&!t.suggested&&(t.priority==='hoch'||(t.due&&t.due<=soon)))
    .sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
  if(!imp.length||L.querySelector('.empty'))return;
  const box=document.createElement('div');box.className='imp';
  box.innerHTML='<div class="cat-head">⭐ Wichtig &amp; bald fällig<span class="cnt">'+imp.length+'</span></div>'+
    imp.slice(0,6).map(t=>`<div class="task" data-id="${t.id}" style="--c:${catColor(t.category)}">
      <button class="check" data-act="toggle" aria-label="erledigt"></button>
      <div class="t-body"><div class="t-title">${t.priority==='hoch'?'❗ ':''}${esc(t.title)}</div>
      <div class="t-meta"><span class="badge" style="background:${catColor(t.category)}">${esc(t.category)}</span>${fmtDate(t)}${t.person?`<span>👤 ${esc(t.person)}</span>`:''}</div></div></div>`).join('');
  L.prepend(box);
};

// ---------- Chat ----------
let msgs=store.get('chat',[]);
const saveChat=()=>store.set('chat',msgs.slice(-40));
const prof=()=>store.get('profileData',{})||{};
const myName=()=>(prof().name||'').split(' ')[0];
function renderChat(){
  if(!msgs.length)msgs=[{role:'ai',text:'Was steht an? Termine, Fristen, Besorgungen – schreib oder sprich einfach. Wenn etwas unklar ist, frage ich nach.'}];
  chatEl.innerHTML=msgs.map((m,i)=>`<div class="msg ${m.role==='me'?'me':'ai'}">${esc(m.text)}${m.acts&&m.acts.length?`<div class="acts">${m.acts.map(a=>`<div class="act">${esc(a)}</div>`).join('')}</div>`:''}${m.undo?`<button class="undo" data-i="${i}">↩︎ Rückgängig</button>`:''}</div>`).join('')
    +(msgs.length>1?'<button class="chat-clear" id="chatClear">Chat leeren</button>':'');
  const c=$('chatClear');if(c)c.onclick=()=>{msgs=[];saveChat();renderChat()};
}
chatEl.addEventListener('click',e=>{const b=e.target.closest('.undo');if(!b)return;const m=msgs[+b.dataset.i];
  if(m&&m.undo){const u=JSON.parse(m.undo);tasks=u.tasks||u;if(u.profile&&window.setProfileData)window.setProfileData(u.profile);
    m.undo=null;m.acts=(m.acts||[]).concat('↩︎ rückgängig gemacht');save();saveChat();renderChat();toast('Rückgängig gemacht')}});

async function llm(prompt){
  if(!cfg.key){openSettings();throw new Error('Bitte zuerst den KI-Schlüssel eintragen (⚙️)')}
  if(cfg.key.startsWith('gsk_')){
    const H={'Content-Type':'application/json','Authorization':'Bearer '+cfg.key};
    const pick=async()=>{const m=await (await fetch('https://api.groq.com/openai/v1/models',{headers:H})).json();
      const ids=(m.data||[]).filter(x=>x.active!==false).map(x=>x.id).filter(id=>!/whisper|tts|guard|vision|embed|orpheus|compound/i.test(id));
      // Chat bevorzugt Modelle mit höherem Gratis-Limit; Gmail-Skript nutzt ein anderes Modell -> getrennte Limits
      for(const p of [/llama-4-scout/,/llama-4-maverick/,/llama-3\.3-70b/,/qwen/,/gpt-oss-120b/,/gpt-oss/,/llama/]){const f=ids.find(id=>p.test(id));if(f)return f}return ids[0]};
    let model=(cfg.model||'').trim();if(!model||model.startsWith('gemini'))model=localStorage.getItem('groqModel2')||await pick();
    const call=md=>fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:H,
      body:JSON.stringify({model:md,messages:[{role:'user',content:prompt}],response_format:{type:'json_object'},temperature:0.2})});
    let r=await call(model),j=await r.json();
    if(r.status===429){const s=parseFloat((j.error?.message||'').match(/try again in ([\d.]+)s/)?.[1]||'0');
      if(s>0&&s<=40){toast('Kurz warten (Gratis-Limit) … '+Math.ceil(s)+' Sek.',Math.ceil(s)*1000);await new Promise(x=>setTimeout(x,s*1000+500));r=await call(model);j=await r.json()}}
    if(!r.ok&&/model/i.test(j.error?.message||'')){model=await pick();r=await call(model);j=await r.json()}
    if(!r.ok)throw new Error(j.error?.message||('Fehler '+r.status));
    try{localStorage.setItem('groqModel2',model)}catch(e){}
    return JSON.parse(j.choices?.[0]?.message?.content||'{}');
  }
  const model=(cfg.model||'gemini-2.5-flash').trim();
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':cfg.key},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:0.2}})});
  const j=await r.json();if(!r.ok)throw new Error(j.error?.message||('Fehler '+r.status));
  return JSON.parse((j.candidates?.[0]?.content?.parts?.map(p=>p.text).join('')||'{}').replace(/^```json|```$/g,''));
}
window.merkerLLM=llm;

const EXTRA=['sub','type','tags','repeat','until'];
function extras(t,a){for(const k of EXTRA)if(a[k]!==undefined&&a[k]!=='')t[k]=a[k]}
function applyActions(acts){
  const done=[];
  for(const a of acts||[]){
    const t=a.id&&tasks.find(x=>x.id===a.id);
    if(a.op==='update'&&t){
      const ch=Object.fromEntries(Object.entries(a).filter(([k,v])=>!['op','id'].includes(k)&&v!==''&&v!=null));
      const nn=normalize({...t,...ch},t.source);
      Object.assign(t,{title:nn.title,category:nn.category,due:nn.due,time:nn.time,person:nn.person,notes:nn.notes,priority:nn.priority});extras(t,a);
      done.push('✏️ '+t.title)}
    else if(a.op==='delete'&&t){tasks=tasks.filter(x=>x!==t);done.push('🗑 '+t.title)}
    else if(a.op==='done'&&t){t.done=true;t.doneAt=Date.now();done.push('✅ '+t.title)}
    else if(a.op==='add'||!a.op){const n=normalize(a,'');extras(n,a);tasks.push(n);
      done.push('➕ '+n.title+' · '+n.category+(n.sub?' › '+n.sub:'')+(n.due?' · '+new Date(n.due+'T00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'})+(n.time?' '+n.time:''):'')+(n.until?' bis '+new Date(n.until+'T00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}):'')+(n.repeat?' · 🔁 '+n.repeat:'')+(n.priority==='hoch'?' ❗':''))}
  }
  return done;
}

// Spracherkennung stoppen, sobald getippt/korrigiert oder gesendet wird – sonst überschreibt sie die Korrektur
const stopRec=()=>{try{if(recOn&&rec){rec.onresult=null;rec.abort()}}catch(e){}};
$('input').addEventListener('input',e=>{if(e.isTrusted)stopRec()});
$('input').addEventListener('focus',stopRec);
async function chatSend(){
  stopRec();
  const text=$('input').value.trim();if(!text)return;
  if(mode!=='chat')setMode('chat');
  msgs.push({role:'me',text});$('input').value='';autoGrow();saveChat();renderChat();
  const typing=document.createElement('div');typing.className='typing';typing.textContent='Merker denkt nach…';chatEl.appendChild(typing);
  window.scrollTo(0,document.body.scrollHeight);
  $('send').disabled=true;
  try{
    const now=new Date();
    // nur das Nötigste mitschicken (spart Tokens): max. 30 offene Einträge, kurze Felder
    const open=tasks.filter(t=>!t.done&&!t.suggested).slice(-30).map(t=>{const o={id:t.id,title:t.title,c:t.category};if(t.due)o.due=t.due;if(t.until)o.until=t.until;if(t.time)o.time=t.time;if(t.person)o.person=t.person;return o});
    const hist=msgs.slice(-6).map(m=>(m.role==='me'?'Nutzer: ':'Merker: ')+m.text+(m.acts&&m.acts.length?' ['+m.acts.join('; ')+']':'')).join('\n');
    const areas=Object.entries(AREAS).map(([k,v])=>`- "${k}" = ${v.label}; Unterkategorien: ${v.subs.join(', ')}`).join('\n');
    const prompt=`Du bist "Merker", der persönliche Organisations- und Erinnerungsassistent des Nutzers in seiner Aufgaben-App.
Heute ist ${now.toLocaleDateString('de-DE',{weekday:'long',year:'numeric',month:'2-digit',day:'2-digit'})} (ISO ${todayISO()}), ${now.toTimeString().slice(0,5)} Uhr, Europe/Berlin.

=== WISSENSPROFIL DES NUTZERS (Hintergrundwissen, keine Aufgaben) ===
${cfg.profile||DEFAULT_PROFILE}
=== ENDE PROFIL ===

LEBENSBEREICHE (category MUSS genau einer dieser Schlüssel sein):
${areas}
Neue Unterkategorie nur, wenn wirklich keine passt (kurz). Ein Eintrag hat genau EINEN Lebensbereich; Bezüge zu anderen Bereichen kommen in "tags" (z. B. ein Technikprojekt für den Verein: category = Projektbereich, tags = [anderer Bereich]).
Typ ("type"): "Termin" (findet zu bestimmter Zeit statt), "Aufgabe" (muss erledigt werden), "Erinnerung" (Hinweis zu einem Zeitpunkt), "Notiz" (Info ohne Erledigung), "Idee" (unverbindlich), "Ziel" (langfristig).

OFFENE EINTRÄGE (JSON):
${JSON.stringify(open)}

BISHERIGER CHAT:
${hist}

SO ARBEITEST DU:
- Lies die letzte Nachricht im Zusammenhang mit dem Chat und dem Profil. Ordne selbst zu, ohne dass der Nutzer Kategorien nennen muss.
- Frage nur nach, wenn eine wichtige Info wirklich fehlt: Datum/Uhrzeit bei Terminen, mehrdeutige Person (prüfe die Personen im Profil – rate nicht, welcher "Alex" gemeint ist), Bereich wirklich unklar. EINE kurze Frage; diesen Eintrag dann noch NICHT anlegen. Klare Teile sofort anlegen.
- Sagt der Nutzer "egal", "kein Datum", "weiß nicht" -> ohne diese Angabe anlegen.
- Korrekturen ("nein", "nicht X sondern Y", "ich meinte") -> bestehenden Eintrag per "update" (mit id) ändern, falsche per "delete". NIE Duplikate.
- "erledigt" -> "done"; "streich/lösch" -> "delete". Fragen zur Liste ("was steht morgen an?") aus den Einträgen beantworten, ohne Aktionen.
- ZEITRÄUME ("ganze nächste Woche", "Montag bis Freitag", "vom 3. bis 7.") sind IMMER GENAU EIN Eintrag: due = erster Tag, until = letzter Tag (YYYY-MM-DD). NIEMALS pro Tag einen eigenen Eintrag anlegen. "Ganze Woche" bei Arbeit = Montag bis Freitag.
- Wiederkehrendes ("jeden Sonntag") -> repeat z. B. "wöchentlich So", due = nächstes Vorkommen.
- Einsatzorte mit "nächstem Einsatz" im Profil: Aufgaben für diesen Ort sind erst dann fällig (due = dieser Tag), Priorität normal.
- priority "hoch", wenn andere auf den Nutzer angewiesen sind oder ein Versäumnis Folgen hat (Fristen, Zahlungen, Absagen, andere informieren, Vorträge/Leitungsaufgaben vorbereiten, Externe, "dringend/wichtig"). Routine = "normal".
- Plane mit Rücksicht auf feste Termine und Verpflichtungen aus dem Profil. Weise kurz auf Überschneidungen hin.
- Neue langfristige Infos über den Nutzer (nicht einmalige Aufgaben!), z. B. neue Rolle oder geänderte Gewohnheit -> in "profile_updates" eintragen. PERSONEN kommen NIE in profile_updates, sondern einzeln in "people": für JEDE genannte Person ein eigener Eintrag mit name (nur der Name), role (kurz, z. B. "Teamleitung", "Kollegin", "Klient") und area; Zusatzinfos kurz in note. Bei 5 Personen also 5 Einträge. Widerspricht etwas dem Profil, frage nach statt zu überschreiben.
- Klientendaten sparsam: nur Vorname/Kürzel in Titeln, keine Diagnosen oder Fallinfos.
- Ton: so wie im Profil gewünscht (du, direkt, präzise, ohne Floskeln). Antworte in 1–3 Sätzen. KEINE Begrüßung, keine Anrede mit Namen am Anfang – komm direkt zur Sache.

Antworte NUR mit JSON:
{"reply":"…","actions":[{"op":"add|update|delete|done","id":"nur bei update/delete/done","title":"","category":"${Object.keys(AREAS).join('|')}","sub":"","type":"Termin|Aufgabe|Erinnerung|Notiz|Idee|Ziel","tags":[],"due":"YYYY-MM-DD oder leer","until":"YYYY-MM-DD nur bei Zeitraum, sonst leer","time":"HH:MM oder leer","repeat":"","person":"","notes":"","priority":"normal|hoch"}],"profile_updates":[{"area":"general|routines|goals|${Object.keys(AREAS).join('|')}","text":"kurzer Satz"}],"people":[{"name":"","role":"","area":"","note":""}]}`;
    const out=await llm(prompt);
    const backup=JSON.stringify({tasks,profile:store.get('profileData',null)});
    const done=applyActions(out.actions);
    for(const u of out.profile_updates||[]){if(u&&u.text&&u.area!=='people'&&window.addProfileNote){window.addProfileNote(u.area,u.text);done.push('🧠 Gemerkt: '+u.text)}}
    for(const p of out.people||[]){if(p&&p.name&&p.name.length<60&&window.addPerson){window.addPerson(p);done.push('👤 '+p.name+(p.role?' – '+p.role:''))}}
    save();
    msgs.push({role:'ai',text:out.reply||(done.length?'Erledigt.':'Okay.'),acts:done,undo:done.length?backup:null});
  }catch(e){msgs.push({role:'ai',text:'⚠️ '+e.message})}
  finally{$('send').disabled=false;saveChat();renderChat();window.scrollTo(0,document.body.scrollHeight)}
}
$('send').onclick=chatSend;
$('send').textContent='➤';
setMode(mode);
})();
