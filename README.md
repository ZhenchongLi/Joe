# Hugo PaperMod Website

This is a static website built with [Hugo](https://gohugo.io/) using the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme.

## Features
- Fast static site generation
- Responsive design
- Dark/Light mode support
- SEO optimized
- Customizable through Hugo config

## Requirements
- Hugo extended version (recommended v0.118+)
- Git (for theme management)

## Installation
1. Clone this repository
2. Install Hugo: `brew install hugo` (macOS) or see [Hugo installation docs](https://gohugo.io/installation/)
3. Run development server: `hugo server -D`

## Configuration
Main configuration file: `hugo.toml`

## Deployment
This site is configured for Netlify deployment (see `netlify.toml`).

## Theme Management
The PaperMod theme is included as a git submodule in `themes/PaperMod`.

To update the theme:
```bash
git submodule update --remote --merge
```

## Content Management
- Posts go in `content/posts/`
- Pages go in `content/` (root)
- Use Hugo archetypes for content templates

## Development
- Run local server: `hugo server -D`
- Build production: `hugo --minify`
