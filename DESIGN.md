# Design

Pasaulis: **Darbo stalas iš viršaus** (stiliaus kodas W5, `references/stiliaus-kodai/README.md`).
Visa svetainė yra vienas gilios žalios veltinio stalas, matomas iš viršaus. Tema viena (tamsi), skyriai nekeičia fono.
Spalvos ir šriftai iš `context/stilius.md`; jei kas prieštarauja, galioja stilius.md.

## Medžiagos

- **Stalas:** `media/stalas/veltinis.webp` (besikartojanti tekstūra) ant `#1a3429`. Pirmame ekrane `kilimelis.webp` su langų šviesa kairėje.
- **Daiktai:** tikros nuotraukos iš viršaus, iškirptos (`kompiuteris`, `telefonas`, `knygele`, `puodelis`, `sakele`). Šešėlis visada į dešinę apačią (šviesa iš kairės): `drop-shadow(14px 18px 18px rgba(4,14,9,.55))`.
- **Popierius:** kremas `#efe6dd`, juodas tekstas, kampai 3 px, lengvas pasukimas (nuo −3° iki 3°). Ant popieriaus dedami darbai, atsiliepimai, moduliai, vizitinė kortelė.
- **Ekranai:** kompiuterio ir telefono ekranuose rodomas tikras turinys (terminalas, reels video), ne paveikslėlis.
- **Robotukai:** oranžinis Claude Code robotukas (`media/robotukas/`: kūnas + 4 kojos). Vaikšto kojomis, šokinėja. Jie yra „komanda“.

## Spalvos

| Žetonas | Hex | Vaidmuo |
|---|---|---|
| `--stalas` | `#1a3429` | fonas, 70 % |
| `--sage` | `#5a6e5c` | linijos, brūkšniai, antriniai blokai |
| `--oranz` | `#e88a5e` | tik akcentas: mygtukas, skaičius, vienas žodis, varnelė |
| `--kremas` | `#efe6dd` | popierius ir tekstas ant žalios |
| `--juoda` | `#0e0d0d` | tekstas ant kremo |
| `--taupe` | `#a1866f` | smulkūs parašai ant popieriaus |

## Šriftai

- Bebas Neue: antraštės, didžiosiomis, `line-height: 1`, vienas antraštės blokas skyriui.
- Poppins 400/600: tekstas.
- Newsreader Italic: citatos ir „ranka rašyti“ užrašai knygelėje; citatos su 3 px sage brūkšniu kairėje.
- Terminalas: sistemos monospace (Consolas), tik ekrano viduje.

## Formos

Mygtukai pilnai apvalūs (pill). Popierius 3 px. Daiktai yra nuotraukos (be rėmelių). Kitokių kampų nėra.

## Judesys

Viena kalba: daiktai juda kaip ant stalo (pakyla, pasislenka, numetami), robotukai vaikšto. Lengvėjanti kreivė `cubic-bezier(.16,1,.3,1)`.
Daiktus galima tempti. `prefers-reduced-motion`: viskas stovi galutinėje būsenoje.

## Parašas

`DEIMANTE_LIVING` apačioje centre, Poppins didžiosiomis, opacity 0,7.
