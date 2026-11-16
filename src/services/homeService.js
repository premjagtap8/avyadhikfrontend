const API_URL = import.meta.env.VITE_API_URL;

// Browse filter names -> backend query param names
export async function fetchHomes(filters, signal) {
  const { city, care, stay, room, rating, facilities = [], page, limit } = filters;

  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (care) params.set("serviceModel", care);
  if (stay) params.set("lengthOfStay", stay);
  if (room) params.set("roomType", room);
  if (rating) params.set("minRating", rating);
  facilities.forEach((f) => params.append("facilities", f));
  params.set("page", page);
  params.set("limit", limit);

  const res = await fetch(`${API_URL}/homes?${params.toString()}`, { signal });
  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new Error(body?.message || "Could not load homes. Please try again.");
  }
  return body; // { success, count, total, page, pages, data: { homes } }
}