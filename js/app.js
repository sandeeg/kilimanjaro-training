/* ============================================================================
   app.js — wires the data to the page.
   ========================================================================== */

(function () {

  var CFG   = window.TREK_CONFIG;
  var PACK  = window.TREK_PACKING;
  var plan  = null;                 // rebuilt whenever hikes change
  var $     = function (id) { return document.getElementById(id); };

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function num(v) { return Math.round(v).toLocaleString(); }

  /* Distances are small enough that rounding away the decimal loses real
     information - 53.6 km should not read as 54 km. Whole numbers stay whole. */
  function km(v) {
    return (Math.round(v * 10) % 10 === 0)
      ? Math.round(v).toLocaleString()
      : (Math.round(v * 10) / 10).toLocaleString(undefined, { minimumFractionDigits: 1 });
  }

  /* Elevation of one Kilimanjaro ascent, gate to summit — used as a fun unit. */
  function kiliAscentM() {
    var it = CFG.itinerary || [];
    if (!it.length) return 4095;
    var lowest = Math.min.apply(null, it.map(function (d) { return Math.min(d.altStartM, d.altEndM); }));
    return CFG.trek.summitAltitudeM - lowest;
  }

  /* ---------- theme ---------- */

  function initTheme() {
    var saved = Store.all.theme;
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    $('themeBtn').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var isDark = cur === 'dark' ||
                   (!cur && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      Store.setTheme(next);
      renderAll();     // charts re-read the CSS custom properties
    });
  }

  /* ---------- tabs ---------- */

  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) {
          var sel = o === t;
          o.setAttribute('aria-selected', sel ? 'true' : 'false');
          $(o.getAttribute('aria-controls')).hidden = !sel;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ---------- placeholder warning ---------- */

  function renderBanner() {
    var msgs = [];
    if (CFG.trek.placeholder) {
      msgs.push('The <b>trek dates and day-by-day itinerary are a placeholder</b> ' +
                '(a standard 7-day Machame profile starting ' +
                esc(Schedule.fmtLong(Schedule.parseISO(CFG.trek.startDate))) + '). ' +
                'Your Altezza itinerary link only opens for a signed-in Altezza account, so I could not read it. ' +
                'Correct <span class="mono">data/config.js</span> → <span class="mono">trek</span> and ' +
                '<span class="mono">itinerary</span>, then set <span class="mono">placeholder: false</span>.');
    }
    var ph = Schedule.allHikes().filter(function (h) { return h.placeholder; }).length;
    if (ph) {
      msgs.push('<b>' + ph + ' of the hikes are placeholder archetypes</b> — right shape of workout, ' +
                'invented trail names, because the Teams note with your options needs a sign-in. ' +
                'Replace them in <span class="mono">data/hikes.js</span> or add real ones on the ' +
                '<b>Hike library</b> tab.');
    }
    if (!msgs.length) { $('placeholderBanner').innerHTML = ''; return; }

    $('placeholderBanner').innerHTML =
      '<div class="banner"><span aria-hidden="true">⚠</span><div><b>Two things still need your real data</b>' +
      msgs.map(function (m) { return '<div style="margin-top:6px">' + m + '</div>'; }).join('') +
      '</div></div>';
  }

  /* ---------- totals ---------- */

  function totals() {
    var planKm = 0, planGain = 0, doneKm = 0, doneGain = 0, doneCount = 0;

    // Hikes done outside the planned weekends count towards what the legs have
    // actually absorbed, so they go into the logged totals — but NOT into the
    // plan totals, which represent the 18-weekend schedule only.
    var logKm = 0, logGain = 0;
    Schedule.completedLog().forEach(function (e) { logKm += e.km; logGain += e.gain; });

    plan.weeks.forEach(function (w) {
      var r = Schedule.resolve(w);
      planKm += w.targetKm;
      planGain += w.targetGain;
      if (r.done) {
        doneCount++;
        doneKm += r.actualKm != null ? r.actualKm : (r.hike ? r.hike.distanceKm : w.targetKm);
        doneGain += r.actualGain != null ? r.actualGain : (r.hike ? r.hike.gainM : w.targetGain);
      }
    });

    return {
      planKm: planKm, planGain: planGain,
      doneKm: doneKm + logKm, doneGain: doneGain + logGain,
      weekendKm: doneKm, weekendGain: doneGain,
      logKm: logKm, logGain: logGain,
      logCount: Schedule.completedLog().length,
      doneCount: doneCount,
      remaining: plan.weeks.length - doneCount
    };
  }

  /* ---------- dashboard ---------- */

  function renderHero() {
    var start = Schedule.parseISO(CFG.trek.startDate);
    var end   = Schedule.parseISO(CFG.trek.endDate);
    var fmt   = function (d) { return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };

    $('heroEyebrow').textContent =
      CFG.trek.route + ' · ' + CFG.trek.days + ' days · ' +
      fmt(start) + ' – ' + fmt(end) + ' ' + end.getFullYear();

    var t = totals();
    $('heroSub').innerHTML =
      '<b>' + plan.daysToTrek + '</b> days to go. ' +
      CFG.team.map(function (p) { return esc(p.name.split(' ')[0]); }).join(', ') +
      ' — <b>' + t.remaining + '</b> of <b>' + plan.weeks.length +
      '</b> training weekends still ahead, and <b>' + num(t.planGain) +
      ' m</b> of climbing in the plan.';
  }

  function renderDashboard() {
    var t = totals();
    var kili = kiliAscentM();

    renderHero();

    $('dashIntro').textContent =
      plan.weeks.length
        ? 'There are ' + plan.weeks.length + ' training weekends between today and the mountain, and ' +
          plan.daysToTrek + ' days in total. Tick weekends off on the Training calendar tab and this fills in.'
        : 'No training weekends left before departure — you are into the final week. Rest, hydrate, pack.';

    var pctGain = t.planGain ? Math.round((t.doneGain / t.planGain) * 100) : 0;

    var tiles = [
      { label: 'Days to go', value: plan.daysToTrek, unit: '',
        foot: plan.trekStartLong ? 'Start: ' + plan.trekStartLong.replace(/^\w+, /, '') : '' },
      { label: 'Weekends left', value: t.remaining, unit: '/ ' + plan.weeks.length,
        foot: t.doneCount + ' logged so far' },
      { label: 'Distance logged', value: km(t.doneKm), unit: 'km',
        foot: t.logKm ? km(t.logKm) + ' km of it before the plan'
                      : 'plan totals ' + num(t.planKm) + ' km' },
      { label: 'Climbing logged', value: num(t.doneGain), unit: 'm',
        foot: pctGain + '% of the ' + num(t.planGain) + ' m plan' },
      { label: 'Kilimanjaros climbed', value: (t.doneGain / kili).toFixed(1), unit: '×',
        foot: 'one ascent ≈ ' + num(kili) + ' m of gain' }
    ];

    $('tiles').innerHTML = tiles.map(function (x) {
      return '<div class="tile"><div class="tile__label">' + esc(x.label) + '</div>' +
             '<div class="tile__value">' + esc(x.value) +
             (x.unit ? '<span class="tile__unit">' + esc(x.unit) + '</span>' : '') + '</div>' +
             '<div class="tile__foot">' + esc(x.foot) + '</div></div>';
    }).join('');

    renderChart();
    renderNextUp();
    renderDoneLog();
    renderTeam();
  }

  function chartData() {
    var labels = [], planCum = [], loggedCum = [];
    var t = totals();
    var p = 0;
    var l = t.logGain;          // start from the hikes already done off-plan

    // Run the logged line as far as the present, not just as far as the last
    // tick, so a skipped weekend reads as the line going flat.
    var lastIdx = -1;
    plan.weeks.forEach(function (w, i) {
      var r = Schedule.resolve(w);
      if (r.done || r.isPast) lastIdx = i;
    });
    if (lastIdx < 0 && l > 0) lastIdx = 0;

    plan.weeks.forEach(function (w, i) {
      var r = Schedule.resolve(w);
      p += w.targetGain;
      if (r.done) l += r.actualGain != null ? r.actualGain : (r.hike ? r.hike.gainM : w.targetGain);
      labels.push(r.dateShort.replace(/^\w+,?\s*/, ''));
      planCum.push(p);
      loggedCum.push(i <= lastIdx ? l : null);
    });
    return { labels: labels, planCum: planCum, loggedCum: loggedCum,
             lastIdx: lastIdx, base: t.logGain };
  }

  function renderChart() {
    var d = chartData();
    if (!d.labels.length) {
      $('chartWrap').innerHTML = '<p class="hint">Nothing to plot — no training weekends remain.</p>';
      $('chartSub').textContent = '';
      return;
    }

    $('chartSub').textContent =
      'Metres of ascent, added up week by week. The plan line is what the schedule asks for; ' +
      'the logged line is what you have actually done, and it runs to today, so a skipped ' +
      'weekend shows as a flat stretch.' +
      (d.base > 0
        ? ' It starts at ' + num(d.base) + ' m, already banked on hikes done outside the plan.'
        : '');

    var css = getComputedStyle(document.documentElement);
    var c1 = css.getPropertyValue('--series-1').trim() || '#2a78d6';
    var c2 = css.getPropertyValue('--series-2').trim() || '#eb6834';

    Chart.lines($('chartWrap'), $('chartTip'), {
      labels: d.labels,
      yLabel: 'metres',
      ariaLabel: 'Cumulative metres of ascent, planned versus logged, across ' + d.labels.length + ' training weekends',
      fmt: function (v) { return num(v) + ' m'; },
      tipSuffix: function (i) { return ' · week ' + (i + 1); },
      series: [
        { name: 'Planned', color: c1, values: d.planCum, dashed: true },
        { name: 'Logged',  color: c2, values: d.loggedCum }
      ]
    });

    // accessible table view of the same numbers
    $('chartTable').innerHTML =
      '<table><caption class="sr-only">Cumulative ascent, planned versus logged</caption><thead><tr>' +
      '<th>Week</th><th>Date</th><th class="num">Planned (m)</th><th class="num">Logged (m)</th>' +
      '</tr></thead><tbody>' +
      d.labels.map(function (lab, i) {
        return '<tr><td>' + (i + 1) + '</td><td>' + esc(lab) + '</td>' +
               '<td class="num">' + num(d.planCum[i]) + '</td>' +
               '<td class="num">' + (d.loggedCum[i] == null ? '—' : num(d.loggedCum[i])) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function renderNextUp() {
    var next = nextWeek();
    if (!next) {
      $('nextUp').innerHTML = '<p class="hint">Every weekend is logged. Nicely done — now taper.</p>';
      return;
    }
    var r = Schedule.resolve(next);
    var h = r.hike;
    $('nextUp').innerHTML =
      '<div class="week__date">' + esc(r.dateLong) + '</div>' +
      '<div class="hint" style="margin-bottom:8px">Week ' + next.index + ' of ' + next.total +
        ' · ' + esc(next.phase.toUpperCase()) + ' · ' + r.daysOut + ' days before departure</div>' +
      (h ? '<div style="font-weight:600;font-size:15px">' + esc(h.name) + '</div>' +
           '<div class="hint">' + esc(h.area || '') + '</div>' +
           '<div class="week__stats" style="margin-top:8px">' +
             '<span><b>' + h.distanceKm + '</b> km</span>' +
             '<span><b>' + num(h.gainM) + '</b> m up</span>' +
             '<span><b>' + h.hours + '</b> h</span>' +
             '<span>pack <b>' + next.packKg + '</b> kg</span>' +
           '</div>' +
           (h.note ? '<p class="week__note" style="margin-top:8px">' + esc(h.note) + '</p>' : '')
         : '<p class="hint">No hike in the library matches this phase yet — add one on the Hike library tab.</p>') +
      (next.milestone
        ? '<div class="milestone" style="margin-top:10px"><span class="milestone__icon" aria-hidden="true">◆</span>' +
          '<div><b>' + esc(next.milestone.title) + '</b><span>' + esc(next.milestone.detail) + '</span></div></div>'
        : '');
  }

  /* "Next up" means the soonest weekend still ahead of you that isn't logged.
     If everything upcoming is logged, fall back to the earliest unlogged past
     weekend so a skipped hike doesn't silently disappear. */
  function nextWeek() {
    var undone = plan.weeks.filter(function (w) { return !Schedule.resolve(w).done; });
    if (!undone.length) return null;
    var upcoming = undone.filter(function (w) { return !Schedule.resolve(w).isPast; });
    return upcoming.length ? upcoming[0] : undone[0];
  }

  function renderDoneLog() {
    var log = Schedule.completedLog();
    var t = totals();

    if (!log.length) {
      $('logSub').textContent = '';
      $('doneLog').innerHTML = '<p class="hint">Nothing logged outside the plan yet.</p>';
      return;
    }

    $('logSub').textContent =
      log.length + ' hikes done outside the 18-weekend plan \u2014 ' + km(t.logKm) +
      ' km and ' + num(t.logGain) + ' m of climbing already in the legs.';

    $('doneLog').innerHTML = log.map(function (e) {
      var h = e.hike;
      var everyone = e.who.length === CFG.team.length;
      return '<div class="itin-day">' +
        '<div class="itin-day__n" aria-hidden="true">\u2713</div>' +
        '<div class="itin-day__body">' +
          '<div class="itin-day__title">' + esc(h ? h.name : e.id) +
            (h && h.state && h.state !== '\u2014'
              ? ' <span class="tag">' + esc(h.state) + '</span>' : '') +
          '</div>' +
          '<div class="itin-day__facts">' +
            (e.dateShort ? esc(e.dateShort) + ' \u00b7 '
                         : '<span class="hint">date not recorded \u00b7 </span>') +
            '<b>' + e.km + '</b> km \u00b7 <b>' + num(e.gain) + '</b> m up' +
            (h && h.maxAltM ? ' \u00b7 tops out <b>' + num(h.maxAltM) + '</b> m' : '') +
          '</div>' +
          '<div class="itin-day__note">' +
            (everyone ? 'Everyone' : esc(e.who.map(nameOf).join(', '))) +
            (e.notes ? ' \u2014 ' + esc(e.notes) : '') +
          '</div>' +
        '</div></div>';
    }).join('');
  }

  function renderTeam() {
    var packTotal = countPackItems();
    $('teamReadiness').innerHTML =
      '<div class="tablescroll"><table><thead><tr><th>Person</th>' +
      '<th class="num">Hikes done</th><th class="num">Climbed</th><th>Packing</th></tr></thead><tbody>' +
      CFG.team.map(function (p) {
        var hikes = 0, gain = 0;
        plan.weeks.forEach(function (w) {
          var r = Schedule.resolve(w);
          if (r.done && r.who.indexOf(p.id) !== -1) {
            hikes++;
            gain += r.actualGain != null ? r.actualGain : (r.hike ? r.hike.gainM : w.targetGain);
          }
        });
        Schedule.completedLog().forEach(function (e) {
          if (e.who.indexOf(p.id) !== -1) { hikes++; gain += e.gain; }
        });
        var packed = Store.packedCount(p.id);
        var pct = packTotal ? Math.round((packed / packTotal) * 100) : 0;
        return '<tr><td>' + esc(p.name) + '</td>' +
               '<td class="num">' + hikes + '</td>' +
               '<td class="num">' + num(gain) + ' m</td>' +
               '<td style="min-width:120px"><div class="progressbar"><i style="width:' + pct + '%"></i></div>' +
               '<span class="hint">' + packed + ' / ' + packTotal + '</span></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------- which day of the week you hike ---------- */

  function renderDayPicker() {
    var sel = $('defaultDay');
    var cur = Schedule.defaultDayIdx();
    sel.innerHTML = Schedule.DAY_NAMES.map(function (nm, i) {
      return '<option value="' + i + '"' + (i === cur ? ' selected' : '') + '>' + esc(nm) + 's</option>';
    }).join('');
  }

  /* ---------- training calendar ---------- */

  function renderCalendar() {
    if (!plan.weeks.length) {
      $('calIntro').textContent = 'Departure is less than a week away — there are no training weekends left to schedule.';
    } else if (plan.fromPlan) {
      $('calIntro').innerHTML =
        'Your own plan, ' + esc(plan.weeks[0].dateShort) + ' to ' +
        esc(plan.weeks[plan.weeks.length - 1].dateShort) + ' — ' + plan.weeks.length +
        ' weekends, warm hikes first, altitude trips in the warm windows, cold and snow ' +
        'saved for last. Every date in your document is a Saturday in 2025 but a Sunday in ' +
        '2026, so each has been shifted back one day onto the real 2026 Saturday; each card ' +
        'shows the original under <span class="mono">doc:</span>. Swap any hike with the ' +
        'dropdown — ★ marks ones suited to that phase. <b>*</b> on a pack weight means it ' +
        'came from your document.';
    } else {
      $('calIntro').textContent =
        'Every ' + ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][CFG.training.primaryDay] +
        ' from ' + plan.weeks[0].dateShort + ' to ' + plan.weeks[plan.weeks.length - 1].dateShort +
        '. Base builds the habit, Build adds climbing, Peak is the hard part, Taper backs off.';
    }

    var fPhase = $('filterPhase').value;
    var fDone  = $('filterDone').value;
    var next   = nextWeek();

    var html = plan.weeks.map(function (w) {
      var r = Schedule.resolve(w);
      if (fPhase !== 'all' && w.phase !== fPhase) return '';
      if (fDone === 'done' && !r.done) return '';
      if (fDone === 'todo' && r.done) return '';

      var isNext = next && next.dateKey === w.dateKey;
      var pool = Schedule.allHikes();

      var options = pool.map(function (h) {
        var recommended = w.allowedTiers.indexOf(h.tier) !== -1;
        var sel = r.hike && r.hike.id === h.id ? ' selected' : '';
        return '<option value="' + esc(h.id) + '"' + sel + '>' +
               (recommended ? '★ ' : '') + esc(h.name) +
               ' · ' + h.distanceKm + ' km / ' + num(h.gainM) + ' m</option>';
      }).join('');

      return '' +
      '<article class="week ' + (r.done ? 'week--done' : '') + ' ' + (isNext ? 'week--next' : '') +
        ' ' + (r.isPast && !r.done ? 'week--past' : '') + '"' +
        ' style="--phase:var(' + phaseVar(w.phase) + ')" data-key="' + w.dateKey + '">' +

        '<div class="week__top">' +
          '<div>' +
            '<div class="week__wk">Week ' + w.index + ' / ' + w.total + '</div>' +
            '<div class="week__date">' + esc(r.dateShort) + '</div>' +
            '<div class="hint">' +
              (r.isPast ? 'already passed · ' : '') + r.daysOut + ' days before departure' +
              (w.docDate ? ' · doc: ' + esc(w.docDate) : '') +
            '</div>' +
          '</div>' +
          '<div class="week__meta">' +
            (r.done ? '<span class="chip chip--done">Done</span>'
                    : isNext ? '<span class="chip chip--next">Next up</span>'
                    : r.isPast ? '<span class="chip chip--missed">Not logged</span>' : '') +
            '<div style="margin-top:4px"><span class="chip chip--' + w.phase + '">' + esc(w.phase) + '</span></div>' +
          '</div>' +
        '</div>' +

        (w.why ? '<div class="week__why">' + esc(w.why) + '</div>' : '') +

        '<div class="week__day">' +
          '<label class="sr-only" for="day-' + w.dateKey + '">Day of the week for week ' + w.index + '</label>' +
          '<select id="day-' + w.dateKey + '" data-act="day">' +
            r.choices.map(function (c) {
              return '<option value="' + c.idx + '"' + (c.idx === r.dayIdx ? ' selected' : '') + '>' +
                     esc(c.short) + '</option>';
            }).join('') +
          '</select>' +
          (r.dayFromWeekend
            ? '<span class="hint">following the default</span>'
            : '<button type="button" class="linkbtn" data-act="dayreset">reset to default</button>') +
        '</div>' +

        '<label class="sr-only" for="sel-' + w.dateKey + '">Hike for ' + esc(w.dateShort) + '</label>' +
        '<select id="sel-' + w.dateKey + '" data-act="hike" style="width:100%">' + options + '</select>' +

        '<div class="week__stats">' +
          '<span><b>' + w.targetKm + '</b> km</span>' +
          '<span><b>' + num(w.targetGain) + '</b> m up</span>' +
          (r.hike && r.hike.maxAltM ? '<span>tops out <b>' + num(r.hike.maxAltM) + '</b> m</span>' : '') +
          '<span>pack <b>' + w.packKg + '</b> kg' + (w.packFromDoc ? '*' : '') + '</span>' +
        '</div>' +

        (w.travel ? '<p class="week__note"><b>Travel:</b> ' + esc(w.travel) + '</p>' : '') +

        (w.altFor && w.altFor.people && w.altFor.people.length
          ? '<p class="week__note"><b>' +
            esc(w.altFor.people.map(nameOf).join(' & ')) + ':</b> ' +
            esc((Schedule.allHikes().filter(function (h) { return h.id === w.altFor.hikeId; })[0] || {}).name ||
                w.altFor.hikeId) + ' instead.</p>'
          : '') +

        (w.absent && w.absent.length
          ? '<p class="week__note week__note--absent"><b>Missing:</b> ' +
            esc(w.absent.map(nameOf).join(', ')) +
            (w.absentWhy ? ' — ' + esc(w.absentWhy) : '') + '</p>'
          : '') +

        (w.planNotes ? '<p class="week__note"><b>Note:</b> ' + esc(w.planNotes) + '</p>' : '') +

        (r.hike && r.hike.note ? '<p class="week__note week__note--trail">' + esc(r.hike.note) +
          (r.hike.url ? ' <a href="' + esc(r.hike.url) + '" target="_blank" rel="noopener">details ↗</a>' : '') +
          '</p>' : '') +

        (w.second && !r.done
          ? '<p class="week__note"><b>' + esc(w.secondDateShort) + ':</b> back-to-back second day — ' +
            esc(w.second.name) + ' (' + w.second.distanceKm + ' km / ' + num(w.second.gainM) + ' m). ' +
            'Consecutive days is the closest thing to a real trek.</p>'
          : '') +

        (w.milestone
          ? '<div class="milestone"><span class="milestone__icon" aria-hidden="true">◆</span>' +
            '<div><b>' + esc(w.milestone.title) + '</b><span>' + esc(w.milestone.detail) + '</span></div></div>'
          : '') +

        '<div class="week__foot">' +
          '<label class="checkline" style="padding:0">' +
            '<input type="checkbox" data-act="done"' + (r.done ? ' checked' : '') + '>' +
            '<span>Completed</span>' +
          '</label>' +
          '<div class="people" style="margin-left:auto" role="group" aria-label="Who came on ' + esc(w.dateShort) + '">' +
            CFG.team.map(function (p) {
              return '<button type="button" class="person" data-act="who" data-person="' + esc(p.id) + '"' +
                     ' aria-pressed="' + (r.who.indexOf(p.id) !== -1 ? 'true' : 'false') + '"' +
                     ' title="' + esc(p.name) + '">' + esc(p.initials) + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="week__foot">' +
          '<label class="hint" for="km-' + w.dateKey + '">Actual</label>' +
          '<input id="km-' + w.dateKey + '" type="number" step="0.1" min="0" style="width:74px" ' +
            'data-act="km" placeholder="km" value="' + (r.actualKm != null ? r.actualKm : '') + '">' +
          '<input type="number" step="10" min="0" style="width:84px" aria-label="Actual metres climbed" ' +
            'data-act="gain" placeholder="m up" value="' + (r.actualGain != null ? r.actualGain : '') + '">' +
        '</div>' +

      '</article>';
    }).join('');

    $('weeks').innerHTML = html || '<p class="hint">Nothing matches those filters.</p>';
  }

  function phaseVar(p) {
    var map = {
      base: '--series-3', build: '--series-1', peak: '--series-2',
      warm: '--series-2', altitude: '--series-4', cold: '--series-1'
    };
    return map[p] || '--text-muted';
  }

  function nameOf(personId) {
    var m = CFG.team.filter(function (p) { return p.id === personId; });
    return m.length ? m[0].name : personId;
  }

  /* One delegated listener for the whole calendar — simpler than wiring
     hundreds of individual handlers, and survives re-renders. */
  function initCalendarEvents() {
    var root = $('weeks');

    root.addEventListener('change', function (e) {
      var art = e.target.closest('.week');
      if (!art) return;
      var key = art.getAttribute('data-key');
      var act = e.target.getAttribute('data-act');

      if (act === 'hike') Store.setWeekend(key, { hikeId: e.target.value });
      if (act === 'day')  Store.setWeekend(key, { dayIdx: +e.target.value });
      if (act === 'done') Store.setWeekend(key, { done: e.target.checked });
      if (act === 'km')   Store.setWeekend(key, { actualKm: e.target.value === '' ? null : +e.target.value });
      if (act === 'gain') Store.setWeekend(key, { actualGain: e.target.value === '' ? null : +e.target.value });
    });

    root.addEventListener('click', function (e) {
      var who = e.target.closest('[data-act="who"]');
      if (who) {
        Store.toggleWho(who.closest('.week').getAttribute('data-key'),
                        who.getAttribute('data-person'));
        return;
      }
      var reset = e.target.closest('[data-act="dayreset"]');
      if (reset) Store.setWeekend(reset.closest('.week').getAttribute('data-key'), { dayIdx: null });
    });

    // global default day
    $('defaultDay').addEventListener('change', function () {
      Store.setDefaultDay(+this.value);
    });

    $('filterPhase').addEventListener('change', renderCalendar);
    $('filterDone').addEventListener('change', renderCalendar);
  }

  /* ---------- hike library ---------- */

  function renderHikes() {
    var hikes = Schedule.allHikes().slice().sort(function (a, b) {
      return a.tier - b.tier || a.gainM - b.gainM;
    });
    var custom = (Store.all.hikes || []).map(function (h) { return h.id; });

    $('hikesCount').textContent =
      hikes.length + ' hikes · ' + hikes.filter(function (h) { return h.placeholder; }).length +
      ' still placeholders · ★ marks the tiers used by each training phase';

    $('hikesTable').innerHTML =
      '<table><thead><tr><th>Tier</th><th>Name</th><th>Area</th>' +
      '<th class="num">km</th><th class="num">m up</th><th class="num">max alt</th>' +
      '<th class="num">hrs</th><th class="num">drive</th><th>Note</th><th></th></tr></thead><tbody>' +
      hikes.map(function (h) {
        return '<tr><td>' + h.tier + '</td>' +
          '<td><b>' + esc(h.name) + '</b>' +
            (h.placeholder ? '<span class="tag">placeholder</span>' : '') +
            (h.url ? ' <a href="' + esc(h.url) + '" target="_blank" rel="noopener">↗</a>' : '') + '</td>' +
          '<td>' + esc(h.area || '—') + '</td>' +
          '<td class="num">' + h.distanceKm + '</td>' +
          '<td class="num">' + num(h.gainM) + '</td>' +
          '<td class="num">' + (h.maxAltM ? num(h.maxAltM) : '—') + '</td>' +
          '<td class="num">' + (h.hours || '—') + '</td>' +
          '<td class="num">' + (h.driveMin ? h.driveMin + 'm' : '—') + '</td>' +
          '<td class="hint">' + esc(h.note || '') + '</td>' +
          '<td>' + (custom.indexOf(h.id) !== -1
            ? '<button class="btn btn--sm" data-del="' + esc(h.id) + '" type="button">Remove</button>' : '') + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  function initHikeEvents() {
    $('hikeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('hName').value.trim();
      if (!name) return;
      var id = 'u-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
               '-' + Object.keys(Store.all.weekends).length + '-' + (Store.all.hikes.length + 1);
      Store.addHike({
        id: id,
        name: name,
        area: $('hArea').value.trim(),
        tier: +$('hTier').value,
        distanceKm: +$('hDist').value || 0,
        gainM: +$('hGain').value || 0,
        maxAltM: +$('hMax').value || 0,
        hours: +$('hHours').value || 0,
        driveMin: +$('hDrive').value || 0,
        terrain: '',
        url: $('hUrl').value.trim(),
        note: $('hNote').value.trim(),
        placeholder: false
      });
      $('hikeForm').reset();
      $('hTier').value = '2';
    });

    $('hikesTable').addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]');
      if (b) Store.removeHike(b.getAttribute('data-del'));
    });

    $('hikesExportBtn').addEventListener('click', function () {
      download('hikes-export.json', JSON.stringify(Schedule.allHikes(), null, 2));
    });
  }

  /* ---------- packing ---------- */

  function countPackItems() {
    var n = 0;
    PACK.categories.forEach(function (c) { n += c.items.length; });
    PACK.extras.forEach(function (g) { n += g.items.length; });
    return n;
  }

  function currentPerson() {
    return $('packPerson').value || CFG.team[0].id;
  }

  function renderPacking() {
    $('packIntro').textContent =
      'Transcribed from Altezza\'s official packing list. Each person gets their own checklist — ' +
      'switch with the dropdown. ' + PACK.climateNote;

    if (!$('packPerson').options.length) {
      $('packPerson').innerHTML = CFG.team.map(function (p) {
        return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>';
      }).join('');
    }

    var pid = currentPerson();
    var total = countPackItems();
    var done = Store.packedCount(pid);
    var pct = total ? Math.round((done / total) * 100) : 0;

    $('packProgress').textContent = done + ' of ' + total + ' packed (' + pct + '%)';
    $('packBar').style.width = pct + '%';
    $('packDuffle').innerHTML = '<b>' + PACK.duffleLimitKg + ' kg duffle limit.</b> ' + esc(PACK.duffleNote);

    $('packCats').innerHTML = PACK.categories.map(function (c) {
      return '<div class="card"><h3 class="card__title">' + esc(c.name) + '</h3>' +
        '<p class="card__sub">' + c.items.filter(function (it) {
          return Store.isPacked(pid, c.name, it.item);
        }).length + ' of ' + c.items.length + ' ticked</p>' +
        c.items.map(function (it) {
          var on = Store.isPacked(pid, c.name, it.item);
          return '<div class="checkline ' + (on ? 'checkline--done' : '') + '">' +
            '<input type="checkbox" ' + (on ? 'checked' : '') +
              ' data-cat="' + esc(c.name) + '" data-item="' + esc(it.item) + '"' +
              ' id="pk-' + hash(c.name + it.item) + '">' +
            '<label for="pk-' + hash(c.name + it.item) + '">' +
              esc(it.item) +
              (it.qty > 1 ? ' <span class="qty">×' + it.qty + '</span>' : '') +
              (it.rentable ? '<span class="tag">rentable</span>' : '') +
              (it.note ? '<small>' + esc(it.note) + '</small>' : '') +
            '</label></div>';
        }).join('') + '</div>';
    }).join('');

    $('packDaily').innerHTML = PACK.daily.map(function (d) {
      return '<div class="itin-day"><div class="itin-day__body">' +
        '<div class="itin-day__title">' + esc(d.label) + '</div>' +
        '<div class="itin-day__facts">' + esc(d.altitude) + ' · ' + esc(d.temp) + '</div>' +
        '<div class="itin-day__note">' + d.wear.map(esc).join(' · ') + '</div>' +
      '</div></div>';
    }).join('');

    $('packExtras').innerHTML = PACK.extras.map(function (g) {
      return '<div style="margin-bottom:10px"><div style="font-weight:600;font-size:13px">' + esc(g.group) + '</div>' +
        g.items.map(function (it) {
          var on = Store.isPacked(pid, 'Extras: ' + g.group, it);
          return '<div class="checkline ' + (on ? 'checkline--done' : '') + '">' +
            '<input type="checkbox" ' + (on ? 'checked' : '') +
              ' data-cat="' + esc('Extras: ' + g.group) + '" data-item="' + esc(it) + '"' +
              ' id="pk-' + hash(g.group + it) + '">' +
            '<label for="pk-' + hash(g.group + it) + '">' + esc(it) + '</label></div>';
        }).join('') + '</div>';
    }).join('');
  }

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return Math.abs(h).toString(36);
  }

  function initPackingEvents() {
    $('packPerson').addEventListener('change', renderPacking);

    ['packCats', 'packExtras'].forEach(function (id) {
      $(id).addEventListener('change', function (e) {
        if (e.target.type !== 'checkbox') return;
        Store.setPacked(currentPerson(), e.target.getAttribute('data-cat'),
                        e.target.getAttribute('data-item'), e.target.checked);
      });
    });
  }

  /* ---------- itinerary ---------- */

  function renderItinerary() {
    var it = CFG.itinerary || [];
    var totalKm = it.reduce(function (a, d) { return a + (d.distanceKm || 0); }, 0);
    var totalUp = it.reduce(function (a, d) {
      return a + Math.max(0, (d.summit ? CFG.trek.summitAltitudeM : d.altEndM) - d.altStartM);
    }, 0);

    $('itinIntro').textContent =
      CFG.trek.route + ' with ' + CFG.trek.operator + ', ' + CFG.trek.days + ' days, ' +
      Schedule.fmtLong(Schedule.parseISO(CFG.trek.startDate)) + ' to ' +
      Schedule.fmtLong(Schedule.parseISO(CFG.trek.endDate)) + '. ' +
      'Roughly ' + num(totalKm) + ' km on foot and ' + num(totalUp) + ' m of climbing.' +
      (CFG.trek.placeholder ? ' These figures are a placeholder — see the warning at the top.' : '');

    $('itinChartSub').textContent =
      'Where you sleep each night, and how high you go during the day. ' +
      'Note day 3: the classic climb-high-sleep-low move that makes the summit possible.';

    if (it.length) Chart.altitude($('itinChartWrap'), $('itinTip'), it);

    $('itinDaysSub').textContent = 'Hover the chart for the same numbers.';

    $('itinDays').innerHTML = it.map(function (d) {
      var up = Math.max(0, (d.summit ? CFG.trek.summitAltitudeM : d.altEndM) - d.altStartM);
      var down = Math.max(0, (d.summit ? CFG.trek.summitAltitudeM : d.altStartM) - d.altEndM);
      return '<div class="itin-day ' + (d.summit ? 'itin-day--summit' : '') + '">' +
        '<div class="itin-day__n">' + d.day + '</div>' +
        '<div class="itin-day__body">' +
          '<div class="itin-day__title">' + esc(d.title) + '</div>' +
          '<div class="itin-day__facts">' +
            esc(d.zone) + ' · <b>' + d.distanceKm + '</b> km · <b>' + esc(d.hours) + '</b> h · ' +
            'sleep at <b>' + num(d.altEndM) + '</b> m · ' +
            '↑ <b>' + num(up) + '</b> m ↓ <b>' + num(down) + '</b> m' +
          '</div>' +
          (d.note ? '<div class="itin-day__note">' + esc(d.note) + '</div>' : '') +
        '</div></div>';
    }).join('');

    $('itinLinks').innerHTML =
      '<div class="checkline"><span aria-hidden="true">↗</span><div>' +
        '<a href="' + esc(CFG.trek.itineraryUrl) + '" target="_blank" rel="noopener">Altezza itinerary</a>' +
        '<small>Opens only for a signed-in Altezza account — that is why the day-by-day above is a placeholder.</small>' +
      '</div></div>' +
      '<div class="checkline"><span aria-hidden="true">↗</span><div>' +
        '<a href="' + esc(CFG.trek.packingListUrl) + '" target="_blank" rel="noopener">Official packing list (PDF)</a>' +
        '<small>Fully transcribed into the Packing list tab. See p.8 for exact gear rental prices.</small>' +
      '</div></div>';
  }

  /* ---------- export / import / reset ---------- */

  function download(filename, text) {
    var blob = new Blob([text], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function initDataEvents() {
    $('exportBtn').addEventListener('click', function () {
      download('kili-training-' + Schedule.toISO(new Date()) + '.json', Store.exportJSON());
    });

    $('importBtn').addEventListener('click', function () {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.addEventListener('change', function () {
        var f = input.files && input.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            Store.importJSON(String(reader.result));
            alert('Imported. Everything below has been replaced with the file\'s contents.');
          } catch (err) {
            alert('That file did not look like an export from this site.\n\n' + err.message);
          }
        };
        reader.readAsText(f);
      });
      input.click();
    });

    $('resetBtn').addEventListener('click', function () {
      if (confirm('Clear every tick, log and custom hike stored in this browser?\n\nThis cannot be undone — export first if you want a copy.')) {
        Store.reset();
      }
    });

    $('chartTableBtn').addEventListener('click', function () {
      var t = $('chartTable');
      t.hidden = !t.hidden;
      this.setAttribute('aria-expanded', t.hidden ? 'false' : 'true');
      this.textContent = t.hidden ? 'Show as a table' : 'Hide the table';
    });
  }

  /* ---------- boot ---------- */

  function renderAll() {
    plan = Schedule.build();

    $('cdDays').textContent = plan.daysToTrek > 0 ? plan.daysToTrek : 0;
    $('brandSub').textContent =
      CFG.trek.route + ' · ' + CFG.team.map(function (p) { return p.name; }).join(', ');

    renderDayPicker();
    renderBanner();
    renderDashboard();
    renderCalendar();
    renderHikes();
    renderPacking();
    renderItinerary();
  }

  function init() {
    if (!CFG || !window.TREK_HIKES || !PACK) {
      document.body.innerHTML =
        '<main><div class="banner"><span>⚠</span><div><b>Data files did not load.</b>' +
        'Make sure the <span class="mono">data/</span> and <span class="mono">js/</span> folders sit ' +
        'next to <span class="mono">index.html</span>.</div></div></main>';
      return;
    }
    initTheme();
    initTabs();
    initCalendarEvents();
    initHikeEvents();
    initPackingEvents();
    initDataEvents();
    renderAll();

    // any save re-renders everything that depends on it
    Store.onChange(function () {
      plan = Schedule.build();
      renderDashboard();
      renderCalendar();
      renderHikes();
      renderPacking();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
