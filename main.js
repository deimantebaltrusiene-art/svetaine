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
