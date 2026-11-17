// Demo data shown when the backend fails or returns nothing.
// Only used when VITE_USE_DUMMY_DATA=true. Remove before going live.

const img = (seed) => `https://picsum.photos/seed/${seed}/800/600`;

const CITIES = {
  gurgaon: { name: "Gurgaon", slug: "gurgaon" },
  mumbai: { name: "Mumbai", slug: "mumbai" },
  pune: { name: "Pune", slug: "pune" },
  bengaluru: { name: "Bengaluru", slug: "bengaluru" },
  chennai: { name: "Chennai", slug: "chennai" },
  coimbatore: { name: "Coimbatore", slug: "coimbatore" },
};

const CARE = {
  assisted: { name: "Assisted Living", slug: "assisted-living" },
  dementia: { name: "Dementia Care", slug: "dementia-care" },
  independent: { name: "Independent Living", slug: "independent-living" },
  postHospital: { name: "Post-Hospital Care", slug: "post-hospital-care" },
  luxury: { name: "Luxury Living", slug: "luxury" },
};

export const DUMMY_HOMES = [
  {
    _id: "dummy-1",
    slug: "serene-gardens-gurgaon",
    name: "Serene Gardens Senior Living",
    city: CITIES.gurgaon,
    area: "Sector 56",
    serviceModels: [CARE.assisted, CARE.dementia],
    rentPerMonth: 65000,
    averageRating: 4.7,
    reviewCount: 48,
    images: [img("avya1")],
    description: "Calm, garden-facing community with round-the-clock nursing and a dedicated memory-care wing.",
  },
  {
    _id: "dummy-2",
    slug: "sunrise-elder-care-mumbai",
    name: "Sunrise Elder Care",
    city: CITIES.mumbai,
    area: "Powai",
    serviceModels: [CARE.assisted, CARE.independent],
    rentPerMonth: 85000,
    averageRating: 4.5,
    reviewCount: 62,
    images: [img("avya2")],
    description: "Premium lakeside residence with spacious private rooms and daily wellness activities.",
  },
  {
    _id: "dummy-3",
    slug: "green-valley-pune",
    name: "Green Valley Senior Home",
    city: CITIES.pune,
    area: "Baner",
    serviceModels: [CARE.assisted, CARE.postHospital],
    rentPerMonth: 48000,
    averageRating: 4.3,
    reviewCount: 31,
    images: [img("avya3")],
    description: "Warm, family-style home with strong rehabilitation support after hospital stays.",
  },
  {
    _id: "dummy-4",
    slug: "lotus-care-bengaluru",
    name: "Lotus Care Residences",
    city: CITIES.bengaluru,
    area: "Whitefield",
    serviceModels: [CARE.dementia, CARE.assisted],
    rentPerMonth: 72000,
    averageRating: 4.8,
    reviewCount: 55,
    images: [img("avya4")],
    description: "Specialised dementia care with trained caregivers and a secure, calming environment.",
  },
  {
    _id: "dummy-5",
    slug: "coastal-comfort-chennai",
    name: "Coastal Comfort Living",
    city: CITIES.chennai,
    area: "ECR",
    serviceModels: [CARE.independent, CARE.assisted],
    rentPerMonth: 42000,
    averageRating: 4.2,
    reviewCount: 24,
    images: [img("avya5")],
    description: "Relaxed seaside community for active seniors who want independence with support nearby.",
  },
  {
    _id: "dummy-6",
    slug: "heritage-homes-coimbatore",
    name: "Heritage Senior Homes",
    city: CITIES.coimbatore,
    area: "RS Puram",
    serviceModels: [CARE.assisted, CARE.postHospital],
    rentPerMonth: 35000,
    averageRating: 4.4,
    reviewCount: 19,
    images: [img("avya6")],
    description: "Affordable, well-run home in a quiet neighbourhood with experienced nursing staff.",
  },
  {
    _id: "dummy-7",
    slug: "evergreen-luxury-gurgaon",
    name: "Evergreen Luxury Residences",
    city: CITIES.gurgaon,
    area: "Golf Course Road",
    serviceModels: [CARE.luxury, CARE.independent],
    rentPerMonth: 140000,
    averageRating: 4.9,
    reviewCount: 40,
    images: [img("avya7")],
    description: "Luxury senior living with suite-style rooms, concierge service and an on-site wellness spa.",
  },
  {
    _id: "dummy-8",
    slug: "tranquil-nest-pune",
    name: "Tranquil Nest",
    city: CITIES.pune,
    area: "Kothrud",
    serviceModels: [CARE.dementia, CARE.assisted],
    rentPerMonth: 55000,
    averageRating: 4.6,
    reviewCount: 37,
    images: [img("avya8")],
    description: "Small, personal-care setting with a low caregiver-to-resident ratio.",
  },
];

