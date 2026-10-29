/*
  Lógica de la wiki. No hace falta tocar este archivo para añadir
  contenido: para eso están js/datos.js, js/mazos.js y js/textos.js.
  js/obtencion.js y js/decks.js se generan automáticamente.
*/

const API = "https://db.ygoprodeck.com/api/v7/";
const IMAGEN_PEQUENA = "https://images.ygoprodeck.com/images/cards_small/";
const POR_PAGINA = 60;
// Link Evolution salió en 2019-2020: las cartas posteriores no están en el juego.
const FECHA_LIMITE = "2020-03-31";

const $ = (selector) => document.querySelector(selector);
const cartasCargadas = new Map(); // id -> carta de la API, para no volver a pedirla

// Evita que un texto se interprete como HTML
const escapar = (texto) => String(texto ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ================= Idioma ================= */

let idioma = "es";
try { idioma = localStorage.getItem("idioma") || "es"; } catch { }

// t("clave", {n: 3}) -> texto en el idioma actual, con {n} sustituido
function t(clave, valores = {}) {
  const texto = TEXTOS[idioma][clave] ?? TEXTOS.es[clave] ?? clave;
  return texto.replace(/\{(\w+)\}/g, (_, k) => valores[k]);
}

function aplicarIdioma() {
  document.documentElement.lang = idioma;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-idioma]").forEach((b) => b.classList.toggle("activo", b.dataset.idioma === idioma));
  pintarSagas();
  pintarGuia();
  pintarPacks();
  pintarDuelos();
  pintarMazos("#lista-meta", META);
  pintarConstructor();
  pintarQuiz();
}

document.querySelectorAll("[data-idioma]").forEach((b) => b.addEventListener("click", () => {
  idioma = b.dataset.idioma;
  try { localStorage.setItem("idioma", idioma); } catch { }
  aplicarIdioma();
}));

/* ================= Datos del juego (js/obtencion.js) ================= */

// Cada fila: [id, nombre, pack, esRara, duelo, battlePack, tipo]
const LE_POR_ID = new Map();
const LE_POR_NOMBRE = new Map();
LE_CARTAS.forEach((fila) => {
  if (fila[0]) LE_POR_ID.set(fila[0], fila);
  LE_POR_NOMBRE.set(fila[1].toLowerCase(), fila);
});
const filaDelJuego = (carta) => LE_POR_ID.get(carta.id) || LE_POR_NOMBRE.get(carta.name.toLowerCase());

/* ================= Navegación entre secciones ================= */

