import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { parseCsv } from "../utils/csv.js";
import { apiGetMyGoleadores, apiPutMyGoleadores } from "../utils/api.js";
import { loadGoleadores, saveGoleadores } from "../utils/goleadoresStorage.js";
import goleadoresCsv from "../../data/goleadores.csv?raw";

const selectBase =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-blue-500/30";

function normalizePicks(picks) {
  const base = Array.isArray(picks) ? picks : [];
  return [0, 1, 2].map((idx) => ({
    team: String(base[idx]?.team ?? ""),
    player: String(base[idx]?.player ?? ""),
  }));
}

export default function GoleadoresView({ userEmail }) {
  const { teamsByGroup, playersByTeam } = useMemo(() => {
    const rows = parseCsv(goleadoresCsv);
    const byGroup = new Map();
    const players = new Map();

    rows.forEach((r) => {
      const grupo = String(r.grupo ?? "").trim();
      const equipo = String(r.equipo ?? "").trim();
      const jugador = String(r.jugador ?? "").trim();
      if (!equipo || !jugador) return;
      const groupKey = grupo || "Otros";
      if (!byGroup.has(groupKey)) byGroup.set(groupKey, new Set());
      byGroup.get(groupKey).add(equipo);
      if (!players.has(equipo)) players.set(equipo, new Set());
      players.get(equipo).add(jugador);
    });

    const teamsByGroupObj = {};
    [...byGroup.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .forEach(([group, set]) => {
        teamsByGroupObj[group] = [...set].sort((a, b) => a.localeCompare(b, "es"));
      });

    const playersByTeamObj = {};
    [...players.entries()].forEach(([team, set]) => {
      playersByTeamObj[team] = [...set].sort((a, b) => a.localeCompare(b, "es"));
    });

    return { teamsByGroup: teamsByGroupObj, playersByTeam: playersByTeamObj };
  }, []);

  const [picks, setPicks] = useState(() => normalizePicks([]));
  const skipSaveRef = useRef(true);
  const lastSavedRef = useRef(JSON.stringify(normalizePicks([])));
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error" | null

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userEmail) {
        skipSaveRef.current = true;
        setPicks(normalizePicks([]));
        lastSavedRef.current = JSON.stringify(normalizePicks([]));
        return;
      }
      try {
        const r = await apiGetMyGoleadores();
        if (cancelled) return;
        const normalized = normalizePicks(r?.picks ?? []);
        skipSaveRef.current = true;
        setPicks(normalized);
        lastSavedRef.current = JSON.stringify(normalized);
        setSaveStatus(null);
      } catch {
        // Fallback: local storage (useful in dev/offline).
        const loaded = loadGoleadores(userEmail);
        if (cancelled) return;
        const normalized = normalizePicks(loaded.picks);
        skipSaveRef.current = true;
        setPicks(normalized);
        lastSavedRef.current = JSON.stringify(normalized);
        setSaveStatus(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    setSaveStatus(null);
  }, [picks]);

  const isDirty = useMemo(() => {
    return JSON.stringify(normalizePicks(picks)) !== lastSavedRef.current;
  }, [picks]);

  async function handleSave() {
    if (!userEmail) return;
    if (!isDirty) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const normalized = normalizePicks(picks);
      await apiPutMyGoleadores(normalized);
      lastSavedRef.current = JSON.stringify(normalized);
      setSaveStatus("saved");
      // Keep a local fallback copy too.
      saveGoleadores(userEmail, normalized);
    } catch {
      setSaveStatus("error");
      // Fallback to local storage if backend is unavailable.
      saveGoleadores(userEmail, picks);
    } finally {
      setIsSaving(false);
    }
  }

  const updatePick = (idx, next) => {
    setPicks((prev) => {
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], ...next };
      return copy;
    });
  };

  const pickRows = [
    { label: "1er goleador", idx: 0 },
    { label: "2do goleador", idx: 1 },
    { label: "3er goleador", idx: 2 },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-tight">Goleadores</h2>
            <p className="text-sm text-slate-300">Elige tus 3 goleadores (equipo + jugador).</p>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === "saved" ? (
              <div className="text-xs font-semibold text-emerald-300">Guardado</div>
            ) : saveStatus === "error" ? (
              <div className="text-xs font-semibold text-rose-300">No se pudo guardar</div>
            ) : isDirty ? (
              <div className="text-xs font-semibold text-amber-300">Cambios sin guardar</div>
            ) : (
              <div className="text-xs font-semibold text-slate-400">Sin cambios</div>
            )}
            <Button variant="secondary" onClick={handleSave} disabled={!isDirty || isSaving || !userEmail}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-6">
          {pickRows.map(({ label, idx }) => {
            const current = picks[idx] ?? { team: "", player: "" };
            const players = current.team ? playersByTeam[current.team] ?? [] : [];
            return (
              <div key={label} className="grid gap-3">
                <div className="text-sm font-black tracking-tight text-slate-100">{label}</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Equipo
                    </span>
                    <select
                      className={selectBase}
                      value={current.team}
                      onChange={(e) => {
                        const team = e.target.value;
                        const allowed = team ? playersByTeam[team] ?? [] : [];
                        const nextPlayer = allowed.includes(current.player) ? current.player : "";
                        updatePick(idx, { team, player: nextPlayer });
                      }}
                    >
                      <option value="">Selecciona equipo</option>
                      {Object.entries(teamsByGroup).map(([group, teams]) => (
                        <optgroup key={group} label={group}>
                          {teams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Jugador
                    </span>
                    <select
                      className={selectBase}
                      value={current.player}
                      onChange={(e) => updatePick(idx, { player: e.target.value })}
                      disabled={!current.team}
                    >
                      <option value="">
                        {current.team ? "Selecciona jugador" : "Selecciona un equipo primero"}
                      </option>
                      {players.map((player) => (
                        <option key={player} value={player}>
                          {player}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
