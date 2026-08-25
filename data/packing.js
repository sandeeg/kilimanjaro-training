/* ============================================================================
   packing.js — transcribed from Altezza's "Ultimate Kilimanjaro Packing List"
   (altezzatravel.com/kilimanjaro-packing-list.pdf, 10 pages)

   NOTE ON RENTAL PRICES: page 8 of the PDF lists per-item rental prices
   ($1–$45 for the whole expedition, plus some "Out of Stock" items). The price
   column did not extract in a reliable item-by-item order, so I have NOT
   guessed which price belongs to which item — `rentable` below marks what the
   PDF says is available from Altezza's rental shop, and you should read p.8 for
   the exact prices. Rental shop is for Altezza clients only.
   ========================================================================== */

window.TREK_PACKING = {

  duffleLimitKg: 15,
  duffleNote: "One porter carries your duffle. Hard limit 15 kg. You can hire an " +
              "extra porter to raise it to 30 kg — ask Altezza in advance. " +
              "Altezza is a KPAP member, so this limit is not negotiable.",

  /* ---- The checklist, by category (p.3 of the PDF) ---- */
  categories: [
    {
      name: "Footwear",
      items: [
        { item: "Trekking boots (with ankle support)", qty: 1, rentable: true,
          note: "Critical. Break them in well before the trip — roomy at the toes, snug but not tight." },
        { item: "Hiking shoes / trekking sneakers", qty: 1, rentable: true,
          note: "For day 1 in the rainforest and around camp." },
        { item: "Hiking socks", qty: 7, rentable: false,
          note: "One pair for every day. Buy, don't rent." },
        { item: "Warm summit socks", qty: 1, rentable: false, note: "Summit night only." },
        { item: "Leg gaiters", qty: 1, rentable: true, note: "Keeps scree and dust out." },
        { item: "Microspikes", qty: 1, rentable: true,
          note: "For ice near the summit. Often included by the operator — confirm." }
      ]
    },
    {
      name: "Clothing",
      items: [
        { item: "Thermal underwear set (long-sleeve + pants)", qty: 3, rentable: true,
          note: "PDF is explicit: 2–3 sets. One stays clean for sleeping only." },
        { item: "Trekking pants", qty: 2, rentable: true },
        { item: "Trekking t-shirt", qty: 3, rentable: true },
        { item: "Long-sleeve shirt", qty: 2, rentable: true, note: "Sun protection above the treeline." },
        { item: "Fleece jacket", qty: 2, rentable: true },
        { item: "Hardshell jacket (waterproof)", qty: 1, rentable: true,
          note: "Essential even in dry season. Not optional." },
        { item: "Hardshell pants (waterproof)", qty: 1, rentable: true },
        { item: "Insulated summit jacket (comfort −15 °C / 5 °F)", qty: 1, rentable: true,
          note: "Summit night. Rent this one if you'll never use it again." },
        { item: "Insulated summit pants (comfort −15 °C / 5 °F)", qty: 1, rentable: true },
        { item: "Waterproof poncho", qty: 1, rentable: true,
          note: "Goes over you AND your backpack. The PDF calls it essential." }
      ]
    },
    {
      name: "Hand gear",
      items: [
        { item: "Fleece gloves", qty: 1, rentable: true },
        { item: "Mittens", qty: 1, rentable: true,
          note: "Worn OVER the fleece gloves on summit night. Must still let you grip a pole." }
      ]
    },
    {
      name: "Headgear",
      items: [
        { item: "Sunglasses (Category 3–4 UV)", qty: 1, rentable: true,
          note: "Glacier-grade. Category 1–2 is not enough at 5,895 m." },
        { item: "Sun hat or cap", qty: 1, rentable: true },
        { item: "Fleece hat", qty: 1, rentable: true },
        { item: "Balaclava", qty: 1, rentable: false, note: "Recommended for summit night." },
        { item: "Headlamp + 1 spare set of batteries", qty: 1, rentable: true,
          note: "Summit push starts around midnight. Cold kills batteries — carry spares warm." }
      ]
    },
    {
      name: "Bags",
      items: [
        { item: "Backpack, 30–40 L", qty: 1, rentable: true, note: "What YOU carry each day." },
        { item: "Duffle bag, 100–150 L", qty: 1, rentable: true, note: "What the porter carries. 15 kg limit." }
      ]
    },
    {
      name: "Sleeping",
      items: [
        { item: "Sleeping bag (comfort −12 °C / 10 °F)", qty: 1, rentable: true,
          note: "Comfort rating, not 'limit' rating. Rent-friendly." }
      ]
    },
    {
      name: "Hydration & other essentials",
      items: [
        { item: "Hydration bladder, 2–2.5 L", qty: 1, rentable: true },
        { item: "Water bottle / flask, 1 L", qty: 1, rentable: true,
          note: "Bladder tubes freeze up high — the bottle is your backup." },
        { item: "Thermos, 1 L", qty: 1, rentable: true, note: "Summit night: hot drink in the backpack." },
        { item: "Trekking poles", qty: 1, rentable: true, note: "Pair. Saves your knees on the day-7 descent." },
        { item: "Powerbank", qty: 1, rentable: true, note: "No charging on the mountain." },
        { item: "Sunscreen SPF 30+", qty: 1, rentable: true, note: "Equator plus altitude. Reapply daily." }
      ]
    }
  ],

  /* ---- What to actually wear, day by day (pp.4–6) ---- */
  daily: [
    {
      label: "Day 1 — Rainforest",
      altitude: "up to 3,000 m / 10,000 ft",
      temp: "20 °C day / 13 °C night",
      wear: ["Trekking sneakers", "T-shirt or long-sleeve", "Trekking pants",
             "Sun hat or cap", "Cat. 3–4 sunglasses", "30–40 L backpack",
             "Flask or hydration system", "Trekking poles", "Sunscreen SPF 30–50"]
    },
    {
      label: "Days 2–5 — Heath, Moorland & Alpine Desert",
      altitude: "4,000–5,000 m / 13,000–16,500 ft",
      temp: "7 °C down to −7 °C",
      wear: ["Hiking boots (ankle support)", "Thermal underwear set", "Warm fleece jacket",
             "Hardshell jacket", "Hardshell pants", "Fleece gloves", "Fleece hat",
             "Cat. 3–4 sunglasses", "30–40 L backpack", "Flask or hydration system",
             "Trekking poles"]
    },
    {
      label: "Day 6 — Arctic Summit",
      altitude: "5,895 m / 19,340 ft",
      temp: "−10 °C to −17 °C",
      wear: ["Hiking boots (ankle support)", "Thermal underwear set", "Warm fleece jacket",
             "Insulated summit jacket (−15 °C)", "Insulated summit pants (−15 °C)",
             "Fleece gloves + mittens over them", "Fleece hat + balaclava",
             "Cat. 3–4 sunglasses", "Headlamp + spare batteries",
             "Flask/hydration + 1 L thermos", "30–40 L backpack", "Trekking poles"]
    }
  ],

  /* ---- Optional extras (p.9) ---- */
  extras: [
    { group: "Keep things dry & organised", items: ["Dry bag", "Zip-lock bags", "Travel bag lock", "Name tag on your duffle", "Luggage strap"] },
    { group: "Gadgets", items: ["Power bank", "E-book / Kindle", "Spare headlamp batteries"] },
    { group: "Energy", items: ["Protein bars", "Dried fruit", "Electrolyte tablets", "Thermos"] },
    { group: "Camp comfort", items: ["Camp slippers (Crocs)", "Light down jacket", "Extra fleece jacket", "Tabletop games"] },
    { group: "Better sleep", items: ["Sleeping bag liner", "Earplugs", "Inflatable pillow", "Fleece clothing set for sleeping only"] },
    { group: "On the trail", items: ["Neck gaiter", "Hand warmers", "Athletic tape", "Hand moisturiser"] },
    { group: "Hygiene", items: ["Wet wipes & paper napkins", "Dry shampoo", "Deodorant", "Camp towel", "Lip balm", "Toothbrush & toothpaste", "Nail clippers"] }
  ],

  /* ---- Climate context (p.2) ---- */
  climateNote: "Kilimanjaro crosses five climate zones — tropical rainforest, heath " +
               "and moorland, alpine desert, and the arctic summit. The PDF's own " +
               "description: it's the equator to Antarctica in a single week. " +
               "Tanzania's Dec–Feb is summer; avoid April (peak rains)."
};
