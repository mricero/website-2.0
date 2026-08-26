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
| `/projects` | All seven, filterable by category |
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
- **`image`** — optional, and currently missing on five of seven. Without one a
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

Two systems, deliberately kept apart.

**One-shot reveals** (`components/motion/reveal.tsx`) are the default. An element
fades in the first time it enters the viewport and is static forever after: a
single shared `IntersectionObserver` unobserves it the moment it lands, so
scrolling back up never replays it. All the visuals are CSS (`[data-reveal]` in
`app/globals.css`); the component only decides *when* to stamp `data-revealed`.

This is why it is not CSS `animation-timeline: view()`: that is scroll-*linked*
and plays backwards as you scroll up, which is the opposite of an entrance.

**Scroll-linked motion** (`components/motion/scroll-linked.tsx`) is used where
the scroll position *is* the information:

| Effect | Where | What it communicates |
|---|---|---|
| `ScrollFadeOut` | hero | the masthead handing off to the page |
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

Reduced motion is handled entirely in CSS, never by branching on
`useReducedMotion()` during render. That hook returns `false` on the server and
its real value on the client, so branching on it produces a hydration mismatch
for precisely the readers it was meant to help.

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
2. **Five of seven projects have no screenshot.** They degrade honestly, but
   `/projects` would be materially better with real images at
   `public/projects/<id>-*.webp`. Add the path to `image` and a real `imageAlt`.
3. **The deployment URL is baked in for GitHub Pages.** `siteConfig.url` and
   `basePath` in `next.config.ts` both encode `/website-2.0`, because Pages
   serves project sites under `/<repo>/`. If you rename the repo, move to a
   custom domain, or switch to a `mricero.github.io` user site, change **both**.
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
  layout.tsx        shell, fonts, metadata, JSON-LD, noscript reveal fallback
  page.tsx          home
  skills|projects|career|contact/   one folder per route
  projects/[slug]/  case studies, via generateStaticParams
  not-found.tsx     exported as 404.html
  globals.css       palette, type scale, surfaces, and both motion systems
components/
  ui/               primitives (Base UI under the hood)
  layout/           navbar, footer, page-header, section, back-to-top, theme
  motion/           reveal (one-shot), scroll-linked (scroll-driven),
                    scroll-spine (the timeline trunk), count-up
  home|projects|skills|career|contact/   per-route components
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
