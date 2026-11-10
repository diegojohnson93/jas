# JAS Peritajes — demo de rediseño

Demo estática del rediseño de [jasperitajes.cl](https://jasperitajes.cl/): home y página de Experiencia.
HTML, CSS y JavaScript puros, sin dependencias ni proceso de build.

## Estructura

```
index.html            Home
experiencia.html      Los nueve proyectos, con ancla por caso
assets/css/site.css   Estilos y animaciones
assets/js/site.js     Cursor que sigue al mouse
assets/img/           Logo (SVG) y fotos
```

## Ver en local

Abrir `index.html` en el navegador, o servir la carpeta:

```
python3 -m http.server 8000
```

## Publicar con GitHub Pages

Settings → Pages → Deploy from a branch → `main` / `(root)`.

## Notas

- Los efectos de scroll usan `animation-timeline` (Chrome y Edge). En otros navegadores el contenido se ve completo, sin esas animaciones.
- Pendiente de contenido: fotos de siete casos, fotos de los tres servicios, correo corporativo y enlaces reales de WhatsApp, LinkedIn y artículo MDPI.
- El formulario de contacto es solo visual; no envía datos.
- El logo es una reconstrucción vectorial a partir de una imagen de baja resolución.
