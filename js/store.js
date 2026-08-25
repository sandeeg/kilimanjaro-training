/* ============================================================================
   store.js — everything you type into the site is kept here.

   Saved in your browser's localStorage, so it survives reloads but does NOT
   sync between people or devices. Use Export / Import on the calendar tab to
   pass the whole state around the group.
   ========================================================================== */

var Store = (function () {
  var KEY = 'kili-training-v1';

  var blank = {
    weekends: {},   // "2026-09-05": { hikeId, done, actualKm, actualGain, packKg, who:[], notes }
    packing:  {},   // "p1": { "Footwear::Trekking boots (…)": true }
    hikes:    [],   // user-added hikes
    theme:    null  // "light" | "dark" | null (follow the OS)
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
