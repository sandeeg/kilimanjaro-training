/* ============================================================================
   schedule.js — builds the training calendar.

   Nothing here is hard-coded to a date. It reads trek.startDate from config.js,
   finds every remaining weekend between today and the mountain, splits them
   into Base / Build / Peak / Taper, ramps the targets, and picks a matching
   hike out of the library for each one.

   Change the trek date and the whole plan re-derives.
   ========================================================================== */

var Schedule = (function () {

  var DAY_MS = 86400000;

  /* ---------- date helpers (local time, no timezone surprises) ---------- */

  function parseISO(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function toISO(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

  function daysBetween(a, b) { return Math.round((midnight(b) - midnight(a)) / DAY_MS); }

  function fmtShort(d) {
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function fmtLong(d) {
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* ---------- phase targets ----------
     Ranges are [start, end] and interpolated across the phase, so the load
     climbs smoothly instead of jumping. Taper deliberately runs downhill. */

  var TARGETS = {
    base:  { km: [8, 13],  gain: [250, 600],   tiers: [1, 2] },
    build: { km: [12, 18], gain: [600, 1050],  tiers: [2, 3] },
    peak:  { km: [18, 25], gain: [1100, 1700], tiers: [3, 4, 5] },
    taper: { km: [13, 5],  gain: [650, 100],   tiers: [0, 1, 2] }
  };

  var PHASE_BLURB = {
    base:  'Get the habit and the boots sorted. Comfortable, talkable pace.',
    build: 'Add real climbing. This is where the legs are made.',
    peak:  'The hardest weekends of the plan. Big days, full pack, back-to-back.',
    taper: 'Load comes off, sharpness stays. Nothing new, nothing heroic.'
  };

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- hike selection ---------- */

  function allHikes() {
    var base = (window.TREK_HIKES || []).slice();
    var custom = (Store.all.hikes || []);
    // A user-added hike with the same id replaces the library one.
    var byId = {};
    base.concat(custom).forEach(function (h) { byId[h.id] = h; });
    return Object.keys(byId).map(function (k) { return byId[k]; });
  }

  function pickHike(phase, targetKm, targetGain, recentIds) {
    var tiers = TARGETS[phase].tiers;
    var pool = allHikes().filter(function (h) { return tiers.indexOf(h.tier) !== -1; });
    if (!pool.length) pool = allHikes();
    if (!pool.length) return null;

    // Score by how close the hike is to the week's target, then penalise
    // anything used in the last three weekends so the plan stays varied.
    var scored = pool.map(function (h) {
      var dGain = Math.abs((h.gainM || 0) - targetGain) / Math.max(targetGain, 1);
      var dKm   = Math.abs((h.distanceKm || 0) - targetKm) / Math.max(targetKm, 1);
      // Heavy enough that a repeat only wins when nothing else is close.
      var repeat = recentIds.indexOf(h.id) !== -1 ? 1.2 : 0;
      return { hike: h, score: dGain * 1.4 + dKm + repeat };
    });
    scored.sort(function (a, b) { return a.score - b.score; });
    return scored[0].hike;
  }

  // The back-to-back second day is deliberately easy. Rotate through the pool by
  // week index so five peak weekends don't all get the same short walk.
  function pickSecondDay(recentIds, weekIndex) {
    var pool = allHikes().filter(function (h) { return h.tier === 1 || h.tier === 2; });
    if (!pool.length) return null;
    var fresh = pool.filter(function (h) { return recentIds.indexOf(h.id) === -1; });
    var use = fresh.length ? fresh : pool;
    return use[weekIndex % use.length];
  }

  /* ---------- the build ---------- */

  function build() {
    var cfg = window.TREK_CONFIG;
    var t = cfg.training;
    var trekStart = parseISO(cfg.trek.startDate);
    var today = midnight(new Date());

    // Every occurrence of the chosen weekday strictly after today and strictly
    // before departure. (Departure week itself is rest.)
    var dates = [];
    var cursor = addDays(today, 1);
    while (cursor.getDay() !== t.primaryDay) cursor = addDays(cursor, 1);
    while (cursor < trekStart) {
      dates.push(cursor);
      cursor = addDays(cursor, 7);
    }

    var n = dates.length;
    if (!n) {
      return { weeks: [], totalWeeks: 0, trekStart: trekStart, today: today,
               daysToTrek: daysBetween(today, trekStart), tooLate: true };
    }

    // Phase boundaries as counts, guaranteeing every phase gets >= 1 weekend
    // when there are at least four weekends to work with.
    var split = t.phaseSplit;
    var order = ['base', 'build', 'peak', 'taper'];
    var counts = order.map(function (p) { return Math.max(n >= 4 ? 1 : 0, Math.round(n * split[p])); });
    // Fix rounding drift by adjusting the largest phase.
    var drift = n - counts.reduce(function (a, b) { return a + b; }, 0);
    while (drift !== 0) {
      var idx = counts.indexOf(Math.max.apply(null, counts));
      counts[idx] += drift > 0 ? 1 : -1;
      drift += drift > 0 ? -1 : 1;
    }

    var phaseOf = [];
    order.forEach(function (p, i) {
      for (var k = 0; k < counts[i]; k++) phaseOf.push(p);
    });

    // Gear milestones snap to the nearest weekend by fraction of the run-up.
    var milestoneFor = {};
    (cfg.gearMilestones || []).forEach(function (m) {
      var i = Math.min(n - 1, Math.max(0, Math.round(m.at * (n - 1))));
      while (milestoneFor[i] !== undefined && i < n - 1) i++;   // don't stack two on one weekend
      milestoneFor[i] = m;
    });

    var weeks = [];
    var recent = [];

    dates.forEach(function (d, i) {
      var phase = phaseOf[i] || 'taper';
      var idxInPhase = 0, sizeOfPhase = 0;
      for (var j = 0; j < n; j++) {
        if (phaseOf[j] === phase) { if (j < i) idxInPhase++; sizeOfPhase++; }
      }
      var tt = sizeOfPhase > 1 ? idxInPhase / (sizeOfPhase - 1) : 0.5;

      var targetKm   = Math.round(lerp(TARGETS[phase].km[0],   TARGETS[phase].km[1],   tt));
      var targetGain = Math.round(lerp(TARGETS[phase].gain[0], TARGETS[phase].gain[1], tt) / 25) * 25;

      var hike = pickHike(phase, targetKm, targetGain, recent);
      if (hike) { recent.unshift(hike.id); recent = recent.slice(0, 3); }

      var second = null;
      if (phase === 'peak' && t.backToBackInPeak) second = pickSecondDay(recent, i);

      // Pack weight climbs to the peak target, then eases off in the taper.
      var progress = n > 1 ? i / (n - 1) : 1;
      var packKg;
      if (phase === 'taper') packKg = Math.max(t.startPackKg, t.peakPackKg - 3);
      else packKg = Math.round(lerp(t.startPackKg, t.peakPackKg, Math.min(1, progress / 0.8)));

      weeks.push({
        index: i + 1,
        total: n,
        date: d,
        dateKey: toISO(d),
        dateShort: fmtShort(d),
        dateLong: fmtLong(d),
        secondDate: second ? addDays(d, 1) : null,
        secondDateShort: second ? fmtShort(addDays(d, 1)) : null,
        phase: phase,
        phaseBlurb: PHASE_BLURB[phase],
        targetKm: targetKm,
        targetGain: targetGain,
        packKg: packKg,
        suggested: hike,
        second: second,
        milestone: milestoneFor[i] || null,
        daysOut: daysBetween(d, trekStart),
        allowedTiers: TARGETS[phase].tiers
      });
    });

    return {
      weeks: weeks,
      totalWeeks: n,
      trekStart: trekStart,
      trekStartLong: fmtLong(trekStart),
      today: today,
      daysToTrek: daysBetween(today, trekStart),
      tooLate: false
    };
  }

  /* ---------- what a weekend actually is, once overrides are applied ---------- */

  function resolve(week) {
    var saved = Store.all.weekends[week.dateKey];
    var hike = week.suggested;
    if (saved && saved.hikeId) {
      var found = allHikes().filter(function (h) { return h.id === saved.hikeId; })[0];
      if (found) hike = found;
    }
    return {
      hike: hike,
      done: !!(saved && saved.done),
      actualKm: saved && saved.actualKm != null ? saved.actualKm : null,
      actualGain: saved && saved.actualGain != null ? saved.actualGain : null,
      who: (saved && saved.who) || [],
      notes: (saved && saved.notes) || ''
    };
  }

  return {
    build: build,
    resolve: resolve,
    allHikes: allHikes,
    parseISO: parseISO,
    toISO: toISO,
    fmtShort: fmtShort,
    fmtLong: fmtLong,
    daysBetween: daysBetween,
    TARGETS: TARGETS
  };
})();
