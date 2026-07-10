/* ============== STATE ============== */
const LS_KEY = "sovranita_tracker_v1";
let state = {
  checked: {},
  profile: null,
  onlyRec: false,
  collapsed: {}
};
try{
  const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  state = Object.assign(state, saved);
}catch(e){}

function save(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/* ============== RENDER ============== */
const main = document.getElementById('main');
const toc = document.getElementById('toc');

function totalItems(){ return DATA.reduce((s,c)=>s+c.items.length,0); }
function doneItems(){ return Object.values(state.checked).filter(Boolean).length; }

function render(){
  main.innerHTML = "";
  toc.innerHTML = "";

  const genLink = document.createElement('a');
  genLink.href = "#generatori";
  genLink.innerHTML = `<span>🔧 Generatori</span>`;
  genLink.addEventListener('click', ()=>{ closeDrawer(); });
  toc.appendChild(genLink);
  const sep = document.createElement('div');
  sep.style.cssText = "height:1px;background:var(--border);margin:8px 4px 10px;";
  toc.appendChild(sep);

  DATA.forEach(cat=>{
    const catDone = cat.items.filter(i=>state.checked[i.id]).length;
    const catTotal = cat.items.length;

    // TOC entry
    const a = document.createElement('a');
    a.href = "#cat-"+cat.id;
    a.innerHTML = `<span>${cat.icon} ${cat.title}</span><span class="cnt">${catDone}/${catTotal}</span>`;
    a.addEventListener('click', ()=>{ closeDrawer(); });
    toc.appendChild(a);

    // Category block
    const el = document.createElement('section');
    el.className = "cat" + (state.collapsed[cat.id] === false || state.collapsed[cat.id] === undefined ? "" : "");
    if(state.collapsed[cat.id] !== true) el.classList.add('open');
    el.id = "cat-"+cat.id;

    el.innerHTML = `
      <div class="cat-head">
        <div class="ic">${cat.icon}</div>
        <div class="ti">
          <h2>${cat.title}</h2>
        </div>
        <div class="stat">${catDone}/${catTotal}</div>
        <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </div>
      <div class="catbar"><i style="width:${catTotal? (catDone/catTotal*100):0}%"></i></div>
      <div class="cat-body">
        ${cat.intro? `<p class="cat-intro">${cat.intro}</p>`:""}
        <div class="items"></div>
      </div>
    `;
    const itemsWrap = el.querySelector('.items');
    cat.items.forEach(it=>{
      const done = !!state.checked[it.id];
      const recommended = !state.profile || it.lvl.includes(state.profile);
      const card = document.createElement('div');
      card.className = "item" + (done? " done":"") + (!recommended? " not-recommended":"");
      card.dataset.name = (it.name+" "+it.desc+" "+(it.tag||"")).toLowerCase();
      card.dataset.id = it.id;
      card.innerHTML = `
        <div class="item-head">
          <button class="chk" aria-label="Segna come completato">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#04120b" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
          <div class="item-body">
            <div class="item-title-row">
              <span class="item-name">${it.name}</span>
              ${it.flag? `<span class="flag">${it.flag}</span>`:""}
              <span class="badges">
                <span class="lvl g ${it.lvl.includes('g')?'on':''}"></span>
                <span class="lvl y ${it.lvl.includes('y')?'on':''}"></span>
                <span class="lvl r ${it.lvl.includes('r')?'on':''}"></span>
              </span>
            </div>
            ${it.tag? `<span class="item-tag">${it.tag}</span>`:""}
            <div class="item-desc">${it.desc}</div>
            <button class="item-toggle">Vedi i passaggi <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m6 9 6 6 6-6"/></svg></button>
            <div class="item-detail">
              <div class="item-why"><b>Perché:</b> ${it.why}</div>
              <ol class="steps">${it.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
              ${it.link && it.link!=="#" ? `<a class="item-link" href="${it.link}" target="_blank" rel="noopener">Vai al sito ufficiale →</a>`:""}
            </div>
          </div>
        </div>
      `;
      card.querySelector('.chk').addEventListener('click', (e)=>{
        e.stopPropagation();
        state.checked[it.id] = !state.checked[it.id];
        save();
        render();
        applyFilters();
      });
      card.querySelector('.item-toggle').addEventListener('click', (e)=>{
        e.stopPropagation();
        card.classList.toggle('expanded');
      });
      itemsWrap.appendChild(card);
    });

    el.querySelector('.cat-head').addEventListener('click', ()=>{
      el.classList.toggle('open');
      state.collapsed[cat.id] = !el.classList.contains('open');
      save();
    });

    main.appendChild(el);
  });

  updateProgress();
  applyFilters();
}

function updateProgress(){
  const t = totalItems(), d = doneItems();
  const pct = t? Math.round(d/t*100) : 0;
  document.getElementById('pctLabel').textContent = pct+"%";
  const ring = document.getElementById('ringFg');
  ring.setAttribute('stroke-dasharray', pct+',100');
}

function applyFilters(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  document.querySelectorAll('.item').forEach(card=>{
    let visible = true;
    if(q && !card.dataset.name.includes(q)) visible = false;
    if(state.onlyRec && card.classList.contains('not-recommended')) visible = false;
    card.classList.toggle('hidden', !visible);
  });
  // hide empty categories when filtering
  document.querySelectorAll('.cat').forEach(cat=>{
    const anyVisible = [...cat.querySelectorAll('.item')].some(i=>!i.classList.contains('hidden'));
    cat.style.display = anyVisible ? "" : "none";
    if(q && anyVisible) cat.classList.add('open');
  });
}

/* ============== PROFILE SELECTOR ============== */
document.querySelectorAll('.profile-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    const lvl = card.dataset.level;
    state.profile = (state.profile === lvl) ? null : lvl;
    document.querySelectorAll('.profile-card').forEach(c=>c.classList.toggle('active', c.dataset.level===state.profile));
    save();
    render();
    toast(state.profile? "Profilo impostato: "+({g:'🟢 Cittadino',y:'🟡 Pseudonimo',r:'🔴 Whistleblower'}[state.profile]) : "Nessun profilo selezionato");
  });
});
if(state.profile){
  document.querySelector(`.profile-card[data-level="${state.profile}"]`)?.classList.add('active');
}

