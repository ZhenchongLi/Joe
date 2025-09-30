# Quickstart: llms.txt Implementation

## Prerequisites
- Hugo static site generator installed
- Existing Hugo site with PaperMod theme
- Content in `content/posts/` directory
- Write access to repository

## Implementation Steps

### 1. Update Hugo Configuration
Add to `hugo.toml`:
```toml
# Custom output format for llms.txt
[outputFormats]
  [outputFormats.llmstxt]
    name = "llmstxt"
    mediaType = "text/plain"
    baseName = "llms"
    path = ""
    isPlainText = true
    notAlternative = true

# Add llmstxt to home page outputs
[outputs]
  home = ["HTML", "RSS", "llmstxt"]
```

### 2. Create Template File
Create `layouts/_default/home.llmstxt`:
```go-template
# {{ .Site.Title }} - LLM Content Index
# Generated: {{ now.Format "2006-01-02T15:04:05Z07:00" }}
# Base URL: {{ .Site.BaseURL }}
# Language: {{ .Site.LanguageCode }}
{{- if .Site.Params.description }}
# Description: {{ .Site.Params.description }}
{{- end }}

{{- $pages := .Site.RegularPages }}
{{- if $pages }}
# Articles (newest first)
{{ range $pages.ByDate.Reverse }}
{{- if not .Draft }}
{{- $category := "Uncategorized" }}
{{- if .Params.categories }}
  {{- $category = index .Params.categories 0 }}
  {{- if eq $category "人工智能" }}{{ $category = "AI" }}{{ end }}
  {{- $category = title $category }}
{{- end }}
{{ .Date.Format "2006-01-02" }} {{ $category }} {{ .Title }} - {{ .Permalink }}
{{- end }}
{{- end }}
{{- else }}
# No articles available
{{- end }}
```

### 3. Test Locally
```bash
# Build the site
hugo

# Check if llms.txt was generated
ls -la public/llms.txt

# View the generated content
cat public/llms.txt

# Test with development server
hugo server -D
# Visit: http://localhost:1313/llms.txt
```

### 4. Validation Checklist
- [ ] `public/llms.txt` file exists after build
- [ ] File contains site header information
- [ ] Articles are listed in newest-first order
- [ ] Categories are properly mapped
- [ ] URLs are absolute and correct
- [ ] File size is reasonable (<100KB)
- [ ] No template errors in build output

### 5. Deployment Test
```bash
# Build for production
hugo

# Deploy to staging/production
# (depends on your deployment method)

# Verify live URL
curl https://fists.cc/llms.txt
```

## Expected Output Format
```
# Joe's Personal Website - LLM Content Index
# Generated: 2025-09-30T10:30:00Z
# Base URL: https://fists.cc/
# Language: zh-cn
# Description: Personal blog covering AI, products, algorithms, and thoughts

# Articles (newest first)

2025-09-28 AI Multi-Agent Systems Analysis - https://fists.cc/posts/ai/multi-agent-analysis/
2025-09-25 AI Context Engineering Best Practices - https://fists.cc/posts/ai/context-engineering/
...
```

## Troubleshooting

### Common Issues

**Template not found**
- Verify file path: `layouts/_default/home.llmstxt`
- Check Hugo version compatibility
- Ensure output format is properly configured

**Empty or missing file**
- Check `[outputs]` configuration in hugo.toml
- Verify home page has the llmstxt output format
- Look for build errors in Hugo output

**Incorrect article data**
- Verify article front matter has proper categories
- Check that articles are not marked as drafts
- Ensure publication dates are valid

**File size too large**
- Review number of articles being included
- Consider pagination for very large sites
- Check for excessively long titles or URLs

### Debug Commands
```bash
# Verbose Hugo build
hugo -v

# Check site data
hugo list all

# Validate configuration
hugo config
```