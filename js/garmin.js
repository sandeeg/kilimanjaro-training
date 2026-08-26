/* ============================================================================
   garmin.js — turn a Garmin Connect activity export into logged kilometres.

   WHY A FILE AND NOT A LIVE FEED
   Garmin's official Activity API is OAuth with a client secret, which needs a
   server to hold the secret. This site is static files on GitHub Pages — there
   is no server, and anything committed here is public. So instead of pretending
   to have a live feed, we read the export Garmin already gives you. Everything
   below runs in your own browser; no credentials, nothing uploaded.

   HOW TO GET THE FILE
   Garmin Connect (web) → Activities → All Activities → filter if you like →
   the "Export CSV" button top-right. That downloads the activities currently
   listed. Do it per person, on each person's own account.

   ROBUSTNESS
   Garmin's column set changes between account types, sports and locales, and
   distances come out in km or miles depending on the account's unit setting.
   So this parser is driven by COLUMN NAMES with aliases rather than fixed
   positions, units are chosen explicitly by the user, and nothing is written
   until a preview has been shown. A Strava or SportTracks export with similar
   headers will usually work too.
   ========================================================================== */

var Garmin = (function () {

  /* ---------- CSV ----------
     Hand-rolled because Garmin quotes fields containing commas — including
     thousands separators inside numbers, e.g. "1,234" — so a naive split on
     commas corrupts exactly the values we care about. */

  function parseCSV(text) {
    var rows = [], row = [], field = '', inQuotes = false;
    text = String(text).replace(/^﻿/, '');   // strip BOM

    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += c;
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field); field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else field += c;
    }
    row.push(field);
    if (row.length > 1 || row[0] !== '') rows.push(row);
    return rows;
  }

  /* ---------- column aliases ---------- */

  var COLS = {
    type:    ['activity type', 'type', 'sport'],
    date:    ['date', 'start time', 'activity date', 'begin timestamp'],
    title:   ['title', 'name', 'activity name'],
    dist:    ['distance', 'distance (km)', 'distance (mi)', 'total distance'],
    gain:    ['total ascent', 'elev gain', 'elevation gain', 'ascent', 'total ascent (m)'],
    maxAlt:  ['max elevation', 'maximum elevation', 'max altitude'],
    time:    ['time', 'moving time', 'elapsed time', 'duration']
  };

  function indexColumns(header) {
    var lower = header.map(function (h) { return String(h).trim().toLowerCase(); });
    var idx = {};
    Object.keys(COLS).forEach(function (key) {
      idx[key] = -1;
      // exact match first, so "distance" wins over "distance to next"
      COLS[key].some(function (alias) {
        var at = lower.indexOf(alias);
        if (at !== -1) { idx[key] = at; return true; }
        return false;
      });
      if (idx[key] === -1) {
        COLS[key].some(function (alias) {
          var at = lower.findIndex(function (h) { return h.indexOf(alias) === 0; });
          if (at !== -1) { idx[key] = at; return true; }
          return false;
        });
      }
    });
    return idx;
  }

  /* ---------- values ---------- */

  function toNumber(v) {
    if (v == null) return null;
    var s = String(v).trim();
    if (!s || s === '--' || s === '-' || s.toLowerCase() === 'n/a') return null;
    s = s.replace(/,/g, '').replace(/[^0-9.\-]/g, '');
    if (!s || s === '-' || s === '.') return null;
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  /* "1:23:45" or "45:12" or "1.5" -> hours */
  function toHours(v) {
    if (v == null) return null;
    var s = String(v).trim();
    if (!s || s === '--') return null;
    if (s.indexOf(':') !== -1) {
      var p = s.split(':').map(function (x) { return parseFloat(x) || 0; });
      if (p.length === 3) return p[0] + p[1] / 60 + p[2] / 3600;
      if (p.length === 2) return p[0] / 60 + p[1] / 3600;
    }
    var n = toNumber(s);
    return n == null ? null : n;
  }

  /* Garmin writes "2026-08-22 09:12:34"; be forgiving about the rest. */
  function toISODate(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return null;

    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[1] + '-' + m[2] + '-' + m[3];

    m = s.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);   // ambiguous D/M vs M/D
    if (m) {
      var a = +m[1], b = +m[2];
      var month = a > 12 ? b : a, day = a > 12 ? a : b;     // assume M/D unless impossible
      return m[3] + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }

    var d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
             '-' + String(d.getDate()).padStart(2, '0');
    }
    return null;
  }

  /* ---------- which activities count as training ---------- */

  var ON_FOOT = ['hik', 'walk', 'trail run', 'mountaineer', 'trekking', 'backpack',
                 'snowshoe', 'stair', 'run', 'treadmill', 'elliptical', 'climb'];

  function classify(type) {
    var t = String(type || '').toLowerCase();
    if (!t) return 'other';
    var isFoot = ON_FOOT.some(function (k) { return t.indexOf(k) !== -1; });
    if (!isFoot) return 'other';
    if (t.indexOf('hik') !== -1 || t.indexOf('trekking') !== -1 ||
        t.indexOf('mountaineer') !== -1 || t.indexOf('backpack') !== -1) return 'hike';
    return 'onfoot';
  }

  /* ---------- parse ----------
     units.dist: 'km' | 'mi'      units.elev: 'm' | 'ft'                     */

  function parse(text, units) {
    units = units || { dist: 'km', elev: 'm' };
    var rows = parseCSV(text);
    if (rows.length < 2) {
      return { error: 'That file has no data rows in it.', activities: [] };
    }

    var idx = indexColumns(rows[0]);
    if (idx.date === -1 || idx.dist === -1) {
      return {
        error: 'Could not find a date and a distance column. Headers found: ' +
               rows[0].slice(0, 12).join(', '),
        activities: []
      };
    }

    var kmPer = units.dist === 'mi' ? 1.609344 : 1;
    var mPer  = units.elev === 'ft' ? 0.3048 : 1;

    var activities = [], skipped = 0;

    rows.slice(1).forEach(function (r, i) {
      var iso = toISODate(r[idx.date]);
      var dist = toNumber(r[idx.dist]);
      if (!iso || dist == null) { skipped++; return; }

      var gain = idx.gain === -1 ? null : toNumber(r[idx.gain]);
      var maxAlt = idx.maxAlt === -1 ? null : toNumber(r[idx.maxAlt]);
      var type = idx.type === -1 ? '' : String(r[idx.type] || '').trim();

      activities.push({
        id: iso + '#' + i,
        isoDate: iso,
        type: type,
        kind: classify(type),
        title: idx.title === -1 ? '' : String(r[idx.title] || '').trim(),
        km: Math.round(dist * kmPer * 10) / 10,
        gainM: gain == null ? null : Math.round(gain * mPer),
        maxAltM: maxAlt == null ? null : Math.round(maxAlt * mPer),
        hours: idx.time === -1 ? null : toHours(r[idx.time])
      });
    });

    activities.sort(function (a, b) { return a.isoDate < b.isoDate ? -1 : 1; });
    return { activities: activities, skipped: skipped, columns: idx, headers: rows[0] };
  }

  /* ---------- sanity check on units ----------
     A metric account exporting kilometres gives hikes of 5–40. If the numbers
     look like metres or like miles, say so rather than silently logging a
     36,000 km walk. */

  function unitWarning(activities, units) {
    var foot = activities.filter(function (a) { return a.kind !== 'other'; });
    if (!foot.length) return null;
    var avg = foot.reduce(function (s, a) { return s + a.km; }, 0) / foot.length;
    if (avg > 200) {
      return 'Those distances average ' + Math.round(avg) + ' per activity, which looks ' +
             'like metres rather than ' + units.dist + '. Check the unit setting.';
    }
    if (avg < 0.4) {
      return 'Those distances average ' + avg.toFixed(2) + ' per activity, which looks too ' +
             'small. Check the unit setting.';
    }
    return null;
  }

  /* ---------- match activities to the plan ----------
     A weekend is anchored to a date but the hike can fall on any day of that
     Mon–Sun week, so match on the week rather than the exact day. Where a week
     holds several qualifying activities, the one with the most climbing is
     taken as the hike and the rest are offered as extras. */

  function mondayOf(iso) {
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    var shift = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - shift);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
           '-' + String(d.getDate()).padStart(2, '0');
  }

  function match(activities, weeks) {
    var byWeek = {};
    weeks.forEach(function (w) { byWeek[mondayOf(w.dateKey)] = w; });

    var matched = [], unmatched = [];
    var claimed = {};

    activities.forEach(function (a) {
      if (a.kind === 'other') { unmatched.push({ activity: a, why: 'not an on-foot activity' }); return; }
      var wk = byWeek[mondayOf(a.isoDate)];
      if (!wk) { unmatched.push({ activity: a, why: 'no planned weekend that week' }); return; }

      var key = wk.dateKey;
      if (!claimed[key]) claimed[key] = [];
      claimed[key].push(a);
    });

    Object.keys(claimed).forEach(function (key) {
      var list = claimed[key].slice().sort(function (a, b) {
        return (b.gainM || 0) - (a.gainM || 0) || b.km - a.km;
      });
      var wk = weeks.filter(function (w) { return w.dateKey === key; })[0];
      matched.push({ week: wk, activity: list[0], alsoThatWeek: list.slice(1) });
      list.slice(1).forEach(function (a) {
        unmatched.push({ activity: a, why: 'second activity that week' });
      });
    });

    matched.sort(function (a, b) { return a.week.dateKey < b.week.dateKey ? -1 : 1; });
    return { matched: matched, unmatched: unmatched };
  }

  return {
    parseCSV: parseCSV,
    parse: parse,
    match: match,
    classify: classify,
    unitWarning: unitWarning,
    toNumber: toNumber,
    toHours: toHours,
    toISODate: toISODate
  };
})();
