/* ============================================================================
   chart.js — two small SVG charts, drawn by hand (no chart library, no build).

   Both follow the same rules: one y-axis only, recessive grid, 2px lines,
   8px markers, the last point of each series directly labelled, and a
   crosshair tooltip on hover / keyboard focus. Colour is identity only — the
   legend and the direct labels carry it too, never colour alone.
   ========================================================================== */

var Chart = (function () {

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, text) {
    var n = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (k) {
      if (attrs[k] == null) return;          // skip, don't write the string "null"
      n.setAttribute(k, attrs[k]);
    });
    if (text != null) n.textContent = text;
    return n;
  }

  function niceCeil(v) {
    if (v <= 0) return 10;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var steps = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10];
    for (var i = 0; i < steps.length; i++) {
      if (steps[i] * mag >= v) return steps[i] * mag;
    }
    return 10 * mag;
  }

  function fmtNum(v) { return Math.round(v).toLocaleString(); }

  /* =========================================================================
     Multi-series line chart with a crosshair.
     opts = { labels:[], series:[{name, color, values:[], dashed:bool}],
              yLabel, xLabel, tipTitle(i), tipRow(s,i) }
     ======================================================================= */

  function lines(wrap, tip, opts) {
    var W = 760, H = 250;
    var PAD = { t: 16, r: 62, b: 30, l: 50 };
    var plotW = W - PAD.l - PAD.r;
    var plotH = H - PAD.t - PAD.b;

    var maxV = 0;
    opts.series.forEach(function (s) {
      s.values.forEach(function (v) { if (v != null && v > maxV) maxV = v; });
    });
    var yMax = niceCeil(maxV || 1);

    var n = opts.labels.length;
    var x = function (i) { return PAD.l + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW); };
    var y = function (v) { return PAD.t + plotH - (v / yMax) * plotH; };

    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      role: 'img',
      'aria-label': opts.ariaLabel || 'Line chart'
    });

    /* --- gridlines + y ticks (recessive) --- */
    var TICKS = 4;
    for (var g = 0; g <= TICKS; g++) {
      var v = (yMax / TICKS) * g;
      svg.appendChild(el('line', {
        x1: PAD.l, x2: PAD.l + plotW, y1: y(v), y2: y(v),
        stroke: 'var(--grid)', 'stroke-width': 1
      }));
      svg.appendChild(el('text', {
        x: PAD.l - 9, y: y(v) + 4, 'text-anchor': 'end',
        fill: 'var(--text-muted)', 'font-size': 11,
        'font-family': 'inherit', style: 'font-variant-numeric:tabular-nums'
      }, fmtNum(v)));
    }

    /* --- baseline --- */
    svg.appendChild(el('line', {
      x1: PAD.l, x2: PAD.l + plotW, y1: y(0), y2: y(0),
      stroke: 'var(--axis)', 'stroke-width': 1
    }));

    /* --- x labels: first, last, and a few in between --- */
    var every = Math.max(1, Math.ceil(n / 8));
    opts.labels.forEach(function (lab, i) {
      if (i % every !== 0 && i !== n - 1) return;
      svg.appendChild(el('text', {
        x: x(i), y: H - 10, 'text-anchor': 'middle',
        fill: 'var(--text-muted)', 'font-size': 11, 'font-family': 'inherit'
      }, lab));
    });

    if (opts.yLabel) {
      svg.appendChild(el('text', {
        x: PAD.l - 9, y: PAD.t - 5, 'text-anchor': 'end',
        fill: 'var(--text-muted)', 'font-size': 10.5, 'font-family': 'inherit'
      }, opts.yLabel));
    }

    /* --- crosshair (hidden until hover) --- */
    var cross = el('line', {
      y1: PAD.t, y2: PAD.t + plotH,
      stroke: 'var(--axis)', 'stroke-width': 1, opacity: 0
    });
    svg.appendChild(cross);

    /* --- series --- */
    var dotGroups = [];
    opts.series.forEach(function (s) {
      var pts = [];
      s.values.forEach(function (v, i) { if (v != null) pts.push([x(i), y(v)]); });
      if (!pts.length) { dotGroups.push(null); return; }

      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
      svg.appendChild(el('path', {
        d: d, fill: 'none', stroke: s.color, 'stroke-width': 2,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        'stroke-dasharray': s.dashed ? '5 4' : null
      }));

      // 2px surface ring on the end cap so overlapping series stay readable
      var last = pts[pts.length - 1];
      svg.appendChild(el('circle', {
        cx: last[0], cy: last[1], r: 4.5,
        fill: s.color, stroke: 'var(--surface-1)', 'stroke-width': 2
      }));

      // direct label on the final point — identity is never colour-alone
      svg.appendChild(el('text', {
        x: last[0] + 9, y: last[1] + 4,
        fill: 'var(--text-secondary)', 'font-size': 11, 'font-family': 'inherit',
        'font-weight': 600
      }, s.name));

      var dot = el('circle', {
        r: 4.5, fill: s.color, stroke: 'var(--surface-1)', 'stroke-width': 2, opacity: 0
      });
      svg.appendChild(dot);
      dotGroups.push(dot);
    });

    /* --- hover surface --- */
    var hit = el('rect', {
      x: PAD.l, y: PAD.t, width: plotW, height: plotH,
      fill: 'transparent', style: 'cursor:crosshair'
    });
    svg.appendChild(hit);

    function show(i, clientX) {
      cross.setAttribute('x1', x(i));
      cross.setAttribute('x2', x(i));
      cross.setAttribute('opacity', 1);

      var rows = '';
      opts.series.forEach(function (s, si) {
        var v = s.values[i];
        var dot = dotGroups[si];
        if (v == null) { if (dot) dot.setAttribute('opacity', 0); return; }
        if (dot) {
          dot.setAttribute('cx', x(i));
          dot.setAttribute('cy', y(v));
          dot.setAttribute('opacity', 1);
        }
        rows += '<div class="tooltip__r">' +
                  '<span><i class="tooltip__dot" style="display:inline-block;background:' + s.color + '"></i> ' + s.name + '</span>' +
                  '<span>' + (opts.fmt ? opts.fmt(v) : fmtNum(v)) + '</span>' +
                '</div>';
      });

      tip.innerHTML = '<div class="tooltip__t">' + opts.labels[i] + (opts.tipSuffix ? opts.tipSuffix(i) : '') + '</div>' + rows;
      tip.setAttribute('data-show', '1');

      var rect = svg.getBoundingClientRect();
      var px = (x(i) / W) * rect.width;
      var tw = tip.offsetWidth || 160;
      tip.style.left = Math.max(0, Math.min(rect.width - tw, px - tw / 2)) + 'px';
      tip.style.top = '4px';
    }

    function hide() {
      cross.setAttribute('opacity', 0);
      dotGroups.forEach(function (d) { if (d) d.setAttribute('opacity', 0); });
      tip.setAttribute('data-show', '0');
    }

    function indexFromEvent(e) {
      var rect = svg.getBoundingClientRect();
      var svgX = ((e.clientX - rect.left) / rect.width) * W;
      var frac = (svgX - PAD.l) / plotW;
      return Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1))));
    }

    hit.addEventListener('mousemove', function (e) { show(indexFromEvent(e), e.clientX); });
    hit.addEventListener('mouseleave', hide);
    hit.addEventListener('touchstart', function (e) {
      if (e.touches[0]) show(indexFromEvent(e.touches[0]));
    }, { passive: true });

    // keyboard: arrow through the points
    var cursor = n - 1;
    svg.setAttribute('tabindex', '0');
    svg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { cursor = Math.min(n - 1, cursor + 1); show(cursor); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { cursor = Math.max(0, cursor - 1);     show(cursor); e.preventDefault(); }
      if (e.key === 'Escape') hide();
    });
    svg.addEventListener('blur', hide);

    wrap.querySelectorAll('svg').forEach(function (o) { o.remove(); });
    wrap.insertBefore(svg, wrap.firstChild);
    return svg;
  }

  /* =========================================================================
     Altitude profile — a single-series step/line with a filled body under it.
     One series, so no legend box: the card title names it.
     ======================================================================= */

  function altitude(wrap, tip, days) {
    var W = 760, H = 230;
    var PAD = { t: 18, r: 20, b: 42, l: 52 };
    var plotW = W - PAD.l - PAD.r;
    var plotH = H - PAD.t - PAD.b;

    // Each day contributes a start and an end point, so the profile shows the
    // climb AND the descent inside a day (summit day especially).
    var pts = [];
    days.forEach(function (d, i) {
      pts.push({ alt: d.altStartM, day: d, at: i, edge: 'start' });
      pts.push({ alt: d.altEndM,   day: d, at: i, edge: 'end' });
    });

    var maxAlt = 0;
    days.forEach(function (d) {
      maxAlt = Math.max(maxAlt, d.altStartM, d.altEndM);
      if (d.summit) maxAlt = Math.max(maxAlt, window.TREK_CONFIG.trek.summitAltitudeM);
    });
    var yMax = niceCeil(maxAlt * 1.02);

    var n = pts.length;
    var x = function (i) { return PAD.l + (i / (n - 1)) * plotW; };
    var y = function (v) { return PAD.t + plotH - (v / yMax) * plotH; };

    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Altitude profile of the trek, day 1 to day ' + days.length
    });

    var TICKS = 4;
    for (var g = 0; g <= TICKS; g++) {
      var v = (yMax / TICKS) * g;
      svg.appendChild(el('line', {
        x1: PAD.l, x2: PAD.l + plotW, y1: y(v), y2: y(v),
        stroke: 'var(--grid)', 'stroke-width': 1
      }));
      svg.appendChild(el('text', {
        x: PAD.l - 9, y: y(v) + 4, 'text-anchor': 'end',
        fill: 'var(--text-muted)', 'font-size': 11, 'font-family': 'inherit',
        style: 'font-variant-numeric:tabular-nums'
      }, fmtNum(v)));
    }
    svg.appendChild(el('text', {
      x: PAD.l - 9, y: PAD.t - 5, 'text-anchor': 'end',
      fill: 'var(--text-muted)', 'font-size': 10.5, 'font-family': 'inherit'
    }, 'metres'));

    // filled body, then the line on top
    var area = 'M' + x(0) + ' ' + y(0);
    pts.forEach(function (p, i) { area += ' L' + x(i) + ' ' + y(p.alt); });
    area += ' L' + x(n - 1) + ' ' + y(0) + ' Z';
    svg.appendChild(el('path', { d: area, fill: 'var(--series-1)', opacity: 0.13 }));

    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(i) + ' ' + y(p.alt); }).join(' ');
    svg.appendChild(el('path', {
      d: line, fill: 'none', stroke: 'var(--series-1)', 'stroke-width': 2,
      'stroke-linejoin': 'round', 'stroke-linecap': 'round'
    }));

    svg.appendChild(el('line', {
      x1: PAD.l, x2: PAD.l + plotW, y1: y(0), y2: y(0),
      stroke: 'var(--axis)', 'stroke-width': 1
    }));

    // day labels along the bottom, at each day's midpoint
    days.forEach(function (d, i) {
      var mid = (x(i * 2) + x(i * 2 + 1)) / 2;
      svg.appendChild(el('text', {
        x: mid, y: H - 24, 'text-anchor': 'middle',
        fill: 'var(--text-muted)', 'font-size': 11, 'font-family': 'inherit'
      }, 'Day ' + d.day));
      if (d.summit) {
        svg.appendChild(el('text', {
          x: mid, y: H - 10, 'text-anchor': 'middle',
          fill: 'var(--series-2)', 'font-size': 10, 'font-weight': 700, 'font-family': 'inherit'
        }, 'SUMMIT'));
      }
    });

    // markers, with the summit one called out directly
    pts.forEach(function (p, i) {
      var isSummitTop = p.day.summit && p.edge === 'start';
      svg.appendChild(el('circle', {
        cx: x(i), cy: y(p.alt), r: 4,
        fill: p.day.summit ? 'var(--series-2)' : 'var(--series-1)',
        stroke: 'var(--surface-1)', 'stroke-width': 2
      }));
      void isSummitTop;
    });

    // Uhuru Peak reference line
    var summitAlt = window.TREK_CONFIG.trek.summitAltitudeM;
    if (summitAlt && summitAlt <= yMax) {
      svg.appendChild(el('line', {
        x1: PAD.l, x2: PAD.l + plotW, y1: y(summitAlt), y2: y(summitAlt),
        stroke: 'var(--series-2)', 'stroke-width': 1.5, 'stroke-dasharray': '5 4'
      }));
      svg.appendChild(el('text', {
        x: PAD.l + 6, y: y(summitAlt) - 6,
        fill: 'var(--series-2)', 'font-size': 10.5, 'font-weight': 700, 'font-family': 'inherit'
      }, 'Uhuru Peak ' + fmtNum(summitAlt) + ' m'));
    }

    var hit = el('rect', {
      x: PAD.l, y: PAD.t, width: plotW, height: plotH, fill: 'transparent', style: 'cursor:crosshair'
    });
    svg.appendChild(hit);

    hit.addEventListener('mousemove', function (e) {
      var rect = svg.getBoundingClientRect();
      var svgX = ((e.clientX - rect.left) / rect.width) * W;
      var frac = (svgX - PAD.l) / plotW;
      var i = Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1))));
      var p = pts[i];
      tip.innerHTML =
        '<div class="tooltip__t">Day ' + p.day.day + ' — ' + (p.edge === 'start' ? 'start' : 'camp') + '</div>' +
        '<div class="tooltip__r"><span>Altitude</span><span>' + fmtNum(p.alt) + ' m</span></div>' +
        '<div class="tooltip__r"><span>Distance</span><span>' + p.day.distanceKm + ' km</span></div>' +
        '<div class="tooltip__r"><span>On foot</span><span>' + p.day.hours + ' h</span></div>';
      tip.setAttribute('data-show', '1');
      var px = (x(i) / W) * rect.width;
      var tw = tip.offsetWidth || 170;
      tip.style.left = Math.max(0, Math.min(rect.width - tw, px - tw / 2)) + 'px';
      tip.style.top = '4px';
    });
    hit.addEventListener('mouseleave', function () { tip.setAttribute('data-show', '0'); });

    wrap.querySelectorAll('svg').forEach(function (o) { o.remove(); });
    wrap.insertBefore(svg, wrap.firstChild);
  }

  return { lines: lines, altitude: altitude };
})();