function mostrarSeccion() {
  const id = location.hash.slice(1) || "inicio";
  document.querySelectorAll(".pagina").forEach((p) => p.classList.toggle("activa", p.id === id));
  document.querySelectorAll(".menu a").forEach((a) => a.classList.toggle("activo", a.hash === "#" + id));
  if ($("#detalle").open) $("#detalle").close();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", mostrarSeccion);

/* ================= Peticiones a la API ================= */

async function pedirCartas(parametros) {
  const respuesta = await fetch(API + "cardinfo.php?" + new URLSearchParams(parametros));
  if (respuesta.status === 400) return { data: [], meta: { total_rows: 0 } }; // sin resultados
  if (!respuesta.ok) throw new Error("La API respondió " + respuesta.status);
  const json = await respuesta.json();
  json.data.forEach((c) => cartasCargadas.set(c.id, c));
  json.meta ??= { total_rows: json.data.length };
  return json;
}

async function cargarArquetipos() {
  try {
    const lista = await (await fetch(API + "archetypes.php")).json();
    $("#lista-arquetipos").innerHTML = lista
      .map((a) => `<option value="${escapar(a.archetype_name)}">`).join("");
  } catch { /* si falla, el campo sigue funcionando escribiendo a mano */ }
}

/* ================= Buscador ================= */

let paginaActual = 0;

function parametrosDeBusqueda() {
  const f = new FormData($("#filtros"));
  const p = { num: POR_PAGINA, offset: paginaActual * POR_PAGINA, sort: f.get("orden") };
  if (f.get("nombre").trim()) p.fname = f.get("nombre").trim();
  if (f.get("tipo")) p.type = f.get("tipo");
  if (f.get("atributo")) p.attribute = f.get("atributo");
  if (f.get("arquetipo").trim()) p.archetype = f.get("arquetipo").trim();
  if (f.get("nivel")) {
    // Los monstruos de Enlace no tienen nivel, tienen "valor Link"
    if (f.get("tipo") === "Link Monster") p.link = f.get("nivel");
    else p.level = f.get("nivel");
  }
  if (f.get("soloJuego")) {
    p.startdate = "1999-01-01";
    p.enddate = FECHA_LIMITE;
    p.dateregion = "tcg";
  }
  return p;
}

async function buscar() {
  const estado = $("#estado-busqueda");
  estado.textContent = t("cartas.buscando");
  $("#resultados").innerHTML = "";
  try {
    const { data, meta } = await pedirCartas(parametrosDeBusqueda());
    const total = meta.total_rows;
    const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    estado.textContent = total ? t("cartas.encontradas", { n: total }) : t("cartas.ninguna");
    $("#resultados").innerHTML = data.map(miniatura).join("");
    $("#info-pagina").textContent = total ? t("cartas.pagina", { a: paginaActual + 1, b: paginas }) : "";
    $("#anterior").disabled = paginaActual === 0;
    $("#siguiente").disabled = paginaActual + 1 >= paginas;
  } catch (error) {
    estado.textContent = t("cartas.error");
    console.error(error);
  }
}

function buscarArquetipo(arquetipo) {
  $("#filtros").reset();
  $("#filtros").arquetipo.value = arquetipo;
  location.hash = "cartas";
  paginaActual = 0;
  buscar();
}

// Miniatura de una carta que viene de la API (con sello "En LE" / "No en LE")
function miniatura(carta) {
  const enJuego = Boolean(filaDelJuego(carta));
  return `<button class="carta" data-id="${carta.id}">
    <img src="${carta.card_images[0].image_url_small}" alt="${escapar(carta.name)}" loading="lazy">
    <em class="sello">${t(enJuego ? "sello.enJuego" : "sello.noJuego")}</em>
    <span>${escapar(carta.name)}</span>
  </button>`;
}

// Miniatura de una carta de los datos del juego (no hace falta pedirla a la API)
function miniaturaLocal([id, nombre, , esRara]) {
  const imagen = id
    ? `<img src="${IMAGEN_PEQUENA}${id}.jpg" alt="${escapar(nombre)}" loading="lazy">`
    : `<div class="sin-imagen">${escapar(nombre)}</div>`;
  return `<button class="carta" ${id ? `data-id="${id}"` : `data-carta="${escapar(nombre)}"`}>
    ${imagen}
    ${esRara ? `<em class="sello rara">${t("sello.rara")}</em>` : ""}
    <span>${escapar(nombre)}</span>
  </button>`;
}

$("#filtros").addEventListener("submit", (e) => {
  e.preventDefault();
  paginaActual = 0;
  buscar();
});
$("#anterior").addEventListener("click", () => { paginaActual--; buscar(); window.scrollTo(0, 0); });
$("#siguiente").addEventListener("click", () => { paginaActual++; buscar(); window.scrollTo(0, 0); });

// Búsqueda rápida desde la portada
$("#busqueda-rapida").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#filtros").nombre.value = $("#busqueda-rapida-texto").value;
  location.hash = "cartas";
  paginaActual = 0;
  buscar();
});

// Opciones de nivel 1-13
$("#filtros").nivel.innerHTML += Array.from({ length: 13 }, (_, i) =>
  `<option value="${i + 1}">${i + 1}</option>`).join("");

/* ================= Detalle de una carta ================= */

function obtencionHTML(carta) {
  const fila = filaDelJuego(carta);
  if (!fila) return `<div class="obtencion"><h4>${t("obt.titulo")}</h4><p>${t("obt.noJuego")}</p></div>`;
  const [, , pack, esRara, duelo, battlePack] = fila;
  const formas = [];
  if (pack >= 0) formas.push(t("obt.pack", { p: escapar(LE_PACKS[pack]) }) + (esRara ? t("obt.rara") : ""));
  if (duelo >= 0 && LE_DUELOS[duelo].includes(">")) formas.push(t("obt.duelo", { d: escapar(nombreDuelo(LE_DUELOS[duelo])) }));
  if (battlePack >= 0) formas.push(t("obt.bp", { b: escapar(LE_BATTLE_PACKS[battlePack]) }));
  return `<div class="obtencion"><h4>${t("obt.titulo")}</h4><ul>${formas.map((f) => `<li>${f}</li>`).join("")}</ul></div>`;
}

