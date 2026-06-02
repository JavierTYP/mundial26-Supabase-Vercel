import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Flag from "../components/Flag.jsx";
import KnockoutBracket from "../components/KnockoutBracket.jsx";
import { buildPredictedKnockoutTournament } from "../utils/predictedKnockout.js";

function clampGoals(value) {
  if (value === "" || value == null) return null;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(10, n));
}

function buildTeamsIndex(grupos) {
  const map = new Map();
  for (const g of Object.values(grupos ?? {})) {
    for (const e of g?.equipos ?? []) map.set(e.id, e);
  }
  return map;
}

function MatchPredictionCard({
  match,
  teamsById,
  prediction,
  disabled,
  onSave,
  onDraft,
  onPickWinner,
}) {
  const localTeam = match.local ? teamsById.get(match.local) : null;
  const awayTeam = match.visitante ? teamsById.get(match.visitante) : null;

  const [local, setLocal] = useState(prediction?.local ?? "");
  const [visitante, setVisitante] = useState(prediction?.visitante ?? "");
  const [winner, setWinner] = useState(prediction?.winner ?? "");
  const [flash, setFlash] = useState(false);
  const timeoutRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const lastAutoSavedRef = useRef({ local: null, visitante: null });
  const latestRef = useRef({ onSave: null, local: "", visitante: "", winner: "" });

  useEffect(() => {
    setLocal(prediction?.local ?? "");
    setVisitante(prediction?.visitante ?? "");
    setWinner(prediction?.winner ?? "");
    lastAutoSavedRef.current = {
      local: prediction?.local ?? null,
      visitante: prediction?.visitante ?? null,
    };
  }, [match.id, prediction?.local, prediction?.visitante, prediction?.winner]);

  const l = clampGoals(local);
  const v = clampGoals(visitante);
  const canSave = !disabled && localTeam && awayTeam && l != null && v != null;
  const isTie = l != null && v != null && l === v;
  const canPickWinner = isTie && localTeam && awayTeam;
  latestRef.current = { onSave, local, visitante, winner };

  function flashSaved() {
    setFlash(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFlash(false), 450);
  }

  function commitScore(nextLocalRaw, nextVisitanteRaw, nextWinnerRaw = winner, options = {}) {
    if (disabled || !localTeam || !awayTeam || !onSave) return;
    const nextLocal = clampGoals(nextLocalRaw);
    const nextVisitante = clampGoals(nextVisitanteRaw);
    if (nextLocal == null || nextVisitante == null) return;

    const nextWinner = nextLocal === nextVisitante ? nextWinnerRaw || null : null;
    const last = lastAutoSavedRef.current;
    if (last.local === nextLocal && last.visitante === nextVisitante && !options.force) return;

    const run = () => {
      lastAutoSavedRef.current = { local: nextLocal, visitante: nextVisitante };
      onSave(nextLocal, nextVisitante, nextWinner);
      if (options.flash !== false) flashSaved();
    };

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    if (options.immediate) run();
    else autoSaveTimeoutRef.current = setTimeout(run, 550);
  }

  useEffect(() => {
    return () => {
      const latest = latestRef.current;
      const nextLocal = clampGoals(latest.local);
      const nextVisitante = clampGoals(latest.visitante);
      if (!disabled && localTeam && awayTeam && latest.onSave && nextLocal != null && nextVisitante != null) {
        const last = lastAutoSavedRef.current;
        if (last.local !== nextLocal || last.visitante !== nextVisitante) {
          lastAutoSavedRef.current = { local: nextLocal, visitante: nextVisitante };
          latest.onSave(
            nextLocal,
            nextVisitante,
            nextLocal === nextVisitante ? latest.winner || null : null,
          );
        }
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [awayTeam, disabled, localTeam]);

  useEffect(() => {
    if (!onPickWinner) return;
    if (!canPickWinner) return;
    if (!winner) return;
    if (winner !== match.local && winner !== match.visitante) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    lastAutoSavedRef.current = { local: l, visitante: v };
    onPickWinner(winner, l, v);
  }, [canPickWinner, l, match.local, match.visitante, onPickWinner, v, winner]);

  return (
    <Card className={`p-4 ${flash ? "border-emerald-500/40 bg-emerald-500/10" : ""}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-black">{match.id}</div>
        {match.emparejamiento ? <Badge tone="neutral">{match.emparejamiento}</Badge> : null}
      </div>

      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400">Resultado al final de los 90'</div>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-[1fr_auto_1fr] min-[420px]:items-center min-[420px]:gap-3">
          <div className="min-w-0 whitespace-normal break-words leading-snug rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm font-semibold">
            {localTeam ? (
              <>
                <span className="mr-2 inline-flex">
                  <Flag team={localTeam} className="h-4 w-4" />
                </span>
                {localTeam.nombre}
              </>
            ) : (
              <span className="text-slate-500">Por definir</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <input
              disabled={disabled || !localTeam || !awayTeam}
              className="w-14 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-center font-black outline-none ring-blue-500/30 focus:ring-2 disabled:opacity-40"
              type="number"
              min={0}
              max={10}
              value={local}
              onBlur={() => commitScore(local, visitante, winner, { immediate: true, flash: false })}
              onChange={(e) => {
                const next = e.target.value;
                setLocal(next);
                onDraft?.(clampGoals(next), clampGoals(visitante));
                commitScore(next, visitante);
              }}
            />
            <span className="text-slate-500">-</span>
            <input
              disabled={disabled || !localTeam || !awayTeam}
              className="w-14 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-center font-black outline-none ring-blue-500/30 focus:ring-2 disabled:opacity-40"
              type="number"
              min={0}
              max={10}
              value={visitante}
              onBlur={() => commitScore(local, visitante, winner, { immediate: true, flash: false })}
              onChange={(e) => {
                const next = e.target.value;
                setVisitante(next);
                onDraft?.(clampGoals(local), clampGoals(next));
                commitScore(local, next);
              }}
            />
          </div>

          <div className="min-w-0 whitespace-normal break-words leading-snug rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-right text-sm font-semibold">
            {awayTeam ? (
              <>
                {awayTeam.nombre}
                <span className="ml-2 inline-flex">
                  <Flag team={awayTeam} className="h-4 w-4" />
                </span>
              </>
            ) : (
              <span className="text-slate-500">Por definir</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-slate-400">
            {disabled
              ? "Pronósticos bloqueados."
              : isTie
                ? "En caso de empate, elije ganador."
                : "0–10 goles, guardado automático"}
          </div>
        </div>

        {canPickWinner ? (
          <div className="pt-1">
            <label className="mb-1 block text-xs font-semibold text-slate-300">En caso de empate</label>
            <select
              disabled={disabled}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm font-semibold outline-none ring-blue-500/30 focus:ring-2 disabled:opacity-40"
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
            >
              <option value="">Elije ganador</option>
              <option value={match.local}>{localTeam?.nombre ?? String(match.local)}</option>
              <option value={match.visitante}>
                {awayTeam?.nombre ?? String(match.visitante)}
              </option>
            </select>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export default function KnockoutPredictionsView({
  torneo,
  title,
  roundKey,
  matches,
  predictionsByMatchId,
  standingsPredictionsByMatchId = null,
  predictionsLocked,
  onUpdatePrediction,
  onUpdatePredictionDraft,
}) {
  const teamsById = useMemo(() => buildTeamsIndex(torneo?.grupos), [torneo?.grupos]);
  const predictedTorneo = useMemo(() => {
    const merged = standingsPredictionsByMatchId ?? predictionsByMatchId;
    return buildPredictedKnockoutTournament(torneo, merged);
  }, [predictionsByMatchId, standingsPredictionsByMatchId, torneo]);

  const projectedMatches = useMemo(() => {
    if (!predictedTorneo) return matches ?? [];
    if (roundKey === "final")
      return [predictedTorneo.final, predictedTorneo.thirdPlace].filter(Boolean);
    const list = predictedTorneo?.[roundKey];
    return Array.isArray(list) ? list : matches ?? [];
  }, [matches, predictedTorneo, roundKey]);
  const [saveStatus, setSaveStatus] = useState("");
  const currentPredictionsByMatchId = standingsPredictionsByMatchId ?? predictionsByMatchId;
  const showManualSave = roundKey === "dieciseisavos";

  const savableMatches = useMemo(() => {
    return (projectedMatches ?? []).filter((m) => {
      if (!m?.id || !m.local || !m.visitante) return false;
      const row = currentPredictionsByMatchId?.[m.id] ?? null;
      return clampGoals(row?.local) != null && clampGoals(row?.visitante) != null;
    });
  }, [currentPredictionsByMatchId, projectedMatches]);

  useEffect(() => {
    if (!saveStatus) return undefined;
    const t = setTimeout(() => setSaveStatus(""), 2200);
    return () => clearTimeout(t);
  }, [saveStatus]);

  function saveVisiblePredictions() {
    if (predictionsLocked || !onUpdatePrediction) return;
    if (!savableMatches.length) {
      setSaveStatus("Completa algún partido");
      return;
    }

    for (const match of savableMatches) {
      const row = currentPredictionsByMatchId?.[match.id] ?? null;
      const local = clampGoals(row?.local);
      const visitante = clampGoals(row?.visitante);
      if (local == null || visitante == null) continue;
      const winner =
        local === visitante && (row?.winner === match.local || row?.winner === match.visitante)
          ? row.winner
          : null;
      onUpdatePrediction(match.id, local, visitante, winner);
    }

    const count = savableMatches.length;
    setSaveStatus(`${count} partido${count === 1 ? "" : "s"} guardado${count === 1 ? "" : "s"}`);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          <p className="text-sm text-slate-300">
            Pronósticos de {title}. {predictionsLocked ? "Bloqueados por el administrador." : ""}
          </p>
        </div>

        {showManualSave ? (
          <div className="flex flex-col items-start gap-1 md:items-end">
            <Button
              variant="secondary"
              disabled={predictionsLocked || !onUpdatePrediction || savableMatches.length === 0}
              onClick={saveVisiblePredictions}
            >
              Guardar datos
            </Button>
            {saveStatus ? (
              <div className="text-xs font-semibold text-emerald-300">{saveStatus}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(projectedMatches ?? []).map((m) => (
          <MatchPredictionCard
            key={m.id}
            match={m}
            teamsById={teamsById}
            disabled={predictionsLocked}
            prediction={predictionsByMatchId?.[m.id] ?? null}
            onSave={(l, v, winner = null) => onUpdatePrediction?.(m.id, l, v, winner)}
            onDraft={(l, v) => onUpdatePredictionDraft?.(m.id, l, v)}
            onPickWinner={(winner, l, v) => {
              onUpdatePrediction?.(m.id, l, v, winner);
            }}
          />
        ))}
      </div>

      <KnockoutBracket
        torneo={predictedTorneo}
        description="Se rellena automáticamente cuando completas los pronósticos de cada grupo."
      />
    </section>
  );
}
