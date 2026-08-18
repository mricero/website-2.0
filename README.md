# Portfolio — Lukalapu Mohnish

A minimalist, fully static portfolio. Next.js App Router, TypeScript, Tailwind v4,
shadcn/ui, Framer Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # must pass before push
npm run build    # production build — every route should report ○ (Static)
```

## Editing content

All copy lives in `data/`. Nothing is fetched at runtime, so an edit there is the
only way to change what the site says.

| File | Holds |
|---|---|
| `data/site-config.ts` | Name, headline, bio, socials, nav items |
| `data/projects.ts` | Projects — `featured: true` gets a grid card, `false` gets the compact row |
| `data/experience.ts` | Timeline entries |

Adding a project means appending one object to `projects`. Two fields are worth
using well:

- **`highlight`** — the non-obvious engineering decision inside the project.
  A stack list says "PyTorch"; this says why the work was hard. It's the line
  that distinguishes real work from tutorial output.
- **`image`** — optional. Without one the card renders a typographic monogram,
  which is deliberate: no broken frames, no stock photography. Set
  `imageTreatment: "chart"` for matplotlib-style plots on white so they invert
  cleanly on the dark theme.

## Before you deploy

Two things are unset and will misbehave until you handle them:

1. **`public/resume.pdf` does not exist.** The hero's Resume button points at it
   and will 404. Drop the file in `public/`, or delete the button in
   `components/sections/hero.tsx`.
2. **`siteConfig.url` falls back to a placeholder domain.** It drives
   `metadataBase`, canonical URLs, OG tags and the sitemap. On Vercel set:

   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

## Where things are

```
app/          layout, page, globals.css, generated icon + OG image, sitemap, robots
components/
  ui/         shadcn primitives (base-nova style, Base UI under the hood)
  layout/     navbar, footer, section wrapper, theme provider + toggle
  motion/     reveal.tsx — the single shared animation variant
  sections/   hero, experience, projects, project-card, contact
data/         the content, as TypeScript
types/        Project, Experience, NavItem
```

Design decisions and their rationale are kept in local working docs
(`architecture.md`, `tasks.md`, `HOW_TO_USE.md`) that are deliberately not
committed — see `.gitignore`.

## Notes on the setup

- **Tailwind v4** — there is no `tailwind.config.ts`. Theme tokens live in
  `app/globals.css` under `@theme inline`. Adding a colour means adding it there
  in both `:root` and `.dark`, then mapping it in the `@theme inline` block;
  a variable without that mapping produces no utility class.
- **shadcn CLI vs npm 11.17** — `npx shadcn add` currently fails on this machine
  because it passes `--allow-scripts`, which npm 11.17 rejects for project-scoped
  installs. Components were fetched from the registry directly instead. If you
  need another one and hit the same error, pull it from
  `https://ui.shadcn.com/r/styles/base-nova/<name>.json` and rewrite the
  `@/registry/base-nova/...` imports to `@/...`.
- **The hero does not use Framer.** It holds the LCP element, and a JS-driven
  fade would serve the `<h1>` at `opacity: 0` until hydration. It animates with a
  CSS keyframe instead. Below-the-fold sections use Framer, with a `<noscript>`
  fallback in `app/layout.tsx` so they stay visible with scripting off.
