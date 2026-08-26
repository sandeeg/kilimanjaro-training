# Kilimanjaro Training Plan

A small website that turns "we're climbing Kilimanjaro at Christmas" into a weekend-by-weekend
training plan, a shared packing checklist, and the trek itself on one page.

For: Sandy, Poonam, Ramita and Sandeep.

## Open it

**Double-click `index.html`.** That's it.

No `npm install`, no build step, no server, no internet needed. It's plain HTML, CSS and
JavaScript. Works in Edge, Chrome, Firefox and Safari, and on a phone.

> Why the data lives in `.js` files rather than `.json`: browsers block `fetch()` on files
> opened straight from your disk, so a `.json` version would show an empty page until you
> ran a web server. Assigning to `window.TREK_CONFIG` in a `.js` file sidesteps that
> entirely. Editing them is exactly as easy — it's still just a list of values.

## Where the content comes from

Everything is now real, from your own "Kilimanjaro Training Calendar — Warm-first training
plan (Aug–Dec)" document plus Altezza's packing list. Two things are worth knowing:

**The dates were shifted by one day.** Every date in your document is a Saturday in 2025 but
a Sunday in 2026 — the weekend table was built on last year's calendar. Each row moved back
one day onto the real 2026 Saturday, which maps 1:1 across all 18 weekends. Each card shows
the original under `doc:` so you can always see what moved.

**Camp altitudes and the day-7 descent are not in your document.** The altitudes are the
standard published heights for those Lemosho camps, and day 7 is inferred — it's marked as
such on the trek tab. Check both against your Altezza paperwork.

## The two files to edit

### `data/config.js` — trek, team, and the plan

```js
trek: {
  route: "Lemosho / Shira Route",
  startDate: "2026-12-25",    // Day 1. Drives the countdown and every date.
  summitDate: "2026-12-30",   // summit night
  ...
}
```

Below that, `plannedWeekends` is the actual 18-weekend schedule: hike, why that weekend,
travel booking, who's away, pack weight. **While that list is non-empty it IS the calendar.**
Empty it and the site falls back to auto-generating a difficulty ramp from the hike library.

Also here: `team`, `itinerary` (day-by-day), and `gearMilestones`.

### `data/hikes.js` — the 24 hikes

Ten are from your document (Mount Si Old Trail, Poo Poo Point, Granite, Mailbox, Teneriffe,
Camp Muir, Baldy, Whitney, Elbert, plus the rest day) and fourteen are other main Washington
trails, available as swaps.

`statsSource` tells you how much to trust the numbers:

| value | meaning |
|---|---|
| `"WTA"` | mileage, gain and high point read off the Washington Trails Association page. All 18 WA hikes. Distances are round trip. |
| `"estimate"` | Baldy, Whitney and Elbert — WTA doesn't cover them. Standard published figures for the usual route. **Confirm before booking.** |

`hours` and `driveMin` are estimates in every case, with drive times from Seattle.

`tier` decides which hikes get starred as suited to a phase:

| tier | meaning |
|---|---|
| 0 | recovery / cross-training |
| 1 | easy base |
| 2 | moderate |
| 3 | hard |
| 4 | very hard |
| 5 | summit simulation, or anything above 2,500 m |

You can also add hikes from inside the site (**Hike library** tab → *Add a hike*). Those save
to your browser only — hit **Export hikes as JSON** and paste the result into this file to
make them permanent for everyone.

One thing to keep an eye on: **Mount Whitney needs a day-use permit** from a February lottery
on recreation.gov, and its quota season runs 1 May – 1 Nov. You've said you have it; the note
stays on the card so nobody forgets.

## What's on each tab

- **Dashboard** — days to go, weekends left, distance and climbing logged, and how many
  Kilimanjaros' worth of ascent you've done. Plus a chart of planned vs logged climbing.
- **Training calendar** — one card per weekend, from your own training document: the hike, why
  that weekend, travel bookings, who's away. Swap the hike, tick who came, log what you did.
  Gear-testing milestones are pinned to specific weekends.

  **Which day you hike is up to you.** The *Hike day* dropdown at the top sets your usual day —
  Saturdays, Sundays, or any weekday. Each weekend card also has its own day dropdown, so you
  can move a single hike to the Wednesday without disturbing anything else; that card then
  offers *reset to default*. Everything downstream follows: the countdown, "days before
  departure", the past/upcoming markers and the chart's x-axis.
- **Hike library** — every hike, sortable by tier. Add your own.
- **Garmin** — import each person's Garmin activity export and the kilometres and
  climbing fill themselves in. See below.
- **Packing list** — the full Altezza list, transcribed from their PDF, with a separate
  checklist per person and the day-by-day layering for the mountain.
- **The trek** — altitude profile and day-by-day, including the climb-high-sleep-low day,
  plus the flights and how they sit around the trek.

