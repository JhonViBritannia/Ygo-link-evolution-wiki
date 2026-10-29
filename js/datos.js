/*
  ============================================================
  DATOS DE LA WIKI  —  ¡Este es el archivo que puedes editar!
  ============================================================
  - Los textos van en dos idiomas: es (español) y en (inglés).
  - Para añadir un duelista: escribe su nombre entre comillas
    dentro de la lista "duelistas", separado por comas.
  - Para añadir una carta emblemática: escribe su nombre EN INGLÉS
    exactamente como aparece en el buscador (así se puede abrir su ficha).
  - Guarda el archivo y recarga la página (F5) para ver los cambios.
*/

const SAGAS = [
  {
    nombre: "Yu-Gi-Oh! (Duel Monsters)",
    es: "La serie original: Reino de los Duelistas, Ciudad Batallas y más. Aquí brillan los monstruos Normales, las Fusiones y los Rituales.",
    en: "The original series: Duelist Kingdom, Battle City and more. Normal Monsters, Fusions and Rituals shine here.",
    duelistas: ["Yugi Muto", "Seto Kaiba", "Joey Wheeler", "Mai Valentine", "Maximillion Pegasus", "Bakura", "Marik Ishtar", "Ishizu Ishtar", "Odion", "Weevil Underwood", "Rex Raptor", "Mako Tsunami", "Bandit Keith"],
    cartas: ["Dark Magician", "Blue-Eyes White Dragon", "Red-Eyes B. Dragon", "Dark Magician Girl", "Blue-Eyes Ultimate Dragon", "Relinquished", "Harpie Lady Sisters", "Exodia the Forbidden One"]
  },
  {
    nombre: "Yu-Gi-Oh! GX",
    es: "La Academia de Duelos. Protagonismo de los HÉROES Elementales y las Invocaciones por Fusión.",
    en: "Duel Academy. Elemental HEROes and Fusion Summoning take center stage.",
    duelistas: ["Jaden Yuki", "Chazz Princeton", "Alexis Rhodes", "Zane Truesdale", "Syrus Truesdale", "Bastion Misawa", "Aster Phoenix", "Jesse Anderson", "Yubel"],
    cartas: ["Elemental HERO Neos", "Elemental HERO Flame Wingman", "Cyber End Dragon", "Armed Dragon LV7", "Destiny HERO - Plasma", "Rainbow Dragon", "Yubel"]
  },
  {
    nombre: "Yu-Gi-Oh! 5D's",
    es: "Neo Domino y los Duelos sobre ruedas. Llegan las Invocaciones por Sincronía.",
    en: "Neo Domino and Turbo Duels. Synchro Summoning arrives.",
    duelistas: ["Yusei Fudo", "Jack Atlas", "Crow Hogan", "Akiza Izinski", "Leo", "Luna", "Kalin Kessler", "Rex Goodwin", "Aporia", "Z-ONE"],
    cartas: ["Stardust Dragon", "Red Dragon Archfiend", "Black Rose Dragon", "Black-Winged Dragon", "Ancient Fairy Dragon", "Shooting Star Dragon"]
  },
  {
    nombre: "Yu-Gi-Oh! ZEXAL",
    es: "Yuma y Astral buscan los Números. Llegan las Invocaciones Xyz.",
    en: "Yuma and Astral hunt for the Numbers. Xyz Summoning arrives.",
    duelistas: ["Yuma Tsukumo", "Astral", "Kite Tenjo", "Reginald \"Shark\" Kastle", "Vector", "Dr. Faker"],
    cartas: ["Number 39: Utopia", "Number 62: Galaxy-Eyes Prime Photon Dragon", "Galaxy-Eyes Photon Dragon", "Number 17: Leviathan Dragon", "Number 32: Shark Drake"]
  },
  {
    nombre: "Yu-Gi-Oh! ARC-V",
    es: "Las dimensiones y los Duelos de Acción. Llegan las Invocaciones de Péndulo.",
    en: "Dimensions and Action Duels. Pendulum Summoning arrives.",
    duelistas: ["Yuya Sakaki", "Declan Akaba", "Yuto", "Yugo", "Yuri", "Zarc"],
    cartas: ["Odd-Eyes Pendulum Dragon", "Dark Rebellion Xyz Dragon", "Clear Wing Synchro Dragon", "Starving Venom Fusion Dragon", "Supreme King Z-ARC"]
  },
  {
    nombre: "Yu-Gi-Oh! VRAINS",
    es: "La red LINK VRAINS. Novedad de Link Evolution: llegan las Invocaciones de Enlace (Link).",
    en: "The LINK VRAINS network. New in Link Evolution: Link Summoning arrives.",
    duelistas: ["Playmaker (Yusaku Fujiki)", "Ai", "Soulburner", "Revolver", "Blue Angel", "Ghost Girl", "Go Onizuka"],
    cartas: ["Decode Talker", "Firewall Dragon", "Borreload Dragon", "Salamangreat Heatleo", "Topologic Bomber Dragon"]
  }
];

