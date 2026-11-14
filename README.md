# Portfolio — Lukalapu Mohnish

A fully static, multi-page portfolio. Next.js App Router, TypeScript, Tailwind v4,
Base UI primitives, Motion for the scroll-linked pieces.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # every route should report ○ or ●
npx eslint app components data lib types   # see the note under Setup
```

## Routes

Five pages plus a case study per project. Every one is prerendered at build time.

| Route | Holds |
|---|---|
| `/` | Hero, the scroll-written statement, three projects, four skill areas, two internships |
| `/skills` | Four areas, searchable and sortable, each skill linked to its evidence |
| `/projects` | All eight, filterable by category |
| `/projects/[slug]` | Full case study, generated from `data/projects.ts` |
| `/career` | Internships, Positions, Education, Results, on a scroll-driven timeline |
| `/contact` | Message form, socials, location, languages |

`app/not-found.tsx` is exported as `404.html` and served for anything unmatched.

## Editing content

All copy lives in `data/`. Nothing is fetched at runtime, so an edit there is the
only way to change what the site says.

| File | Holds |
|---|---|
| `data/site-config.ts` | Name, tagline, statement, socials, nav items |
| `data/projects.ts` | Projects and their full case-study bodies |
| `data/skills.ts` | Skill categories, levels, and evidence links |
| `data/career.ts` | Internships, positions, education, results, coursework, languages |

`navItems` in `site-config.ts` is the single source for the navbar, the mobile
sheet, the footer sitemap and `app/sitemap.ts`. Adding a page means one line
there plus a folder under `app/`.

Adding a project means appending one object to `projects`; the listing, the
category filter, the home-page preview, `generateStaticParams` and the sitemap
all derive from that array. Four fields are worth using well:

- **`highlight`** — the non-obvious engineering decision inside the project.
  A stack list says "PyTorch"; this says why the work was hard. It's the line
  that distinguishes real work from tutorial output.
- **`role`** — "Project lead" / "Project co-lead", from the CV.
- **`detail`** — optional. With it the project gets a full case study; without
  it, a card and a short page. Nothing breaks either way.
- **`image`** — optional, and currently missing on four of eight. Without one a
  card in the grid falls back to a typographic monogram, and a *wide* card drops
  its media panel entirely rather than showing a 400px empty rectangle. Set
  `imageTreatment: "chart"` for matplotlib plots on white so they invert cleanly
  on the dark theme.

Skill `level` values are a self-assessment and are printed as *bands*, never as
percentages. The header comment in `data/skills.ts` records which came from the
previous site verbatim, which were seeded from project evidence, and which came
from the CV.

## Design system

**Palette: "graphite on paper".** One warm neutral ramp (hue 55-85), in OKLCH.
Warm neutrals rather than cool zinc, because zinc-plus-emerald is the shadcn
starter palette and reads instantly as generated.

**The accent changes hue between themes, on purpose.** Light mode is a deep
brick `#b14019`, a red pen mark on a problem sheet. Lightening that far enough
to read on a dark ground turns it into a soft peach, and a soft peach on warm
graphite is Anthropic's brand colour: measured in OKLab, the first attempt sat
**0.052** from Claude's `#d97757`, closer to it than to anything else tested.
Dark mode therefore carries the same *idea* in a different medium, an
olive-chartreuse `#b6ca54` highlighter, which measures **0.146** from the
nearest recognisable AI or starter-template accent, the furthest of any usable
candidate.

Ruled out by measurement, not taste: purple and indigo (Linear `#7c5cfc`,
Stripe `#635bff`), `#0070f3` blue (Vercel), emerald (the shadcn default this
site started on), and the whole coral-to-sand band (`#d97757`, `#d4955a`).
`tmp/darkpick.mjs` in the working notes scores candidates on contrast and
OKLab distance if you want to re-run it.

Every text pair was measured, not eyeballed: 4.95 to 16.47:1. Anything whose
*border* identifies it as a control uses `--border-strong` (3.49:1), not the
decorative `--border` hairline.

**Type.** Three faces, three jobs: Archivo for display, Instrument Sans for
prose and UI, Geist Mono for numbers, dates and labels. Geist Sans was retired
because it is the default face of the framework this site is built with, which
makes it the fastest way to be recognised as a template.

**Shape lock.** One radius, 4px, for every surface and every control. The single
documented exception is a tag or status chip, which is pill-shaped because it is
a discrete token rather than a container.