function abrirDetalle(carta) {
  const esMonstruo = carta.type.includes("Monster");
  const etiquetas = [TEXTOS[idioma]["tipo." + carta.type] || carta.type];
  if (carta.attribute) etiquetas.push(t("attr." + carta.attribute));
  if (carta.race) etiquetas.push(carta.race);
  if (carta.level) etiquetas.push(t(carta.type.includes("XYZ") ? "ficha.rango" : "ficha.nivel") + " " + carta.level);
  if (carta.linkval) etiquetas.push("Link-" + carta.linkval);
  if (carta.scale !== undefined) etiquetas.push(t("ficha.escala") + " " + carta.scale);
  if (esMonstruo) etiquetas.push(`ATK ${carta.atk ?? "?"}` + (carta.linkval ? "" : ` / DEF ${carta.def ?? "?"}`));
  if (carta.archetype) etiquetas.push(t("ficha.arquetipo") + ": " + carta.archetype);
  if (carta.linkmarkers) etiquetas.push(t("ficha.flechas") + ": " + carta.linkmarkers.join(", "));

  const fav = esFavorita(carta.id);
  $("#detalle-contenido").innerHTML = `
    <div class="ficha">
      <img src="${carta.card_images[0].image_url}" alt="${escapar(carta.name)}">
      <div>
        <h3>${escapar(carta.name)}</h3>
        <div class="datos">${etiquetas.map((e) => `<span class="etiqueta">${escapar(e)}</span>`).join("")}</div>
        <div class="texto-carta">${escapar(carta.desc)}</div>
        ${obtencionHTML(carta)}
        <div class="acciones">
          <button id="boton-favorito">${t(fav ? "btn.favQuitar" : "btn.favAdd")}</button>
          ${LE_POR_ID.has(carta.id) ? `<button data-sumar="${carta.id}">${botonMazoTexto(carta.id)}</button>` : ""}
          ${carta.archetype ? `<button data-arquetipo="${escapar(carta.archetype)}">${t("btn.verArquetipo")}</button>` : ""}
          <a href="${carta.ygoprodeck_url}" target="_blank" rel="noopener">${t("btn.masInfo")}</a>
        </div>
      </div>
    </div>
    ${decksHTML(carta)}`;

  $("#boton-favorito").onclick = () => { alternarFavorita(carta); abrirDetalle(carta); };
  if (!$("#detalle").open) $("#detalle").showModal();
}

// Abre una carta por id o por nombre, pidiéndola a la API si hace falta
async function abrirCarta({ id, nombre }, boton) {
  if (!id) id = LE_POR_NOMBRE.get(nombre.toLowerCase())?.[0];
  if (id && cartasCargadas.has(id)) return abrirDetalle(cartasCargadas.get(id));
  const textoOriginal = boton.innerHTML;
  boton.disabled = true;
  if (boton.classList.contains("chip")) boton.textContent = t("cargando");
  try {
    const { data } = await pedirCartas(id ? { id } : { name: nombre });
    if (data.length) abrirDetalle(data[0]);
    else alert(t("error.noEncontrada", { n: nombre }));
  } catch {
    alert(t("error.conexion"));
  } finally {
    boton.disabled = false;
    boton.innerHTML = textoOriginal;
  }
}

// Un solo "escuchador" para todos los botones de cartas y arquetipos de la página
document.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-id], [data-carta], [data-arquetipo]");
  if (!boton) return;
  if (boton.dataset.arquetipo) {
    if ($("#detalle").open) $("#detalle").close();
    return buscarArquetipo(boton.dataset.arquetipo);
  }
  abrirCarta({ id: Number(boton.dataset.id) || 0, nombre: boton.dataset.carta }, boton);
});
$("#cerrar-detalle").addEventListener("click", () => $("#detalle").close());
$("#detalle").addEventListener("click", (e) => { if (e.target.id === "detalle") $("#detalle").close(); });

/* ================= Packs de la tienda ================= */

let packElegido = "";

function pintarPacks() {
  $("#lista-packs").innerHTML = Object.entries(PACKS_POR_SERIE).map(([serie, personajes]) => `
    <div class="grupo">
      <h3>${escapar(serie)}</h3>
      <div class="chips">${personajes.map((p) => {
        const pack = p + " Booster Pack";
        return `<button class="chip ${pack === packElegido ? "activo" : ""}" data-pack="${escapar(pack)}">${escapar(p)}</button>`;
      }).join("")}</div>
    </div>`).join("");
  if (packElegido) pintarContenidoPack();
}

function pintarContenidoPack() {
  const indice = LE_PACKS.indexOf(packElegido);
  const cartas = LE_CARTAS.filter((f) => f[2] === indice)
    .sort((a, b) => b[3] - a[3] || a[1].localeCompare(b[1])); // raras primero
  const raras = cartas.filter((f) => f[3]).length;
  $("#contenido-pack").innerHTML = `
    <div class="grupo">
      <h3>${escapar(packElegido)}</h3>
      <p class="estado">${t("packs.cartas", { n: cartas.length, r: raras })}</p>
      <div class="rejilla">${cartas.map(miniaturaLocal).join("")}</div>
    </div>`;
}

$("#lista-packs").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-pack]");
  if (!chip) return;
  packElegido = chip.dataset.pack;
  pintarPacks();
  $("#contenido-pack").scrollIntoView({ behavior: "smooth" });
});

/* ================= Drops de cada duelo ================= */

const SERIES_DUELOS = { "Yu-Gi-Oh": "Yu-Gi-Oh!", "GX": "GX", "5Ds": "5D's", "Zexal": "ZEXAL", "ARC V": "ARC-V", "VRAINS": "VRAINS" };

// "Challenge>GX>Jaden Yuki" -> "Desafío · Jaden Yuki"
function nombreDuelo(texto) {
  const [modo, , nombre] = texto.split(">");
  return `${t(modo === "Campaign" ? "duelos.campana" : "duelos.desafio")} · ${nombre}`;
}

