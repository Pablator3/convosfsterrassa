const { fcfFetch } = require("./fcf-fetch");

const FCF_CLUB_ID = "6569";
const UPCOMING_MATCH_LIMIT = 6;
const CREST_BASE_URL = "https://files.fcf.cat/escudos/clubes/escudos/";

function horaCatalana() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

function escut(fileName) {
  const file = String(fileName || "").trim();
  if (!/^[\w.-]+\.(?:png|jpe?g|webp|svg)$/i.test(file)) return "";
  return CREST_BASE_URL + encodeURIComponent(file);
}

function mapPartit(match, competition) {
  const inici = String(match.COMIENZO1 || "").match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):\d{2}$/);
  const id = String(match.CODACTA || "").trim();
  const local = String(match.NOMBRE_CASA || "").trim();
  const visitant = String(match.NOMBRE_FUERA || "").trim();
  if (!inici || !id || !local || !visitant) return null;

  const latitud = Number(match.LATITUD);
  const longitud = Number(match.LONGITUD);
  const jornada = Number(match.JORNADA);

  return {
    id,
    jornada: Number.isInteger(jornada) && jornada > 0 ? jornada : "",
    data: inici[1],
    hora: inici[2],
    local,
    visitant,
    clubIdLocal: String(match.CODCLUB_CASA || "").trim(),
    equipIdLocal: String(match.CODEQUIPO_CASA || "").trim(),
    clubIdVisitant: String(match.CODCLUB_FUERA || "").trim(),
    equipIdVisitant: String(match.CODEQUIPO_FUERA || "").trim(),
    escudoLocal: escut(match.ESCUDO_CASA),
    escudoVisitant: escut(match.ESCUDO_FUERA),
    pavello: String(match.CAMPO || "").trim(),
    ubicacio: Number.isFinite(latitud) && Number.isFinite(longitud)
      ? `https://maps.google.com/?q=${latitud},${longitud}`
      : "",
    competicio: String(match.NOMBRE_COMPETICION || competition || "").trim(),
    amistos: jornada === 0,
  };
}

function mapEquipacions(kits) {
  if (!Array.isArray(kits)) return [];
  return kits
    .filter((kit) => kit && (kit.PRINCIPAL === "1" || kit.PRINCIPAL === "2"))
    .map((kit) => ({
      nom: kit.PRINCIPAL === "1" ? "Primera" : "Segona",
      samarreta: String(kit.COLOR_CAMISETA1 || kit.COLOR_CAMISETA2 || "").trim(),
      pantalons: String(kit.COLOR_PANTALON1 || kit.COLOR_PANTALON2 || "").trim(),
      mitgetes: String(kit.COLOR_MEDIAS1 || kit.COLOR_MEDIAS2 || "").trim(),
    }))
    .filter((kit) => kit.samarreta);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Mètode no permès" });
  }

  const equip = String(req.query?.equip || "").trim();
  if (!/^\d{1,12}$/.test(equip)) {
    return res.status(400).json({ error: "Cal indicar un identificador d'equip vàlid" });
  }

  try {
    const response = await fcfFetch(`https://www.fcf.cat/api/clubs/${FCF_CLUB_ID}/team/${encodeURIComponent(equip)}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: "La FCF no ha pogut carregar els partits" });
    }

    const payload = await response.json();
    const data = payload?.data;
    if (!Array.isArray(data?.matches)) {
      return res.status(502).json({ error: "La resposta de partits de la FCF no té el format esperat" });
    }

    const competition = String(data.info?.CATEGORIA_EQUIPO || "").trim();
    const ara = horaCatalana();
    const partits = data.matches
      .filter((match) => String(match.COMIENZO1 || "") >= ara)
      .sort((a, b) => String(a.COMIENZO1).localeCompare(String(b.COMIENZO1)))
      .map((match) => mapPartit(match, competition))
      .filter(Boolean)
      .slice(0, UPCOMING_MATCH_LIMIT);

    return res.status(200).json({ partits, equipacions: mapEquipacions(data.kits) });
  } catch {
    return res.status(502).json({ error: "No s'han pogut consultar els partits a la FCF" });
  }
};