## Garmin

Fully automatic live sync is **not possible here**, and it's worth knowing why: Garmin's
official Activity API uses OAuth with a client *secret*, which needs a server to hold it.
This site is static files on GitHub Pages — there is no server, and anything committed is
public. So instead of a half-working live feed, the site reads the export Garmin already
gives you.

Per person, once:

1. Garmin Connect on a computer → **Activities** → scroll back far enough to load the hikes
   you want (the export only contains what's on screen) → **Export CSV** (top right).
2. On the **Garmin** tab, pick the units matching your Garmin account (km/miles, metres/feet),
   then choose the file.
3. Check the preview, then press **Apply**.

What it does:

- Matches activities to a training weekend **by week, not exact day** — so it doesn't matter
  which day you actually went, and it works with the per-weekend day picker.
- Ignores rides, swims and anything not on foot.
- Keeps **each person's own distance** for the same hike, rather than one shared number.
- Offers off-plan activities (an earlier hike, a holiday traverse) for the "Already in the
  bank" log.
- **Remove import** undoes everything that import wrote, including log entries.

Parsing happens in your browser. No Garmin login, nothing uploaded, and the file itself is
never stored anywhere but this device. If the numbers look wrong by a factor of ~1.6 or ~3.3,
the unit selector is set incorrectly — the site warns you if the averages look implausible.

## Reservation codes

The flight dates, times and airports are in `data/config.js`. **The booking references are
not**, on purpose: a reservation code plus a surname is usually all an airline asks for to
view or change a booking, and this repo is public.

Instead, type them into the boxes on the **The trek** tab. They're saved in your browser
alongside your hike ticks, and never become part of the site's files. Each person enters
their own; nothing is shared unless you deliberately send someone your Export file.

## Where your ticks are saved

**In this browser, on this device only.** Nothing is uploaded anywhere; there's no account
and no server. If Poonam ticks something on her laptop, you won't see it on yours.

To share progress: **Training calendar** tab → **Export my data** saves a `.json` file.
Send it over; the other person hits **Import**. Note that Import *replaces* everything —
it doesn't merge two people's logs together.

**Reset** wipes every tick and custom hike in this browser. Export first if you care.

## Putting it online (optional)

So all four of you can open it on a phone instead of passing files around:

1. Make a new repository on GitHub (public, or private with GitHub Pages enabled).
2. Upload this whole folder — keep the `css/`, `js/` and `data/` folders as they are,
   with `index.html` at the top level.
3. Repo **Settings** → **Pages** → Source: *Deploy from a branch*, branch `main`, folder
   `/ (root)`. Save.
4. A minute later it's live at `https://<your-username>.github.io/<repo-name>/`.

Each person still has their own checkboxes — Pages only hosts the files, it doesn't sync
data between people.

## The photo

`assets/kilimanjaro.jpg` is Kibo under cloud with two porters on the trail — by Joel Peel,
originally on Unsplash, via Wikimedia Commons, released under
[CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.en) (public domain dedication).
CC0 imposes no attribution requirement; the credit in the corner of the hero is there because
crediting a photographer is the decent thing to do. To use your own photo instead, drop it in
at the same path and keep it roughly 3:2 — the hero crops to 16:7 on desktop and 4:3 on phones.

## Sources

- Packing list: [altezzatravel.com/kilimanjaro-packing-list.pdf](https://altezzatravel.com/kilimanjaro-packing-list.pdf)
  — fully transcribed into `data/packing.js`. Gear rental prices are on page 8 of the PDF;
  I deliberately didn't copy them across, because the price column didn't extract in a
  reliable item-by-item order and a wrong price is worse than no price.
- Training plan, trek dates, team and per-person gear gaps:
  **Kilimanjaro_Training_Calendar.pdf** ("Warm-first training plan, Aug–Dec"). This is the
  source of record for the calendar.
- Trail stats: [wta.org](https://www.wta.org) — each hike links to its own page.
- Itinerary: [story.altezza.travel/itinerary/iqj6ur](https://story.altezza.travel/itinerary/iqj6ur)
  — **still unread.** It's a JavaScript app whose route requires a signed-in Altezza account;
  the API returns 401 without one. The day-by-day came from your PDF instead.

## File map

```
index.html            the page itself
css/styles.css        styling, light and dark themes
assets/kilimanjaro.jpg  the hero photo (CC0)
data/config.js        trek, team, the 18-weekend plan, itinerary     <- EDIT FIRST
data/hikes.js         the 24 hikes                                   <- EDIT SECOND
data/packing.js       the Altezza packing list
js/store.js           saving to and loading from your browser
js/schedule.js        works out the training calendar from the trek date
js/chart.js           draws the two charts
js/app.js             puts it all on the page
```
