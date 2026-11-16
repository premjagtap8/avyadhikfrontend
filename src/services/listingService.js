const API_URL = import.meta.env.VITE_API_URL;

export async function submitListing(data) {
  const res = await fetch(`${API_URL}/listing-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new Error(body?.message || "We could not save the submission. Please try again.");
  }
  return body;
}