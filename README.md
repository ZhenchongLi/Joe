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

## Ops Notes

### Hugo + Netlify 时区问题（2026-04-17）
**症状**：文章 push 后 Netlify 构建成功，但文章不出现在网站上（404）。  
**原因**：文章 `date` 用北京时间（+08:00），Netlify 在 UTC 时区构建。例如 `2026-04-17T10:00:00+08:00` = UTC 02:00，Hugo 认为这是"未来"文章，构建时默认跳过。  
**解法**：`netlify.toml` 的 build command 加 `--buildFuture` flag（已在 fc68bd3 修复）。  
**结论**：同一天发的文章不再有此问题。