function pintarDuelos() {
  const porSerie = {};
  LE_DUELOS.forEach((texto, indice) => {
    const serie = texto.split(">")[1];
    if (!SERIES_DUELOS[serie]) return; // descarta entradas mal formadas de los datos
    (porSerie[serie] ??= []).push({ texto, indice, total: LE_CARTAS.filter((f) => f[4] === indice).length });
  });
  $("#lista-duelos").innerHTML = Object.keys(SERIES_DUELOS).filter((s) => porSerie[s]).map((serie) => `
    <div class="grupo">
      <h3>${SERIES_DUELOS[serie]}</h3>
      ${porSerie[serie].sort((a, b) => a.texto.localeCompare(b.texto)).map((d) => `
        <details class="duelo" data-duelo="${d.indice}">
          <summary>${escapar(nombreDuelo(d.texto))} <small>${t("duelos.cartas", { n: d.total })}</small></summary>
          <div class="rejilla"></div>
        </details>`).join("")}
    </div>`).join("");
  filtrarDuelos();
}

// Las cartas de cada duelo se pintan solo al abrirlo, para no cargar cientos de imágenes de golpe
$("#lista-duelos").addEventListener("toggle", (e) => {
  const duelo = e.target;
  const rejilla = duelo.querySelector(".rejilla");
  if (!duelo.open || rejilla.innerHTML) return;
  const indice = Number(duelo.dataset.duelo);
  rejilla.innerHTML = LE_CARTAS.filter((f) => f[4] === indice).map(miniaturaLocal).join("");
}, true);

function filtrarDuelos() {
  const texto = $("#filtro-duelos").value.trim().toLowerCase();
  document.querySelectorAll("#lista-duelos .grupo").forEach((grupo) => {
    let visibles = 0;
    grupo.querySelectorAll("details").forEach((d) => {
      const coincide = d.querySelector("summary").textContent.toLowerCase().includes(texto);
      d.hidden = !coincide;
      visibles += coincide;
    });
    grupo.hidden = visibles === 0;
  });
}
$("#filtro-duelos").addEventListener("input", filtrarDuelos);

/* ================= Avisos rápidos ================= */

function avisar(texto) {
  let caja = $("#toast");
  if (!caja) {
    caja = document.createElement("div");
    caja.id = "toast";
    caja.setAttribute("role", "status");
  }
  // Dentro de la ficha si está abierta (la ficha tapa el resto de la página)
  ($("#detalle").open ? $("#detalle") : document.body).append(caja);
  caja.textContent = texto;
  caja.classList.remove("visible");
  void caja.offsetWidth; // reinicia la animación
  caja.classList.add("visible");
}

/* ================= Mazos de la comunidad (js/decks.js) ================= */

// Cada mazo: [arquetipo, nombre, url, visitas, main [id, copias, …], extra [id, copias, …], serie, invocacion, estilo, tipoMonstruo, dificultad]
const DECKS_POR_CARTA = new Map(); // id -> posiciones de los mazos que la llevan
DECKS.forEach((d, i) => [d[4], d[5]].forEach((pares) => {
  for (let k = 0; k < pares.length; k += 2) {
    if (!DECKS_POR_CARTA.has(pares[k])) DECKS_POR_CARTA.set(pares[k], []);
    DECKS_POR_CARTA.get(pares[k]).push(i);
  }
}));
const totalCartas = (pares) => pares.reduce((suma, v, k) => suma + (k % 2 ? v : 0), 0);

function tarjetaDeck(i, extraHTML = "") {
  const [arquetipo, nombre, url, visitas, main, extra] = DECKS[i];
  return `<div class="deck">
    <img src="${IMAGEN_PEQUENA}${main[0]}.jpg" alt="" loading="lazy">
    <div>
      <b>${escapar(nombre)}</b>
      <small>${escapar(arquetipo)} · ${t("decks.cartas", { m: totalCartas(main), e: totalCartas(extra) })} · ${t("decks.vistas", { n: visitas.toLocaleString() })}</small>
      ${extraHTML}
      <div class="acciones">
        <button data-abrir-deck="${i}">${t("decks.abrir")}</button>
        <a href="https://ygoprodeck.com/deck/${encodeURIComponent(url)}" target="_blank" rel="noopener">YGOPRODeck ↗</a>
      </div>
    </div>
  </div>`;
}

// Hasta 6 mazos que llevan la carta: primero uno por arquetipo (los más vistos), para dar variedad
function decksHTML(carta) {
  const indices = [...(DECKS_POR_CARTA.get(carta.id) || [])].sort((a, b) => DECKS[b][3] - DECKS[a][3]);
  if (!indices.length) return "";
  const arquetipos = new Set();
  const variados = indices.filter((i) => !arquetipos.has(DECKS[i][0]) && arquetipos.add(DECKS[i][0]));
  const elegidos = [...new Set([...variados, ...indices])].slice(0, 6);
  return `<div class="decks-carta">
    <h4>${t("decks.titulo")}</h4>
    <div class="lista-decks">${elegidos.map((i) => tarjetaDeck(i)).join("")}</div>
    <p class="estado">${t("decks.nota")}</p>
  </div>`;
}