**Texture.** A fixed, pointer-events-none film grain over the whole page
(`body::before`), plus one soft accent wash behind each masthead. This replaced a
graph-paper grid: ruled lines drawn only to make a page feel designed are
decoration pretending to be structure.

**Eyebrows are rationed** to at most one per three sections, and are never
section numbers. `Section` has no `index` prop for that reason.

**No em-dashes or en-dashes** in any string that reaches the page. Ranges use a
hyphen. `data/*.ts` and every page were swept for this.

## Animation

Three systems, deliberately kept apart. Every duration, easing, spring and
stagger lives in `lib/motion-config.ts` (the CSS mirrors them as `--ease-*`,
`--dur-*` and friends in `app/globals.css`); components never write a literal.

**One-shot** is the contract everything below shares. An element animates the
first time it enters the viewport and is static forever after: a single shared
`IntersectionObserver` (`observeOnce` in `components/motion/reveal.tsx`)
unobserves it the moment it lands, so scrolling back up never replays it.
`Reveal` itself is now a build (see below), so every card, row and panel
assembles the same way; `useRevealOnce` and `observeOnce` remain for the
pieces with their own entrance (skill rows and bars, timeline branches and
nodes, count-ups), whose visuals are CSS (`[data-reveal]`, `[data-bar]`,
`[data-branch]`, `[data-node]` in `app/globals.css`). Several callers can wait
on the same element (a skill row is both a build and a reveal); each gets its
callback.

This is why it is not CSS `animation-timeline: view()`: that is scroll-*linked*
and plays backwards as you scroll up, which is the opposite of an entrance.

**Scroll-linked motion** (`components/motion/scroll-linked.tsx`) is used where
the scroll position *is* the information:

| Effect | Where | What it communicates |
|---|---|---|
| `ScrollFadeOut` | hero | the masthead handing off to the page |
| `ScrollDepth` | the giant outlined name | depth; it lags the hero as it leaves |
| `ScrollWrite` | home statement | pace; the one line meant to be read, not scanned |
| `StickyStack` | home, selected work | sequence; these projects are in an order |
| `ParallaxMedia` | project card images | the frame is a window, not a printed rectangle |
| `ScrollSpine` | career timeline | "you are here" on the trunk |

Three rules hold across all of them: no `window.addEventListener("scroll")`, no
scroll position in React state (every value is a MotionValue written straight to
a style property, so scrolling re-renders nothing), and only `transform` and
`opacity` are animated.

`ScrollWrite` computes its per-word opacity **in CSS** from three custom
properties (`--p` progress, `--n` word count, `--i` word index), which keeps it
to one MotionValue regardless of sentence length.

`StickyStack` dims a receding card with an opaque **scrim**, never by animating
the card's own opacity: opacity on the wrapper makes the whole subtree
translucent, and in a stack that means the card underneath reads straight
through the one on top.

`VelocityMarquee` (the focus areas on the home page) drifts on its own and
speeds up with scroll velocity; its frame loop runs only while it is on screen.

**Build** (`components/motion/build/`) is the third system: the page assembling
itself, the way a layout tool or an agent harness shows work in progress. A
cursor arrives, drags a selection frame round a block with a name tag on it, a
grey skeleton fills the frame, and an opaque cover wipes off the real content.
It is one-shot (it reuses the reveal observer) and multi-phase, never
scroll-linked. On the first view of the home page in a browser session the
page builds itself in real time, one block at a time, in about 7 seconds: a
flock of cursors orbits a seed square, and just before each block's turn a
couple of them peel off to its corners, draw its frame, hold the skeleton and
wipe it open, so the flock thins out as the page fills in. Any key, click,
wheel or touch skips straight to the finished page, and the input still goes
through.

| Piece | Job |
|---|---|
| `build.tsx` | `<Build label>`: wraps a block, adds one `aria-hidden` cover span |
| `registry.ts` | module-level store linking blocks to the engine; no React context, so nothing re-renders |
| `engine.ts` | schedules `data-build-state` (pending, frame, skeleton, resolve, done) and draws the canvas |
| `sim.ts`, `draw.ts` | pure: the cursor simulation and the canvas drawing; no React, no DOM |
| `stage.tsx` | the one fixed canvas, mounted last in `app/layout.tsx` |
| `boot.tsx` | starts the home-page boot, or makes sure it never replays |

What keeps it safe:

- **The content is never hidden.** Blocks are server-rendered and opaque; only
  the cover on top moves, and the cover's states are pure CSS. The `<h1>` is
  painted from the first frame, so LCP is unaffected.
