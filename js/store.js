/* ============================================================================
   store.js — everything you type into the site is kept here.

   Saved in your browser's localStorage, so it survives reloads but does NOT
   sync between people or devices. Use Export / Import on the calendar tab to
   pass the whole state around the group.
   ========================================================================== */

var Store = (function () {
  var KEY = 'kili-training-v1';

  var blank = {
    weekends: {},   // "2026-09-05": { hikeId, done, dayIdx, actualKm, actualGain, who:[], notes }
    packing:  {},   // "p1": { "Footwear::Trekking boots (…)": true }
    hikes:    [],   // user-added hikes
    theme:    null, // "light" | "dark" | null (follow the OS)
    defaultDay: null, // 0=Mon … 6=Sun. null = use config.training.primaryDay
    pnrs:     {},   // "seaIst": "ABC123" — see setPnr
    hotels:   {},   // "istanbul": "92736632" — hotel confirmation refs, kept locally
    garmin:   {},   // "p1": { units, importedAt, activities:[] }
    extraLog: [],   // hikes added from a Garmin import, outside the plan
    recommendations: {}, // "Footwear::Trekking boots (…)::p1": "Salomon" — gear recommendations per person
    mountElbert: { needed: {}, customItems: [] } // Mount Elbert gear: needed status & custom items
  };

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(blank));
      var d = JSON.parse(raw);
      // fill in anything a older save is missing
      Object.keys(blank).forEach(function (k) {
        if (d[k] === undefined) d[k] = JSON.parse(JSON.stringify(blank[k]));
      });
      return d;
    } catch (e) {
      console.warn('Could not read saved data, starting fresh.', e);
      return JSON.parse(JSON.stringify(blank));
    }
  }

  var data = read();
  var listeners = [];

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      // Opening the file straight from disk in some browsers blocks storage.
      console.warn('Could not save. Your changes will be lost on reload.', e);
    }
    listeners.forEach(function (fn) { fn(); });
  }

  return {
    get all() { return data; },

    onChange: function (fn) { listeners.push(fn); },

    /* ---- weekend entries ---- */
    weekend: function (dateKey) {
      if (!data.weekends[dateKey]) {
        data.weekends[dateKey] = {
          hikeId: null, done: false,
          actualKm: null, actualGain: null,
          who: [], notes: ''
        };
      }
      return data.weekends[dateKey];
    },

    setWeekend: function (dateKey, patch) {
      var w = this.weekend(dateKey);
      Object.keys(patch).forEach(function (k) { w[k] = patch[k]; });
      save();
    },

    toggleWho: function (dateKey, personId) {
      var w = this.weekend(dateKey);
      var i = w.who.indexOf(personId);
      if (i === -1) w.who.push(personId); else w.who.splice(i, 1);
      save();
    },

    /* ---- packing ---- */
    packKey: function (category, item) { return category + '::' + item; },

    isPacked: function (personId, category, item) {
      var p = data.packing[personId];
      return !!(p && p[this.packKey(category, item)]);
    },

    setPacked: function (personId, category, item, on) {
      if (!data.packing[personId]) data.packing[personId] = {};
      var k = this.packKey(category, item);
      if (on) data.packing[personId][k] = true;
      else delete data.packing[personId][k];
      save();
    },

    packedCount: function (personId) {
      var p = data.packing[personId];
      return p ? Object.keys(p).length : 0;
    },

    /* ---- user-added hikes ---- */
    addHike: function (hike) {
      data.hikes.push(hike);
      save();
    },

    removeHike: function (id) {
      data.hikes = data.hikes.filter(function (h) { return h.id !== id; });
      save();
    },

    /* ---- theme ---- */
    setTheme: function (t) { data.theme = t; save(); },

    /* ---- Garmin imports, per person ----
       The parsed activity list is kept so a re-match is possible without
       re-importing the file. Like everything else here it stays in this
       browser. */
    setGarmin: function (personId, payload) {
      if (!data.garmin) data.garmin = {};
      data.garmin[personId] = payload;
      save();
    },

    getGarmin: function (personId) {
      return (data.garmin && data.garmin[personId]) || null;
    },

    clearGarmin: function (personId) {
      if (data.garmin) delete data.garmin[personId];
      // drop anything that import had written into the weekends
      Object.keys(data.weekends).forEach(function (k) {
        var w = data.weekends[k];
        if (w.people && w.people[personId]) {
          delete w.people[personId];
          if (!Object.keys(w.people).length) delete w.people;
        }
      });
      data.extraLog = (data.extraLog || []).filter(function (e) {
        return !(e.src === 'garmin' && e.who.length === 1 && e.who[0] === personId);
      });
      save();
    },

    /* ---- per-person distance on a given weekend ----
       Four people on the same hike record slightly different numbers, so each
       person's own figure is kept rather than one shared value. */
    setPersonActual: function (weekendKey, personId, entry) {
      var w = this.weekend(weekendKey);
      if (!w.people) w.people = {};
      w.people[personId] = entry;
      if (w.who.indexOf(personId) === -1) w.who.push(personId);
      w.done = true;
      save();
    },

    personActual: function (weekendKey, personId) {
      var w = data.weekends[weekendKey];
      return (w && w.people && w.people[personId]) || null;
    },

    /* ---- hikes logged from an import, outside the plan ---- */
    addExtraLog: function (entry) {
      if (!data.extraLog) data.extraLog = [];
      if (data.extraLog.some(function (e) { return e.id === entry.id; })) return false;
      data.extraLog.push(entry);
      save();
      return true;
    },

    removeExtraLog: function (id) {
      data.extraLog = (data.extraLog || []).filter(function (e) { return e.id !== id; });
      save();
    },

    /* ---- airline reservation codes ----
       Kept in this browser and NOWHERE else. A booking reference plus a surname
       is usually all an airline asks for to view or change a reservation, so
       these must never end up in the repo — it's public. Each person enters
       their own; Export carries them only if they choose to share the file. */
    getPnr: function (key) { return (data.pnrs && data.pnrs[key]) || ''; },

    setPnr: function (key, value) {
      if (!data.pnrs) data.pnrs = {};
      var v = String(value || '').trim().toUpperCase();
      if (v) data.pnrs[key] = v; else delete data.pnrs[key];
      save();
    },

    /* ---- hotel confirmation references ----
       Same principle as PNRs: kept in browser only, never committed. Hotel
       confirmation numbers are needed for check-in but should not be public. */
    getHotelRef: function (key) { return (data.hotels && data.hotels[key]) || ''; },

    setHotelRef: function (key, value) {
      if (!data.hotels) data.hotels = {};
      var v = String(value || '').trim();
      if (v) data.hotels[key] = v; else delete data.hotels[key];
      save();
    },

    /* ---- which day of the week you hike ----
       0 = Monday … 6 = Sunday. Set globally here, or per weekend via
       setWeekend(key, {dayIdx: n}), which wins over this. */
    setDefaultDay: function (d) { data.defaultDay = d; save(); },

    /* ---- import / export ---- */
    exportJSON: function () { return JSON.stringify(data, null, 2); },

    importJSON: function (text) {
      var parsed = JSON.parse(text);          // throws on bad input — caller catches
      if (typeof parsed !== 'object' || parsed === null) throw new Error('Not an object');
      data = parsed;
      Object.keys(blank).forEach(function (k) {
        if (data[k] === undefined) data[k] = JSON.parse(JSON.stringify(blank[k]));
      });
      save();
    },

    reset: function () {
      data = JSON.parse(JSON.stringify(blank));
      save();
    }
  };
})();