// Copia un mazo de la comunidad como mazo nuevo en el constructor
function abrirDeck(i) {
  const [, nombre, , , main, extra] = DECKS[i];
  const cartas = [];
  [[main, false], [extra, true]].forEach(([pares, esExtra]) => {
    for (let k = 0; k < pares.length; k += 2) cartas.push({ id: pares[k], n: pares[k + 1], extra: esExtra });
  });
  mazos.push({ nombre, cartas });
  mazoActual = mazos.length - 1;
  guardarMazos();
  if ($("#detalle").open) $("#detalle").close();
  location.hash = "constructor";
  pintarConstructor();
  avisar(t("decks.abierto", { n: nombre }));
}

document.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-abrir-deck]");
  if (boton) abrirDeck(Number(boton.dataset.abrirDeck));
});

/* ================= Meta (js/mazos.js) ================= */

function pintarMazos(contenedor, lista) {
  $(contenedor).innerHTML = lista.map((m) => {
    const ejemplo = DECKS.findIndex((d) => d[0] === m.arquetipo);
    return `<article class="mazo">
      <div class="mazo-cabecera">
        <h3>${escapar(m.nombre)}</h3>
        <small>${escapar(m.epoca)}</small>
      </div>
      <div class="mazo-cuerpo">
        <h4>${t("mazo.estrategia")}</h4>
        <p>${escapar(m[idioma])}</p>
        <h4>${t("mazo.porque")}</h4>
        <p>${escapar(m.porque[idioma])}</p>
        <h4>${t("mazo.clave")}</h4>
        <div class="chips">${m.cartas.map((c) => `<button class="chip" data-carta="${escapar(c)}">${escapar(c)}</button>`).join("")}</div>
        <div class="acciones">
          <button data-arquetipo="${escapar(m.arquetipo)}">${t("btn.verCartas")}</button>
          ${ejemplo >= 0 ? `<button class="secundario" data-abrir-deck="${ejemplo}">${t("decks.abrir")}</button>` : ""}
        </div>
      </div>
    </article>`;
  }).join("");
}

/* ================= Quiz: ¿qué mazo es para ti? ================= */

let respuestasQuiz = null; // null = portada del quiz; lista = posición de la opción elegida en cada pregunta
const PESOS_QUIZ = { serie: 2, invocacion: 3, estilo: 2, raza: 2, dificultad: 1 };

// Afinidad de 0 a 1 entre las respuestas y las características de un mazo
function afinidad(d) {
  const [, , , , , , serie, invocacion, estilo, raza, dificultad] = d;
  const delMazo = { serie, invocacion, estilo, raza, dificultad };
  let puntos = 0, maximo = 0;
  QUIZ.forEach((pregunta, k) => {
    const valor = pregunta.opciones[respuestasQuiz[k]].valor;
    if (!valor) return; // "me da igual"
    const peso = PESOS_QUIZ[pregunta.clave] || 1;
    maximo += peso;
    if (valor === delMazo[pregunta.clave]) puntos += peso;
  });
  return maximo ? puntos / maximo : 1;
}

function pintarQuiz() {
  const caja = $("#quiz-contenido");
  if (!respuestasQuiz) {
    caja.innerHTML = `<p>${t("quiz.intro")}</p><button data-quiz="empezar">${t("quiz.empezar")}</button>`;
    return;
  }
  const paso = respuestasQuiz.length;
  if (paso < QUIZ.length) {
    const pregunta = QUIZ[paso];
    caja.innerHTML = `
      <p class="estado">${t("quiz.pregunta", { a: paso + 1, b: QUIZ.length })}</p>
      <div class="progreso"><span style="width:${(paso / QUIZ.length) * 100}%"></span></div>
      <h3>${escapar(pregunta[idioma])}</h3>
      <div class="opciones">${pregunta.opciones.map((o, k) =>
        `<button class="opcion" data-quiz="${k}">${escapar(o[idioma])}</button>`).join("")}</div>
      ${paso ? `<button class="secundario" data-quiz="atras">${t("quiz.atras")}</button>` : ""}`;
    return;
  }
  // Los 3 mazos con más afinidad, de arquetipos distintos (a igualdad, el más visto)
  const ranking = DECKS.map((d, i) => ({ i, a: afinidad(d), v: d[3] })).sort((x, y) => y.a - x.a || y.v - x.v);
  const arquetipos = new Set();
  const top = ranking.filter((r) => !arquetipos.has(DECKS[r.i][0]) && arquetipos.add(DECKS[r.i][0])).slice(0, 3);
  caja.innerHTML = `
    <h3>${t("quiz.resultado")}</h3>
    <div class="lista-decks">${top.map((r) =>
      tarjetaDeck(r.i, `<em class="afinidad">${t("quiz.afinidad", { n: Math.round(r.a * 100) })}</em>`)).join("")}</div>
    <button class="secundario" data-quiz="repetir">${t("quiz.repetir")}</button>`;
}

