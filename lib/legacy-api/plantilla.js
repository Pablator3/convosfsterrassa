const { fcfFetch } = require("./fcf-fetch");

const FCF_CLUB_ID = "6569";

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
      return res.status(502).json({ error: "La FCF no ha pogut carregar la plantilla" });
    }

    const payload = await response.json();
    const players = payload?.data?.players;
    if (!Array.isArray(players)) {
      return res.status(502).json({ error: "La resposta de plantilla de la FCF no té el format esperat" });
    }

    const jugadors = players
      .map((player) => String(player?.NOMBRE || "").trim())
      .filter((name) => name && !/^JUGADOR(?:\/A)?$/i.test(name));
    return res.status(200).json({ jugadors });
  } catch {
    return res.status(502).json({ error: "No s'ha pogut consultar la plantilla a la FCF" });
  }
};