- **A CSS failsafe** removes every build cover after 0.6s, and shows any
  one-shot reveal still hidden after 2.6s, until the engine stamps
  `data-build-ready` on `<html>`, so a failed or blocked bundle can never leave
  the page covered. On an intro visit the inline script also sets
  `data-boot-hold`, which stops the hero's covers timing out while the page's
  scripts are still loading (a slow first visit still gets the whole intro):
  it is released 1.5s after `load`, at once if a script fails to load, and
  after 10s regardless, and then the ordinary failsafe runs. If the engine
  arrives after a cover has already started to go, that block is left
  uncovered rather than covered again. With scripting off a `<noscript>` rule
  removes the covers outright.
- **No render-time branching.** Whether the boot plays is decided by an inline
  `<head>` script that writes `data-boot` (`play`, `skip` or `done`) onto
  `<html>` before first paint; everything else reacts in CSS.
- **Cursor travel is a minimum-jerk path**, re-planned from the current
  position, velocity and acceleration on every new target, so nothing snaps.
  The simulation runs on a fixed 1/120s step and is identical at any frame
  rate. The loop stops after 8s with nothing to do.
- **Everything builds**: the navbar, logo, buttons, page titles, cards and
  rows. Blocks that arrive together are queued, ordered by position (reading
  order) and started 60ms apart, with up to 14 frames live at once; extra
  cursors fly in from the screen edges. Untagged blocks name themselves from
  their own heading or text. On the first home visit the hero and navbar
  build one after another in the ~7s intro; everywhere else they build as
  they load.

Reduced motion is handled entirely in CSS, never by branching on
`useReducedMotion()` during render. That hook returns `false` on the server and
its real value on the client, so branching on it produces a hydration mismatch
for precisely the readers it was meant to help. Under reduced motion there are
no covers, no canvas, no marquee drift and no magnetic or tilt effects.

**Micro-interactions** (`components/motion/magnetic.tsx`): primary controls lean
toward a nearby pointer, project cards tilt slightly, and case-study metrics
count up once (`count-up.tsx`). The lean and the tilt are fine-pointer only,
decided in an effect; all three are off under reduced motion.

Once the builds are done a few **ambient cursors** drift in the right margin
(only where the margin is wide enough to hold them) and fly to the next block
that builds. A block scrolled past faster than 2500px/s wipes open without a
frame.

## Theme

Light on a first visit, **unconditionally**. `enableSystem` is off: with it on,
`defaultTheme` only decides what happens when the OS expresses no preference, so
anyone running a dark desktop would never see the default at all.

The storage key is **versioned** (`storageKey="theme-2"`). next-themes persists
the reader's choice and a stored value beats `defaultTheme` every time, so
anyone who had visited while dark was the default still had `"dark"` sitting in
`localStorage.theme` and kept landing on dark no matter what the default said.
Bumping the key retires those stored values once. Bump it again if you ever
change the default and need existing visitors to actually see the change.

The toggle still works and choices made from here persist normally. Turn
`enableSystem` back on in `app/layout.tsx` to follow the OS instead.

## Email alerts from the contact form

A static export has no server, so the form needs a form backend or it has to be
honest about doing nothing. It does both, and which one depends on one
environment variable.

**Without a key** it composes the message in the visitor's own mail client and
says so on screen. Works, but nothing reaches you unless they actually press
send there.