// Mimics the API: filters, paginates and returns the same response shape.
// Only city, care and rating are filtered; stay/room/facilities are ignored.
export function getDummyResponse(filters = {}, page = 1, limit = 12) {
  const { city, care, rating } = filters;

  const list = DUMMY_HOMES.filter((h) => {
    if (city && h.city.slug !== city) return false;
    if (care && !h.serviceModels.some((s) => s.slug === care)) return false;
    if (rating && h.averageRating < Number(rating)) return false;
    return true;
  });

  const start = (page - 1) * limit;
  return {
    data: { homes: list.slice(start, start + limit) },
    total: list.length,
    pages: Math.max(1, Math.ceil(list.length / limit)),
  };
}

// ---------- Details page (/homes/:slug) ----------

const COORDS = {
  gurgaon: [77.0266, 28.4595], // [lng, lat]
  mumbai: [72.9051, 19.1176],
  pune: [73.8567, 18.5204],
  bengaluru: [77.5946, 12.9716],
  chennai: [80.2707, 13.0827],
  coimbatore: [76.9558, 11.0168],
};

const AMENITIES = [
  { name: "Landscaped garden", category: "lifestyle" },
  { name: "Daily yoga & exercise", category: "lifestyle" },
  { name: "Library & reading room", category: "lifestyle" },
  { name: "Home-style vegetarian meals", category: "lifestyle" },
  { name: "Housekeeping & laundry", category: "lifestyle" },
  { name: "Festival celebrations", category: "community" },
  { name: "Group outings & satsang", category: "community" },
  { name: "Family visiting lounge", category: "community" },
  { name: "Games & music evenings", category: "community" },
];

const MEDICAL_FACILITIES = [
  "24x7 trained nursing staff",
  "Doctor visits & on-call support",
  "Physiotherapy room",
  "Emergency ambulance tie-up",
  "Medication management",
  "Vitals monitoring",
];

// Full home object for the details page, built from the card data above.
export function getDummyHome(slug) {
  const base = DUMMY_HOMES.find((h) => h.slug === slug);
  if (!base) return null;

  const i = DUMMY_HOMES.indexOf(base);
  return {
    ...base,
    address: `${base.area}, ${base.city.name}`,
    location: { coordinates: COORDS[base.city.slug] },
    buyPrice: base.rentPerMonth * 180,
    scores: {
      lifestyle: 8 + (i % 2),
      medical: 7 + (i % 3),
      services: 8,
      community: 7 + (i % 2),
    },
    facilities: MEDICAL_FACILITIES,
    amenities: AMENITIES,
    roomTypes: ["private", "shared"],
    lengthOfStay: ["short-term", "long-term"],
  };
}

// ---------- Booking page (/booking/:slug) ----------

// Care-type dropdown options, same shape as the backend's service models.
export const DUMMY_CARE_TYPES = Object.values(CARE).map((c) => ({
  _id: c.slug,
  name: c.name,
  slug: c.slug,
}));