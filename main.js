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
      if (!telefonas.src) telefonas.src = 'media/efektai/01-kabliukas-uz-galvos.mp4';
      if (!ramiai) telefonas.play().catch(() => {});
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
      if (telefonas.src) telefonas.play().catch(() => {});
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
  const kelias = v => `media/efektai/${v}.mp4`;
  let matosi = false, paliete = false, ratas = null;
  let eile = Math.max(0, lapeliai.findIndex(m => m.getAttribute('aria-pressed') === 'true'));
  const paleisk = v => { if (!ramiai && matosi) v.play().catch(() => {}); };

  function parodyk(vardas) {
    const naujas = kitas, senas = rodomas;
    naujas.classList.remove('rodomas');
    naujas.classList.add('virsuje');
    senas.classList.remove('virsuje', 'rodomas');
    naujas.poster = `media/efektai/${vardas}.jpg`;
    naujas.src = kelias(vardas);
    const atverk = () => {
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

// ---------- 5. Atsiliepimai: žinutes galima pastumdyti, paspaudus atsidaro visa ----------
const langas = document.querySelector('.zinute');
if (langas) {
  const vaizdas = langas.querySelector('img');
  document.querySelectorAll('[data-zinute]').forEach(lapas => {
    tempiamas(lapas, () => {
      vaizdas.src = lapas.dataset.zinute;
      vaizdas.width = lapas.dataset.w;
      vaizdas.height = lapas.dataset.h;
      langas.showModal();
      langas.scrollTop = 0;
    });
  });
  langas.querySelector('.zinute__uzdaryti').addEventListener('click', () => langas.close());
  langas.addEventListener('click', e => { if (e.target === langas) langas.close(); });
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

// ---------- 7. Kaina: robotukai nuspiria seną kainą ----------
const kainosScena = document.querySelector('[data-kaina]');
if (kainosScena) {
  const drobe = kainosScena.querySelector('canvas');
  const x = drobe.getContext('2d');
  const suma = kainosScena.querySelector('.kaina__suma');
  const nauja = kainosScena.querySelector('.kaina__nauja');
  const KOJOS = [{ x: 119, w: 54 }, { x: 197.7, w: 55 }, { x: 389.8, w: 55 }, { x: 466.8, w: 56 }];
  const pav = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
  const tarp = (a, b, p) => a + (b - a) * p;
  const lygu = (a, b, t) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const isej = p => 1 - Math.pow(1 - p, 3);
  let R = null, W = 0, H = 0, dpr = 1;

  const dydis = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = kainosScena.clientWidth; H = kainosScena.clientHeight;
    drobe.width = W * dpr; drobe.height = H * dpr;
  };

  function robotukas(cx, pedos, pl, o = {}) {
    const S = pl / 640, faze = o.eisena;
    const sup = faze == null ? 0 : Math.abs(Math.sin(faze)) * 14;
    x.save();
    x.globalAlpha = 0.35 * Math.max(0.3, 1 - (o.sok || 0) / pl);
    x.fillStyle = '#06110c';
    x.beginPath(); x.ellipse(cx + pl * 0.06, pedos + pl * 0.02, pl * 0.38, pl * 0.05, 0, 0, Math.PI * 2); x.fill();
    x.restore();
    x.save();
    x.translate(cx, pedos - (o.sok || 0));
    x.scale(S, S);
    x.translate(-320, -448);
    KOJOS.forEach((k, i) => {
      const pak = faze == null ? 0 : Math.max(0, Math.sin(faze + (i % 2 ? Math.PI : 0))) * 46;
      x.save();
      if (i === 3 && o.spyris) {
        x.translate(k.x + k.w / 2, 352 - sup); x.rotate(-o.spyris);
        x.drawImage(R.kojos[i], -k.w / 2, -8);
      } else {
        x.beginPath(); x.rect(0, 352 - sup, 640, 200); x.clip();
        x.drawImage(R.kojos[i], k.x, 344.7 - pak - sup * 0.2);
      }
      x.restore();
    });
    x.drawImage(R.kunas, 0, -sup);
    x.restore();
  }

  function piesk(t) {
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, W, H);
    // telefone kaina viršuje, o robotukai vaikšto po ja
    const siauras = W < 620;
    const pl = siauras ? Math.min(84, W * 0.2) : Math.min(150, Math.max(78, W * 0.12));
    const pedos = H * (siauras ? 0.95 : 0.8);
    const kainosY = siauras ? H * 0.56 : pedos;
    const cx = W / 2;
    const pw = Math.min(suma.offsetWidth || W * 0.4, W - pl * 1.2);
    const sriftas = parseFloat(getComputedStyle(nauja).fontSize);
    const tiksl = siauras
      ? [cx, cx - pl * 1.2, cx + pl * 1.2]
      : [cx - pw / 2 - pl * 0.75, cx - pw / 2 - pl * 1.95, cx + pw / 2 + pl * 0.75];

    // sena kaina stovi, kol ją nuspiria, tada nuskrenda
    const smugis = 2.05;
    if (t < 3.2) {
      const p = lygu(smugis, 3.1, t);
      x.save();
      x.globalAlpha = 1 - p;
      x.translate(cx + p * W * 0.45, kainosY - Math.sin(p * Math.PI) * H * 0.35);
      x.rotate(p * 1.6);
      x.font = `400 ${sriftas * 0.82}px "Bebas Neue"`;
      x.textAlign = 'center';
      x.fillStyle = '#efe6dd';
      x.shadowColor = 'rgba(4,14,9,.5)'; x.shadowBlur = 20; x.shadowOffsetY = 8;
      x.fillText('147 €', 0, 0);
      x.restore();
    }

    tiksl.forEach((galas, k) => {
      // pirmi du atžygiuoja iki kainos, trečias palaukia ir po smūgio nueina į kitą pusę
      let pozicija, eisena = null, spyris = 0, sok = 0;
      const pirmas = tiksl[0];
      if (k < 2) {
        const p = lygu(0.2 + k * 0.15, 1.9, t);
        pozicija = tarp(-pl * (1.5 + k), galas, isej(p));
        if (p > 0 && p < 1) eisena = t * 13 + k;
      } else {
        const p1 = lygu(0.1, 1.7, t), p2 = lygu(2.6, 3.9, t);
        const laukia = pirmas - pl * 2.3;
        pozicija = t < 2.6 ? tarp(-pl * 4, laukia, isej(p1)) : tarp(laukia, galas, isej(p2));
        if ((p1 > 0 && p1 < 1) || (p2 > 0 && p2 < 1)) eisena = t * 13;
      }
      if (k === 0) spyris = Math.max(0, lygu(1.85, 2.05, t) - lygu(2.15, 2.6, t)) * 1.1;
      // kai atsiranda nauja kaina, visi pašoka, paskui kartais po vieną
      const st = t - 4.0 - k * 0.12;
      if (st > 0 && st < 1.3) sok = Math.abs(Math.sin(st * Math.PI * 1.55)) * pl * 0.32 * (1 - st / 1.3);
      const ritmas = (t - 6 - k * 1.7) % 5.2;
      if (t > 6 && ritmas > 0 && ritmas < 0.55) sok = Math.sin(ritmas / 0.55 * Math.PI) * pl * 0.22;
      robotukas(pozicija, pedos, pl, { eisena, spyris, sok });
    });
  }

  let pradzia = null, kadras = null, sustota = 0;
  const suktis = laikas => {
    if (pradzia == null) pradzia = laikas;
    const t = (laikas - pradzia) / 1000;
    if (t > 3.75) kainosScena.classList.remove('laukia');
    piesk(t);
    kadras = requestAnimationFrame(suktis);
  };

  (async () => {
    const [kunas, ...kojos] = await Promise.all(['kunas', 'koja0', 'koja1', 'koja2', 'koja3'].map(f => pav(`media/robotukas/${f}.webp?v=3`)));
    R = { kunas, kojos };
    await document.fonts?.load('400 100px "Bebas Neue"', '147 € š').catch(() => {});
    dydis();
    window.addEventListener('resize', () => { dydis(); if (!kadras) piesk(ramiai ? 9 : 0); });
    if (ramiai || !('IntersectionObserver' in window)) { piesk(9); return; }
    kainosScena.classList.add('laukia');
    piesk(0);
    kaiMatosi(kainosScena, () => {
      if (kadras) return;
      if (pradzia != null) pradzia += performance.now() - sustota;
      kadras = requestAnimationFrame(suktis);
    }, () => {
      if (!kadras) return;
      cancelAnimationFrame(kadras); kadras = null; sustota = performance.now();
    }, 0.5);
  })();
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
