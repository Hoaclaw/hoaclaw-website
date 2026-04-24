# HOAClaw Website

Landing page for **HOAClaw** — the virtual HOA manager. A cluster of AI agents that handles violations, dues, vendors, and resident communications so HOA boards can get back to their neighbors.

## What's in the box

| File | Purpose |
| --- | --- |
| `index.html` | The full landing page — hero, stakeholder cards, feature grid, news carousel, CTA, footer, and the floating lobster mascot |
| `site.css` | Custom styles layered on top of Tailwind — animations (sun rays, butterflies, mascot bob/wave, leaf float), carousel transitions, announcement prose styles, reduced-motion fallbacks |
| `site.js` | Mobile nav toggle, scroll-reveal, and the announcements loader (fetches `announcements.md`, parses it, renders the carousel with prev/next, dots, auto-advance, swipe, keyboard arrows, and hover-pause) |
| `announcements.md` | Latest news entries rendered into the carousel on the homepage |

Tailwind is loaded via CDN, and `marked` (markdown parser) is loaded via CDN for announcement rendering. No build step.

## Running locally

The page uses `fetch('announcements.md')` which does not work from `file://` URLs. Serve the directory over HTTP:

```sh
cd website
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly still works, but the announcements carousel will fall back to the empty state.

## Updating announcements

Edit `announcements.md`. Each entry follows:

```markdown
## Title of the announcement
YYYY-MM-DD

Body paragraph. Markdown supported — **bold**, *italics*, [links](https://…), lists.
```

The parser splits on `## ` headings, so keep each entry starting with one. The first line after the heading is treated as the date; everything below is the body.

## Editing the page

- **Hero headline / copy** — top `<section>` in `index.html`, the `<h1>` and the paragraph beneath it.
- **Stakeholder cards** — `#who` section, four cards under `grid sm:grid-cols-2 lg:grid-cols-4`.
- **Feature grid** — `#features` section, six cards describing each agent cluster.
- **Contact email** — search for `hello@hoaclaw.com` and replace everywhere; it's wired into every CTA and the floating lobster mascot.
- **Mascot** — `<a class="mascot-pinned …">` near the bottom of `index.html`. Change `href` to retarget the click, or adjust `bottom-*` / `right-*` / `w-*` / `h-*` classes to reposition and resize.
- **Colors / fonts** — `tailwind.config` is inlined at the top of `index.html`. The palette is a sage-green + coral + cream theme with Fraunces (display) and Inter (body).

## Accessibility notes

- Every decorative SVG (neighborhood scene, fronds, sunbursts, mascot) is `aria-hidden`.
- All animations respect `prefers-reduced-motion`.
- The announcements carousel responds to ← / → arrows when focused, and pauses on hover.
