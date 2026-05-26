import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import SelectMenu from "../components/SelectMenu.jsx";
import { parseCsv } from "../utils/csv.js";
import { apiAdminGetMvpResult, apiAdminPutMvpResult } from "../utils/api.js";
import jugadoresCsv from "../../data/jugadores.csv?raw";

function normalizePick(pick) {
  const row = pick && typeof pick === "object" ? pick : {};
  return {
    team: String(row?.team ?? ""),
    player: String(row?.player ?? ""),
  };
}

function encodeValue(team, player) {
  return JSON.stringify({ team: String(team ?? ""), player: String(player ?? "") });
}

function decodeValue(value) {
  try {
    const obj = JSON.parse(String(value ?? ""));
    return normalizePick(obj);
  } catch {
    return normalizePick(null);
  }
}

export default function AdminMvpResultView({ resultsLocked = false }) {
  const { allOptions } = useMemo(() => {
    const rows = parseCsv(jugadoresCsv);
    const byGroup = new Map();

    rows.forEach((r) => {
      const grupo = String(r.grupo ?? "").trim();
      const equipo = String(r.equipo ?? "").trim();
      const jugador = String(r.jugador ?? "").trim();
      if (!equipo || !jugador) return;
      const groupKey = grupo || "Otros";
      if (!byGroup.has(groupKey)) byGroup.set(groupKey, []);
      byGroup.get(groupKey).push({ team: equipo, player: jugador });
    });

    const options = [];
    [...byGroup.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .forEach(([group, list]) => {
        const sorted = list.sort((a, b) => {
          const pa = `${a.player} (${a.team})`;
          const pb = `${b.player} (${b.team})`;
          return pa.localeCompare(pb, "es");
        });
        sorted.forEach((p) => {
          options.push({
            value: encodeValue(p.team, p.player),
            label: `${p.player} (${p.team})`,
            group,
          });
        });
      });

    return { allOptions: options };
  }, []);

  const [pick, setPick] = useState(() => normalizePick(null));
  const skipSaveRef = useRef(true);
  const lastSavedRef = useRef(JSON.stringify(normalizePick(null)));
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error" | null

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await apiAdminGetMvpResult();
        if (cancelled) return;
        const normalized = normalizePick(r?.pick ?? null);
        skipSaveRef.current = true;
        setPick(normalized);
        lastSavedRef.current = JSON.stringify(normalized);
        setSaveStatus(null);
      } catch {
        if (cancelled) return;
        const normalized = normalizePick(null);
        skipSaveRef.current = true;
        setPick(normalized);
        lastSavedRef.current = JSON.stringify(normalized);
        setSaveStatus(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    setSaveStatus(null);
  }, [pick]);

  const isDirty = useMemo(() => {
    return JSON.stringify(normalizePick(pick)) !== lastSavedRef.current;
  }, [pick]);

  async function handleSave() {
    if (resultsLocked) return;
    if (!isDirty) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const normalized = normalizePick(pick);
      await apiAdminPutMvpResult(normalized);
      lastSavedRef.current = JSON.stringify(normalized);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-tight">Balón de oro</h2>
            <p className="text-sm text-slate-300">Resultado real (admin).</p>
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
            <Button variant="secondary" onClick={handleSave} disabled={!isDirty || isSaving || resultsLocked}>
              {resultsLocked ? "Bloqueado" : isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-3">
          <SelectMenu
            label="Jugador"
            placeholder="Selecciona jugador"
            value={pick.player ? encodeValue(pick.team, pick.player) : ""}
            disabled={resultsLocked}
            options={allOptions}
            searchable
            onChange={(val) => setPick(decodeValue(val))}
          />
        </div>
      </Card>
    </section>
  );
}
