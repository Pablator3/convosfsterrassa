const FCF_CLUB_ID = "6569";
const FCF_URL = `https://www.fcf.cat/api/clubs/${FCF_CLUB_ID}`;

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Mètode no permès" });
  }

  try {
    const response = await fetch(FCF_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "FutbolSalaTerrassaConvocatories/1.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: "La FCF no ha pogut carregar els equips" });
    }

    const payload = await response.json();
    if (!Array.isArray(payload?.data?.teams)) {
      return res.status(502).json({ error: "La resposta de la FCF no té el format esperat" });
    }

    const equips = payload.data.teams
      .filter((team) => /futbol\s+sala/i.test(String(team.categoria_nombre || "")))
      .map((team) => {
        const id = String(team.codequipo || "").trim();
        const nom = String(team.nombre_equipo || "").trim();
        const lletra = String(team.letra_equipo || "").trim();
        const categoria = String(team.categoria_nombre || "").trim();
        if (!id || !nom || !categoria) return null;

        const nomEquip = lletra ? `${nom} "${lletra}"` : nom;
        return {
          id,
          etiqueta: `${categoria}${lletra ? ` · ${lletra}` : ""}`,
          nom: nomEquip,
          lletra,
          categoria,
        };
      })
      .filter(Boolean);

    if (!equips.length) {
      return res.status(502).json({ error: "La FCF no ha retornat equips de futbol sala" });
    }

    return res.status(200).json({ equips });
  } catch {
    return res.status(502).json({ error: "No s'ha pogut consultar la FCF" });
  }
};
