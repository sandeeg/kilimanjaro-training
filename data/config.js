/* ============================================================================
   config.js — EDIT THIS FILE FIRST
   ----------------------------------------------------------------------------
   Everything the site shows is driven from here. Change a value, save, reload
   the page in your browser. No build step, no npm, nothing to install.

   Anything marked  placeholder: true  is a guess I made because the source was
   locked behind a login. Replace it with the real thing and set it to false.
   ========================================================================== */

window.TREK_CONFIG = {

  /* ---- The trek itself ---------------------------------------------------
     startDate drives the WHOLE training calendar. Change it and every weekend,
     phase and taper recomputes automatically.
     Format is always "YYYY-MM-DD".                                          */
  trek: {
    placeholder: true,            // <-- set false once you've confirmed below
    operator: "Altezza Travel",
    route: "Machame Route",
    days: 7,
    startDate: "2026-12-21",      // first day on the mountain
    endDate: "2026-12-28",
    summitDate: "2026-12-26",     // summit night / Uhuru Peak day
    summitAltitudeM: 5895,
    itineraryUrl: "https://story.altezza.travel/itinerary/iqj6ur",
    packingListUrl: "https://altezzatravel.com/kilimanjaro-packing-list.pdf",
    duffleLimitKg: 15             // porter weight limit, from the packing list
  },

  /* ---- Who's going ------------------------------------------------------
     Each person gets their own packing checklist and can be ticked off on
     each training hike.                                                     */
  team: [
    { id: "p1", name: "Sandy",  initials: "SY" },
    { id: "p2", name: "Poonam", initials: "P"  },
    { id: "p3", name: "Ramita", initials: "R"  },
    { id: "p4", name: "Sandeep",initials: "S"  }
  ],

  /* ---- How training is scheduled ---------------------------------------- */
  training: {
    // 0 = Sunday, 1 = Monday ... 6 = Saturday. Your main weekly hike day.
    primaryDay: 6,

    // In the Peak phase, add a second (shorter) hike the next day. Back-to-back
    // days are the single best simulation of consecutive trekking days.
    backToBackInPeak: true,

    // Pack weight progression, in kg. On Kilimanjaro your daypack is ~6-8 kg
    // (water, layers, snacks, camera). Train above that so it feels easy.
    startPackKg: 4,
    peakPackKg: 10,

    // Fraction of the run-up spent in each phase. Must add up to 1.
    phaseSplit: { base: 0.20, build: 0.30, peak: 0.30, taper: 0.20 }
  },

  /* ---- Day-by-day mountain itinerary ------------------------------------
     PLACEHOLDER: a standard 7-day Machame profile. The real numbers are in
     your Altezza link — paste them over these and set trek.placeholder=false.
     altStartM / altEndM are used to draw the altitude profile.              */
  itinerary: [
    { day: 1, title: "Machame Gate → Machame Camp",
      altStartM: 1800, altEndM: 3010, distanceKm: 11, hours: "5–7",
      zone: "Rainforest",
      note: "Humid, often raining. Poncho on top of everything." },

    { day: 2, title: "Machame Camp → Shira Cave Camp",
      altStartM: 3010, altEndM: 3850, distanceKm: 5, hours: "4–6",
      zone: "Heath & Moorland",
      note: "Short day. Big altitude gain — walk deliberately slowly." },

    { day: 3, title: "Shira → Lava Tower → Barranco Camp",
      altStartM: 3850, altEndM: 3960, distanceKm: 10, hours: "6–8",
      zone: "Alpine Desert",
      note: "Climb to 4,630 m then sleep low. The key acclimatisation day." },

    { day: 4, title: "Barranco Wall → Karanga Camp",
      altStartM: 3960, altEndM: 4035, distanceKm: 5, hours: "4–5",
      zone: "Alpine Desert",
      note: "Scrambling on the Wall. Poles stowed, hands free." },

    { day: 5, title: "Karanga Camp → Barafu Camp",
      altStartM: 4035, altEndM: 4640, distanceKm: 4, hours: "4–5",
      zone: "Alpine Desert",
      note: "Eat and sleep early. Summit push starts around midnight." },

    { day: 6, title: "Barafu → UHURU PEAK → Mweka Camp",
      altStartM: 4640, altEndM: 3100, distanceKm: 17, hours: "12–16",
      zone: "Arctic Summit", summit: true,
      note: "Summit day: 1,255 m up in the dark, then 2,795 m down. This is the day all the training is for." },

    { day: 7, title: "Mweka Camp → Mweka Gate",
      altStartM: 3100, altEndM: 1640, distanceKm: 10, hours: "3–4",
      zone: "Rainforest",
      note: "Long descent on tired quads. Certificates at the gate." }
  ],

  /* ---- Gear-testing milestones ------------------------------------------
     Pinned to a fraction of the way through training (0 = first weekend,
     1 = last). Nothing new should touch the mountain untested.              */
  gearMilestones: [
    { at: 0.05, title: "Wear your boots. All day.",
      detail: "Start breaking them in now. Blisters on Kilimanjaro end summit attempts." },
    { at: 0.18, title: "Hike with trekking poles",
      detail: "Both poles, whole hike. Learn the downhill technique — it saves your knees on day 7." },
    { at: 0.30, title: "Test the rain shell + poncho",
      detail: "Go out in actual rain on purpose. Better to find the leak here." },
    { at: 0.45, title: "Full daypack, 8 kg",
      detail: "Hydration bladder, 1 L flask, layers, snacks. Exactly what you'll carry." },
    { at: 0.58, title: "Test the hydration system in the cold",
      detail: "Bite valves freeze. Learn to blow water back down the tube." },
    { at: 0.70, title: "Wear the full summit layering system",
      detail: "Thermals + fleece + insulated jacket + mittens. On a cold morning, uphill." },
    { at: 0.82, title: "Day hike above 2,500 m if you can reach it",
      detail: "Any real altitude exposure helps. Note how you sleep afterwards." },
    { at: 0.90, title: "Pack the duffle and weigh it",
      detail: "Hard limit is 15 kg for the porter. Weigh it, then take things out." },
    { at: 1.00, title: "Nothing new. Rest.",
      detail: "Final week: short walks only. Sleep, hydrate, sort documents." }
  ]
};