// A qué serie pertenece cada sobre de la tienda (para agruparlos)
const PACKS_POR_SERIE = {
  "Yu-Gi-Oh!": ["Yugi", "Seto Kaiba", "Joey Wheeler", "Mai Valentine", "Bakura", "Grandpa Muto"],
  "GX": ["Jaden Yuki", "Chazz Princeton", "Alexis Rhodes", "Syrus Truesdale", "Bastion", "Jesse Anderson"],
  "5D's": ["Yusei Fudo", "Jack Atlas", "Crow", "Akiza Izinski", "Leo/Luna", "Tetsu Trudge"],
  "ZEXAL": ["Yuma Tsukumo", "Shark", "Kite Tenjo", "Cathy Katherine", "Quinton"],
  "ARC-V": ["Yuya Sakaki", "Declan Akaba", "Zuzu Boyle", "Shay", "Gong Strong"],
  "VRAINS": ["Playmaker", "Soulburner", "Blue Angel", "Ai", "Varis"]
};

const GUIA = {
  modos: [
    { es: ["Campaña", "Revive los duelos de cada serie. Al ganar un duelo de historia se desbloquea su versión 'Duelo Inverso', donde juegas con el mazo del rival."],
      en: ["Campaign", "Replay the duels of each series. Winning a story duel unlocks its 'Reverse Duel', where you play with the opponent's deck."] },
    { es: ["Desafíos de Duelista", "Duelos contra personajes de todas las series con distintos niveles de dificultad. Buena fuente de Puntos de Duelo (DP) y de cartas."],
      en: ["Duelist Challenges", "Duels against characters from every series at different difficulty levels. A good source of Duel Points (DP) and cards."] },
    { es: ["Tienda de cartas", "Compra sobres con DP. Hay un sobre por personaje (33 en total): mira la sección Packs para ver su contenido."],
      en: ["Card Shop", "Buy packs with DP. There is one pack per character (33 in total): check the Packs section to see their contents."] },
    { es: ["Constructor de mazos", "Crea y guarda tus mazos. Incluye mazos recomendados de los personajes."],
      en: ["Deck Edit", "Build and save your decks. Includes recommended decks from the characters."] },
    { es: ["Battle Packs", "Modos de draft/sellado: construyes un mazo con cartas que abres en el momento (Epic Dawn, War of the Giants…)."],
      en: ["Battle Packs", "Draft/sealed modes: you build a deck from cards you open on the spot (Epic Dawn, War of the Giants…)."] },
    { es: ["Online", "Duelos clasificatorios y casuales contra otros jugadores."],
      en: ["Online", "Ranked and casual duels against other players."] }
  ],
  consejos: [
    { es: "Completa los duelos de historia y sus Duelos Inversos: dan DP y cartas.", en: "Clear story duels and their Reverse Duels: they give DP and cards." },
    { es: "Antes de gastar DP, abre la ficha de la carta que quieres: te dice en qué sobre está y qué duelo la da.", en: "Before spending DP, open the card you want: it tells you which pack has it and which duel drops it." },
    { es: "Si una carta sale como drop de un duelo, repetir ese duelo suele ser más barato que comprar sobres.", en: "If a card drops from a duel, replaying that duel is usually cheaper than buying packs." },
    { es: "Empieza con un mazo recomendado y mejóralo poco a poco con las cartas clave de su arquetipo.", en: "Start with a recommended deck and improve it with its archetype's key cards." },
    { es: "Guarda en Favoritos las cartas que quieras conseguir y úsalo como lista de deseos.", en: "Save the cards you want in Favorites and use it as a wishlist." }
  ],
  glosario: [
    { es: ["DP (Duel Points)", "Moneda del juego para comprar sobres."], en: ["DP (Duel Points)", "In-game currency to buy packs."] },
    { es: ["Sincronía", "Invocación usando un Cantante (Tuner) y otros monstruos cuyos niveles sumen el del monstruo Sincronía."], en: ["Synchro", "Summon using a Tuner and other monsters whose Levels add up to the Synchro Monster's Level."] },
    { es: ["Xyz", "Invocación superponiendo monstruos del mismo nivel. Usa 'materiales Xyz' para activar efectos."], en: ["Xyz", "Summon by overlaying monsters of the same Level. Uses 'Xyz Materials' to activate effects."] },
    { es: ["Péndulo", "Monstruos que pueden ir a las Zonas de Péndulo para invocar varios monstruos a la vez."], en: ["Pendulum", "Monsters that can go to the Pendulum Zones to summon several monsters at once."] },
    { es: ["Link (Enlace)", "Invocación usando monstruos como material según su valor Link. Sus flechas marcan dónde puedes invocar."], en: ["Link", "Summon using monsters as material based on the Link Rating. Its arrows mark where you can summon."] },
    { es: ["Arquetipo", "Familia de cartas que se apoyan entre sí (ej. 'Blue-Eyes', 'Elemental HERO')."], en: ["Archetype", "A family of cards that support each other (e.g. 'Blue-Eyes', 'Elemental HERO')."] }
  ]
};

