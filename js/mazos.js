/*
  MAZOS DEL META DE LA ÉPOCA
  - "arquetipo": nombre exacto que usa el buscador (para el botón "Ver todas sus cartas").
  - "cartas": nombres EN INGLÉS tal como aparecen en el juego.
  - Textos en dos idiomas: es / en.
*/

const META = [
  {
    nombre: "Orcust", arquetipo: "Orcust", epoca: "2019 – 2020",
    es: "Monstruos OSCURIDAD que se activan desde el cementerio para encadenar Invocaciones de Enlace. El combo típico termina con Knightmare Unicorn, Longirsu y Galatea, the Orcust Automaton protegiendo el campo e interrumpiendo al rival.",
    en: "DARK monsters that activate from the Graveyard to chain Link Summons. The typical combo ends with Knightmare Unicorn, Longirsu and Galatea, the Orcust Automaton protecting the board and interrupting the opponent.",
    porque: { es: "Fue el mazo más jugado de principios de 2020: un solo monstruo de la mano bastaba para montar un campo con varias interrupciones.", en: "It was the most played deck in early 2020: a single monster in hand was enough to build a board with several interruptions." },
    cartas: ["Orcust Harp Horror", "Orcust Knightmare", "Orcust Cymbal Skeleton", "Orcustrated Return", "Orcustrated Babel", "Galatea, the Orcust Automaton", "Longirsu, the Orcust Orchestrator", "Knightmare Unicorn"]
  },
  {
    nombre: "Sky Striker", arquetipo: "Sky Striker", epoca: "2018 – 2020",
    es: "Un solo monstruo principal (Raye) y casi todo mágicas rápidas. Con la Zona de Monstruos Principal vacía, las mágicas Sky Striker roban, destruyen y destierran. Raye se transforma en Kagari, Shizuku o Hayate según lo que necesites.",
    en: "A single main monster (Raye) and almost all quick spells. With your Main Monster Zone empty, Sky Striker spells draw, destroy and banish. Raye turns into Kagari, Shizuku or Hayate depending on what you need.",
    porque: { es: "Muy consistente y difícil de agotar: siempre tenía respuestas y robo extra con Engage!", en: "Very consistent and hard to grind out: always had answers and extra draws with Engage!" },
    cartas: ["Sky Striker Ace - Raye", "Sky Striker Mobilize - Engage!", "Sky Striker Mecha - Hornet Drones", "Sky Striker Mecha - Widow Anchor", "Sky Striker Mecha Modules - Multirole", "Sky Striker Airspace - Area Zero", "Sky Striker Ace - Kagari", "Sky Striker Ace - Shizuku"]
  },
  {
    nombre: "Thunder Dragon", arquetipo: "Thunder Dragon", epoca: "2019 – 2020",
    es: "Monstruos Trueno que activan efectos al descartarse o desterrarse. Se buscan y reciclan sin parar, y acaban en Thunder Dragon Colossus (bloquea que el rival añada cartas a su mano) o Thunder Dragon Titan.",
    en: "Thunder monsters that trigger when discarded or banished. They search and recycle each other nonstop, ending in Thunder Dragon Colossus (stops the opponent adding cards to hand) or Thunder Dragon Titan.",
    porque: { es: "Su jefe Colossus anulaba la búsqueda de cartas, que es el motor de casi todos los mazos rivales.", en: "Its boss Colossus shut off searching, which is the engine of almost every opposing deck." },
    cartas: ["Thunder Dragondark", "Thunder Dragonhawk", "Thunder Dragonroar", "Thunder Dragonmatrix", "Batteryman Micro-Cell", "Thunder Dragon Fusion", "Thunder Dragon Colossus", "Thunder Dragon Titan"]
  },
  {
    nombre: "Salamangreat", arquetipo: "Salamangreat", epoca: "2019",
    es: "Mazo Ciberso de FUEGO de Soulburner. Su gracia es la 'Reencarnación': invocar un monstruo Link usando una copia de sí mismo como material para activar efectos extra. Heatleo y Sunlight Wolf se reciclan y destruyen cartas.",
    en: "Soulburner's FIRE Cyberse deck. Its gimmick is 'Reincarnation': Link Summoning a monster using a copy of itself as material for extra effects. Heatleo and Sunlight Wolf recycle each other and destroy cards.",
    porque: { es: "Muy resistente: podía volver a montar su campo turno tras turno aunque se lo destruyeran.", en: "Very resilient: it could rebuild its board turn after turn even after being wiped." },
    cartas: ["Salamangreat Gazelle", "Salamangreat Spinny", "Salamangreat Foxy", "Salamangreat Circle", "Salamangreat Sanctuary", "Salamangreat Almiraj", "Salamangreat Heatleo", "Salamangreat Sunlight Wolf"]
  },
  {
    nombre: "Dragon Link", arquetipo: "Guardragon", epoca: "2018 – 2019",
    es: "Mezcla de dragones Rokket, Guardragon y Chaos Dragon Levianeer para hacer combos largos de Enlace. Termina con Borreload Savage Dragon y varias negaciones, normalmente en el primer turno.",
    en: "A mix of Rokket, Guardragon and Chaos Dragon Levianeer dragons for long Link combos. Ends with Borreload Savage Dragon and several negations, usually on turn one.",
    porque: { es: "Montaba campos casi imposibles de romper en el primer turno.", en: "It built nearly unbreakable boards on turn one." },
    cartas: ["Rokket Tracer", "Absorouter Dragon", "Guardragon Elpy", "Guardragon Pisty", "World Legacy Guardragon", "Chaos Dragon Levianeer", "Striker Dragon", "Borreload Savage Dragon"]
  },
  {
    nombre: "Danger!", arquetipo: "Danger!", epoca: "2019",
    es: "Monstruos 'críptidos' que, al revelarlos, hacen que el rival descarte una carta al azar de tu mano: si sale otra, se invoca sola. Se combinaban con Dark World, que gana ventaja cuando sus monstruos se descartan.",
    en: "'Cryptid' monsters that, when revealed, make the opponent discard a random card from your hand: if it's another one, it summons itself. Paired with Dark World, which gains advantage when its monsters are discarded.",
    porque: { es: "Daba ventaja de cartas en cada descarte y era muy rápido montando jugadas.", en: "It gained card advantage on every discard and set up plays very fast." },
    cartas: ["Danger! Bigfoot!", "Danger! Chupacabra!", "Danger! Nessie!", "Danger! Thunderbird!", "Danger!? Jackalope?", "Danger! Mothman!", "Snoww, Unlight of Dark World", "Grapha, Dragon Lord of Dark World"]
  },
  {
    nombre: "Invoked", arquetipo: "Invoked", epoca: "2019 – 2020",
    es: "Aleister the Invoker y Invocation fusionan usando monstruos de cualquier campo o cementerio. Invoked Mechaba niega cartas y Invoked Caliga limita al rival. Solía mezclarse con Shaddoll para fusionar también los monstruos del oponente.",
    en: "Aleister the Invoker and Invocation fuse using monsters from either field or Graveyard. Invoked Mechaba negates cards and Invoked Caliga restricts the opponent. Often mixed with Shaddoll to also fuse away the opponent's monsters.",
    porque: { es: "Su motor de fusión era pequeño y se podía añadir a muchos mazos para quitar monstruos del rival.", en: "Its small fusion engine fit into many decks to remove the opponent's monsters." },
    cartas: ["Aleister the Invoker", "Invocation", "Magical Meltdown", "Invoked Mechaba", "Invoked Caliga", "Invoked Purgatrio", "El Shaddoll Construct", "Shaddoll Dragon"]
  }
];