/* ============== TOOLBAR ============== */
document.getElementById('search').addEventListener('input', applyFilters);

document.getElementById('onlyRecBtn').addEventListener('click', (e)=>{
  state.onlyRec = !state.onlyRec;
  e.target.classList.toggle('accent', state.onlyRec);
  save();
  applyFilters();
});

let allExpanded = false;
document.getElementById('expandAllBtn').addEventListener('click', (e)=>{
  allExpanded = !allExpanded;
  document.querySelectorAll('.cat').forEach(c=>{
    c.classList.toggle('open', allExpanded);
    state.collapsed[c.id.replace('cat-','')] = !allExpanded;
  });
  e.target.textContent = allExpanded ? "Comprimi tutto" : "Espandi tutto";
  save();
});

document.getElementById('exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = "sovranita-digitale-progressi.json";
  a.click();
  URL.revokeObjectURL(url);
  toast("Progressi esportati");
});

document.getElementById('importFile').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const imported = JSON.parse(reader.result);
      state = Object.assign({checked:{},profile:null,onlyRec:false,collapsed:{}}, imported);
      save();
      render();
      toast("Progressi importati");
    }catch(err){
      toast("File non valido");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(confirm("Azzerare tutti i progressi salvati in questo browser?")){
    state = {checked:{},profile:null,onlyRec:false,collapsed:{}};
    save();
    document.querySelectorAll('.profile-card').forEach(c=>c.classList.remove('active'));
    render();
    toast("Progressi azzerati");
  }
});

/* ============== MOBILE DRAWER ============== */
const overlay = document.getElementById('overlay');
document.getElementById('menuBtn').addEventListener('click', ()=>{
  toc.classList.add('open');
  overlay.classList.add('show');
});
function closeDrawer(){
  if(window.innerWidth <= 880){
    toc.classList.remove('open');
    overlay.classList.remove('show');
  }
}
overlay.addEventListener('click', closeDrawer);

/* ============== TOAST ============== */
let toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ============== SCROLLSPY ============== */
const catEls = ()=> DATA.map(c=>document.getElementById('cat-'+c.id)).filter(Boolean);
window.addEventListener('scroll', ()=>{
  let current = null;
  catEls().forEach(el=>{
    const r = el.getBoundingClientRect();
    if(r.top < 140) current = el.id;
  });
  document.querySelectorAll('nav.toc a').forEach(a=>{
    a.classList.toggle('active', a.getAttribute('href') === '#'+current);
  });
}, {passive:true});

/* ============== PWA: SERVICE WORKER ============== */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{
      // file:// or unsupported context — silently ignore, app still works
    });
  });
}

/* ============== PWA: INSTALL PROMPT ============== */
let deferredInstall = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredInstall = e;
  installBtn.style.display = "inline-block";
});
window.addEventListener('appinstalled', ()=>{
  installBtn.style.display = "none";
  toast("App installata");
});
installBtn.addEventListener('click', async ()=>{
  if(!deferredInstall){
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(isIOS
      ? "Su iPhone/iPad: tocca l'icona Condividi in Safari, poi 'Aggiungi a Home'."
      : "Apri il menu del browser e cerca 'Installa app' o 'Aggiungi a schermata Home'. Nota: l'installazione richiede che la pagina sia servita via https:// o http://localhost, non funziona aprendo il file direttamente dal disco.");
    return;
  }
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  installBtn.style.display = "none";
});
// Show the button proactively on iOS (no beforeinstallprompt event exists there)
if(/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone){
  installBtn.style.display = "inline-block";
}

