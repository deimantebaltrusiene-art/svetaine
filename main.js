// Darbo stalas. Jei žmogus sistemoje išjungęs judesį, viskas rodoma galutinėje būsenoje.
const ramiai = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const tiksliPele = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const lauk = ms => new Promise(r => setTimeout(r, ms));
const kaiMatosi = (el, kai, kitaip, slenkstis = 0.3) => {
  if (!('IntersectionObserver' in window)) { kai(); return; }
  new IntersectionObserver(([i]) => (i.isIntersecting ? kai() : kitaip && kitaip()), { threshold: slenkstis }).observe(el);
};

// ---------- Daiktus ant stalo galima patempti pele ----------
let virsus = 10;
function tempiamas(el, paspaudus) {
  let pradzia = null, pajudejo = false;
  el.addEventListener('pointerdown', e => {
    if (!tiksliPele || e.button !== 0) return;
    const dx = parseFloat(el.style.getPropertyValue('--dx')) || 0;
    const dy = parseFloat(el.style.getPropertyValue('--dy')) || 0;
    pradzia = { x: e.clientX, y: e.clientY, dx, dy };
    pajudejo = false;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!pradzia) return;
    const mx = e.clientX - pradzia.x, my = e.clientY - pradzia.y;
    if (!pajudejo && Math.hypot(mx, my) < 6) return;
    if (!pajudejo) { pajudejo = true; el.classList.add('tempiamas'); el.style.zIndex = ++virsus; }
    el.style.setProperty('--dx', pradzia.dx + mx + 'px');
    el.style.setProperty('--dy', pradzia.dy + my + 'px');
  });
  const baik = () => {
    if (!pradzia) return;
    pradzia = null;
    el.classList.remove('tempiamas');
  };
  el.addEventListener('pointerup', baik);
  el.addEventListener('pointercancel', baik);
  // paspaudimas be tempimo yra paspaudimas
  el.addEventListener('click', e => {
    if (pajudejo) { e.preventDefault(); e.stopPropagation(); pajudejo = false; return; }
    paspaudus && paspaudus(e);
  });
}
document.querySelectorAll('.scena [data-daiktas]').forEach(el => tempiamas(el));

