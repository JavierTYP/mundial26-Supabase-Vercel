import { useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import bannerImg from "../assets/mundial2026-typsa_16x9.png";
import {
  DEFAULT_PASSWORD,
  isAllowedEmail,
  normalizeEmail,
  saveSessionSid,
} from "../utils/authStorage.js";
import { apiLogin } from "../utils/api.js";

export default function LoginView({ onLoggedIn, notify }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nick, setNick] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("login"); // login | register

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    let shouldResetModeToLogin = false;
    try {
      if (!normalizedEmail) {
        notify({ tone: "error", message: "Introduce un email." });
        return;
      }
      if (!isAllowedEmail(normalizedEmail)) {
        notify({ tone: "error", message: "Solo se permiten emails @typsa.es" });
        return;
      }
      if (mode === "register" && !nick.trim()) {
        notify({ tone: "error", message: "Introduce un nick." });
        return;
      }
      if (password !== DEFAULT_PASSWORD) {
        notify({ tone: "error", message: "Contraseña incorrecta." });
        return;
      }

      let res;
      try {
        res = await apiLogin(
          normalizedEmail,
          password,
          mode === "register" ? nick.trim() : null,
        );
      } catch (err) {
        const apiError = err?.data?.error ?? err?.message ?? "request_failed";
        if (apiError === "user_not_registered") {
          notify({ tone: "info", message: "Usuario no registrado" });
          setMode("register");
          return;
        }
        if (apiError === "invalid_password") {
          notify({ tone: "error", message: "Contraseña incorrecta." });
          return;
        }
        if (apiError === "invalid_email") {
          notify({ tone: "error", message: "Email inválido." });
          return;
        }
        notify({ tone: "error", message: "No se pudo iniciar sesión." });
        return;
      }

      if (mode === "register") {
        if (res.status === "created") {
          notify({ tone: "success", message: "Usuario registrado correctamente" });
        } else {
          notify({ tone: "info", message: "Usuario existente" });
        }
      } else if (res.status === "created") {
        notify({ tone: "success", message: "Usuario registrado correctamente" });
      }
      if (res?.sid) saveSessionSid(res.sid);
      onLoggedIn(res.user);
      shouldResetModeToLogin = true;
    } finally {
      setSubmitting(false);
      if (shouldResetModeToLogin) setMode("login");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
            <img
              src={bannerImg}
              alt="Mundial 2026 TYPSA"
              className="mx-auto h-auto max-h-[32vh] w-full object-contain"
              loading="eager"
            />
          </div>

          <Card className="w-full p-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              Acceso de usuarios
            </h1>

            {false ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
                <img
                  src={bannerImg}
                  alt="Mundial 2026 TYPSA"
                  className="mx-auto h-auto max-h-48 w-full object-contain"
                  loading="eager"
                />
              </div>
            ) : null}

            <p className="mt-3 text-sm text-slate-300">
              Email @typsa.es y contraseña{" "}
              <span className="font-mono">'mundial2026'</span>
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-300">
                  USER
                </div>
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none ring-1 ring-black/5 placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  type="email"
                  autoComplete="username"
                  placeholder="nombre@typsa.es"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="block">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-300">
                  PASSWORD
                </div>
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none ring-1 ring-black/5 placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  type="password"
                  autoComplete="current-password"
                  placeholder="mundial2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {mode === "register" ? (
                <label className="block">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    NICK
                  </div>
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none ring-1 ring-black/5 placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                    type="text"
                    autoComplete="nickname"
                    placeholder="Nombre jugador/equipo"
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                  />
                </label>
              ) : null}

              <div className="grid gap-2">
                {mode === "login" ? (
                  <>
                    <Button className="w-full" disabled={submitting} type="submit">
                      Entrar
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      disabled={submitting}
                      type="button"
                      onClick={() => setMode("register")}
                    >
                      Crear nuevo usuario
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full" disabled={submitting} type="submit">
                      Crear nuevo usuario
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      disabled={submitting}
                      type="button"
                      onClick={() => setMode("login")}
                    >
                      Volver
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs text-slate-500">
            © 2026 Jobiyo · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