$("#quiz-contenido").addEventListener("click", (e) => {
  const boton = e.target.closest("[data-quiz]");
  if (!boton) return;
  const accion = boton.dataset.quiz;
  if (accion === "empezar" || accion === "repetir") respuestasQuiz = [];
  else if (accion === "atras") respuestasQuiz.pop();
  else respuestasQuiz.push(Number(accion));
  pintarQuiz();
});

/* ================= Constructor de mazos (se guarda en este navegador) ================= */

const leerGuardado = (clave, porDefecto) => {
  try { return JSON.parse(localStorage.getItem(clave)) ?? porDefecto; } catch { return porDefecto; }
};
// Cada mazo: { nombre, cartas: [{ id, n, extra }] }. La colección son los ids de las cartas que tienes.
let mazos = leerGuardado("mazos", []);
let mazoActual = 0;
const coleccion = new Set(leerGuardado("coleccion", []));
let pestana = "buscar";   // "buscar" o "favoritos"
let filtroTipo = "";      // "", "M", "S", "T" o "X"
let ultimaAnadida = 0;    // para animar la carta que acabas de añadir

function guardarMazos() {
  try {
    localStorage.setItem("mazos", JSON.stringify(mazos));
    localStorage.setItem("coleccion", JSON.stringify([...coleccion]));
  } catch { }
}

const tipoDe = (id) => LE_POR_ID.get(id)?.[6] || "M";
const mazo = () => mazos[mazoActual];
const contar = (extra) => mazo().cartas.filter((c) => c.extra === extra).reduce((s, c) => s + c.n, 0);
const copiasEnMazo = (id) => mazo().cartas.find((c) => c.id === id)?.n || 0;
const botonMazoTexto = (id) => copiasEnMazo(id) ? t("btn.anadida", { n: copiasEnMazo(id) }) : t("btn.anadirMazo");

function sumarAlMazo(id, boton) {
  const extra = tipoDe(id) === "X";
  let entrada = mazo().cartas.find((c) => c.id === id);
  if (entrada?.n >= 3) return avisar(t("constructor.max3"));
  if (extra ? contar(true) >= 15 : contar(false) >= 60) {
    return avisar(t(extra ? "constructor.maxExtra" : "constructor.maxMain"));
  }
  if (!entrada) mazo().cartas.push(entrada = { id, n: 0, extra });
  entrada.n++;
  ultimaAnadida = id;
  guardarMazos();
  pintarConstructor();
  if (boton?.closest("dialog")) boton.textContent = botonMazoTexto(id);
}

function quitarDelMazo(id) {
  const entrada = mazo().cartas.find((c) => c.id === id);
  if (!entrada) return;
  entrada.n--;
  if (!entrada.n) mazo().cartas = mazo().cartas.filter((c) => c !== entrada);
  ultimaAnadida = 0;
  guardarMazos();
  pintarConstructor();
}

// Carta dentro del mazo: imagen (abre la ficha), copias y controles − + ✓
function cartaDelMazo({ id, n }) {
  const tengo = coleccion.has(id);
  return `<div class="carta-mazo ${tengo ? "" : "falta"} ${id === ultimaAnadida ? "nueva" : ""}">
    <button class="carta" data-id="${id}"><img src="${IMAGEN_PEQUENA}${id}.jpg" alt="${escapar(LE_POR_ID.get(id)[1])}" loading="lazy"></button>
    <em class="copias">x${n}</em>
    <div class="controles">
      <button class="mini" data-quitar="${id}" aria-label="−1">−</button>
      <button class="mini" data-sumar="${id}" aria-label="+1">+</button>
      <button class="mini tengo ${tengo ? "activo" : ""}" data-tengo="${id}" title="${t("constructor.tengo")}" aria-pressed="${tengo}">✓</button>
    </div>
  </div>`;
}

// Carta en la lista de búsqueda o favoritas: tocarla la añade; ⓘ abre su ficha
function cartaParaAnadir(id) {
  const n = copiasEnMazo(id);
  return `<div class="carta-mazo">
    <button class="carta" data-sumar="${id}" title="${t("btn.anadirMazo")}">
      <img src="${IMAGEN_PEQUENA}${id}.jpg" alt="" loading="lazy">
      <span>${escapar(LE_POR_ID.get(id)[1])}</span>
    </button>
    ${n ? `<em class="copias">x${n}</em>` : ""}
    <button class="mini info" data-id="${id}" aria-label="ⓘ">i</button>
  </div>`;
}