// ---------- 1. Kompiuteryje rašomi prašymai, o ant stalo atsiranda darbai ----------
const scena = document.querySelector('[data-scena]');
if (scena) {
  const terminalas = scena.querySelector('[data-terminalas]');
  const telefonas = scena.querySelector('[data-telefonas]');
  const telefonoDaiktas = scena.querySelector('.daiktas--telefonas');
  const lapai = Object.fromEntries([...scena.querySelectorAll('[data-lapas]')].map(l => [l.dataset.lapas, l]));
  const uzduotys = Object.fromEntries([...scena.querySelectorAll('[data-uzduotis]')].map(l => [l.dataset.uzduotis, l]));
  const DARBAI = [
    { id: 'reels', prasymas: 'sumontuok šitą reels su subtitrais', atsakymas: '✓ reels sumontuotas, žiūrėk telefone' },
    { id: 'saskaitos', prasymas: 'išrašyk sąskaitas iš Stan pardavimų', atsakymas: '✓ sąskaitos PDF formatu, žurnalas atnaujintas' },
    { id: 'karusele', prasymas: 'sudėk karuselę iš mano nuotraukų', atsakymas: '✓ karuselė paruošta, padėjau ant stalo' },
    { id: 'zinutes', prasymas: 'atsakyk visiems, kurie parašė GIDAS', atsakymas: '✓ visiems išsiųsta nuoroda' },
  ];
  const REELS = 'media/efektai2/ka-pasakau.mp4';
  let matosi = false, vyksta = false;

  const eilute = (klase, tekstas = '') => {
    const p = document.createElement('p');
    p.className = klase;
    p.textContent = tekstas;
    terminalas.appendChild(p);
    while (terminalas.children.length > 9) terminalas.firstElementChild.remove();
    return p;
  };
  const zymeklis = document.createElement('span');
  zymeklis.className = 'ekranas__zymeklis';

  function ivykdyk(id) {
    uzduotys[id]?.classList.add('atlikta');
    if (id === 'reels') {
      if (!telefonas.src) telefonas.src = REELS;
      telefonoDaiktas.classList.add('sumontuota');
      if (!ramiai) {
        telefonas.currentTime = 0;
        telefonas.play().catch(() => {});
        telefonoDaiktas.animate([{ scale: '1' }, { scale: '1.08' }, { scale: '1' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    }
    if (lapai[id]) lapai[id].classList.add('islenda');
    if (id === 'zinutes' && telefonoDaiktas && !ramiai) {
      telefonoDaiktas.animate([{ rotate: '-8deg' }, { rotate: '-5deg' }, { rotate: '-11deg' }, { rotate: '-6deg' }, { rotate: '-8deg' }], { duration: 420 });
    }
  }

  async function ciklas() {
    if (vyksta) return;
    vyksta = true;
    while (matosi) {
      terminalas.textContent = '';
      Object.values(uzduotys).forEach(u => u.classList.remove('atlikta'));
      Object.values(lapai).forEach(l => l.classList.remove('islenda'));
      telefonoDaiktas.classList.remove('sumontuota');
      telefonas.pause();
      await lauk(700);
      for (const darbas of DARBAI) {
        if (!matosi) break;
        const p = eilute('prasymas');
        p.appendChild(zymeklis);
        for (const raide of darbas.prasymas) {
          zymeklis.before(raide);
          await lauk(38 + Math.random() * 40);
        }
        await lauk(260);
        zymeklis.remove();
        const dirba = eilute('dirba', 'dirbu…');
        await lauk(1100);
        dirba.className = 'atlikta';
        dirba.textContent = darbas.atsakymas;
        ivykdyk(darbas.id);
        await lauk(1500);
      }
      await lauk(5200);
    }
    vyksta = false;
  }

  if (ramiai) {
    DARBAI.forEach(d => { eilute('prasymas', d.prasymas); eilute('atlikta', d.atsakymas); ivykdyk(d.id); });
  } else {
    kaiMatosi(scena, () => {
      matosi = true;
      // reels pasikrauna iš anksto, kad po „sumontuotas“ iškart grotų
      if (!telefonas.src) { telefonas.preload = 'auto'; telefonas.src = REELS; }
      if (telefonoDaiktas.classList.contains('sumontuota')) telefonas.play().catch(() => {});
      ciklas();
    }, () => { matosi = false; telefonas.pause(); }, 0.25);
  }
}

// ---------- 2. Anksčiau ir dabar ----------
const jungiklis = document.querySelector('.jungiklis');
if (jungiklis) {
  const turiniai = document.querySelectorAll('[data-laikas-turinys]');
  jungiklis.dataset.busena = 'dabar';
  jungiklis.querySelectorAll('[data-laikas]').forEach(m => m.addEventListener('click', () => {
    const kuris = m.dataset.laikas;
    jungiklis.dataset.busena = kuris;
    jungiklis.querySelectorAll('[data-laikas]').forEach(k => k.setAttribute('aria-pressed', String(k === m)));
    turiniai.forEach(t => {
      const rodyti = t.dataset.laikasTurinys === kuris;
      t.hidden = !rodyti;
      t.classList.toggle('rodomas', rodyti);
    });
  }));
}

// ---------- Video groja tik tada, kai matosi ----------
const stebiVideo = 'IntersectionObserver' in window && !ramiai
  ? new IntersectionObserver(irasai => irasai.forEach(({ target, isIntersecting }) => {
      if (isIntersecting && !target.closest('[hidden]')) target.play().catch(() => {}); else target.pause();
    }), { threshold: 0.35 })
  : null;
document.querySelectorAll('video[data-matomas]').forEach(v => stebiVideo?.observe(v));

// ---------- 3. Komanda: robotukai atžygiuoja, paspaustas pašoka ir parodo darbą ----------
const sablonas = document.getElementById('robotukas');
document.querySelectorAll('.robotas').forEach(r => r.appendChild(sablonas.content.cloneNode(true)));
const robotai = document.querySelector('[data-robotai]');
if (robotai) {
  const mygtukai = [...robotai.querySelectorAll('[data-darbas]')];
  const darbai = [...document.querySelectorAll('[data-darbas-turinys]')];

  const pasoka = r => {
    if (ramiai) return;
    r.classList.remove('soka');
    void r.offsetWidth;
    r.classList.add('soka');
    r.addEventListener('animationend', e => { if (e.target === r) r.classList.remove('soka'); });
  };
  mygtukai.forEach(m => m.addEventListener('click', () => {
    mygtukai.forEach(k => k.setAttribute('aria-pressed', String(k === m)));
    pasoka(m.querySelector('.robotas'));
    darbai.forEach(d => {
      const rodyti = d.dataset.darbasTurinys === m.dataset.darbas;
      if (rodyti === !d.hidden) return;
      d.hidden = !rodyti;
      d.querySelectorAll('video').forEach(v => (rodyti && !ramiai ? v.play().catch(() => {}) : v.pause()));
      if (rodyti && !ramiai) { d.classList.remove('atsiranda'); void d.offsetWidth; d.classList.add('atsiranda'); }
    });
  }));

  // komanda atžygiuoja, kai skyrius pasirodo
  if (!ramiai && 'IntersectionObserver' in window) {
    const visi = [...robotai.querySelectorAll('.robotas')];
    visi.forEach(r => { r.style.opacity = '0'; });
    const st = new IntersectionObserver(([i]) => {
      if (!i.isIntersecting) return;
      st.disconnect();
      visi.forEach((r, k) => {
        const kelias = -(window.innerWidth * 0.5 + k * 40);
        r.style.opacity = '1';
        r.classList.add('eina');
        r.animate([{ transform: `translateX(${kelias}px)` }, { transform: 'translateX(0)' }],
          { duration: 1700 + k * 120, delay: k * 90, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'backwards' })
          .finished.then(() => { r.classList.remove('eina'); setTimeout(() => pasoka(r), k * 70); });
      });
    }, { threshold: 0.4 });
    st.observe(robotai);
  }
}

// ---------- 4. Reels: paspaustas lapelis telefone virsta efektu ----------
const reels = document.querySelector('.reels');
if (reels) {
  const lapeliai = [...reels.querySelectorAll('[data-efektas-video]')];
  const atsakymas = reels.querySelector('[data-atsakymas]');
  const pavadinimas = reels.querySelector('[data-efektas]');
  let [rodomas, kitas] = reels.querySelectorAll('.efektas');
  const kelias = v => `media/efektai2/${v}.mp4`;
  let matosi = false, paliete = false, ratas = null;
  let eile = Math.max(0, lapeliai.findIndex(m => m.getAttribute('aria-pressed') === 'true'));
  const paleisk = v => { if (!ramiai && matosi) v.play().catch(() => {}); };

  let keitimas = 0;
  function parodyk(vardas) {
    const naujas = kitas, senas = rodomas;
    naujas.classList.remove('rodomas');
    naujas.classList.add('virsuje');
    senas.classList.remove('virsuje', 'rodomas');
    naujas.poster = `media/efektai2/${vardas}.jpg`;
    naujas.src = kelias(vardas);
    // be šito naršyklė naujo video nekrauna (preload="none"), ir telefone likdavo senas efektas
    naujas.preload = 'auto';
    naujas.load();
    const sis = ++keitimas;
    const atverk = () => {
      if (sis !== keitimas) return;
      paleisk(naujas);
      void naujas.offsetWidth;
      naujas.classList.add('rodomas');
      setTimeout(() => { if (senas !== rodomas) senas.pause(); }, 750);
    };
    if (ramiai || naujas.readyState >= 2) atverk(); else naujas.addEventListener('loadeddata', atverk, { once: true });
    kitas = senas; rodomas = naujas;
  }
  function pasirink(m) {
    lapeliai.forEach(k => k.setAttribute('aria-pressed', String(k === m)));
    eile = lapeliai.indexOf(m);
    const juosta = m.closest('ul');
    if (juosta.scrollWidth > juosta.clientWidth) {
      juosta.scrollTo({ left: juosta.scrollLeft + m.getBoundingClientRect().left - juosta.getBoundingClientRect().left - 8, behavior: ramiai ? 'auto' : 'smooth' });
    }
    atsakymas.textContent = '✓ Padaryta: ' + m.dataset.atsakymas;
    pavadinimas.textContent = m.dataset.pavadinimas;
    parodyk(m.dataset.efektasVideo);
  }
  lapeliai.forEach(m => m.addEventListener('click', () => { paliete = true; clearInterval(ratas); pasirink(m); }));
  const sukis = () => {
    clearInterval(ratas);
    if (ramiai || paliete) return;
    ratas = setInterval(() => pasirink(lapeliai[(eile + 1) % lapeliai.length]), 6000);
  };
  if ('IntersectionObserver' in window) {
    const krovejas = new IntersectionObserver(([i]) => {
      if (!i.isIntersecting) return;
      krovejas.disconnect();
      rodomas.src = kelias(lapeliai[eile].dataset.efektasVideo);
      paleisk(rodomas);
    }, { rootMargin: '400px' });
    krovejas.observe(reels);
    kaiMatosi(reels.querySelector('.reels__telefonas'), () => { matosi = true; paleisk(rodomas); sukis(); }, () => { matosi = false; rodomas.pause(); clearInterval(ratas); });
  }
}

// ---------- Atsiliepimai sudėliojami stulpeliais taip, kad apačioje neliktų skylių ----------
const siena = document.querySelector('.laiskai');
let sudeliok = () => {};
if (siena) {
  const EIL = 4;
  let aukstis = [];
  const stulpeliu = () => { const p = siena.clientWidth; return p >= 900 ? 3 : p >= 580 ? 2 : 1; };
  const padek = sarasas => {
    const tarpas = parseFloat(getComputedStyle(siena).columnGap) || 24;
    // ilgiausios pirma: taip stulpeliai baigiasi beveik vienoje linijoje
    sarasas.map(l => [l, l.offsetHeight]).sort((a, b) => b[1] - a[1]).forEach(([l, h]) => {
      const k = aukstis.indexOf(Math.min(...aukstis));
      const kiek = Math.ceil((h + tarpas) / EIL);
      l.style.gridColumn = String(k + 1);
      l.style.gridRow = `${aukstis[k] / EIL + 1} / span ${kiek}`;
      aukstis[k] += kiek * EIL;
    });
  };
  sudeliok = papildyti => {
    const n = stulpeliu();
    const rodomi = [...siena.children].filter(l => !l.hidden);
    if (n === 1) {
      siena.classList.remove('murai');
      [...siena.children].forEach(l => { l.style.gridColumn = ''; l.style.gridRow = ''; });
      aukstis = [];
      return;
    }
    siena.classList.add('murai');
    siena.style.setProperty('--stulpeliai', n);
    if (papildyti && aukstis.length === n) { padek(rodomi.filter(l => !l.style.gridRow)); return; }
    aukstis = Array(n).fill(0);
    rodomi.forEach(l => { l.style.gridColumn = '1'; l.style.gridRow = 'auto'; });
    padek(rodomi);
  };
  sudeliok();
  document.fonts?.ready.then(() => sudeliok());
  let laikas;
  window.addEventListener('resize', () => { clearTimeout(laikas); laikas = setTimeout(() => sudeliok(), 150); });
}

// ---------- 5. Atsiliepimai: pirmi devyni matosi, kiti po paspaudimo ----------
const daugiau = document.querySelector('[data-daugiau-mygtukas]');
if (daugiau) {
  // telefone pradžioje tik keturi, kad nereikėtų ilgai slinkti
  if (window.matchMedia('(max-width: 820px)').matches) {
    [...document.querySelectorAll('.laiskas')].slice(4).forEach(l => { l.hidden = true; l.dataset.daugiau = ''; });
  }
  const liko = document.querySelectorAll('[data-daugiau]').length;
  daugiau.textContent = `Skaityti dar ${liko} atsiliepim${liko % 10 === 1 && liko % 100 !== 11 ? 'ą' : (liko % 10 === 0 || (liko % 100 > 10 && liko % 100 < 20)) ? 'ų' : 'us'}`;
  daugiau.addEventListener('click', () => {
    const paslepti = [...document.querySelectorAll('[data-daugiau]')];
    paslepti.forEach((l, k) => {
      l.hidden = false;
      if (!ramiai) { l.style.animationDelay = k * 70 + 'ms'; l.classList.add('atsiranda'); }
    });
    sudeliok(true);
    daugiau.parentElement.remove();
    paslepti[0]?.querySelector('blockquote')?.setAttribute('tabindex', '-1');
    paslepti[0]?.querySelector('blockquote')?.focus({ preventScroll: true });
  });
}

// ---------- 6. Moduliai: paspaudus parodoma, ką po jo pasakysi Claude Code ----------
const prasymas = document.querySelector('.turinys-lapas [data-prasymas]');
if (prasymas) {
  const moduliai = [...document.querySelectorAll('.moduliai [data-prasymas]')];
  let rasymas = 0;
  const parasyk = async tekstas => {
    const sis = ++rasymas;
    if (ramiai) { prasymas.textContent = tekstas; return; }
    prasymas.textContent = '';
    for (const raide of tekstas) {
      if (sis !== rasymas) return;
      prasymas.textContent += raide;
      await lauk(22);
    }
  };
  const pasirink = m => {
    moduliai.forEach(k => k.setAttribute('aria-pressed', String(k === m)));
    parasyk(m.dataset.prasymas);
  };
  moduliai.forEach(m => {
    m.addEventListener('click', () => pasirink(m));
    if (tiksliPele) m.addEventListener('mouseenter', () => { if (m.getAttribute('aria-pressed') !== 'true') pasirink(m); });
  });
}

// ---------- 7. Kas mokymuose: pamokos pavyzdys, promptas, skilsai ----------
const pamoka = document.querySelector('[data-pamoka]');
if (pamoka) {
  const eilutes = pamoka.querySelector('[data-pamokos-eilutes]');
  const mygtukas = pamoka.querySelector('[data-pamokos-mygtukas]');
  const juosta = pamoka.querySelector('[data-pamokos-juosta]');
  const EIGA = [
    ['balsas', 'Įmesk nufilmuotą video į aplanką ir parašyk taip:'],
    ['prasymas', 'sumontuok šitą reels su subtitrais'],
    ['dirba', 'dirbu…'],
    ['atlikta', '✓ iškirpau pauzes'],
    ['atlikta', '✓ subtitrai tavo šriftu ir spalvomis'],
    ['atlikta', '✓ reels.mp4 paruoštas'],
    ['balsas', 'Matai? Dabar pabandyk pati ar pats.'],
  ];
  let groja = false, kartas = 0, matosi = false;
  const rodyk = (iki, eiga) => {
    eilutes.textContent = '';
    EIGA.slice(0, iki).forEach(([k, t]) => { const p = document.createElement('p'); p.className = k; p.textContent = t; eilutes.appendChild(p); });
    juosta.style.setProperty('--eiga', eiga);
  };
  const groti = async () => {
    const sis = ++kartas;
    groja = true;
    pamoka.classList.add('groja');
    mygtukas.setAttribute('aria-label', 'Sustabdyti pamokos pavyzdį');
    for (let i = 1; i <= EIGA.length; i++) {
      if (sis !== kartas) return;
      rodyk(i, i / EIGA.length);
      await lauk(EIGA[i - 1][0] === 'balsas' ? 1900 : 1100);
    }
    await lauk(2600);
    if (sis === kartas && matosi) groti(); else if (sis === kartas) sustok();
  };
  const sustok = () => {
    kartas++; groja = false;
    pamoka.classList.remove('groja');
    mygtukas.setAttribute('aria-label', 'Paleisti pamokos pavyzdį');
  };
  rodyk(ramiai ? EIGA.length : 1, ramiai ? 1 : 0);
  mygtukas.addEventListener('click', () => (groja ? sustok() : groti()));
  if (!ramiai) kaiMatosi(pamoka, () => { matosi = true; if (!groja) groti(); }, () => { matosi = false; sustok(); }, 0.5);
}

const promptoMygtukas = document.querySelector('[data-kopijuoti-prompta]');
if (promptoMygtukas) {
  const tekstas = document.querySelector('[data-promptas]').textContent.trim();
  promptoMygtukas.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(tekstas);
      promptoMygtukas.textContent = 'Nukopijuota ✓';
    } catch {
      promptoMygtukas.textContent = 'Pažymėk ir kopijuok';
    }
    setTimeout(() => { promptoMygtukas.textContent = 'Nukopijuok'; }, 2200);
  });
}

const skilsoFailas = document.querySelector('[data-skilso-failas]');
if (skilsoFailas) {
  const SKILSAI = {
    mokytojas: ['mokytojas', 'aiškink kaip mentorė,\n  žingsnis po žingsnio, paprastai.', ['mokausi ką nors nauja', 'prašau paaiškinti, kaip veikia']],
    reels: ['reels-efektai', 'sumontuok mano reels su efektais,\n  lietuviškai ir mano stiliumi.', ['sakau „sumontuok su efektais“', 'įmetu naują video']],
    logika: ['logikos-patikra', 'patikrink scenarijų ar tekstą\n  dėl loginių klaidų prieš skelbiant.', ['parašiau scenarijų ar promptą', 'ruošiu tekstą karuselei']],
  };
  const auseles = [...document.querySelectorAll('[data-skilsas]')];
  const parodyk = raktas => {
    const [vardas, aprasas, kada] = SKILSAI[raktas];
    skilsoFailas.innerHTML = '';
    const eil = (t, klase) => { const sp = document.createElement('span'); if (klase) sp.className = klase; sp.textContent = t; skilsoFailas.append(sp); };
    eil('---\n'); eil('name: ', 'raktas'); eil(vardas + '\n'); eil('description: ', 'raktas'); eil(aprasas + '\n---\n');
    eil('# Kada naudoti\n', 'antr'); eil(kada.map(k => '- ' + k).join('\n'));
    if (!ramiai) skilsoFailas.animate([{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: 350, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  auseles.forEach(a => a.addEventListener('click', () => {
    auseles.forEach(k => k.setAttribute('aria-selected', String(k === a)));
    parodyk(a.dataset.skilsas);
  }));
  parodyk('mokytojas');
}

// ---------- Robotukai vaikšto ant mokymų kortelės, prie mygtuko pašoka ----------
const lapoRobotai = document.querySelector('[data-lapo-robotai]');
if (lapoRobotai) {
  const rob = [...lapoRobotai.querySelectorAll('.lapo-robotai .robotas')];
  const max = r => Math.max(0, lapoRobotai.clientWidth - r.offsetWidth);
  const poz = rob.map((r, k) => [0.06, 0.46, 0.84][k] * max(r));
  rob.forEach((r, k) => { r.style.transform = `translateX(${poz[k]}px)`; });
  const pasok = r => {
    if (ramiai) return;
    r.classList.remove('soka'); void r.offsetWidth; r.classList.add('soka');
  };
  rob.forEach(r => r.addEventListener('animationend', e => { if (e.target === r) r.classList.remove('soka'); }));
  const mygt = lapoRobotai.querySelector('.mygtukas');
  ['mouseenter', 'focus'].forEach(ev => mygt.addEventListener(ev, () => rob.forEach((r, k) => setTimeout(() => pasok(r), k * 90))));
  if (!ramiai) {
    let matosi = false, pradeta = false;
    const eik = async (r, k) => {
      await lauk(k * 700);
      for (;;) {
        if (!matosi) { await lauk(700); continue; }
        const iki = Math.random() * max(r);
        const trukme = Math.max(500, Math.abs(iki - poz[k]) / 70 * 1000);
        r.classList.add('eina');
        const a = r.animate([{ transform: `translateX(${poz[k]}px)` }, { transform: `translateX(${iki}px)` }], { duration: trukme, easing: 'linear', fill: 'forwards' });
        await a.finished;
        a.commitStyles(); a.cancel();
        poz[k] = iki;
        r.classList.remove('eina');
        if (Math.random() < 0.45) pasok(r);
        await lauk(900 + Math.random() * 2600);
      }
    };
    kaiMatosi(lapoRobotai, () => {
      matosi = true;
      if (!pradeta) { pradeta = true; rob.forEach(eik); }
    }, () => { matosi = false; }, 0.2);
  }
}

// ---------- El. paštas nusikopijuoja, o ne atidaro pašto programą ----------
document.querySelectorAll('[data-kopijuoti]').forEach(m => {
  const tekstas = m.textContent;
  m.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(m.dataset.kopijuoti);
      m.textContent = 'Nukopijuota ✓';
    } catch {
      m.textContent = m.dataset.kopijuoti;
      return;
    }
    setTimeout(() => { m.textContent = tekstas; }, 2000);
  });
});
