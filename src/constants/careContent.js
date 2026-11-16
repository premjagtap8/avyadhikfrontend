// Content for the care type pages (/care/:careSlug).
// Hero photo: save a file at  public/images/care/<slug>.jpg  (for example dementia-care.jpg)
// or put a full URL in `image`. If the image is missing, a colour block is shown instead.

// Words used to double-check that a home really offers this care type.
// They are matched against the service names the API returns for each home.
export const CARE_KEYWORDS = {
  "assisted-living": ["assisted living"],
  "independent-living": ["independent living"],
  "luxury-senior-living": ["luxury"],
  "dementia-care": ["dementia", "memory"],
  "post-operative-care": ["post operative", "postoperative"],
  rehabilitation: ["rehabilitation", "rehab"],
};

export const CARE_CONTENT = {
  "assisted-living": {
    name: "Assisted living",
    eyebrow: "Everyday support with dignity",
    title: "Assisted Living Homes in India",
    intro:
      "Assisted living gives older adults help with daily routines such as meals, bathing, medication and moving around, in a home where trained staff are always nearby.",
    image: "/images/care/assisted-living.jpg",
    imageAlt: "Residents and a caregiver in an assisted living home",
    resultsTitle: "Explore assisted living homes",
    resultsText:
      "Only homes that list assisted living are shown. Confirm the care offered, current fees and availability directly with the home.",
    checks: [
      {
        title: "Compare the support, not the label",
        text: "Ask exactly which daily tasks staff help with, how many carers are on each shift and what happens at night. Two homes can both say assisted living and offer very different levels of help.",
      },
      {
        title: "Ask what happens when needs change",
        text: "Find out how the home reviews your parent's needs, who decides when more care is needed and whether the monthly fee changes. Ask which needs the home cannot meet.",
      },
    ],
    questions: [
      "Which daily tasks does the staff help with, and at what hours?",
      "Is nursing included, or billed separately?",
      "How often is the care plan reviewed with the family?",
    ],
    closer: {
      care: {
        title: "Ask about the everyday details",
        points: [
          "How many carers are there on a night shift?",
          "How are medicines stored and given?",
          "What happens in a medical emergency?",
        ],
      },
      budget: {
        title: "Understand the complete cost",
        text: "Separate the room fee from personal care, nursing, meals, laundry and extras. Ask for the full monthly amount in writing after the care assessment.",
      },
      family: {
        title: "Stay involved from anywhere",
        text: "Agree who gets updates, how visits work and who answers urgent questions. If you live abroad, ask for a video tour and a written summary of next steps.",
      },
    },
    faqs: [
      {
        q: "Who is assisted living for?",
        a: "It suits older adults who can live fairly independently but need regular help with daily tasks, medication or safety, without needing hospital-level care.",
      },
      {
        q: "What is the difference between assisted living and a nursing home?",
        a: "Assisted living focuses on daily help and a safe routine. Nursing care is for people who need frequent medical attention. Some homes offer both, so ask what is included.",
      },
      {
        q: "What does assisted living cost in India?",
        a: "Costs vary by city, room type and the care needed. Ask each home for a written quotation that lists the room, care, meals and extras separately.",
      },
    ],
  },

  "independent-living": {
    name: "Independent living",
    eyebrow: "Community without compromise",
    title: "Independent Senior Living & Retirement Homes in India",
    intro:
      "Independent senior communities combine private homes with managed services, upkeep, wellness programmes and a chance to build an active social life.",
    image: "/images/care/independent-living.jpg",
    imageAlt: "Two senior residents smiling together",
    resultsTitle: "Explore independent living homes",
    resultsText:
      "Only homes that list independent living are shown. Confirm services, fees and availability directly with the community.",
    checks: [
      {
        title: "Separate housing from care",
        text: "Independent living is mainly about a home and a community. Ask what happens if your parent later needs help with daily tasks, and whether care is available on site or has to be arranged separately.",
      },
      {
        title: "Look at what the fee covers",
        text: "Ask what the monthly charge includes: maintenance, meals, housekeeping, security, activities and emergency response. Check what is paid once and what is paid every month.",
      },
    ],
    questions: [
      "Is this a rental, a purchase or a membership?",
      "What services and activities are included in the monthly fee?",
      "How is emergency help given if a resident falls ill?",
    ],
    closer: {
      care: {
        title: "Ask about life in the community",
        points: [
          "What activities run during a normal week?",
          "How quickly can staff reach a resident in an emergency?",
          "Can a resident bring a helper or caregiver?",
        ],
      },
      budget: {
        title: "Understand the complete cost",
        text: "Ask for the deposit, the monthly fee and any one-time charges separately. Check what is refundable and what happens to the deposit if your parent moves out.",
      },
      family: {
        title: "Stay close from anywhere",
        text: "Ask about visiting rules, guest rooms and how the community contacts family in an emergency. A video tour helps if you are choosing from far away.",
      },
    },
    faqs: [
      {
        q: "Who is independent living for?",
        a: "It suits older adults who manage daily life on their own but want a safe, maintained home, services and the company of other seniors.",
      },
      {
        q: "Is care available in an independent living community?",
        a: "Some communities have a care centre or tie-ups with providers, and others do not. Ask what is available on site and what it costs.",
      },
      {
        q: "What does independent living cost in India?",
        a: "It depends on the city, the home and the services. Ask for a written breakdown of the deposit, monthly fee and any extras.",
      },
    ],
  },

  "luxury-senior-living": {
    name: "Luxury senior living",
    eyebrow: "Comfort with hospitality",
    title: "Luxury Senior Living in India",
    intro:
      "Luxury senior residences pair premium homes with hospitality, wellness amenities and managed services for older adults who want comfort and convenience.",
    image: "/images/care/luxury-senior-living.jpg",
    imageAlt: "Premium senior living residence",
    resultsTitle: "Explore luxury senior living homes",
    resultsText:
      "Only homes that list luxury senior living are shown. Confirm amenities, fees and availability directly with the residence.",
    checks: [
      {
        title: "Look past the amenities",
        text: "Ask who is on the care and medical team, how emergencies are handled and what support is available if your parent's health changes. Amenities do not replace care.",
      },
      {
        title: "Ask what the premium pays for",
        text: "Compare what is included in the fee, such as dining, wellness, housekeeping and transport, with what is charged on top. Ask for the full list in writing.",
      },
    ],
    questions: [
      "Which amenities and services are included in the monthly fee?",
      "Is a doctor or nurse available on site, and at what hours?",
      "What are the deposit and exit terms?",
    ],
    closer: {
      care: {
        title: "Ask about the everyday details",
        points: [
          "What medical support is on site?",
          "Can the home meet dietary and cultural preferences?",
          "How does the staff handle an emergency?",
        ],
      },
      budget: {
        title: "Understand the complete cost",
        text: "Ask for the deposit, the monthly fee and optional charges as separate lines. Check what can change over time and what is refundable.",
      },
      family: {
        title: "Stay involved from anywhere",
        text: "Agree who gets updates and who handles urgent questions. Ask for a video tour and written next steps if you are arranging care from abroad.",
      },
    },
    faqs: [
      {
        q: "Who is luxury senior living for?",
        a: "It suits older adults who want a premium home with hospitality, wellness services and a comfortable social setting.",
      },
      {
        q: "Does luxury senior living include medical care?",
        a: "Not always. Some residences have nurses or a care centre, and others do not. Ask exactly what medical support is available on site.",
      },
      {
        q: "What does luxury senior living cost in India?",
        a: "Prices vary widely by city and residence. Ask for a written quotation that lists the deposit, monthly fee and extras separately.",
      },
    ],
  },

  "dementia-care": {
    name: "Dementia care",
    eyebrow: "Specialist memory support",
    title: "Dementia Care Homes & Memory Care in India",
    intro:
      "Dementia care, often searched for as memory care, uses predictable routines, trained teams and thoughtful surroundings to support safety, dignity and meaningful engagement.",
    image: "/images/care/dementia-care.jpg",
    imageAlt: "Senior family members sitting together in a living room",
    resultsTitle: "Explore dementia care homes",
    resultsText:
      "Only homes that list dementia care are shown. Confirm the memory care offered, current fees and availability directly with the home.",
    checks: [
      {
        title: "Ask about training and routine",
        text: "Ask how staff are trained for dementia, how routines are planned and how the home responds when a resident becomes anxious or wanders. A calm, steady daily rhythm matters more than the building.",
      },
      {
        title: "Check safety and the next stage",
        text: "Ask how the home keeps residents safe, how the plan changes as the condition progresses and which needs the home cannot meet. Discuss late-stage care before you decide.",
      },
    ],
    questions: [
      "How are staff trained to support people living with dementia?",
      "What safety measures prevent wandering, and how are falls handled?",
      "How does the care plan change as the condition progresses?",
    ],
    closer: {
      care: {
        title: "Ask about the everyday details",
        points: [
          "What activities are planned for residents each day?",
          "How are mealtimes and sleep routines handled?",
          "How does the home involve the family in the care plan?",
        ],
      },
      budget: {
        title: "Understand the complete cost",
        text: "Separate the room fee from nursing, memory care, medication support and personal assistance. Ask what changes in the fee if care needs increase.",
      },
      family: {
        title: "Stay involved from anywhere",
        text: "Agree how often you will receive updates and who to call with urgent questions. Ask for a video tour and written next steps if you are arranging care from abroad.",
      },
    },
    faqs: [
      {
        q: "Who is dementia care for?",
        a: "It is for people living with dementia or Alzheimer's who need a structured routine, close supervision and staff trained in memory care.",
      },
      {
        q: "What is the difference between dementia care and assisted living?",
        a: "Assisted living gives help with daily tasks. Dementia care adds a secure setting, trained staff and activities designed around memory loss. Some homes offer both.",
      },
      {
        q: "What does dementia care cost in India?",
        a: "Costs depend on the city and the level of care. Ask for a written quotation that separates the room, memory care, nursing and extras.",
      },
    ],
  },

  "post-operative-care": {
    name: "Post-operative care",
    eyebrow: "Recover after hospital",
    title: "Post-Operative Care Homes for Seniors in India",
    intro:
      "Post-operative care offers short-stay nursing, rehabilitation and recovery support after hospital discharge, so older adults can heal in a supervised setting.",
    image: "/images/care/post-operative-care.jpg",
    imageAlt: "Nurse supporting a senior during recovery",
    resultsTitle: "Explore post-operative care homes",
    resultsText:
      "Only homes that list post-operative care are shown. Confirm the care offered, current fees and availability directly with the home.",
    checks: [
      {
        title: "Match the home to the surgery",
        text: "Share the discharge summary and ask whether the home can manage your parent's wound care, mobility needs, medicines and follow-up visits. Do not assume every home handles every kind of surgery.",
      },
      {
        title: "Plan the stay and the exit",
        text: "Ask how long a typical stay lasts, how progress is reviewed and what the plan is when the stay ends, whether that is going home with support or moving to another setting.",
      },
    ],
    questions: [
      "Can the home manage my parent's specific surgery and medicines?",
      "Which nurses and therapists are available, and at what hours?",
      "How are doctor visits and follow-up appointments arranged?",
    ],
    closer: {
      care: {
        title: "Ask about the everyday details",
        points: [
          "Is a nurse on duty around the clock?",
          "How are wounds, pain and medicines managed?",
          "How is transport to hospital appointments arranged?",
        ],
      },
      budget: {
        title: "Understand the complete cost",
        text: "Ask for the daily or weekly rate and what it covers: nursing, therapy, equipment, consumables and meals. Ask what is billed extra and whether insurance applies.",
      },
      family: {
        title: "Stay involved from anywhere",
        text: "Agree who receives updates from the care team and how the family is told if the plan changes. Ask for written next steps before the stay ends.",
      },
    },
    faqs: [
      {
        q: "Who is post-operative care for?",
        a: "It is for older adults who no longer need to stay in hospital but still need nursing, supervision and support to recover after surgery or illness.",
      },
      {
        q: "How long do people usually stay?",
        a: "Stays range from a few days to several weeks, depending on the surgery and recovery. Ask the home and the treating doctor for an expected time.",
      },
      {
        q: "What does post-operative care cost in India?",
        a: "Costs depend on the city and the nursing and therapy needed. Ask for a written quotation that separates the room, nursing, therapy and consumables.",
      },
    ],
  },

  rehabilitation: {
    name: "Rehabilitation",
    eyebrow: "Recover strength and confidence",
    title: "Senior & Geriatric Rehabilitation Centres in India",
    intro:
      "Senior rehabilitation combines physiotherapy, occupational support and everyday assistance around an individual recovery plan.",
    image:
      "https://images.pexels.com/photos/14769678/pexels-photo-14769678.jpeg?auto=compress&cs=tinysrgb&w=1600",
    imageAlt: "Lounge and everyday living space at a rehabilitation residence",
    resultsTitle: "Explore rehabilitation homes",
    resultsText:
      "Only homes that list rehabilitation are shown. Confirm the programme, current fees and availability directly with the home.",
    checks: [
      {
        title: "Compare the programme, not the label",
        text: "Ask which therapists are involved, what sessions are planned and how progress is reviewed. A room with occasional physiotherapy is very different from a coordinated residential programme.",
      },
      {
        title: "Make progress reviews explicit",
        text: "Ask how the family takes part in setting goals, when the plan is reviewed and who is responsible. Ask what help is given between sessions, such as dressing, bathroom use and night support.",
      },
    ],
    questions: [
      "Which therapists will assess and treat my parent, and how often?",
      "What help is given between sessions and overnight?",
      "How is progress reviewed, and who plans the next setting?",
    ],
    closer: {
      care: {
        title: "Ask about the everyday details",
        points: [
          "Which therapists will assess and support your parent?",
          "How many sessions are included, and who reviews progress?",
          "Is specialist stroke or neurological support available?",
        ],
      },
      budget: {
        title: "Understand the complete cost",
        text: "Separate the room fee from therapy sessions, nursing, equipment and personal assistance. Confirm the programme and current prices after a clinical assessment.",
      },
      family: {
        title: "Stay involved from anywhere",
        text: "Agree who receives updates, how visits work and who handles urgent questions. Ask for a video tour and written next steps if you are arranging care from abroad.",
      },
    },
    faqs: [
      {
        q: "Who is rehabilitation for?",
        a: "Senior rehabilitation combines physiotherapy, occupational support and everyday assistance around an individual recovery plan.",
      },
      {
        q: "Which therapists will assess and support your parent?",
        a: "Packages differ between homes, so ask who provides the therapy, at what hours, and whether it is included in the monthly fee or billed separately. Ask for the answer in writing.",
      },
      {
        q: "What does rehabilitation cost in India?",
        a: "Separate the room fee from therapy sessions, nursing, equipment and personal assistance. Confirm the programme and current prices after a clinical assessment.",
      },
    ],
  },
};