/* ============================================================================
   config.js — EDIT THIS FILE FIRST
   ----------------------------------------------------------------------------
   Everything the site shows is driven from here. Change a value, save, reload
   the page in your browser. No build step, no npm, nothing to install.

   Trek dates, route, names and the day-by-day now come from your own document,
   "Kilimanjaro Training Calendar — Warm-first training plan (Aug–Dec)".
   ========================================================================== */

window.TREK_CONFIG = {

  /* ---- The trek itself ---------------------------------------------------
     From your document: Day 1 = Dec 25, summit night = Day 6, Dec 30.
     The camps listed (Shira 1, Shira 2, Barranco, Karanga, Barafu,
     Millennium) are the Lemosho / Shira route, and a 2-hour 3.5 km first day
     to Shira Camp 1 means you're driving in to Morum Barrier rather than
     walking up from Londorossi Gate.

     Two things your document does NOT state, so I've supplied them and marked
     them below: camp ALTITUDES, and a Day 7 descent to the gate.            */
  trek: {
    placeholder: false,
    operator: "Altezza Travel",
    route: "Lemosho / Shira Route",
    days: 7,                       // 6 in your doc + the inferred descent day
    startDate: "2026-12-25",       // Day 1 per your document
    endDate: "2026-12-31",         // inferred — your doc stops at Day 6
    summitDate: "2026-12-30",      // Day 6, summit night
    summitAltitudeM: 5895,
    itineraryUrl: "https://story.altezza.travel/itinerary/iqj6ur",
    packingListUrl: "https://altezzatravel.com/kilimanjaro-packing-list.pdf",
    duffleLimitKg: 15
  },

  /* ---- Who's going ------------------------------------------------------
     Full names from the packing table in your document.                     */
  team: [
    { id: "p1", name: "Sandy Gupta",   initials: "SG" },
    { id: "p2", name: "Poonam Gupta",  initials: "PG" },
    { id: "p3", name: "Ramita Singh",  initials: "RS" },
    { id: "p4", name: "Sandeep Singh", initials: "SS" }
  ],

  /* ---- How training is scheduled ---------------------------------------- */
  training: {
    // 0 = Sunday, 1 = Monday ... 6 = Saturday.
    // Your document times the hikes on the first day of each weekend pair
    // (e.g. "Aug 23 – 09:00AM–01:00PM"), i.e. Saturdays.
    primaryDay: 6,

    // In the Peak phase, add a second (shorter) hike the next day.
    backToBackInPeak: true,

    // Pack weight progression, in kg. Your document calls for 15–20 lb on the
    // opening weekend and 25 lb by mid-October — that's ~7 kg to ~11 kg.
    startPackKg: 7,
    peakPackKg: 11,

    // Fraction of the run-up spent in each phase. Must add up to 1.
    // Only used if plannedWeekends below is empty.
    phaseSplit: { base: 0.20, build: 0.30, peak: 0.30, taper: 0.20 }
  },

  /* ---- THE ACTUAL PLAN --------------------------------------------------
     Transcribed from the weekend table in your training document.

     DATE SHIFT: every date in your document is a Saturday in 2025 but a
     Sunday in 2026 — the table was built on last year's calendar. Each row
     has been moved back one day onto the real 2026 Saturday, which maps 1:1
     across all 18 weekends (doc "Aug 23-24" -> Sat Aug 22, 2026). `docDate`
     keeps the original so you can always see what moved.

     While this list is non-empty it IS the calendar; the automatic
     difficulty-ramp generator is only used if you empty it.

     packKg: your document states pack weight on two weekends only — "15-20 lb"
     on the first and "Add 25 lb" from Oct 18. Those two are marked
     packFromDoc: true. The rest are a sensible fill; change freely.         */
  plannedWeekends: [
    { date: "2026-08-22", docDate: "Aug 23–24", hikeId: "mount-si-old",
      phase: "warm", packKg: 8, packFromDoc: true,
      why: "Warm baseline test",
      notes: "15–20 lb pack.",
      altFor: { hikeId: "poo-poo-point", people: ["p3", "p4"] } },

    { date: "2026-08-29", docDate: "Aug 30–31", hikeId: "granite-mountain",
      phase: "warm", packKg: 8,
      why: "Warm, dry scree practice",
      notes: "Hydrate well — the upper slope has no shade at all." },

    { date: "2026-09-05", docDate: "Sep 6–7", hikeId: "mailbox-peak",
      phase: "warm", packKg: 8,
      why: "Warm-season steep grind",
      notes: "No snow yet." },

    { date: "2026-09-12", docDate: "Sep 13–14", hikeId: "mount-teneriffe",
      phase: "warm", packKg: 8,
      why: "Warm, dry conditions",
      notes: "Long ascent.",
      absent: ["p4"],
      absentWhy: "Sandeep — CA for Dreamforce, 13–18 Sep. The Saturday shift now puts " +
                 "this hike the day before he flies, so he may be able to make it." },

    { date: "2026-09-19", docDate: "Sep 20–21", hikeId: "mount-baldy",
      phase: "altitude", packKg: 9,
      why: "Warm SoCal altitude",
      travel: "Fly LAX",
      notes: "Cheap flight. Sandeep can reposition SFO→LAX on the 18th." },

    { date: "2026-09-26", docDate: "Sep 27–28", hikeId: "camp-muir",
      phase: "altitude", packKg: 9,
      why: "Still warm enough; minimal snow",
      notes: "Best local altitude — 10,080 ft without getting on a plane." },

    { date: "2026-10-03", docDate: "Oct 4–5", hikeId: "mount-whitney",
      phase: "altitude", packKg: 9,
      why: "Ideal weather window",
      travel: "Fly BIH, LAX or RNO",
      notes: "14,505 ft. Permit secured. Biggest single day of the whole plan — " +
             "longer and higher than Kilimanjaro's summit day." },

    { date: "2026-10-10", docDate: "Oct 11–12", hikeId: "mount-elbert",
      phase: "altitude", packKg: 9,
      why: "Warm fall conditions",
      travel: "Fly DEN",
      notes: "Thin-air training. Start before dawn — afternoon lightning is the real risk." },

    { date: "2026-10-17", docDate: "Oct 18–19", hikeId: "granite-mountain",
      phase: "warm", packKg: 11, packFromDoc: true,
      why: "Still warm; build volume",
      notes: "Add 25 lb pack.",
      absent: ["p3", "p4"],
      absentWhy: "Ramita and Sandeep — Purdue parents' weekend." },

    { date: "2026-10-24", docDate: "Oct 25–26", hikeId: "mount-si-old",
      phase: "warm", packKg: 11,
      why: "Warm-season endurance",
      notes: "Faster pacing than August — same hill, less time." },

    { date: "2026-10-31", docDate: "Nov 1–2", hikeId: "mailbox-peak",
      phase: "warm", packKg: 11,
      why: "Cooler but not snowy yet",
      notes: "Mental toughness." },

    { date: "2026-11-07", docDate: "Nov 8–9", hikeId: "mount-teneriffe",
      phase: "cold", packKg: 11,
      why: "Shoulder-season training",
      notes: "Great descent control — this is the day-7 rehearsal." },

    { date: "2026-11-14", docDate: "Nov 15–16", hikeId: "camp-muir",
      phase: "cold", packKg: 11,
      why: "First cold exposure",
      notes: "Light snow likely. First real test of the summit layering system." },

    { date: "2026-11-21", docDate: "Nov 22–23", hikeId: "mailbox-peak",
      phase: "cold", packKg: 11,
      why: "Snow practice",
      notes: "Microspikes." },

    { date: "2026-11-28", docDate: "Nov 29–30", hikeId: "mount-si-old",
      phase: "cold", packKg: 11,
      why: "Cold-weather pacing",
      notes: "Mimics Kili summit night." },

    { date: "2026-12-05", docDate: "Dec 6–7", hikeId: "camp-muir",
      phase: "cold", packKg: 11,
      why: "Final cold/wind prep",
      notes: "Closest to Kili conditions you will get in Washington." },

    { date: "2026-12-12", docDate: "Dec 13–14", hikeId: "granite-mountain",
      phase: "taper", packKg: 9,
      why: "Taper weekend",
      notes: "Your doc says \"Granite or Teneriffe\" — swap with the dropdown. " +
             "Keep effort moderate." },

    { date: "2026-12-19", docDate: "Dec 20–21", hikeId: "rest-light",
      phase: "taper", packKg: 4,
      why: "Recovery",
      notes: "3–5 miles only. Nothing new." }
  ],


  /* ---- FLIGHTS ----------------------------------------------------------
     From Ramita's airline app (screenshot, 12 Aug 2026). Seattle - Istanbul -
     Kilimanjaro and back. All four weekday labels in the screenshot match the
     real 2026/2027 calendar, so unlike the training document these dates need
     no correcting.

     RESERVATION CODES ARE NOT STORED HERE. A booking reference plus a surname
     is all most airlines ask for to view or change a booking, and this repo is
     public. Put the real codes in data/private.js, which is gitignored - the
     site shows them when that file is present and shows a masked stub when it
     isn't. See the README.

     Airline is INFERRED from the SEA-IST-JRO routing; the screenshot doesn't
     name it. utcOffset values are for December/January.                     */
  flights: {
    source: "Ramita's airline app, 12 Aug 2026",
    airline: "Turkish Airlines (inferred from the routing \u2014 confirm)",
    note: "The two halves are SEPARATE bookings. If the Seattle flight runs late " +
          "the airline is not obliged to protect the Kilimanjaro leg, though the " +
          "23-hour Istanbul stop makes that very unlikely to bite.",

    airports: {
      SEA: { name: "Seattle\u2013Tacoma International", city: "Seattle", utcOffset: -8 },
      IST: { name: "Istanbul Airport",                  city: "Istanbul", utcOffset: 3 },
      JRO: { name: "Kilimanjaro International",         city: "Moshi / Arusha", utcOffset: 3 }
    },

    bookings: [
      {
        pnrKey: "seaIst", pnrMask: "VM\u2022\u2022\u2022\u2022",
        label: "Seattle \u2194 Istanbul",
        segments: [
          { from: "SEA", to: "IST", depDate: "2026-12-21", dep: "19:05",
            arrDate: "2026-12-22", arr: "18:05", dir: "out" },
          { from: "IST", to: "SEA", depDate: "2027-01-06", dep: "15:35",
            arrDate: "2027-01-06", arr: "17:10", dir: "back" }
        ]
      },
      {
        pnrKey: "istJro", pnrMask: "TQ\u2022\u2022\u2022\u2022",
        label: "Istanbul \u2194 Kilimanjaro",
        segments: [
          { from: "IST", to: "JRO", depDate: "2026-12-23", dep: "17:10",
            arrDate: "2026-12-24", arr: "00:15", dir: "out" },
          { from: "JRO", to: "IST", depDate: "2027-01-04", dep: "05:55",
            arrDate: "2027-01-04", arr: "13:30", dir: "back" }
        ]
      }
    ]
  },

  /* ---- HIKES ALREADY DONE ------------------------------------------------
     Training done outside the planned weekends — earlier in the summer, or on
     days that don't line up with the schedule. These count towards the totals
     on the dashboard and towards each person's tally, but they are not part of
     the 18-weekend plan.

     `date: null` means the date wasn't recorded. Fill it in when you know it
     and it will show up properly.

     NOTE ON POO POO POINT: reported as "Poo Poo Point, Chirico Trail", which is
     one hike, not two — the Chirico Trail is the standard route up to Poo Poo
     Point. Logged once, so the climbing isn't counted twice. If they really
     were two separate outings, duplicate the entry.                          */
  completedLog: [
    { id: "done-little-si", date: null, hikeId: "little-si",
      who: ["p1", "p2", "p3", "p4"],
      notes: "" },

    { id: "done-poo-poo", date: null, hikeId: "poo-poo-point",
      who: ["p1", "p2", "p3", "p4"],
      notes: "Up the Chirico Trail." },

    { id: "done-rysy", date: null, hikeId: "mount-rysy",
      who: ["p1"],
      notes: "36 km across the Slovak/Polish border, over the highest point in " +
             "Poland. By far the biggest day anyone on this trip has done." }
  ],

  /* ---- Day-by-day mountain itinerary ------------------------------------
     Distances, durations and camps are transcribed from your document.
     ALTITUDES ARE NOT IN YOUR DOCUMENT — the values below are the standard
     published heights for these camps. Check them against your Altezza
     paperwork; they drive the altitude profile chart.                       */
  itinerary: [
    { day: 1, title: "Morum Barrier → Shira Camp 1",
      altStartM: 3500, altEndM: 3610, distanceKm: 3.5, hours: "2",
      zone: "Heath & Moorland",
      note: "Short first day — you drive up to the barrier. Walk it slowly anyway; " +
            "you're starting higher than most routes finish day 2." },

    { day: 2, title: "Shira Camp 1 → Shira Camp 2",
      altStartM: 3610, altEndM: 3850, distanceKm: 10, hours: "4",
      zone: "Heath & Moorland",
      note: "Plus an acclimatisation hike. Go on it even if you feel fine — " +
            "especially if you feel fine." },

    { day: 3, title: "Shira Camp 2 → Barranco Camp",
      altStartM: 3850, altEndM: 3960, distanceKm: 10, hours: "6",
      zone: "Alpine Desert",
      note: "Climb high toward Lava Tower (~4,630 m) then descend to camp. Your doc " +
            "flags the downhill. This is the key acclimatisation day of the trek." },

    { day: 4, title: "Barranco Camp → Karanga Camp",
      altStartM: 3960, altEndM: 4035, distanceKm: 6, hours: "4",
      zone: "Alpine Desert",
      note: "Four hours uphill for 75 m of net gain — that's the Barranco Wall. " +
            "Poles stowed, hands free. Plus an acclimatisation hike." },

    { day: 5, title: "Karanga Camp → Barafu Summit Camp",
      altStartM: 4035, altEndM: 4640, distanceKm: 4, hours: "4",
      zone: "Alpine Desert",
      note: "Short but you're high now. Plus an acclimatisation hike. Eat, then " +
            "sleep early — you're up around midnight." },

    { day: 6, title: "Barafu → UHURU PEAK → Barafu → Millennium Camp",
      altStartM: 4640, altEndM: 3820, distanceKm: 14, hours: "13", summit: true,
      zone: "Arctic Summit",
      note: "Summit night. 1,255 m up in the dark to 5,895 m, then all the way down " +
            "to Millennium. Thirteen hours. Everything you've trained for is this day." },

    { day: 7, title: "Millennium Camp → Mweka Gate",
      altStartM: 3820, altEndM: 1640, distanceKm: 12, hours: "4–5",
      zone: "Rainforest",
      note: "NOT IN YOUR DOCUMENT — inferred descent day. Long drop on wrecked quads; " +
            "this is what the Teneriffe descent practice was for. Confirm with Altezza." }
  ],

  /* ---- Gear-testing milestones ------------------------------------------
     Pinned to a fraction of the way through training (0 = first weekend,
     1 = last). Nothing new should touch the mountain untested.              */
  gearMilestones: [
    { at: 0.05, title: "Wear your boots. All day.",
      detail: "Start breaking them in now. Blisters on Kilimanjaro end summit attempts." },
    { at: 0.18, title: "Hike with trekking poles",
      detail: "Both poles, whole hike. Learn the downhill technique — it saves your knees." },
    { at: 0.30, title: "Test the rain shell + poncho",
      detail: "Go out in actual rain on purpose. Better to find the leak here." },
    { at: 0.45, title: "Full daypack, 8 kg",
      detail: "Hydration bladder, 1 L flask, layers, snacks. Exactly what you'll carry." },
    { at: 0.58, title: "Test the hydration system in the cold",
      detail: "Bite valves freeze. Learn to blow water back down the tube." },
    { at: 0.70, title: "Wear the full summit layering system",
      detail: "Thermals + fleece + insulated jacket + mittens. On a cold morning, uphill." },
    { at: 0.82, title: "Microspikes on real snow",
      detail: "Your plan schedules snow hikes from late November. Fit them before you need them." },
    { at: 0.90, title: "Pack the duffle and weigh it",
      detail: "Hard limit is 15 kg for the porter. Weigh it, then take things out." },
    { at: 1.00, title: "Nothing new. Rest.",
      detail: "Final week: short walks only. Sleep, hydrate, sort documents." }
  ]
};