**With a key** it POSTs to [Web3Forms](https://web3forms.com), which forwards
the submission to the address the key is bound to. That is the email alert.

Setup, about a minute:

1. Go to <https://web3forms.com>, enter the address you want alerts at. The
   access key arrives by email. No account, no dashboard.
2. Create `.env.local` in the repo root (`.env*` is already gitignored):

   ```
   NEXT_PUBLIC_WEB3FORMS_KEY=paste-your-key-here
   ```

3. `npm run deploy`.

Free tier is 250 submissions a month. Submissions are forwarded, not stored.

Notes on how it is wired:

- The key **is public** in the built bundle. Unavoidable on a static site, and
  how Web3Forms is designed: the key only authorises delivery to the address it
  is already bound to. The worst case is spam in your inbox.
- `replyto` is set to the visitor's address, so hitting Reply in your mail
  client answers them rather than answering the form service.
- There is an off-screen `botcheck` honeypot. Off-screen rather than
  `display:none`, because the bots worth stopping check for `display:none`.
- **If the request fails the visitor is offered the `mailto:` link with
  everything they typed already in it.** A form that loses someone's message
  because a third party was down is worse than a form that never pretended to
  send.

## Before you deploy

1. **`public/resume.pdf` does not exist.** `siteConfig.resumeAvailable` is
   `false`, so the hero shows GitHub instead of a Resume button and no dead link
   ships. Drop the PDF in `public/`, flip the flag, and the button appears.
2. **Four of eight projects have no screenshot.** They degrade honestly, but
   `/projects` would be materially better with real images at
   `public/projects/<id>-*.webp`. Add the path to `image` and a real `imageAlt`.
3. **The site is served from the root of a custom domain.** `www.mohnish.co.in`
   (`public/CNAME`), so `basePath` in `next.config.ts` defaults to `""`. To
   serve under a sub-path again (a GitHub Pages project site at `/<repo>/`),
   set `NEXT_PUBLIC_BASE_PATH` and change `siteConfig.url` with it.
4. **`app/opengraph-image.tsx` and `app/icon.tsx` hard-code hex colours.** Satori
   cannot resolve CSS custom properties or `oklch()`. If you change the palette
   in `globals.css`, change those two files with it; both carry a comment listing
   the tokens they mirror.

## Deploying

```bash
npm run deploy        # next build -> prepare-pages -> publish out/ to gh-pages
```

Enable it once in **Settings → Pages → Source: Deploy from a branch →
`gh-pages` / root**.

`prepare-pages` does three things, each fixing a failure that stays invisible
until the site is live:

- writes `out/.nojekyll` — without it Pages runs the output through Jekyll,
  which silently drops `_next/` (underscore-prefixed) and serves the site
  unstyled;
- asserts the basePath actually applied, because without it every asset 404s;
- writes dot-joined aliases for the RSC prefetch payloads. `next build` emits
  them as nested directories (`projects/__next.projects/__PAGE__.txt`) while the
  client requests them as a single filename
  (`projects/__next.projects.__PAGE__.txt`). A server that rewrites hides the
  difference; a plain file host does not, and every `<Link>` prefetch 404s.

## Where things are

```
app/
  layout.tsx        shell, fonts, metadata, JSON-LD, noscript fallback,
                    boot script, build stage mount
  page.tsx          home
  skills|projects|career|contact/   one folder per route
  projects/[slug]/  case studies, via generateStaticParams
  not-found.tsx     exported as 404.html
  globals.css       palette, type scale, surfaces, and all three motion systems
components/
  ui/               primitives (Base UI under the hood)
  layout/           navbar, footer, page-header, section, back-to-top, theme
  motion/           reveal (one-shot), scroll-linked (scroll-driven),
                    scroll-spine (the timeline trunk), build/ (the build
                    engine), split-words, magnetic, count-up
  home|projects|skills|career|contact/   per-route components
lib/
  motion-config.ts  every motion constant on the site
  utils.ts          cn(), assetPath()
data/                the content, as TypeScript
types/               Project, Skill, TimelineEntry, Course, Achievement, NavItem
```

Design decisions and their rationale are kept in local working docs
(`architecture.md`, `tasks.md`, `HOW_TO_USE.md`) that are deliberately not
committed — see `.gitignore`. The previous Vite site lives in `website/`, also
uncommitted; it was the content reference for this rebuild, alongside the CV PDF
in the repository root.

## Notes on the setup

- **Tailwind v4** — there is no `tailwind.config.ts`. Theme tokens live in
  `app/globals.css` under `@theme inline`. Adding a colour means adding it there
  in both `:root` and `.dark`, then mapping it in the `@theme inline` block;
  a variable without that mapping produces no utility class.
- **`npm run lint` also lints `website/`**, the old Vite site, which carries its
  own pre-existing errors. Lint your own work with
  `npx eslint app components data lib types`.
- **Above-the-fold content never uses a scroll reveal.** The hero and every page
  header hold the LCP element, and an intersection-driven fade would serve the
  `<h1>` at `opacity: 0` until hydration. They animate with the `.animate-rise`
  CSS keyframe instead. A `<noscript>` rule in `app/layout.tsx` keeps everything
  else visible with scripting off.
- **`main` is `overflow-x: clip`.** A horizontal entrance offset
  (`data-reveal="right"`, +28px) widens the document until it lands, which on a
  phone shows a horizontal scrollbar for as long as the element stays
  unrevealed. `clip` rather than `hidden`, because `hidden` establishes a scroll
  container and every `position: sticky` inside it would silently stop sticking.
