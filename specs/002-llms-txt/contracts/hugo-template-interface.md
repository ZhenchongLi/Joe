# Hugo Template Interface Specification

## Output Format Configuration

### hugo.toml Addition
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

## Template Requirements

### Template Location
- **File**: `layouts/_default/home.llmstxt`
- **Alternative**: `layouts/index.llmstxt`

### Template Interface

#### Required Variables Access
```go
// Site information
.Site.Title           // Website title
.Site.BaseURL         // Website base URL
.Site.LanguageCode    // Site language
.Site.Params.description // Site description

// Content iteration
.Site.RegularPages    // All regular content pages
.ByDate.Reverse       // Sort by date (newest first)

// Per-article data
.Title                // Article title
.Permalink           // Full article URL
.Date.Format         // Publication date
.Params.categories   // Article categories
```

#### Template Processing Logic
1. Generate header with site metadata
2. Iterate through `.Site.RegularPages`
3. Filter for published content only
4. Sort by date (newest first)
5. Format each article according to contract
6. Handle missing metadata gracefully

### Template Output Requirements
- Must produce valid text/plain content
- Must follow llms-txt-format.md specification
- Must handle empty content gracefully
- Must not exceed 100KB file size
- Must use UTF-8 encoding

## Build Integration

### Hugo Build Process
1. Hugo reads configuration from hugo.toml
2. Hugo processes home page with llmstxt output format
3. Template generates content using site data
4. File written to `public/llms.txt`
5. File deployed with rest of site

### Validation Points
- Template syntax validation during build
- Output format validation (text/plain)
- File size validation (<100KB)
- Content encoding validation (UTF-8)

## Error Handling

### Build-time Errors
- Template syntax errors → Build failure
- Missing template → Format skipped
- Invalid configuration → Build failure

### Runtime Errors
- Missing metadata → Default values used
- Empty content → Header-only output
- Oversized output → Truncation with warning