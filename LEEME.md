# Link Evolution Wiki

Tu wiki personal de *Yu-Gi-Oh! Legacy of the Duelist: Link Evolution*.

## Cómo abrirla

Haz **doble clic en `index.html`**: se abre en tu navegador. No necesitas instalar nada,
solo conexión a internet (las imágenes y el texto de las cartas vienen de YGOPRODeck).

## Secciones

- **Cartas**: buscador con filtros. Cada carta lleva el sello "En LE" o "No en LE". Su ficha dice cómo
  conseguirla y qué **mazos** puedes montar con ella.
- **Packs**: los 33 sobres de la tienda con todas sus cartas (las raras primero).
- **Drops**: qué cartas da cada duelo de campaña y de desafío.
- **Mazos**: constructor visual con solo cartas del juego. Pestañas *Buscar* y *★ Favoritas*, filtros por tipo,
  marca ✓ en las cartas que tienes, mano de prueba y lista de dónde conseguir lo que falta.
- **Quiz**: 5 preguntas y te recomienda 3 mazos que puedes montar enteros en el juego.
- **Meta**: los mazos dominantes del competitivo en 2019–2020 que puedes montar en el juego.
- **Sagas** y **Guía**.
- Botón **ES / EN** arriba a la derecha para cambiar el idioma.

## Qué hay en cada archivo

| Archivo | Para qué sirve | ¿Lo editas tú? |
|---|---|---|
| `index.html` | La estructura de la página (menú, secciones) | A veces |
| `css/estilos.css` | Colores y diseño. Los colores están arriba del todo | Sí, para cambiar el aspecto |
| `js/datos.js` | Sagas, duelistas, guía, glosario y **preguntas del quiz** | **Sí** |
| `js/mazos.js` | Mazos del meta de la época | **Sí** |
| `js/textos.js` | Los textos de botones y menús en español e inglés | Sí |
| `js/obtencion.js` | Dónde conseguir cada carta (generado automáticamente, 10.000 cartas) | No |
| `js/decks.js` | Mazos de la comunidad jugables en el juego (generado automáticamente) | No |
| `js/app.js` | La lógica: buscador, fichas, constructor, quiz, idioma | Mejor pídeselo a Claude |

## Cómo añadir contenido

Abre el archivo con el Bloc de notas (o mejor, con [VS Code](https://code.visualstudio.com/), gratis).
Los textos van en dos idiomas: `es` y `en`. Guarda y pulsa **F5** en el navegador para ver el cambio.

Las cartas deben escribirse **en inglés**, igual que salen en el juego.

## Cosas a tener en cuenta

- Los datos de packs y drops vienen de la lista comunitaria de [YGOPRODeck](https://ygoprodeck.com/lod/)
  (thecardhub.net). Pueden tener algún error o estar incompletos, sobre todo los drops.
- Los mazos recomendados son listas publicadas por usuarios de [YGOPRODeck](https://ygoprodeck.com/deck-search/)
  (las más vistas de cada arquetipo) en las que **todas** las cartas están en el juego. No son mazos oficiales.
  Las características del quiz (serie, estilo, dificultad…) se calculan automáticamente a partir de sus cartas.
- El texto de las cartas solo está en inglés (la base de datos gratuita no tiene español).
- No existe un ranking oficial del modo online del juego: la sección Meta usa el competitivo real de 2019–2020.
- Los **favoritos**, los **mazos**, tu colección y el idioma se guardan en tu navegador.
  Si borras los datos del navegador o cambias de navegador, se pierden.
- El constructor aplica los límites básicos (40–60 Main, 15 Extra, 3 copias), pero no la lista de cartas prohibidas del juego.
