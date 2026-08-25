/* ============================================================================
   hikes.js — YOUR HIKE LIBRARY
   ----------------------------------------------------------------------------
   These are the hikes the scheduler picks from. Every one below is a
   PLACEHOLDER ARCHETYPE — the shape of the workout is right, the trail name is
   not, because your Teams note was behind a sign-in.

   To make this real: replace name/area/driveMin/url with actual trails near
   you, keep distanceKm / gainM / tier roughly as they are, and the calendar
   keeps working. Add as many as you like.

   tier  1 = easy base          (flat-ish, conversational)
         2 = moderate           (real climb, half day)
         3 = hard               (long or steep, most of a day)
         4 = very hard          (big day, close to summit-day effort)
         5 = summit simulation  (the hardest thing you'll do in training)
         0 = recovery / cross-training (no tier matching, used in taper)

   You can also add hikes from inside the website (Hikes tab → "Add a hike"),
   which saves to your browser. Use "Export" there to get JSON to paste back
   into this file so everyone on the team gets it.
   ========================================================================== */

window.TREK_HIKES = [

  /* ---------- Tier 1 — base building ---------- */
  {
    id: "river-flat", name: "Riverside Flat Loop", area: "Local — REPLACE ME",
    tier: 1, distanceKm: 8, gainM: 150, maxAltM: 100, hours: 2.0, driveMin: 15,
    terrain: "Gravel path", placeholder: true, url: "",
    note: "Time on feet, nothing else. Walk it fast rather than slow."
  },
  {
    id: "park-long", name: "Long Park Walk", area: "Local — REPLACE ME",
    tier: 1, distanceKm: 13, gainM: 220, maxAltM: 150, hours: 3.0, driveMin: 10,
    terrain: "Mixed path", placeholder: true, url: "",
    note: "First test of whether your boots and socks actually agree with you."
  },
  {
    id: "coast-easy", name: "Shoreline Out-and-Back", area: "Local — REPLACE ME",
    tier: 1, distanceKm: 11, gainM: 300, maxAltM: 200, hours: 2.5, driveMin: 30,
    terrain: "Sand and trail", placeholder: true, url: "",
    note: "Soft ground works the ankles. Good early-season variety."
  },

  /* ---------- Tier 2 — moderate ---------- */
  {
    id: "foothill-ridge", name: "Foothills Ridge Loop", area: "Nearby hills — REPLACE ME",
    tier: 2, distanceKm: 12, gainM: 600, maxAltM: 700, hours: 4.0, driveMin: 45,
    terrain: "Forest singletrack", placeholder: true, url: "",
    note: "Your first sustained climb. Find the slow-and-steady pace you can hold talking."
  },
  {
    id: "lake-switchbacks", name: "Lake Switchbacks", area: "Nearby hills — REPLACE ME",
    tier: 2, distanceKm: 10, gainM: 700, maxAltM: 900, hours: 3.5, driveMin: 50,
    terrain: "Rocky trail", placeholder: true, url: "",
    note: "Practise pole-assisted descending on the way down."
  },
  {
    id: "quarry-hill", name: "Quarry Hill Repeats", area: "Nearby hills — REPLACE ME",
    tier: 2, distanceKm: 8, gainM: 750, maxAltM: 500, hours: 3.0, driveMin: 25,
    terrain: "Steep track", placeholder: true, url: "",
    note: "Same hill, three or four times. Boring, and extremely effective."
  },

  /* ---------- Tier 3 — hard ---------- */
  {
    id: "stair-vertical", name: "Stairs / Incline Session", area: "Urban — REPLACE ME",
    tier: 3, distanceKm: 6, gainM: 950, maxAltM: 200, hours: 3.0, driveMin: 15,
    terrain: "Stairs", placeholder: true, url: "",
    note: "Pure vertical. The closest thing to the Barranco Wall you can do in a city."
  },
  {
    id: "forest-peak", name: "Forest Peak Out-and-Back", area: "Mountains — REPLACE ME",
    tier: 3, distanceKm: 16, gainM: 1000, maxAltM: 1400, hours: 5.5, driveMin: 75,
    terrain: "Mountain trail", placeholder: true, url: "",
    note: "First proper mountain day. Carry everything you'd carry on Kili."
  },
  {
    id: "three-lakes", name: "Three Lakes Traverse", area: "Mountains — REPLACE ME",
    tier: 3, distanceKm: 19, gainM: 900, maxAltM: 1300, hours: 6.0, driveMin: 90,
    terrain: "Alpine trail", placeholder: true, url: "",
    note: "Distance over steepness. Trains the mind for a long, boring, cold day."
  },

  /* ---------- Tier 4 — very hard ---------- */
  {
    id: "alpine-traverse", name: "Alpine Lake Traverse", area: "Mountains — REPLACE ME",
    tier: 4, distanceKm: 21, gainM: 1250, maxAltM: 1900, hours: 7.5, driveMin: 100,
    terrain: "Alpine, some scree", placeholder: true, url: "",
    note: "Scree teaches you how to walk on Kibo's summit cone. Gaiters on."
  },
  {
    id: "double-summit", name: "Double Summit Ridge", area: "Mountains — REPLACE ME",
    tier: 4, distanceKm: 18, gainM: 1400, maxAltM: 2100, hours: 7.5, driveMin: 110,
    terrain: "Rocky ridge", placeholder: true, url: "",
    note: "Two climbs in one day. The second one is where the training happens."
  },
  {
    id: "night-hike", name: "Pre-Dawn Start Hike", area: "Mountains — REPLACE ME",
    tier: 4, distanceKm: 16, gainM: 1200, maxAltM: 1800, hours: 6.5, driveMin: 90,
    terrain: "Mountain trail", placeholder: true, url: "",
    note: "Start at 03:00 by headlamp, in the cold. This is literally summit night."
  },

  /* ---------- Tier 5 — summit simulation ---------- */
  {
    id: "big-mountain-day", name: "Big Mountain Day", area: "Mountains — REPLACE ME",
    tier: 5, distanceKm: 25, gainM: 1700, maxAltM: 2400, hours: 10.0, driveMin: 120,
    terrain: "Full mountain", placeholder: true, url: "",
    note: "The benchmark. If you can finish this and still eat dinner, you're ready."
  },
  {
    id: "altitude-day", name: "High-Altitude Day Hike (2,500 m+)", area: "High mountains — REPLACE ME",
    tier: 5, distanceKm: 18, gainM: 1400, maxAltM: 3000, hours: 8.0, driveMin: 180,
    terrain: "High alpine", placeholder: true, url: "",
    note: "Worth a long drive or an overnight. Real thin air is irreplaceable practice."
  },

  /* ---------- Tier 0 — recovery & cross-training ---------- */
  {
    id: "recovery-walk", name: "Recovery Walk", area: "Anywhere",
    tier: 0, distanceKm: 6, gainM: 100, maxAltM: 100, hours: 1.5, driveMin: 0,
    terrain: "Flat", placeholder: false, url: "",
    note: "Legs moving, heart rate low. Not a workout — maintenance."
  },
  {
    id: "gym-vertical", name: "Stairmaster Session (indoor)", area: "Gym",
    tier: 0, distanceKm: 0, gainM: 700, maxAltM: 0, hours: 1.0, driveMin: 10,
    terrain: "Indoor", placeholder: false, url: "",
    note: "Weather backup. Loaded pack on the machine, 45–60 minutes."
  },
  {
    id: "gear-day", name: "Gear Sort & Duffle Weigh-In", area: "Home",
    tier: 0, distanceKm: 0, gainM: 0, maxAltM: 0, hours: 1.5, driveMin: 0,
    terrain: "Living room floor", placeholder: false, url: "",
    note: "Lay everything out, pack the duffle, put it on a bathroom scale. 15 kg max."
  }
];