function pintarResultados() {
  $("#panel-buscar").hidden = pestana !== "buscar";
  document.querySelectorAll("[data-pestana]").forEach((b) => b.classList.toggle("activo", b.dataset.pestana === pestana));
  document.querySelectorAll("[data-tipo]").forEach((b) => b.classList.toggle("activo", b.dataset.tipo === filtroTipo));
  let ids = [];
  if (pestana === "favoritos") {
    ids = leerFavoritos().map((c) => c.id).filter((id) => LE_POR_ID.has(id));
    $("#mazo-ayuda").textContent = ids.length ? t("constructor.ayudaFav") : t("favoritos.vacio");
  } else {
    const texto = $("#mazo-buscar").value.trim().toLowerCase();
    if (texto.length >= 2 || filtroTipo) {
      ids = LE_CARTAS.filter((f) => f[0] && (!filtroTipo || f[6] === filtroTipo) && f[1].toLowerCase().includes(texto))
        .slice(0, 60).map((f) => f[0]);
    }
    $("#mazo-ayuda").textContent = t("constructor.ayudaBuscar");
  }
  $("#mazo-resultados").innerHTML = ids.map(cartaParaAnadir).join("");
}

const ORDEN_TIPOS = { M: 0, S: 1, T: 2, X: 3 };

function pintarConstructor() {
  if (!mazos.length) mazos.push({ nombre: t("constructor.sinNombre"), cartas: [] });
  mazoActual = Math.min(mazoActual, mazos.length - 1);
  $("#mazo-elegido").innerHTML = mazos.map((m, i) =>
    `<option value="${i}" ${i === mazoActual ? "selected" : ""}>${escapar(m.nombre)}</option>`).join("");
  $("#mazo-nombre").value = mazo().nombre;

  // Monstruos, luego mágicas, luego trampas; y por nombre
  const ordenadas = [...mazo().cartas].sort((a, b) =>
    ORDEN_TIPOS[tipoDe(a.id)] - ORDEN_TIPOS[tipoDe(b.id)] || LE_POR_ID.get(a.id)[1].localeCompare(LE_POR_ID.get(b.id)[1]));
  const lista = (extra) => ordenadas.filter((c) => c.extra === extra).map(cartaDelMazo).join("")
    || `<p class="estado">${t("constructor.vacio")}</p>`;
  $("#mazo-main").innerHTML = lista(false);
  $("#mazo-extra").innerHTML = lista(true);

  const main = contar(false);
  const porTipo = (tipo) => mazo().cartas.filter((c) => !c.extra && tipoDe(c.id) === tipo).reduce((s, c) => s + c.n, 0);
  $("#cuenta-main").textContent = `${main} / 40–60`;
  $("#cuenta-main").classList.toggle("valido", main >= 40);
  $("#cuenta-extra").textContent = `${contar(true)} / 15`;
  $("#mazo-estadisticas").innerHTML = mazo().cartas.length
    ? `<b>${t("constructor.estadisticas", { m: porTipo("M"), s: porTipo("S"), t: porTipo("T") })}</b><br><small>${t("constructor.ayudaControles")}</small>`
    : "";

  // Lista de compras: cartas que no tienes, agrupadas por sobre (el que más te da, primero)
  const faltan = mazo().cartas.filter((c) => !coleccion.has(c.id)).map((c) => LE_POR_ID.get(c.id));
  const porPack = {};
  faltan.filter((fila) => fila[2] >= 0).forEach((fila) => (porPack[LE_PACKS[fila[2]]] ??= []).push(fila[1]));
  const drops = faltan.filter((fila) => fila[4] >= 0 && LE_DUELOS[fila[4]].includes(">"));
  $("#mazo-faltan").innerHTML = !mazo().cartas.length ? "" : !faltan.length ? `<p>${t("constructor.completo")}</p>` : `
    <ul class="compras">${Object.entries(porPack).sort((a, b) => b[1].length - a[1].length).map(([pack, nombres]) => `
      <li><b>${escapar(pack)}</b> · ${t("constructor.packFaltan", { n: nombres.length })}<br><small>${nombres.map(escapar).join(", ")}</small></li>`).join("")}
    </ul>
    ${drops.length ? `<p><b>${t("constructor.duelos")}</b></p><ul>${drops.map((f) =>
      `<li>${escapar(f[1])} — ${escapar(nombreDuelo(LE_DUELOS[f[4]]))}</li>`).join("")}</ul>` : ""}`;

  pintarResultados();
}

$("#mazo-buscar").addEventListener("input", pintarResultados);

