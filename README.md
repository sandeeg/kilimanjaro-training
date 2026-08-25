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

## Change these two things first

Both are placeholders because the sources needed a login I don't have.

### 1. `data/config.js` — the trek

```js
trek: {
  placeholder: true,          // <- set to false once you've checked the rest
  route: "Machame Route",
  startDate: "2026-12-21",    // <- the important one
  ...
}
```

`startDate` drives **everything**. Change it and the number of training weekends, the
phase split, the taper and the countdown all recompute. Below it, `itinerary` holds the
day-by-day camps and altitudes — currently a standard 7-day Machame profile. Replace it
with the real one from your Altezza page.

Also in this file: `team` (the four names and their initials) and `training` (which day you hike,
how heavy the pack gets).

### 2. `data/hikes.js` — the hikes

17 hikes, most of them **placeholder archetypes**: the shape of each workout is right
("a 950 m stair session", "a 25 km mountain day"), the trail names are invented.

Replace `name`, `area`, `driveMin` and `url` with real trails near you. Keep `distanceKm`,
`gainM` and `tier` roughly as they are and the calendar keeps working.

`tier` is what matters — it decides which training phase a hike gets offered for:

| tier | meaning | used in |
|---|---|---|
| 0 | recovery / cross-training | taper |
| 1 | easy base | base, taper |
| 2 | moderate | base, build, taper |
| 3 | hard | build, peak |
| 4 | very hard | peak |
| 5 | summit simulation | peak |

You can also add hikes from inside the site (**Hike library** tab → *Add a hike*). Those
save to your browser only — hit **Export hikes as JSON** and paste the result into this
file to make them permanent for everyone.

## What's on each tab

- **Dashboard** — days to go, weekends left, distance and climbing logged, and how many
  Kilimanjaros' worth of ascent you've done. Plus a chart of planned vs logged climbing.
- **Training calendar** — one card per weekend. Swap the hike, tick who came, log what you
  actually did. Phases: Base → Build → Peak → Taper. Gear-testing milestones are pinned to
  specific weekends (break in boots, test the rain shell, weigh the duffle).
- **Hike library** — every hike, sortable by tier. Add your own.
- **Packing list** — the full Altezza list, transcribed from their PDF, with a separate
  checklist per person and the day-by-day layering for the mountain.
- **The trek** — altitude profile and day-by-day, including the climb-high-sleep-low day.

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

## Sources

- Packing list: [altezzatravel.com/kilimanjaro-packing-list.pdf](https://altezzatravel.com/kilimanjaro-packing-list.pdf)
  — fully transcribed into `data/packing.js`. Gear rental prices are on page 8 of the PDF;
  I deliberately didn't copy them across, because the price column didn't extract in a
  reliable item-by-item order and a wrong price is worse than no price.
- Itinerary: [story.altezza.travel/itinerary/iqj6ur](https://story.altezza.travel/itinerary/iqj6ur)
  — **couldn't read this.** It's a JavaScript app whose route requires a signed-in Altezza
  account; the underlying API returns 401 without one. Hence the placeholder itinerary.
- The Teams note with your hike options — needs a Microsoft sign-in that wasn't completed.
  Hence the placeholder hikes.

## File map

```
index.html            the page itself
css/styles.css        styling, light and dark themes
data/config.js        trek dates, team, itinerary, gear milestones   <- EDIT FIRST
data/hikes.js         the hike library                              <- EDIT SECOND
data/packing.js       the Altezza packing list
js/store.js           saving to and loading from your browser
js/schedule.js        works out the training calendar from the trek date
js/chart.js           draws the two charts
js/app.js             puts it all on the page
```
