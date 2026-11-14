// Merker – "Ich"-Seite: Überblick + Wissensprofil + Kalender (alle Daten nur lokal auf dem Gerät)
(function(){
const css=`
#me{display:none;padding-top:4px}
body.mode-me #me{display:block}
body.mode-me #tabs,body.mode-me #list,body.mode-me #chat,body.mode-me .bar{display:none!important}
#me h2{font-size:17px;margin:22px 0 8px}
#me .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px}
#me .row2{display:flex;gap:8px}#me .row2>*{flex:1;min-width:0}
#me textarea{width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;font:inherit;font-size:15px;background:var(--bg);color:var(--text);resize:vertical}
#me select{padding:9px}
#me .item{border:1px solid var(--line);border-radius:12px;padding:10px;margin-bottom:8px;position:relative}
#me .del{position:absolute;top:6px;right:6px;background:none;color:var(--muted);font-size:16px;padding:4px 8px}
#me .add{background:var(--bg);color:var(--accent);padding:8px 12px;font-size:14px;margin-top:4px}
#me .next{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}
#me .when{min-width:64px;text-align:center;font-size:12px;color:var(--muted)}
#me .when b{display:block;font-size:18px;color:var(--text)}
#me .areas{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#me .area{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--c);border-radius:14px;padding:10px 12px;text-align:left;color:var(--text)}
#me .area b{display:block;font-size:22px}
#me .area span{font-size:12px;color:var(--muted)}
#me details{background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:8px}
#me summary{padding:13px 12px;font-weight:600;cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px}
#me summary::-webkit-details-marker{display:none}
#me summary .st{margin-left:auto;font-size:12px;font-weight:400;color:var(--muted)}
#me details>.in{padding:0 12px 12px}
#me .hello{font-size:22px;font-weight:700;margin:6px 0 2px}
#me .sec{font-size:13px;color:var(--muted);margin:10px 0 4px;text-transform:uppercase;letter-spacing:.04em}
.sp-hide{display:none!important}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const sp=$('sProfile');if(sp){sp.classList.add('sp-hide');sp.previousElementSibling?.classList.add('sp-hide')}
const AR=window.AREAS||{};

const me=document.createElement('div');me.id='me';$('list').after(me);
const nav=document.querySelector('.nav');
const btn=document.createElement('button');btn.dataset.m='me';btn.innerHTML='<b>👤</b>Ich';nav.prepend(btn);
function showMe(){document.body.classList.remove('mode-chat','mode-list');document.body.classList.add('mode-me');
  nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===btn));store.set('page','me');renderMe();window.scrollTo(0,0)}
btn.addEventListener('click',e=>{e.stopPropagation();showMe()});
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b!==btn){document.body.classList.remove('mode-me');store.set('page',b.dataset.m)}},true);
function goArea(a){filter=a;document.body.classList.remove('mode-me');store.set('page','list');setMode('list')}

// ---------- Profil ----------
const BASE=[['general','👤','Allgemein & Werte','Wohnort, Lebenssituation, Werte …']];
const EXTRA=[['routines','🔁','Feste Termine & Gewohnheiten','z. B. Mo 9:00 Teamsitzung · Sa Sport'],
  ['goals','🎯','Ziele & Prioritäten','z. B. bis Juni Führerschein'],
  ['style','💬','So soll Merker mit dir reden','z. B. du, direkt, kurz']];
const P0={name:'',greeting:'',general:'',routines:'',goals:'',style:'',a:{},places:[],people:[]};
let P=Object.assign({},P0,store.get('profileData',{}));P.a=P.a||{};
// ältere Felder übernehmen
const OLD={beruf:'Beruf',privat:'Privat',projekte:'Projekte',personal:'Privat'};
for(const [o,k] of Object.entries(OLD))if(P[o]){P.a[k]=[P.a[k],P[o]].filter(Boolean).join('\n');delete P[o]}
if(P.job||P.employer){P.a.Beruf=[P.a.Beruf,[P.job,P.employer].filter(Boolean).join(' ')].filter(Boolean).join('\n');delete P.job;delete P.employer}
if(P.extra){P.general=[P.general,P.extra].filter(Boolean).join('\n');delete P.extra}
P.people=(P.people||[]).map(x=>({name:x.name||'',role:x.role||'',area:x.area||'',note:x.note||''}));P.places=P.places||[];
const fmt=d=>d?new Date(d+'T00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}):'';
function profileText(){
  const L=[];
  if(P.name)L.push('Name: '+P.name);
  if(P.general.trim())L.push('## Allgemein & Werte\n'+P.general.trim());
  for(const [k,v] of Object.entries(AR))if((P.a[k]||'').trim())L.push('## '+v.label+' (Bereich "'+k+'")\n'+P.a[k].trim());
  for(const [k,,label] of EXTRA)if((P[k]||'').trim())L.push('## '+label+'\n'+P[k].trim());
  const pl=P.places.filter(x=>x.name);
  if(pl.length)L.push('## Einsatzorte\n'+pl.map(p=>'- '+p.name+': Rolle '+(p.role||'–')+(p.next?'; nächster Einsatz '+fmt(p.next)+' (ISO '+p.next+') – Aufgaben für diesen Ort erst dann fällig, Priorität normal':'')+(p.note?'; '+p.note:'')).join('\n'));
  const pp=P.people.filter(x=>x.name);
  if(pp.length)L.push('## Personen (Kontakte, keine Kategorie)\n'+pp.map(x=>'- '+x.name+': '+(x.role||'?')+(x.area?' ['+x.area+']':'')+(x.note?' – '+x.note:'')).join('\n'));
  return L.join('\n\n')||DEFAULT_PROFILE;
}
function saveP(){store.set('profileData',P);cfg.profile=profileText();store.set('cfg',cfg)}
window.addProfileNote=function(area,text){
  if(area==='people'){const m=String(text).match(/^([^:–-]+)[:–-]\s*(.*)$/);P.people.push({name:m?m[1].trim():text,role:m?m[2].trim():'',area:'',note:''})}
  else if(AR[area]){P.a[area]=((P.a[area]||'').trim()?P.a[area].trim()+'\n':'')+'• '+text}
  else{const k=['general','routines','goals','style'].includes(area)?area:'general';P[k]=((P[k]||'').trim()?P[k].trim()+'\n':'')+'• '+text}
  saveP();renderMe()};
window.addPerson=function(p){const n=String(p.name).trim();const ex=P.people.find(x=>x.name.toLowerCase()===n.toLowerCase());
  if(ex){if(p.role)ex.role=p.role;if(p.area)ex.area=p.area;if(p.note)ex.note=p.note}
  else P.people.push({name:n,role:p.role||'',area:p.area||'',note:p.note||''});
  saveP();renderMe()};
window.setProfileData=function(p){if(p){P=Object.assign({},P0,p);P.a=P.a||{};saveP();renderMe()}};
saveP();

// ---------- Kalender ----------
const ics1=t=>{const d=t.due.replace(/-/g,'');const lines=['BEGIN:VEVENT','UID:'+t.id+'@merker','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z'];
  if(t.time){const [h,m]=t.time.split(':').map(Number);const e=new Date(2000,0,1,h+1,m);
    lines.push('DTSTART;TZID=Europe/Berlin:'+d+'T'+t.time.replace(':','')+'00','DTEND;TZID=Europe/Berlin:'+d+'T'+String(e.getHours()).padStart(2,'0')+String(e.getMinutes()).padStart(2,'0')+'00',
      'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:Erinnerung','END:VALARM')}
  else{const n=new Date((t.until&&t.until>t.due?t.until:t.due)+'T12:00');n.setDate(n.getDate()+1);lines.push('DTSTART;VALUE=DATE:'+d,'DTEND;VALUE=DATE:'+n.toISOString().slice(0,10).replace(/-/g,''),
      'BEGIN:VALARM','TRIGGER:PT8H','ACTION:DISPLAY','DESCRIPTION:Erinnerung','END:VALARM')}
  lines.push('BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:Erinnerung','END:VALARM',
    'SUMMARY:'+(t.priority==='hoch'?'❗ ':'')+t.title.replace(/[,;\n]/g,' '),'DESCRIPTION:'+[(AR[t.category]?AR[t.category].label:t.category),t.sub,t.person,t.notes].filter(Boolean).join(' - ').replace(/[,;\n]/g,' '),'END:VEVENT');
  return lines.join('\r\n')};
const sig=t=>[t.title,t.due,t.time,t.until||''].join('|');
function pendingCal(){const sent=store.get('calSent',{});return tasks.filter(t=>!t.done&&!t.suggested&&t.due&&t.due>=todayISO()&&t.type!=='Notiz'&&t.type!=='Idee'&&sent[t.id]!==sig(t))}
window.exportCalendar=function(list){
  list=list||pendingCal();if(!list.length){toast('Keine neuen Termine für den Kalender');return}
  const body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Merker//DE','CALSCALE:GREGORIAN',...list.map(ics1),'END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'text/calendar'}));a.download='merker-termine.ics';a.click();
  const sent=store.get('calSent',{});list.forEach(t=>sent[t.id]=sig(t));store.set('calSent',sent);
  toast(list.length+' Termin(e) an den Kalender übergeben');renderMe()};

// ---------- Import ----------
function importJSON(o){
  if(o.areas&&typeof o.areas==='object'){const ar={};for(const [k,v] of Object.entries(o.areas)){ar[k]={label:v.label||k,icon:v.icon||'',color:v.color||'',subs:v.subs||[]};if(v.text)P.a[k]=Array.isArray(v.text)?v.text.join('\n'):v.text}
    store.set('areas',ar)}
  for(const k of ['name','greeting','general','routines','goals','style'])if(o[k])P[k]=Array.isArray(o[k])?o[k].join('\n'):String(o[k]);
  for(const p of o.places||[])if(p&&p.name&&!P.places.some(x=>x.name===p.name))P.places.push({name:p.name,role:p.role||'',next:p.next||'',note:p.note||''});
  for(const p of o.people||[])if(p&&p.name&&!P.people.some(x=>x.name===p.name))P.people.push({name:p.name,role:p.role||'',area:p.area||'',note:p.note||''});
  saveP();
  if(o.areas)location.reload();
}
async function importText(text){
  const keys=Object.entries(AR).map(([k,v])=>`"${k}" (${v.label})`).join(', ');
  const prompt=`Teile den folgenden Profiltext auf. Fasse knapp in Stichpunkten ("• …") zusammen, behalte aber ALLE konkreten Fakten (Namen, Zeiten, Wochentage, Beträge, Fristen, Rollen). Lass Wiederholungen und Anweisungen zur App-Entwicklung weg. Max. ca. 600 Zeichen pro Feld.
Antworte NUR mit JSON: {"name":"","general":"","routines":"","goals":"","style":"","areas":{${Object.keys(AR).map(k=>`"${k}":{"text":""}`).join(',')}},"places":[{"name":"","role":"","note":""}],"people":[{"name":"","role":"","area":"","note":""}]}
Bereiche: ${keys}. routines = feste/wiederkehrende Termine mit Wochentag+Uhrzeit. goals = Ziele mit Fristen. style = wie die KI kommunizieren soll.

TEXT:
"""${text}"""`;
  const out=await window.merkerLLM(prompt);
  if(out.areas)for(const [k,v] of Object.entries(out.areas)){if(AR[k]&&v&&v.text)P.a[k]=Array.isArray(v.text)?v.text.join('\n'):v.text}
  delete out.areas;importJSON(out);
}

// ---------- Seite ----------
const filled=v=>(v||'').trim()?'✓ ausgefüllt':'leer';
function areasToText(){return Object.entries(AR).map(([k,v])=>`${k} | ${v.label} | ${v.icon} | ${v.subs.join(', ')}`).join('\n')}
function textToAreas(t){const o={};t.split('\n').map(l=>l.trim()).filter(Boolean).forEach(l=>{const [k,label,icon,subs]=l.split('|').map(s=>(s||'').trim());
  if(k)o[k.replace(/\s+/g,'')]={label:label||k,icon:icon||'',color:(AR[k]||{}).color||'',subs:(subs||'').split(',').map(s=>s.trim()).filter(Boolean)}});return o}
function renderMe(){
  if(!document.body.classList.contains('mode-me'))return;
  const openD=[...me.querySelectorAll('details[open]')].map(d=>d.dataset.k);
  const td=todayISO(),week=new Date(Date.now()+8*864e5).toISOString().slice(0,10);
  const open=tasks.filter(t=>!t.done&&!t.suggested);
  const over=open.filter(t=>t.due&&t.due<td),today=open.filter(t=>t.due===td),
    next=open.filter(t=>t.due&&t.due>td&&t.due<=week).sort((a,b)=>(a.due+(a.time||'')).localeCompare(b.due+(b.time||''))).slice(0,6);
  const pend=pendingCal().length;
  const row=t=>{const d=new Date(t.due+'T00:00');return `<div class="next"><div class="when"${t.due<td?' style="color:var(--danger)"':''}><b>${d.getDate()}.${d.getMonth()+1}.</b>${t.due===td?'Heute':d.toLocaleDateString('de-DE',{weekday:'short'})}${t.time?' '+t.time:''}</div>
    <div style="flex:1;min-width:0"><div class="t-title">${t.priority==='hoch'?'❗ ':''}${esc(t.title)}</div><div class="t-meta"><span class="badge" style="background:${catColor(t.category)}">${esc(t.category)}</span>${t.sub?'<span class="sub">'+esc(t.sub)+'</span>':''}${t.person?'👤 '+esc(t.person):''}</div></div></div>`};
  const hr=new Date().getHours();
  const ta=(k,val,rows,ph,attr='data-k')=>`<textarea ${attr}="${k}" rows="${rows}" placeholder="${ph}">${esc(val||'')}</textarea>`;
  me.innerHTML=`
  <div class="hello">${hr<11?'Guten Morgen':hr<18?'Hallo':'Guten Abend'}${P.name?', '+esc(P.name.split(' ')[0]):''} 👋</div>
  <div class="hint">${today.length?today.length+' Eintrag/Einträge heute':'Heute nichts Festes'}${over.length?' · <span style="color:var(--danger)">'+over.length+' überfällig</span>':''}</div>

  <h2>📅 Heute & demnächst</h2>
  <div class="card">
    ${over.length?'<div class="sec" style="color:var(--danger)">Überfällig</div>'+over.slice(0,5).map(row).join(''):''}
    ${today.length?'<div class="sec">Heute</div>'+today.map(row).join(''):''}
    ${next.length?'<div class="sec">Nächste 7 Tage</div>'+next.map(row).join(''):''}
    ${!over.length&&!today.length&&!next.length?'<div class="hint">In den nächsten 7 Tagen steht nichts an.</div>':''}
    <button class="primary" id="calBtn">📲 ${pend?pend+' neue Termin'+(pend>1?'e':'')+' in iPhone-Kalender':'Kalender ist aktuell'}</button>
    <div class="hint">Übernimmt neue/geänderte Termine auf einmal – mit Erinnerung am Vortag und kurz vorher.</div>
  </div>

  <h2>🧭 Lebensbereiche</h2>
  <div class="areas">${Object.entries(AR).map(([k,a])=>{const n=open.filter(t=>t.category===k).length;
    return `<button class="area" data-area="${k}" style="--c:${a.color}"><b>${a.icon} ${n}</b><span>${esc(a.label)}</span></button>`}).join('')}</div>

  <h2>🧠 Mein Profil <span class="hint" style="font-weight:400">– nur auf diesem Gerät gespeichert</span></h2>
  <details data-k="import"><summary>📥 Profil importieren<span class="st">Text oder Datei</span></summary><div class="in">
    <textarea id="impText" rows="6" placeholder="Profil-Datei (beginnt mit {) oder freien Text hier einfügen …"></textarea>
    <button class="primary" id="impBtn">Übernehmen</button>
    <div class="hint">Profil-Datei (JSON) wird direkt übernommen – nichts verlässt das Gerät. Freier Text wird einmal von der KI (Groq) in die Bereiche verteilt.</div>
  </div></details>
  <div class="card"><label>Name</label><input data-k="name" value="${esc(P.name)}" placeholder="Vorname Nachname"></div>
  ${BASE.map(([k,ic,label,ph])=>`<details data-k="${k}"><summary>${ic} ${label}<span class="st">${filled(P[k])}</span></summary><div class="in">${ta(k,P[k],6,ph)}</div></details>`).join('')}
  ${Object.entries(AR).map(([k,v])=>`<details data-k="a-${k}"><summary>${v.icon} ${esc(v.label)}<span class="st">${filled(P.a[k])}</span></summary><div class="in">
    ${ta(k,P.a[k],7,'Rollen, Aufgaben, Zuständigkeiten, wichtige Infos …','data-a')}
    ${k===Object.keys(AR)[0]?`<div class="sec">Einsatzorte</div><div class="hint" style="margin-bottom:6px">Mit „nächstem Einsatz“ plant Merker Aufgaben für den Ort auf diesen Tag.</div>
      ${P.places.map((p,i)=>`<div class="item" data-list="places" data-i="${i}"><button class="del" data-del="places" data-i="${i}">✕</button>
      <label>Ort / Einrichtung</label><input data-f="name" value="${esc(p.name)}">
      <div class="row2"><div><label>Meine Rolle</label><input data-f="role" value="${esc(p.role)}" placeholder="z. B. Aushilfe"></div>
      <div><label>Nächster Einsatz</label><input data-f="next" type="date" value="${esc(p.next)}"></div></div>
      <label>Notiz</label><input data-f="note" value="${esc(p.note)}"></div>`).join('')}
      <button class="add" data-add="places">+ Einsatzort</button>`:''}
  </div></details>`).join('')}
  ${EXTRA.map(([k,ic,label,ph])=>`<details data-k="${k}"><summary>${ic} ${label}<span class="st">${filled(P[k])}</span></summary><div class="in">${ta(k,P[k],4,ph)}</div></details>`).join('')}
  <details data-k="people"><summary>👥 Personen<span class="st">${P.people.filter(x=>x.name).length} Kontakte</span></summary><div class="in">
    <div class="hint" style="margin-bottom:6px">Damit Merker weiß, wer wer ist. Vertrauliche Kontakte am besten nur mit Vornamen/Kürzel.</div>
    ${P.people.map((p,i)=>`<div class="item" data-list="people" data-i="${i}"><button class="del" data-del="people" data-i="${i}">✕</button>
      <div class="row2"><div><label>Name</label><input data-f="name" value="${esc(p.name)}"></div>
      <div><label>Wer ist das?</label><input data-f="role" value="${esc(p.role)}" placeholder="Kollege, Freundin …"></div></div>
      <div class="row2"><div><label>Bereich</label><select data-f="area"><option value="">–</option>${Object.keys(AR).map(a=>`<option${p.area===a?' selected':''}>${a}</option>`).join('')}</select></div>
      <div><label>Notiz</label><input data-f="note" value="${esc(p.note)}"></div></div></div>`).join('')}
    <button class="add" data-add="people">+ Person</button>
  </div></details>
  <details data-k="areas"><summary>⚙️ Bereiche & Unterkategorien<span class="st">${Object.keys(AR).length} Bereiche</span></summary><div class="in">
    <div class="hint" style="margin-bottom:6px">Eine Zeile pro Bereich: Kürzel | Name | Symbol | Unterkategorien (mit Komma)</div>
    <textarea id="areasText" rows="6">${esc(areasToText())}</textarea>
    <button class="primary" id="areasBtn">Bereiche speichern</button>
  </div></details>
  <div class="hint" style="text-align:center;margin:12px 0 24px">Alles wird automatisch gespeichert ✓ · Merker merkt sich im Chat auch neue Infos über dich.</div>`;
  openD.forEach(k=>{const d=me.querySelector(`details[data-k="${k}"]`);if(d)d.open=true});
  $('calBtn').onclick=()=>exportCalendar();
  $('areasBtn').onclick=()=>{const a=textToAreas($('areasText').value);if(!Object.keys(a).length){toast('Mindestens ein Bereich nötig');return}window.setAreas(a)};
  $('impBtn').onclick=async()=>{const t=$('impText').value.trim();if(!t){toast('Bitte zuerst etwas einfügen');return}
    const b=$('impBtn');
    if(t.startsWith('{')){try{importJSON(JSON.parse(t));toast('Profil übernommen ✓');renderMe()}catch(e){toast('Datei fehlerhaft: '+e.message,6000)}return}
    if(!confirm('Text an die KI schicken und Profilfelder ersetzen?'))return;
    b.disabled=true;b.textContent='KI teilt auf … (ca. 10 Sek.)';
    try{await importText(t);toast('Profil übernommen ✓');renderMe()}
    catch(e){toast('Fehler: '+e.message,6000);b.disabled=false;b.textContent='Übernehmen'}};
}
me.addEventListener('input',e=>{const el=e.target;
  if(el.id==='impText'||el.id==='areasText')return;
  if(el.dataset.k)P[el.dataset.k]=el.value;
  else if(el.dataset.a)P.a[el.dataset.a]=el.value;
  else if(el.dataset.f){const it=el.closest('.item');P[it.dataset.list][+it.dataset.i][el.dataset.f]=el.value}
  else return;
  saveP()});
me.addEventListener('change',e=>{if(e.target.tagName==='SELECT'&&e.target.dataset.f){const it=e.target.closest('.item');P[it.dataset.list][+it.dataset.i][e.target.dataset.f]=e.target.value;saveP()}});
me.addEventListener('click',e=>{const a=e.target.closest('[data-add]'),d=e.target.closest('[data-del]'),ar=e.target.closest('[data-area]');
  if(a){P[a.dataset.add].push({name:'',role:'',next:'',note:'',area:''});saveP();renderMe()}
  if(d&&confirm('Eintrag entfernen?')){P[d.dataset.del].splice(+d.dataset.i,1);saveP();renderMe()}
  if(ar)goArea(ar.dataset.area)});

setInterval(()=>{const n=pendingCal().length;const h='<b>👤</b>Ich'+(n?' <span style="background:var(--danger);color:#fff;border-radius:999px;padding:0 6px;font-size:11px">'+n+'</span>':'');if(btn.innerHTML!==h)btn.innerHTML=h},2000);

if(store.get('page','me')==='me')showMe();
})();
