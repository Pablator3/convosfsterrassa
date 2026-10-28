const { fcfFetch } = require("./fcf-fetch");

function mapEquipacions(kits) {
  if (!Array.isArray(kits)) return [];
  return kits
    .filter((kit) => kit && (kit.PRINCIPAL === "1" || kit.PRINCIPAL === "2"))
    .map((kit) => ({
      nom: kit.PRINCIPAL === "1" ? "Primera" : "Segona",
      colors: [...new Set([kit.COLOR_CAMISETA1, kit.COLOR_CAMISETA2]
        .map((color) => String(color || "").trim().toUpperCase())
        .filter((color) => /^#[\da-f]{6}$/i.test(color)))],
    }))
    .filter((kit) => kit.colors.length);
}

async function consultaEquipacions(clubId, equipId) {
  const response = await fcfFetch(`https://www.fcf.cat/api/clubs/${clubId}/team/${equipId}`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error("La FCF no ha pogut carregar les equipacions");
  const payload = await response.json();
  return mapEquipacions(payload?.data?.kits);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Mètode no permès" });
  }

  const clubLocal = String(req.query?.clubLocal || "").trim();
  const equipLocal = String(req.query?.equipLocal || "").trim();
  const clubVisitant = String(req.query?.clubVisitant || "").trim();
  const equipVisitant = String(req.query?.equipVisitant || "").trim();
  const ids = [clubLocal, equipLocal, clubVisitant, equipVisitant];
  if (ids.some((id) => !/^\d{1,12}$/.test(id))) {
    return res.status(400).json({ error: "Cal indicar els identificadors vàlids dels dos equips" });
  }

  try {
    const [local, visitant] = await Promise.all([
      consultaEquipacions(clubLocal, equipLocal),
      consultaEquipacions(clubVisitant, equipVisitant),
    ]);

    return res.status(200).json({ equipacions: { local, visitant } });
  } catch {
    return res.status(502).json({ error: "No s'han pogut consultar les equipacions a la FCF" });
  }
};
