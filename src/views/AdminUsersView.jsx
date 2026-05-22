import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { ADMIN_EMAIL } from "../utils/authStorage.js";

export default function AdminUsersView({
  users,
  onDeleteUser,
  onClearNonAdminUsers,
  predictionsLocked,
  onTogglePredictionsLocked,
  resultsLocked,
  onToggleResultsLocked,
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight">Usuarios</h2>
        <p className="text-sm text-slate-300">
          Administración local (se guarda en tu navegador).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={predictionsLocked ? "danger" : "secondary"}
          onClick={() => onTogglePredictionsLocked?.(!predictionsLocked)}
        >
          {predictionsLocked ? "Desbloquear pronósticos" : "Bloquear pronósticos"}
        </Button>
        <Button
          variant={resultsLocked ? "danger" : "secondary"}
          onClick={() => onToggleResultsLocked?.(!resultsLocked)}
        >
          {resultsLocked ? "Desbloquear resultados" : "Bloquear resultados"}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            // eslint-disable-next-line no-alert
            if (!confirm("Â¿Borrar todos los usuarios no-admin?")) return;
            onClearNonAdminUsers();
          }}
        >
          Borrar no-admin
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-2">
          {users.length ? (
            users.map((u) => {
              const isAdmin = u.email === ADMIN_EMAIL || u.role === "admin";
              return (
                <div
                  key={u.email}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">
                      {u.email}
                    </div>
                    {u.nick ? (
                      <div className="truncate text-xs font-semibold text-slate-300">
                        Nick: {u.nick}
                      </div>
                    ) : null}
                    <div className="text-xs text-slate-400">
                      {isAdmin ? "admin" : "user"} Â· creado {u.createdAt ?? "â€”"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      disabled={isAdmin}
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        if (!confirm(`Â¿Borrar usuario ${u.email}?`)) return;
                        onDeleteUser(u.email);
                      }}
                    >
                      Borrar
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-slate-300">No hay usuarios registrados.</div>
          )}
        </div>
      </Card>
    </section>
  );
}
