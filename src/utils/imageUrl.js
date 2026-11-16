// VITE_API_URL ends in /api, uploaded images live on the server root.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

export function imageUrl(path) {
  if (!path) return "";
  if (/^(https?:|data:)/.test(path)) return path; // picsum links stay as they are
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}