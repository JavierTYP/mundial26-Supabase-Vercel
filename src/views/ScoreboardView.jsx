import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import { apiScoreboard } from "../utils/api.js";

export default function ScoreboardView({ grupos }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void apiScoreboard(null)
      .then((r) => {
        if (!cancelled) setData(r);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight">Puntuaciones</h2>
        <p className="text-sm text-slate-300">
          0 pts si no acierta ganador; 1 pt si acierta ganador/empate; 4 pts si acierta marcador exacto.
        </p>
      </div>

      <Card className="p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-300">Partidos</div>
        <div className="mt-2 text-xs text-slate-400">
          {loading ? "Cargando..." : `Partidos con resultado real: ${data?.playedMatches ?? 0}`}
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs font-black uppercase tracking-wide text-slate-300">
                <th className="px-4 py-3">Id</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Nick</th>
                <th className="px-4 py-3 text-center">ACERTADOS (CON RESULTADO)</th>
                <th className="px-4 py-3 text-center">ACERTADOS (SIN RESULTADO)</th>
                <th className="px-4 py-3 text-center">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {(data?.rows ?? []).map((r, idx) => (
                <tr key={r.email} className="border-t border-slate-800">
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-100">{r.email}</td>
                  <td className="px-4 py-3 font-semibold text-slate-100">{r.nick ?? "-"}</td>
                  <td className="px-4 py-3 text-center font-black text-slate-100">{r.exactHits}</td>
                  <td className="px-4 py-3 text-center font-black text-slate-100">{r.outcomeHits}</td>
                  <td className="px-4 py-3 text-center font-black text-blue-200">{r.points}</td>
                </tr>
              ))}
              {!loading && !(data?.rows?.length) ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-300" colSpan={6}>
                    No hay datos (aún no hay resultados reales o no hay usuarios).
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