/*
  PREGUNTAS DEL QUIZ
  Cada respuesta tiene un "valor" que se compara con las características de cada mazo (js/decks.js).
  Valor "" = me da igual (no suma ni resta).
*/
const QUIZ = [
  {
    clave: "serie",
    es: "¿Cuál es tu serie favorita?", en: "What's your favorite series?",
    opciones: [
      { valor: "Yu-Gi-Oh!", es: "Yu-Gi-Oh! (Yugi y Kaiba)", en: "Yu-Gi-Oh! (Yugi and Kaiba)" },
      { valor: "GX", es: "GX (Jaden y la Academia)", en: "GX (Jaden and Duel Academy)" },
      { valor: "5D's", es: "5D's (Yusei y los Duelos en moto)", en: "5D's (Yusei and Turbo Duels)" },
      { valor: "ZEXAL", es: "ZEXAL (Yuma y Astral)", en: "ZEXAL (Yuma and Astral)" },
      { valor: "ARC-V", es: "ARC-V (Yuya y las dimensiones)", en: "ARC-V (Yuya and the dimensions)" },
      { valor: "VRAINS", es: "VRAINS (Playmaker)", en: "VRAINS (Playmaker)" },
      { valor: "", es: "Me da igual", en: "I don't mind" }
    ]
  },
  {
    clave: "invocacion",
    es: "¿Qué tipo de invocación te gusta más?", en: "Which summoning mechanic do you like most?",
    opciones: [
      { valor: "fusion", es: "Fusión", en: "Fusion" },
      { valor: "ritual", es: "Ritual", en: "Ritual" },
      { valor: "synchro", es: "Sincronía", en: "Synchro" },
      { valor: "xyz", es: "Xyz", en: "Xyz" },
      { valor: "pendulum", es: "Péndulo", en: "Pendulum" },
      { valor: "link", es: "Link (Enlace)", en: "Link" },
      { valor: "none", es: "Ninguna: monstruos clásicos y poco Extra Deck", en: "None: classic monsters and little Extra Deck" }
    ]
  },
  {
    clave: "estilo",
    es: "¿Cómo te gusta ganar?", en: "How do you like to win?",
    opciones: [
      { valor: "aggro", es: "Atacando fuerte desde el principio", en: "Attacking hard from the start" },
      { valor: "control", es: "Con trampas y respuestas: que el rival no pueda jugar", en: "With traps and answers: shut the opponent down" },
      { valor: "combo", es: "Con combos largos que llenan el campo", en: "With long combos that fill the field" }
    ]
  },
  {
    clave: "raza",
    es: "¿Qué tipo de monstruo prefieres?", en: "Which monster type do you prefer?",
    opciones: [
      { valor: "Dragon", es: "Dragones", en: "Dragons" },
      { valor: "Spellcaster", es: "Lanzadores de Conjuros", en: "Spellcasters" },
      { valor: "Warrior", es: "Guerreros", en: "Warriors" },
      { valor: "Machine", es: "Máquinas", en: "Machines" },
      { valor: "Fiend", es: "Demonios y Zombis", en: "Fiends and Zombies" },
      { valor: "Beast", es: "Bestias y Bestias Aladas", en: "Beasts and Winged Beasts" },
      { valor: "", es: "Me da igual", en: "I don't mind" }
    ]
  },
  {
    clave: "dificultad",
    es: "¿Cuánta experiencia tienes?", en: "How experienced are you?",
    opciones: [
      { valor: "facil", es: "Estoy empezando: algo sencillo", en: "I'm just starting: something simple" },
      { valor: "medio", es: "Me defiendo", en: "I know my way around" },
      { valor: "dificil", es: "Mucha: quiero un reto", en: "A lot: give me a challenge" }
    ]
  }
];