/* ============== COPY-TO-CLIPBOARD (delegated) ============== */
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-copy]');
  if(!btn) return;
  const ta = document.getElementById(btn.dataset.copy);
  if(!ta) return;
  navigator.clipboard.writeText(ta.value).then(()=>toast("Copiato negli appunti")).catch(()=>{
    ta.select(); document.execCommand('copy'); toast("Copiato negli appunti");
  });
});

function downloadText(filename, text){
  const blob = new Blob([text], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ============== GENERATOR: PGP KEY PAIR ============== */
let openpgpLoading = null;
function loadOpenPGP(){
  if(window.openpgp) return Promise.resolve(window.openpgp);
  if(openpgpLoading) return openpgpLoading;
  const sources = [
    "https://cdnjs.cloudflare.com/ajax/libs/openpgp/5.11.2/openpgp.min.js",
    "https://unpkg.com/openpgp@5/dist/openpgp.min.js"
  ];
  openpgpLoading = new Promise((resolve, reject)=>{
    let i = 0;
    function tryNext(){
      if(i >= sources.length) return reject(new Error("Impossibile scaricare la libreria di cifratura"));
      const s = document.createElement('script');
      s.src = sources[i++];
      s.onload = ()=> window.openpgp ? resolve(window.openpgp) : tryNext();
      s.onerror = tryNext;
      document.head.appendChild(s);
    }
    tryNext();
  });
  return openpgpLoading;
}

document.getElementById('pgpGenBtn').addEventListener('click', async ()=>{
  const name = document.getElementById('pgpName').value.trim();
  const email = document.getElementById('pgpEmail').value.trim();
  const pass = document.getElementById('pgpPass').value;
  const status = document.getElementById('pgpStatus');
  const btn = document.getElementById('pgpGenBtn');

  if(!name || !email){
    status.textContent = "Inserisci almeno nome ed email.";
    status.className = "gen-status err";
    return;
  }

  btn.disabled = true;
  status.textContent = "Carico la libreria di cifratura...";
  status.className = "gen-status";

  try{
    const openpgp = await loadOpenPGP();
    status.textContent = "Genero la coppia di chiavi (qualche secondo)...";
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'ecc',
      curve: 'curve25519',
      userIDs: [{ name, email }],
      passphrase: pass || undefined,
      format: 'armored'
    });
    document.getElementById('pgpPub').value = publicKey;
    document.getElementById('pgpPriv').value = privateKey;
    document.getElementById('pgpOutput').style.display = "block";
    status.textContent = "Fatto. Salva subito la chiave privata in un posto sicuro.";
    status.className = "gen-status ok";

    document.getElementById('pgpPubDl').onclick = ()=> downloadText(name.replace(/\s+/g,'_') + "_public.asc", publicKey);
    document.getElementById('pgpPrivDl').onclick = ()=> downloadText(name.replace(/\s+/g,'_') + "_private.asc", privateKey);
  }catch(err){
    status.textContent = "Errore: " + (err && err.message ? err.message : "impossibile generare le chiavi. Verifica la connessione internet (serve al primo utilizzo).");
    status.className = "gen-status err";
  }finally{
    btn.disabled = false;
  }
});

/* ============== GENERATOR: WIREGUARD CONFIG ASSEMBLER ============== */
document.getElementById('wgGenBtn').addEventListener('click', ()=>{
  const priv = document.getElementById('wgPriv').value.trim();
  const addr = document.getElementById('wgAddr').value.trim();
  const dns = document.getElementById('wgDns').value.trim();
  const peerPub = document.getElementById('wgPeerPub').value.trim();
  const endpoint = document.getElementById('wgEndpoint').value.trim();
  const allowed = document.getElementById('wgAllowed').value.trim() || "0.0.0.0/0, ::/0";
  const status = document.getElementById('wgStatus');

  if(!priv || !addr || !peerPub || !endpoint){
    status.textContent = "Servono almeno: chiave privata, indirizzo, chiave pubblica del server, endpoint.";
    status.className = "gen-status err";
    return;
  }

  const lines = [
    "[Interface]",
    "PrivateKey = " + priv,
    "Address = " + addr,
  ];
  if(dns) lines.push("DNS = " + dns);
  lines.push("", "[Peer]", "PublicKey = " + peerPub, "AllowedIPs = " + allowed, "Endpoint = " + endpoint, "PersistentKeepalive = 25");

  const conf = lines.join("\n") + "\n";
  document.getElementById('wgConf').value = conf;
  document.getElementById('wgOutput').style.display = "block";
  status.textContent = "File generato.";
  status.className = "gen-status ok";
  document.getElementById('wgDl').onclick = ()=> downloadText("wg0.conf", conf);
});

render();
