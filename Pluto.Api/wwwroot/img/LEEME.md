# Imágenes de PLUTO

Todas las imágenes de la app viven aquí. No hay ninguna fuera de esta carpeta.

## Dónde dejar una imagen nueva

Suéltala en **`origen/`**, con el nombre que traiga. De ahí sale el azulejo listo para la interfaz,
que se guarda en esta carpeta con el nombre de la marca (`bbva.webp`, `bac.webp`, `wise.webp`).

Los originales se conservan para poder recomponer el azulejo sin volver a pedírtelos.

## Cómo se compone un azulejo de marca

1. Se recorta el rótulo a su caja de contenido (se descartan los márgenes del original).
2. Se centra sobre un cuadrado de 128 px relleno con el color de marca **muestreado de la propia
   imagen**, ocupando el 76 % del ancho.
3. Se guarda como WebP. Pesa ~2,5 KB y se ve nítido en pantallas densas.

El cuadrado va **a sangre**, sin esquinas propias: el redondeo lo pone el azulejo de la interfaz,
así el icono tiene exactamente el mismo radio que todos los demás.

## Qué hay ahora

| Fichero | Para qué |
|---|---|
| `bbva.webp` | Cuentas cuyo nombre contiene «bbva» |
| `bac.webp` | Cuentas cuyo nombre contiene «bac» |
| `wise.webp` | Cuentas cuyo nombre contiene «wise» |
| `icon.svg` | Icono de la PWA (`manifest.json` y `apple-touch-icon`) |

La tabla que asocia nombre → azulejo es `ACCOUNT_MARKS`, en
`js/logica/categories.js`. Añadir un banco es **una línea** en esa tabla más su imagen aquí.
