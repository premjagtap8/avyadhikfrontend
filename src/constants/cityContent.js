// Per-city content for the location page (/assisted-living/:citySlug).
// To add a city, copy one block below and change the text.
// Image: put a file at  public/images/cities/<slug>.jpg  (for example mumbai.jpg)
// or set `image` to a full URL. If the image is missing, a colour block is shown.

export const CITY_CONTENT = {
  pune: {
    region: "Pune Metropolitan Region",
    image:
      "https://images.unsplash.com/photo-1572782252655-9c8771392601?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Hill fort landscape near Pune, India",
    intro:
      "A home advertised for Pune may sit inside the city or in a town further out, such as Talegaon. Check the exact address, and ask whether the offer is independent retirement housing or a care package that starts with an assessment.",
    areas: "Baner, Kharadi and Pimpri-Chinchwad",
    enquiryTitle: "Separate Pune city options from a wider regional move",
    enquiryText:
      "Note whether each home is inside Pune or further away, including an address described as Talegaon. A wider search can make sense, but it changes how relatives visit and attend appointments. Keep housing-led retirement communities apart from care-led stays when you compare offers.",
    guideLabel: "Read: Assisted living in Pune, city access, care and retirement housing",
    faqs: [
      {
        q: "How much do old age homes and assisted living cost in Pune?",
        a: "Ask each home for a dated written quotation covering the room and the care your parent needs. Keep one-time payments, monthly charges and extras on separate lines so homes can be compared fairly. There is no single city-wide price you can rely on.",
      },
      {
        q: "Does a Pune listing necessarily mean a city-centre residence?",
        a: "No. Confirm the full address and work out the real travel time for family and for the doctor. Some homes marketed to Pune families are a long drive away.",
      },
      {
        q: "Can I compare apartment maintenance with assisted living fees?",
        a: "Not directly. Apartment maintenance pays for the building, while assisted living fees also cover daily help and nursing. Ask for the care charges and the exclusions before you compare the two.",
      },
    ],
  },

  mumbai: {
    region: "Mumbai Metropolitan Region",
    image: "/images/cities/mumbai.jpg", // save a Mumbai photo here (public/images/cities/mumbai.jpg)
    imageAlt: "Gateway of India, Mumbai",
    intro:
      "A Mumbai search can include homes across a very wide metropolitan area. Verify the exact address, test the journey for your family and confirm the care available at that branch. A Mumbai label does not promise an easy trip or equal services.",
    areas: "Thane, Navi Mumbai and the western suburbs",
    enquiryTitle: "Separate Mumbai city options from the wider region",
    enquiryText:
      "Note whether each home is inside Mumbai, in Thane or in Navi Mumbai. Travel times in this region change a lot with traffic, so test the journey at the hour your family would actually travel.",
    guideLabel: "Read: Assisted living in Mumbai, choosing a practical care location",
    faqs: [
      {
        q: "How much do old age homes and assisted living cost in Mumbai?",
        a: "Request a dated written quotation for the exact room and the care your parent needs. Keep the deposit, the monthly fee and anything billed extra on separate lines.",
      },
      {
        q: "Does a Mumbai listing mean the home is within Mumbai city?",
        a: "Not always. The listing can cover the wider metropolitan region. Check the full address and the travel time from your family and your doctor.",
      },
      {
        q: "Are Thane or Navi Mumbai always cheaper?",
        a: "Not necessarily. Compare the full monthly cost, including care and extras, instead of the room rate alone, and add the cost of travel for visiting family.",
      },
    ],
  },
};

// Used for every city that has no block above.
export function getCityContent(slug, name) {
  const found = CITY_CONTENT[slug];
  const base = {
    region: name,
    image: `/images/cities/${slug}.jpg`,
    imageAlt: `${name}, India`,
    intro: `A home listed under ${name} can be inside the city or in a nearby town. Check the exact address, the travel time for family, and the care available at that branch before you shortlist it.`,
    areas: `neighbourhoods around ${name}`,
    enquiryTitle: `Separate ${name} city options from a wider regional move`,
    enquiryText: `Note whether each home is inside ${name} or further away. Keep housing-led retirement communities apart from care-led stays when you compare offers.`,
    guideLabel: `Read: Assisted living in ${name}`,
    faqs: [
      {
        q: `How much do old age homes and assisted living cost in ${name}?`,
        a: "Request a dated written quotation for the room and the care needed. Keep deposits, monthly charges and extras on separate lines.",
      },
      {
        q: `Does a ${name} listing always mean a home inside the city?`,
        a: "No. Confirm the full address and work out how long it takes family and doctors to reach it.",
      },
      {
        q: "Can I compare apartment maintenance with assisted living fees?",
        a: "Not directly. Assisted living fees also cover daily help and nursing, so ask for care charges and exclusions first.",
      },
    ],
  };
  return { ...base, ...(found || {}) };
}