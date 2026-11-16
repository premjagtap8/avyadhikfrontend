export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi NCR", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

// value = what is sent to the backend (SRS section 4.8), label = what the visitor sees
export const LOOKING_FOR = [
  { value: "parent", label: "My mother or father" },
  { value: "spouse", label: "My spouse" },
  { value: "self", label: "Myself" },
  { value: "relative or friend", label: "A relative or friend" },
];

export const MONTHLY_BUDGET = [
  { value: "still exploring", label: "Still exploring" },
  { value: "under 75000", label: "Under Rs. 75,000" },
  { value: "75000-125000", label: "Rs. 75,000 to 1.25 lakh" },
  { value: "125000-200000", label: "Rs. 1.25 to 2 lakh" },
  { value: "above 200000", label: "Above Rs. 2 lakh" },
];