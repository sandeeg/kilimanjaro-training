/* ============================================================================
   hikes.js — THE REAL HIKE LIBRARY
   ----------------------------------------------------------------------------
   Source: "Kilimanjaro Training Calendar — Warm-first training plan (Aug–Dec)".
   All placeholders removed.

   `onPlan: true`  = named in your training document.
   `onPlan: false` = other main Washington trails, added as extra options.

   STATS PROVENANCE — this matters, so it's marked per hike:
     statsSource: "WTA"      -> mileage / gain / high point read off the
                                Washington Trails Association page linked below.
                                Distances are ROUND TRIP. Verified 2026-08-25.
     statsSource: "estimate" -> the three out-of-state peaks. WTA doesn't cover
                                them; these are standard published figures for
                                the usual route, but CONFIRM before booking.

   `hours` and `driveMin` are my estimates in every case — driveMin is rough
   door-to-trailhead from Seattle. Adjust to wherever you actually start from.

   tier  0 = recovery / cross-training      3 = hard
         1 = easy base                      4 = very hard
         2 = moderate                       5 = summit simulation or real altitude
   Tier is assigned by elevation gain, except that anything topping out above
   2,500 m counts as tier 5 regardless — thin air is the point.
   ========================================================================== */

window.TREK_HIKES = [

  /* ======================================================================
     ON THE PLAN — Washington
     ====================================================================== */
  {
    id: "mount-si-old", name: "Mount Si (Old Trail)", area: "North Bend", state: "WA",
    tier: 4, distanceKm: 11.9, gainM: 1043, maxAltM: 1213, hours: 5.0, driveMin: 40,
    terrain: "Forest trail, steady grade", onPlan: true, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/mount-si-old-trail",
    note: "Your warm baseline test. 7.4 mi / 3,420 ft. Plan says 15–20 lb pack. " +
          "The repeat visits later add faster pacing, then snow."
  },
  {
    id: "poo-poo-point", name: "Poo Poo Point", area: "Issaquah — Tiger Mountain", state: "WA",
    tier: 2, distanceKm: 11.6, gainM: 533, maxAltM: 616, hours: 3.5, driveMin: 25,
    terrain: "Forest trail to paraglider launch", onPlan: true, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/poo-poo-point",
    note: "7.2 mi / 1,748 ft. The plan has Sandeep and Ramita doing this instead of " +
          "Mount Si on the opening weekend. Closest real hill to town."
  },
  {
    id: "granite-mountain", name: "Granite Mountain", area: "Snoqualmie Pass", state: "WA",
    tier: 4, distanceKm: 13.8, gainM: 1158, maxAltM: 1716, hours: 6.0, driveMin: 50,
    terrain: "Open slope, scree, talus", onPlan: true, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/granite-mountain",
    note: "8.6 mi / 3,800 ft. Warm dry scree practice — this is the closest local " +
          "match for Kibo's summit cone. Hydrate well; the slope is fully exposed."
  },
  {
    id: "mailbox-peak", name: "Mailbox Peak", area: "North Bend", state: "WA",
    tier: 4, distanceKm: 15.1, gainM: 1219, maxAltM: 1470, hours: 6.5, driveMin: 45,
    terrain: "Relentless steep grind", onPlan: true, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/mailbox-peak",
    note: "9.4 mi / 4,000 ft. The mental-toughness hike. Note WTA's figures are the " +
          "New Trail; the Old Trail is far shorter and far more brutal for the same gain."
  },
  {
    id: "mount-teneriffe", name: "Mount Teneriffe", area: "North Bend", state: "WA",
    tier: 4, distanceKm: 20.9, gainM: 1158, maxAltM: 1398, hours: 7.5, driveMin: 45,
    terrain: "Long forest road and trail", onPlan: true, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/mount-teneriffe",
    note: "13.0 mi / 3,800 ft. Longest local day — trains descent control, which is " +
          "what actually wrecks people on Kili's final day."
  },
  {
    id: "camp-muir", name: "Camp Muir (Mount Rainier)", area: "Paradise, Mt Rainier NP", state: "WA",
    tier: 5, distanceKm: 12.9, gainM: 1414, maxAltM: 3072, hours: 8.0, driveMin: 135,
    terrain: "Trail then permanent snowfield", onPlan: true, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/camp-muir",
    note: "8.0 mi / 4,640 ft, topping out at 10,080 ft. Your best altitude day without " +
          "flying anywhere, and the plan hits it three times — Sep, Nov, then Dec for " +
          "cold and wind. The December visit is the closest thing to Kili conditions."
  },

  /* ======================================================================
     ON THE PLAN — out-of-state altitude trips
     Figures are standard published values, not WTA-verified. Confirm these.
     ====================================================================== */
  {
    id: "mount-baldy", name: "Mount Baldy (Mt San Antonio)", area: "Angeles NF — fly LAX", state: "CA",
    tier: 5, distanceKm: 14.3, gainM: 1189, maxAltM: 3068, hours: 7.0, driveMin: 0,
    terrain: "Ski Hut / Baldy Bowl route", onPlan: true, placeholder: false,
    statsSource: "estimate", url: "https://www.fs.usda.gov/angeles",
    note: "~8.9 mi / ~3,900 ft, summit 10,064 ft. Warm SoCal altitude. Plan notes " +
          "Sandeep can reposition SFO→LAX on the 18th. CONFIRM route stats — several " +
          "routes exist and Devil's Backbone is longer."
  },
  {
    id: "mount-whitney", name: "Mount Whitney", area: "Lone Pine — fly LAX / RNO / BIH", state: "CA",
    tier: 5, distanceKm: 35.4, gainM: 2012, maxAltM: 4421, hours: 14.0, driveMin: 0,
    terrain: "Main Whitney Trail, 97 switchbacks", onPlan: true, placeholder: false,
    statsSource: "estimate", url: "https://www.recreation.gov/permits/233260",
    note: "PERMIT REQUIRED — day-use quota runs 1 May to 1 Nov and is allocated by a " +
          "February lottery on recreation.gov. An Oct 4 date falls inside the quota " +
          "season, so this trip does not happen without a permit already in hand. " +
          "~22 mi / ~6,600 ft to 14,505 ft: a 12–16 hour day, harder than Kili summit day."
  },
  {
    id: "mount-elbert", name: "Mount Elbert", area: "Leadville — fly DEN", state: "CO",
    tier: 5, distanceKm: 15.3, gainM: 1372, maxAltM: 4401, hours: 8.0, driveMin: 0,
    terrain: "Northeast Ridge, above treeline", onPlan: true, placeholder: false,
    statsSource: "estimate", url: "https://www.14ers.com/route.php?route=elbe1",
    note: "~9.5 mi / ~4,500 ft, summit 14,440 ft — highest point in the Rockies and " +
          "the best thin-air rehearsal on the plan. Start before dawn; afternoon " +
          "lightning is the real hazard. No permit needed."
  },

  /* ======================================================================
     EXTRA OPTIONS — other main Washington trails (all WTA-verified)
     Not in your document. Use them to swap a weekend or add a second day.
     ====================================================================== */

  /* ---- tier 1: easy base ---- */
  {
    id: "little-si", name: "Little Si", area: "North Bend", state: "WA",
    tier: 1, distanceKm: 6.0, gainM: 396, maxAltM: 472, hours: 2.0, driveMin: 40,
    terrain: "Forest trail, rock walls", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/little-si",
    note: "3.7 mi / 1,300 ft. Good first-time-in-boots hike and an easy recovery day."
  },
  {
    id: "rattlesnake-ledge", name: "Rattlesnake Ledge", area: "North Bend", state: "WA",
    tier: 1, distanceKm: 6.4, gainM: 354, maxAltM: 633, hours: 2.0, driveMin: 40,
    terrain: "Wide trail, viewpoint ledge", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/rattlesnake-ledge",
    note: "4.0 mi / 1,160 ft. Very popular — go early or the lot fills."
  },
  {
    id: "wallace-falls", name: "Wallace Falls", area: "Gold Bar", state: "WA",
    tier: 1, distanceKm: 9.0, gainM: 396, maxAltM: 457, hours: 3.0, driveMin: 60,
    terrain: "River trail, staircases", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/wallace-falls",
    note: "5.6 mi / 1,300 ft. Holds up in rain, which makes it a good day to test " +
          "the hardshell and poncho on purpose."
  },

  /* ---- tier 2: moderate ---- */
  {
    id: "west-tiger-3", name: "West Tiger 3", area: "Issaquah Alps", state: "WA",
    tier: 2, distanceKm: 8.0, gainM: 640, maxAltM: 770, hours: 3.0, driveMin: 25,
    terrain: "Steady forest climb", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/west-tiger-3",
    note: "5.0 mi / 2,100 ft. The default after-work conditioning hill. Repeatable."
  },
  {
    id: "snow-lake", name: "Snow Lake", area: "Snoqualmie Pass", state: "WA",
    tier: 2, distanceKm: 11.6, gainM: 549, maxAltM: 1341, hours: 4.0, driveMin: 55,
    terrain: "Rocky alpine trail", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/snow-lake",
    note: "7.2 mi / 1,800 ft. Holds snow early — useful microspike practice in November."
  },
  {
    id: "mount-pilchuck", name: "Mount Pilchuck", area: "Mountain Loop Hwy", state: "WA",
    tier: 2, distanceKm: 8.7, gainM: 701, maxAltM: 1624, hours: 4.0, driveMin: 90,
    terrain: "Boulder field near the top", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/mount-pilchuck",
    note: "5.4 mi / 2,300 ft to a lookout at 5,327 ft. The talus scramble at the end " +
          "is good hands-free practice for the Barranco Wall."
  },

  /* ---- tier 3: hard ---- */
  {
    id: "bandera-mountain", name: "Bandera Mountain", area: "North Bend", state: "WA",
    tier: 3, distanceKm: 12.9, gainM: 1036, maxAltM: 1597, hours: 5.5, driveMin: 50,
    terrain: "Steep open slope", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/bandera-mountain",
    note: "8.0 mi / 3,400 ft. Hands-on-knees steep in the upper half."
  },
  {
    id: "kendall-katwalk", name: "Kendall Katwalk", area: "Snoqualmie Pass", state: "WA",
    tier: 3, distanceKm: 19.3, gainM: 792, maxAltM: 1646, hours: 6.0, driveMin: 55,
    terrain: "PCT, exposed rock traverse", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/kendall-katwalk",
    note: "12.0 mi / 2,600 ft. Distance over steepness — trains the long, patient, " +
          "slightly boring day, which is most of Kilimanjaro."
  },

  /* ---- tier 4: very hard ---- */
  {
    id: "mount-defiance", name: "Mount Defiance", area: "Snoqualmie Pass", state: "WA",
    tier: 4, distanceKm: 17.7, gainM: 1092, maxAltM: 1702, hours: 7.0, driveMin: 50,
    terrain: "Long climb past Mason Lake", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/mount-defiance",
    note: "11.0 mi / 3,584 ft. Big day that can be shortened at Mason Lake if the " +
          "weather turns."
  },
  {
    id: "mcclellan-butte", name: "McClellan Butte", area: "Snoqualmie Pass", state: "WA",
    tier: 4, distanceKm: 16.9, gainM: 1241, maxAltM: 1573, hours: 7.0, driveMin: 45,
    terrain: "Switchbacks, final scramble", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/mcclellan-butte",
    note: "10.5 mi / 4,073 ft. The summit block is a genuine scramble — skip it in " +
          "snow and turn round at the shoulder."
  },
  {
    id: "mount-dickerman", name: "Mount Dickerman", area: "Mountain Loop Hwy", state: "WA",
    tier: 4, distanceKm: 13.2, gainM: 1204, maxAltM: 1756, hours: 6.5, driveMin: 90,
    terrain: "Endless switchbacks, open summit", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/mount-dickerman",
    note: "8.2 mi / 3,950 ft. Similar profile to Mailbox but prettier at the top."
  },
  {
    id: "vesper-peak", name: "Vesper Peak", area: "Mountain Loop Hwy", state: "WA",
    tier: 4, distanceKm: 12.9, gainM: 1219, maxAltM: 1894, hours: 7.0, driveMin: 95,
    terrain: "Boulders, slab, route-finding", onPlan: false, placeholder: false,
    statsSource: "WTA", url: "https://www.wta.org/go-hiking/hikes/vesper-peak",
    note: "8.0 mi / 4,000 ft. Hardest terrain on this list. Not a beginner day and " +
          "not one to attempt once snow arrives."
  },

  /* ======================================================================
     RECOVERY & NON-TRAIL DAYS
     ====================================================================== */
  {
    id: "rest-light", name: "Rest + light hike", area: "Local", state: "WA",
    tier: 0, distanceKm: 6.5, gainM: 120, maxAltM: 200, hours: 1.5, driveMin: 15,
    terrain: "Flat and easy", onPlan: true, placeholder: false,
    statsSource: "plan", url: "",
    note: "The plan's final weekend: 3–5 miles only. Legs moving, heart rate low."
  },
  {
    id: "gym-vertical", name: "Stairmaster session (indoor)", area: "Gym", state: "—",
    tier: 0, distanceKm: 0, gainM: 700, maxAltM: 0, hours: 1.0, driveMin: 10,
    terrain: "Indoor", onPlan: false, placeholder: false,
    statsSource: "plan", url: "",
    note: "Weather backup. Loaded pack on the machine, 45–60 minutes."
  },
  {
    id: "gear-day", name: "Gear sort & duffle weigh-in", area: "Home", state: "—",
    tier: 0, distanceKm: 0, gainM: 0, maxAltM: 0, hours: 1.5, driveMin: 0,
    terrain: "Living room floor", onPlan: false, placeholder: false,
    statsSource: "plan", url: "",
    note: "Lay everything out, pack the duffle, put it on a bathroom scale. 15 kg max."
  }
];
