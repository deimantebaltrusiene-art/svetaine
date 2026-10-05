// Svetainės judesys. Jei žmogus sistemoje išjungęs judesį, viskas rodoma iš karto ir video nesisuka.
const ramiai = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Pirmo ekrano video: telefone vertikalus, kompiuteryje horizontalus ----
const video = document.querySelector('.herojus__video');
if (video) {
  const statmenas = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  const kuris = statmenas ? 'stati' : 'plati';
  video.poster = video.dataset[kuris + 'Poster'];
  if (!ramiai) {
    video.src = video.dataset[kuris];
    video.play().catch(() => {});
  }
}

// ---- Antraštė rašoma po žodį ----
const herojus = document.querySelector('.herojus');
const antraste = document.querySelector('[data-rasyti]');
if (antraste) {
  const zodziai = antraste.textContent.trim().split(/\s+/);
  antraste.setAttribute('aria-label', antraste.textContent.trim());
  antraste.innerHTML = zodziai
    .map(z => `<span class="zodis" aria-hidden="true">${z}</span>`)
    .join(' ') + '<span class="zymeklis" aria-hidden="true"></span>';

  if (ramiai) {
    herojus.classList.add('baigta');
  } else {
    document.documentElement.classList.add('js-judesys');
    const spanai = antraste.querySelectorAll('.zodis');
    spanai.forEach((s, i) => {
      // po taško trumpa pauzė, lyg rašytojas atsikvėptų
      const pauze = zodziai.slice(0, i).filter(z => z.endsWith('.')).length * 380;
      setTimeout(() => s.classList.add('matomas'), 450 + i * 170 + pauze);
    });
    const pabaiga = 450 + spanai.length * 170 + 380 + 200;
    setTimeout(() => herojus.classList.add('baigta'), pabaiga);
  }
}

// ---- Reels ištrauka sukasi tik tada, kai matosi ----
const matomiVideo = document.querySelectorAll('video[data-matomas]');
if (!ramiai && 'IntersectionObserver' in window) {
  const stebetojas = new IntersectionObserver(irasai => {
    irasai.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.35 });
  matomiVideo.forEach(v => stebetojas.observe(v));
}

// ---- 3D dalelės: gyva scena įkeliama tik priartėjus prie jos ----
const orbita = document.querySelector('[data-orbita]');
if (orbita && !ramiai && 'IntersectionObserver' in window) {
  const stebetojas = new IntersectionObserver(irasai => {
    if (!irasai[0].isIntersecting) return;
    stebetojas.disconnect();
    const remas = document.createElement('iframe');
    remas.src = '3d/daleles.html';
    remas.title = 'Dalelės, kurios tampa žodžiais';
    remas.setAttribute('tabindex', '-1');
    // Kol scena kraunasi, matosi nuotrauka. Iframe nekilnojam, nes perkeltas jis persikrautų.
    remas.style.cssText += 'position:absolute;inset:0;opacity:0;transition:opacity .6s';
    remas.addEventListener('load', () => { setTimeout(() => { remas.style.opacity = '1'; }, 400); });
    orbita.style.position = 'relative';
    orbita.appendChild(remas);
  }, { rootMargin: '300px' });
  stebetojas.observe(orbita);
}

// ---- 3D scenos (kompiuteris, skardinė): įkeliamos priartėjus, o sukasi tik tada, kai matosi ----
document.querySelectorAll('[data-scena]').forEach(scena => {
  if (ramiai || !('IntersectionObserver' in window)) return;
  let remas = null, matosi = false;
  const pranesk = () => remas?.contentWindow?.postMessage(matosi ? 'rodomas' : 'pasleptas', '*');

  const krovejas = new IntersectionObserver(irasai => {
    if (!irasai[0].isIntersecting) return;
    krovejas.disconnect();
    remas = document.createElement('iframe');
    remas.src = scena.dataset.scena;
    remas.title = scena.dataset.pavadinimas;
    remas.setAttribute('tabindex', '-1');
    remas.style.cssText += 'position:absolute;inset:0;opacity:0;transition:opacity .6s';
    remas.addEventListener('load', () => {
      setTimeout(() => { remas.style.opacity = '1'; pranesk(); }, 400);
    });
    scena.appendChild(remas);
  }, { rootMargin: '300px' });
  krovejas.observe(scena);

  // Scena prasideda tik tada, kai žmogus jau žiūri, ne anksčiau
  new IntersectionObserver(irasai => {
    matosi = irasai[0].isIntersecting;
    pranesk();
  }, { threshold: 0.35 }).observe(scena);
});

// ---- Robotukai: vienas šablonas, kiekvienas gauna savo dydį ir šuolio ritmą ----
const sablonas = document.getElementById('robotukas');
document.querySelectorAll('[data-robotukai]').forEach(vieta => {
  const kiek = Number(vieta.dataset.robotukai) || 3;
  const ritmai = [1.02, 0.88, 1.15, 0.95, 1.24];
  const dydziai = [1, 0.72, 0.9, 0.64, 0.82];
  for (let i = 0; i < kiek; i++) {
    const bot = sablonas.content.firstElementChild.cloneNode(true);
    bot.style.setProperty('--trukme', ritmai[i % ritmai.length] + 's');
    bot.style.setProperty('--vel', (i * 0.23) + 's');
    if (!vieta.classList.contains('robotukai--mazi')) {
      bot.style.setProperty('--w', Math.round(52 * dydziai[i % dydziai.length]) + 'px');
    }
    vieta.appendChild(bot);
  }
});

// ---- Visa atsiliepimo žinutė atsidaro lange ----
const langas = document.querySelector('.zinute');
if (langas) {
  const vaizdas = langas.querySelector('img');
  document.querySelectorAll('[data-zinute]').forEach(mygtukas => {
    mygtukas.addEventListener('click', () => {
      vaizdas.src = mygtukas.dataset.zinute;
      vaizdas.width = mygtukas.dataset.w;
      vaizdas.height = mygtukas.dataset.h;
      langas.showModal();
      langas.scrollTop = 0;
    });
  });
  langas.querySelector('.zinute__uzdaryti').addEventListener('click', () => langas.close());
  // paspaudus šalia žinutės, langas užsidaro
  langas.addEventListener('click', e => { if (e.target === langas) langas.close(); });
}

// ---- El. paštas nusikopijuoja, o ne atidaro pašto programą (pas daugelį ji neįjungta) ----
document.querySelectorAll('[data-kopijuoti]').forEach(mygtukas => {
  const tekstas = mygtukas.textContent;
  mygtukas.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(mygtukas.dataset.kopijuoti);
      mygtukas.textContent = 'Nukopijuota ✓';
    } catch {
      // jei naršyklė neleidžia kopijuoti, bent pažymim adresą, kad būtų lengva nusikopijuoti ranka
      window.getSelection().selectAllChildren(mygtukas);
      return;
    }
    setTimeout(() => { mygtukas.textContent = tekstas; }, 2000);
  });
});
