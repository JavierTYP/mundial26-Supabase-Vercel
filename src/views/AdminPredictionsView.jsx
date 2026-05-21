import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import GroupTabs from "../components/GroupTabs.jsx";
import MatchRow from "../components/MatchRow.jsx";
import Button from "../components/Button.jsx";
import { apiAdminExportPredictions, apiAdminPredictions, apiAdminPredictionsSummary } from "../utils/api.js";

function allGroupIds(grupos) {
  return Object.keys(grupos ?? {}).sort((a, b) => a.localeCompare(b, "es"));
}

export default function AdminPredictionsView({ grupos, users }) {
  const groupIds = useMemo(() => allGroupIds(grupos), [grupos]);
  const [activeGroup, setActiveGroup] = useState(groupIds[0] ?? "A");
  const [selectedEmail, setSelectedEmail] = useState(users?.[0]?.email ?? "");
  const [predictions, setPredictions] = useState({});
  const [mode, setMode] = useState("user"); // user | summary
  const [summary, setSummary] = useState(null);
  const [summaryStatus, setSummaryStatus] = useState("idle"); // idle | loading | loaded | error

  useEffect(() => {
    if (!groupIds.includes(activeGroup)) setActiveGroup(groupIds[0] ?? "A");
  }, [activeGroup, groupIds]);

  useEffect(() => {
    setSelectedEmail((prev) => {
      if (users?.some((u) => u.email === prev)) return prev;
      return users?.[0]?.email ?? "";
    });
  }, [users]);

  useEffect(() => {
    if (!selectedEmail) {
      setPredictions({});
      return;
    }
    void apiAdminPredictions(selectedEmail)
      .then((r) => setPredictions(r.predictions ?? {}))
      .catch(() => setPredictions({}));
  }, [selectedEmail]);

  useEffect(() => {
    if (mode !== "summary") return;
    setSummaryStatus("loading");
    void apiAdminPredictionsSummary(activeGroup)
      .then((r) => {
        setSummary(r);
        setSummaryStatus("loaded");
      })
      .catch(() => {
        setSummary(null);
        setSummaryStatus("error");
      });
  }, [mode, activeGroup]);

  const grupo = grupos?.[activeGroup] ?? null;
  const byId = useMemo(() => {
    if (!grupo) return new Map();
    return new Map(grupo.equipos.map((e) => [e.id, e]));
  }, [grupo]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight">Pronósticos</h2>
        <p className="text-sm text-slate-300">
          Solo ver: se leen desde el servidor del administrador.
        </p>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:grid-rows-2 md:items-end">
          <label className="block md:col-start-1 md:row-start-1">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Usuario
            </div>
            <select
              disabled={mode !== "user"}
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-black/5 focus:border-blue-500/50 focus:ring-blue-500/20"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
            >
              {users?.length ? (
                users.map((u) => (
                  <option key={u.email} value={u.email}>
                    {u.email}
                  </option>
                ))
              ) : (
                <option value="">(Sin usuarios)</option>
              )}
            </select>
          </label>

          <div className="md:col-start-1 md:col-span-2 md:row-start-2">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Grupo
            </div>
            <div className="mt-1">
              <GroupTabs groupIds={groupIds} active={activeGroup} onChange={setActiveGroup} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:col-start-3 md:row-start-2 md:justify-end">
            <Button
              variant={mode === "user" ? "secondary" : "primary"}
              onClick={() => setMode("user")}
            >
              Por usuario
            </Button>
            <Button
              variant={mode === "summary" ? "secondary" : "primary"}
              onClick={() => setMode("summary")}
            >
              Resumen
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                const blob = await apiAdminExportPredictions();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `pronosticos_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Exportar todos
            </Button>
          </div>
        </div>
      </Card>

      {mode === "user" && grupo ? (
        <Card className="p-4">
          <div className="grid gap-3">
            {grupo.partidos.map((p) => (
              <MatchRow
                key={p.id}
                partido={p}
                equipoLocal={byId.get(p.idLocal)}
                equipoVisitante={byId.get(p.idVisitante)}
                resultado={predictions?.[p.id] ?? null}
                readOnly
                onUpdate={() => {}}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {mode === "summary" ? (
        summaryStatus === "loading" ? (
          <Card className="p-4">
            <div className="text-sm text-slate-300">Cargando resumen…</div>
          </Card>
        ) : summaryStatus === "error" ? (
          <Card className="p-4">
            <div className="text-sm text-slate-300">
              No se pudo cargar el resumen. Revisa que el servidor esté levantado y que el endpoint
              de resumen esté disponible.
            </div>
          </Card>
        ) : summary?.matches?.length ? (
          <Card className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-xs font-black uppercase tracking-wide text-slate-300">
                    <th className="sticky left-0 z-10 bg-slate-950/80 px-3 py-2">Usuario</th>
                    {summary.matches.map((m) => (
                      <th key={m.id} className="whitespace-nowrap border-l border-slate-800 px-3 py-2">
                        {m.localNombre ?? m.idLocal ?? "â€”"} vs {m.visitanteNombre ?? m.idVisitante ?? "â€”"}
                        <div className="text-[11px] font-semibold text-slate-500">{m.id}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.users?.map((u) => (
                    <tr key={u.email} className="border-t border-slate-800">
                      <td className="sticky left-0 z-10 bg-slate-950/80 px-3 py-2 font-semibold text-slate-100">
                        {u.email}
                      </td>
                      {summary.matches.map((m) => {
                        const v = summary.predictionsByUser?.[u.email]?.[m.id];
                        const label =
                          v && v.local != null && v.visitante != null ? `${v.local}-${v.visitante}` : "â€”";
                        return (
                          <td
                            key={`${u.email}:${m.id}`}
                            className="border-l border-slate-800 px-3 py-2 text-center font-black text-slate-100"
                          >
                            {label}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="text-sm text-slate-300">No hay datos para mostrar.</div>
          </Card>
        )
      ) : null}

      {mode === "user" && !grupo ? (
        <div className="text-sm text-slate-300">No hay datos de ese grupo.</div>
      ) : null}
    </section>
  );
}