// Botones + − ✓ (también el "Añadir al mazo" de la ficha de cada carta), pestañas y filtros
document.addEventListener("click", (e) => {
  const sumar = e.target.closest("[data-sumar]");
  const quitar = e.target.closest("[data-quitar]");
  const tengo = e.target.closest("[data-tengo]");
  const pestanaBoton = e.target.closest("[data-pestana]");
  const tipoBoton = e.target.closest("[data-tipo]");
  if (sumar) sumarAlMazo(Number(sumar.dataset.sumar), sumar);
  if (quitar) quitarDelMazo(Number(quitar.dataset.quitar));
  if (tengo) {
    const id = Number(tengo.dataset.tengo);
    coleccion.has(id) ? coleccion.delete(id) : coleccion.add(id);
    guardarMazos();
    pintarConstructor();
  }
  if (pestanaBoton) { pestana = pestanaBoton.dataset.pestana; pintarResultados(); }
  if (tipoBoton) { filtroTipo = tipoBoton.dataset.tipo; pintarResultados(); }
});

$("#mazo-elegido").addEventListener("change", (e) => {
  mazoActual = Number(e.target.value);
  $("#mazo-mano-resultado").innerHTML = "";
  pintarConstructor();
});
$("#mazo-nombre").addEventListener("change", (e) => {
  mazo().nombre = e.target.value.trim() || t("constructor.sinNombre");
  guardarMazos();
  pintarConstructor();
});
$("#mazo-nuevo").addEventListener("click", () => {
  mazos.push({ nombre: `${t("constructor.sinNombre")} ${mazos.length + 1}`, cartas: [] });
  mazoActual = mazos.length - 1;
  $("#mazo-mano-resultado").innerHTML = "";
  guardarMazos();
  pintarConstructor();
});
$("#mazo-borrar").addEventListener("click", () => {
  if (!confirm(t("constructor.confirmarBorrar", { n: mazo().nombre }))) return;
  mazos.splice(mazoActual, 1);
  mazoActual = 0;
  $("#mazo-mano-resultado").innerHTML = "";
  guardarMazos();
  pintarConstructor();
});

// Mano de prueba: baraja el Main Deck y roba 5
$("#mazo-mano").addEventListener("click", () => {
  const baraja = mazo().cartas.filter((c) => !c.extra).flatMap((c) => Array(c.n).fill(c.id));
  if (baraja.length < 5) return avisar(t("constructor.manoVacia"));
  for (let i = baraja.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
  }
  $("#mazo-mano-resultado").innerHTML = `<h3>${t("constructor.manoTitulo")}</h3>
    <div class="rejilla rejilla-mini mano">${baraja.slice(0, 5).map((id) =>
      `<button class="carta" data-id="${id}"><img src="${IMAGEN_PEQUENA}${id}.jpg" alt="${escapar(LE_POR_ID.get(id)[1])}"></button>`).join("")}</div>`;
  $("#mazo-mano-resultado").scrollIntoView({ behavior: "smooth", block: "nearest" });
});

/* ================= Favoritos (se guardan en este navegador) ================= */

function leerFavoritos() {
  try { return JSON.parse(localStorage.getItem("favoritos")) || []; }
  catch { return []; }
}
const esFavorita = (id) => leerFavoritos().some((c) => c.id === id);

function alternarFavorita(carta) {
  let favs = leerFavoritos();
  if (esFavorita(carta.id)) favs = favs.filter((c) => c.id !== carta.id);
  else {
    const { card_sets, card_prices, ...ligera } = carta; // no guardamos precios ni sets
    favs.push(ligera);
  }
  try { localStorage.setItem("favoritos", JSON.stringify(favs)); } catch { }
  if (pestana === "favoritos") pintarResultados();
}

/* ================= Sagas y guía (js/datos.js) ================= */

function pintarSagas() {
  $("#lista-sagas").innerHTML = SAGAS.map((s) => `
    <article class="saga">
      <h3>${escapar(s.nombre)}</h3>
      <p>${escapar(s[idioma])}</p>
      <h4>${t("sagas.duelistas")}</h4>
      <div class="chips">${s.duelistas.map((d) => `<span class="chip">${escapar(d)}</span>`).join("")}</div>
      <h4>${t("sagas.cartas")}</h4>
      <div class="chips">${s.cartas.map((c) => `<button class="chip" data-carta="${escapar(c)}">${escapar(c)}</button>`).join("")}</div>
    </article>`).join("");
}

function pintarGuia() {
  const lista = (items) => items.map((i) => `<dt>${escapar(i[idioma][0])}</dt><dd>${escapar(i[idioma][1])}</dd>`).join("");
  $("#contenido-guia").innerHTML = `
    <div class="bloque-guia">
      <h3>${t("guia.modos")}</h3>
      <dl class="glosario">${lista(GUIA.modos)}</dl>
    </div>
    <div class="bloque-guia">
      <h3>${t("guia.consejos")}</h3>
      <ul>${GUIA.consejos.map((c) => `<li>${escapar(c[idioma])}</li>`).join("")}</ul>
    </div>
    <div class="bloque-guia">
      <h3>${t("guia.glosario")}</h3>
      <dl class="glosario">${lista(GUIA.glosario)}</dl>
    </div>`;
}

/* ================= Arranque ================= */

aplicarIdioma();
cargarArquetipos();
mostrarSeccion();
