import { groupIsComplete, calculateStandings } from "./standings.js";

export function getClassifiedByGroup(grupos, resultsByMatchId = null) {
  const standingsOpts = resultsByMatchId
    ? { fallbackToPartidoResultado: false }
    : { fallbackToPartidoResultado: true };
  const out = {};
  for (const [gid, grupo] of Object.entries(grupos)) {
    if (!groupIsComplete(grupo, resultsByMatchId, standingsOpts)) continue;
    const standings = calculateStandings(grupo, resultsByMatchId, standingsOpts);
    out[gid] = { first: standings[0], second: standings[1], third: standings[2] };
  }
  return out;
}

function compareTeamsForRanking(a, b) {
  // Higher is better for: pts, dg, gf, fairPlay (when stored as FIFA-style negatives, -1 > -3).
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.dg !== a.dg) return b.dg - a.dg;
  if (b.gf !== a.gf) return b.gf - a.gf;
  const fp = fairPlayScore(b) - fairPlayScore(a);
  if (fp !== 0) return fp;
  // Lower FIFA ranking number is better.
  const rk = fifaRanking(a) - fifaRanking(b);
  if (rk !== 0) return rk;
  return String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""));
}

function fairPlayScore(team) {
  // Higher is better. If you store "fairPlay" as negative points (FIFA style),
  // this still works because -1 > -3.
  const v = team?.fairPlay;
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function fifaRanking(team) {
  // Lower is better. Missing ranking is treated as very low priority.
  const v = team?.fifaRanking;
  return typeof v === "number" && Number.isFinite(v) ? v : Number.POSITIVE_INFINITY;
}

export function getBestThirds(grupos, limit = 8, resultsByMatchId = null) {
  const classified = getClassifiedByGroup(grupos, resultsByMatchId);
  const thirds = Object.entries(classified)
    .map(([gid, g]) => ({ gid, team: g.third }))
    .filter((x) => x.team);

  thirds.sort((a, b) => compareTeamsForRanking(a.team, b.team));

  return thirds.slice(0, limit);
}

function resolveToken(token, classified) {
  // token examples: "1A", "2B"
  const pos = token[0];
  const gid = token.slice(1);
  const g = classified[gid];
  if (!g) return null;
  if (pos === "1") return g.first;
  if (pos === "2") return g.second;
  if (pos === "3") return g.third;
  return null;
}

function rankGroupFinishers(grupos, position, resultsByMatchId = null) {
  // position: "first" | "second" | "third"
  const classified = getClassifiedByGroup(grupos, resultsByMatchId);
  const list = Object.entries(classified)
    .map(([gid, g]) => ({ gid, team: g[position] }))
    .filter((x) => x.team);
  list.sort((a, b) => compareTeamsForRanking(a.team, b.team));
  return list;
}

export function buildDieciseisavos(dieciseisavosTemplate, grupos, resultsByMatchId = null) {
  // Deterministic bracket based on performance ranking (not the full FIFA Annex-C mapping).
  // Seeds:
  // - W1..W12: ranked group winners
  // - R1..R12: ranked runners-up
  // - T1..T8 : ranked best third-placed teams
  const winners = rankGroupFinishers(grupos, "first", resultsByMatchId);
  const runnersUp = rankGroupFinishers(grupos, "second", resultsByMatchId);
  const thirds = getBestThirds(grupos, 8, resultsByMatchId).map((x) => ({ ...x }));

  const seeds = [];
  for (let i = 0; i < 8; i += 1) {
    seeds.push({
      local: winners[i]?.team?.id ?? null,
      visitante: thirds[7 - i]?.team?.id ?? null,
      emparejamiento:
        winners[i] && thirds[7 - i]
          ? `W${i + 1} (${winners[i].gid}1) vs T${8 - i} (${thirds[7 - i].gid}3)`
          : `W${i + 1} vs T${8 - i}`,
    });
  }

  for (let i = 0; i < 4; i += 1) {
    seeds.push({
      local: winners[8 + i]?.team?.id ?? null,
      visitante: runnersUp[11 - i]?.team?.id ?? null,
      emparejamiento:
        winners[8 + i] && runnersUp[11 - i]
          ? `W${9 + i} (${winners[8 + i].gid}1) vs R${12 - i} (${runnersUp[11 - i].gid}2)`
          : `W${9 + i} vs R${12 - i}`,
    });
  }

  for (let i = 0; i < 4; i += 1) {
    seeds.push({
      local: runnersUp[i]?.team?.id ?? null,
      visitante: runnersUp[7 - i]?.team?.id ?? null,
      emparejamiento:
        runnersUp[i] && runnersUp[7 - i]
          ? `R${i + 1} (${runnersUp[i].gid}2) vs R${8 - i} (${runnersUp[7 - i].gid}2)`
          : `R${i + 1} vs R${8 - i}`,
    });
  }

  return dieciseisavosTemplate.map((m, idx) => {
    const s = seeds[idx] ?? { local: null, visitante: null, emparejamiento: m.emparejamiento };
    return {
      ...m,
      local: s.local,
      visitante: s.visitante,
      emparejamiento: s.emparejamiento ?? m.emparejamiento,
    };
  });
}

export function buildOctavos(octavosTemplate, grupos) {
  const classified = getClassifiedByGroup(grupos);
  return octavosTemplate.map((m) => {
    const [a, b] = String(m.emparejamiento).split("vs").map((s) => s.trim());
    const localTeam = resolveToken(a, classified);
    const awayTeam = resolveToken(b, classified);
    return {
      ...m,
      local: localTeam?.id ?? null,
      visitante: awayTeam?.id ?? null,
    };
  });
}

export function winnerId(match) {
  if (
    match?.resultado?.local == null ||
    match?.resultado?.visitante == null ||
    match.local == null ||
    match.visitante == null
  )
    return null;
  if (match.resultado.local > match.resultado.visitante) return match.local;
  if (match.resultado.local < match.resultado.visitante) return match.visitante;
  return null;
}

export function advanceRound(nextTemplate, previousMatches, pairingKey) {
  // pairingKey is like "08-O1 vs 08-O2"
  const map = new Map(previousMatches.map((m) => [m.id, winnerId(m)]));
  return nextTemplate.map((m) => {
    const [a, b] = String(m.emparejamiento).split("vs").map((s) => s.trim());
    if (!a || !b) return m;
    const local = map.get(a) ?? null;
    const visitante = map.get(b) ?? null;
    return { ...m, local, visitante };
  });
}
