// Filter options for the Browse page (FR-30 to FR-35).
// Keep these in sync with the backend seed data and validation.

export const LOCATION_OPTIONS = [
  { value: "", label: "All locations" },
  { value: "gurgaon", label: "Gurgaon" },
  { value: "gurgaon-and-delhi-ncr", label: "Gurgaon & Delhi NCR" },
  { value: "mumbai", label: "Mumbai" },
  { value: "dehradun", label: "Dehradun" },
  { value: "chennai", label: "Chennai" },
  { value: "pune", label: "Pune" },
  { value: "bengaluru", label: "Bengaluru" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "coimbatore", label: "Coimbatore" },
  { value: "kochi", label: "Kochi" },
  { value: "kolkata", label: "Kolkata" },
  { value: "bhiwadi", label: "Bhiwadi" },
  { value: "jaipur", label: "Jaipur" },
  { value: "chandigarh-tricity", label: "Chandigarh Tricity" },
];

export const CARE_OPTIONS = [
  { value: "", label: "All types of care" },
  { value: "assisted-living", label: "Assisted living" },
  { value: "independent-living", label: "Independent living" },
  { value: "luxury-senior-living", label: "Luxury senior living" },
  { value: "dementia-care", label: "Dementia care" },
  { value: "post-operative-care", label: "Post-operative care" },
  { value: "rehabilitation", label: "Rehabilitation" },
];

export const STAY_OPTIONS = [
  { value: "", label: "Any stay" },
  { value: "long-term", label: "Long-term" },
  { value: "short-stay", label: "Short-stay" },
  { value: "respite", label: "Respite" },
];

export const ROOM_OPTIONS = [
  { value: "", label: "Any room" },
  { value: "private suite", label: "Private suite" },
  { value: "companion room", label: "Companion room" },
  { value: "one-bedroom residence", label: "One-bedroom residence" },
  { value: "two-bedroom residence", label: "Two-bedroom residence" },
];

export const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4.0+" },
  { value: "4.5", label: "4.5+" },
];

export const FACILITY_OPTIONS = [
  { value: "Geriatric nutrition", label: "Geriatric nutrition" },
  { value: "24x7 medical assistance", label: "24×7 medical assistance" },
  { value: "Holistic care", label: "Holistic care" },
  { value: "Personal caregivers", label: "Personal caregivers" },
  { value: "Rehabilitation", label: "Rehabilitation" },
  { value: "Dementia care", label: "Dementia care" },
  { value: "Post-operative care", label: "Post-operative care" },
  { value: "Parkinson's care", label: "Parkinson’s care" },
];

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];

// Label lookup for care tags (the cards now use the name from the API,
// but this is harmless to keep)
export const CARE_LABELS = Object.fromEntries(
  CARE_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label])
);

// City grid shown at the bottom of the page (same 14 cities as the filter)
export const CITY_CARDS = [
  { value: "gurgaon", name: "Gurgaon", sub: "Gurugram, Haryana" },
  { value: "gurgaon-and-delhi-ncr", name: "Delhi NCR", sub: "Delhi, Gurgaon, Noida & Faridabad" },
  { value: "mumbai", name: "Mumbai", sub: "Mumbai Metropolitan Region" },
  { value: "dehradun", name: "Dehradun", sub: "Dehradun & Mussoorie foothills" },
  { value: "bengaluru", name: "Bengaluru", sub: "Bengaluru Urban" },
  { value: "pune", name: "Pune", sub: "Pune Metropolitan Region" },
  { value: "chennai", name: "Chennai", sub: "Chennai Metropolitan Area" },
  { value: "coimbatore", name: "Coimbatore", sub: "Coimbatore" },
  { value: "kochi", name: "Kochi", sub: "Kochi Metropolitan Area" },
  { value: "hyderabad", name: "Hyderabad", sub: "Hyderabad Metropolitan Region" },
  { value: "kolkata", name: "Kolkata", sub: "Kolkata Metropolitan Area" },
  { value: "chandigarh-tricity", name: "Chandigarh Tricity", sub: "Chandigarh, Mohali & Panchkula" },
  { value: "bhiwadi", name: "Bhiwadi", sub: "Bhiwadi, Delhi NCR" },
  { value: "jaipur", name: "Jaipur", sub: "Jaipur" },
];

export const POPULAR_LOCATIONS = [
  "gurgaon",
  "mumbai",
  "coimbatore",
  "chennai",
  "pune",
  "bengaluru",
];