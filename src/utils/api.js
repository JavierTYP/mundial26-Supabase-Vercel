import { loadSessionSid } from "./authStorage.js";

async function apiFetch(path, options = {}) {
  const sid = loadSessionSid();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(sid ? { "X-Sid": sid } : {}),
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error ?? "request_failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function apiLogin(email, password, nick = null) {
  return apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password, nick }),
  });
}

export function apiLogout() {
  return apiFetch("/api/logout", { method: "POST" });
}

export function apiMe() {
  return apiFetch("/api/me", { method: "GET" });
}

export function apiGetTournamentState() {
  return apiFetch("/api/tournament-state", { method: "GET" });
}

export function apiPutTournamentState(state) {
  return apiFetch("/api/tournament-state", {
    method: "PUT",
    body: JSON.stringify({ state }),
  });
}

export function apiGetMyPredictions() {
  return apiFetch("/api/predictions/me", { method: "GET" });
}

export function apiPutMyPrediction(matchId, local, visitante, winner = null) {
  return apiFetch("/api/predictions/me", {
    method: "PUT",
    body: JSON.stringify({ matchId, local, visitante, winner }),
  });
}

export function apiAdminUsers() {
  return apiFetch("/api/admin/users", { method: "GET" });
}

export function apiAdminDeleteUser(email) {
  return apiFetch(`/api/admin/users/${encodeURIComponent(email)}`, { method: "DELETE" });
}

export function apiAdminClearNonAdminUsers() {
  return apiFetch("/api/admin/users/clear-non-admin", { method: "POST" });
}

export function apiAdminPredictions(email) {
  const qs = new URLSearchParams({ email });
  return apiFetch(`/api/admin/predictions?${qs.toString()}`, { method: "GET" });
}

export function apiAdminPredictionsSummary(groupId) {
  const qs = new URLSearchParams();
  if (groupId) qs.set("groupId", groupId);
  return apiFetch(`/api/admin/predictions/summary?${qs.toString()}`, { method: "GET" });
}

export async function apiAdminExportPredictions() {
  const res = await fetch("/api/admin/predictions/export", { credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const err = new Error(data?.error ?? "request_failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return res.blob();
}

export function apiAdminScoreboard(groupId) {
  const qs = new URLSearchParams();
  if (groupId) qs.set("groupId", groupId);
  return apiFetch(`/api/admin/scoreboard?${qs.toString()}`, { method: "GET" });
}

export function apiScoreboard(groupId) {
  const qs = new URLSearchParams();
  if (groupId) qs.set("groupId", groupId);
  return apiFetch(`/api/scoreboard?${qs.toString()}`, { method: "GET" });
}

export function apiAdminSettings(predictionsLocked) {
  return apiFetch("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ predictionsLocked }),
  });
}
