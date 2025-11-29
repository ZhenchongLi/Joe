# Repository Guidelines

## Project Structure & Module Organization
- Hugo site using PaperMod theme submodule in `themes/PaperMod` (run `git submodule update --init --recursive` after clone).
- Content lives in `content/posts/<category>/<slug>.md`; archetype templates in `archetypes/`; custom templates (including `layouts/_default/home.llmstxt` for the llms.txt output) in `layouts/`.
- Static assets and images go under `static/` (published as-is); shared CSS/JS or pipelines belong in `assets/`.
- Build artifacts land in `public/`—treat as generated output, not a source of truth.
- Specs and implementation notes for features sit under `specs/` and `implement/` for reference.

## Build, Test, and Development Commands
- `hugo server -D` — local dev with drafts, live reload at http://localhost:1313.
- `hugo --minify` — production-style build; verify before pushing.
- `hugo --gc --minify` — mirrors Netlify build (`netlify.toml`), runs garbage collection to trim assets.
- `hugo server -D --disableFastRender` — useful when debugging template changes.

## Coding Style & Naming Conventions
- Front matter uses TOML delimiters (`+++`); prefer ISO-8601 timestamps and kebab-case filenames (e.g., `content/posts/ai/new-idea.md`).
- Categories and tags follow existing taxonomy (AI, Products, LeetCode, Thinking, etc.); keep the first category aligned with config menu entries.
- Write Markdown with clear headings and short paragraphs; use Hugo shortcodes (e.g., `{{< img src=\"images/…\" >}}`) for media.
- Template edits: stay consistent with Hugo Go template style in `layouts/`; avoid inline logic in content files.

## Testing Guidelines
- Run `hugo --minify` to ensure templates and content compile without errors; check that `public/llms.txt` is regenerated and ordered newest-first for articles.
- For visual changes, review `hugo server -D` locally; screenshot noteworthy UI differences.
- If adding content with assets, confirm links resolve under `relativeURLs = true` and media renders.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, etc.); keep commits focused and readable.
- PRs should describe scope, tests run, and any content or template impact; link issues when available.
- Exclude generated `public/` artifacts from PRs unless explicitly required; keep submodule updates intentional and documented.
- For front-end or layout tweaks, include before/after screenshots or local URLs to verify.

## Security & Configuration Tips
- Site configuration lives in `hugo.toml`; avoid ad-hoc per-file overrides unless necessary and document any new output formats.
- `static/robots.txt` is intentionally permissive; coordinate changes with SEO/LLM ingestion expectations.
- When adjusting llms.txt behavior, edit `layouts/_default/home.llmstxt` and keep the format in sync with `specs/002-llms-txt/contracts/llms-txt-format.md`.
