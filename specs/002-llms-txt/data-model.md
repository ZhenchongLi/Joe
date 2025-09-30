# Data Model: llms.txt Generation

## Core Entities

### Website Entity
**Description**: Represents the Hugo site's basic information
**Attributes**:
- `title`: string - Site title from hugo.toml
- `baseURL`: string - Site base URL from hugo.toml
- `description`: string - Site description (optional)
- `language`: string - Site language code

**Hugo Template Access**: `.Site.Title`, `.Site.BaseURL`, `.Site.Params.description`, `.Site.LanguageCode`

### Article Entity
**Description**: Represents a published article/post on the website
**Attributes**:
- `title`: string - Article title from front matter
- `url`: string - Absolute URL to the article
- `category`: string - Primary category from front matter categories
- `publishDate`: date - Publication date from front matter
- `path`: string - Relative path from content root

**Hugo Template Access**: `.Title`, `.Permalink`, `.Params.categories`, `.Date`, `.RelPermalink`

**Validation Rules**:
- Title must not be empty
- URL must be valid absolute URL
- Category must be one of: "thinking", "products", "leetcode", "AI" (人工智能)
- PublishDate must be valid date
- Only published content (draft: false) included

**State Transitions**: N/A (static content)

### llms.txt Output Entity
**Description**: The generated output file structure
**Attributes**:
- `header`: string - Site information section
- `articleList`: array of Article - Ordered list of articles
- `generatedAt`: timestamp - Generation timestamp

**Generation Rules**:
- Articles sorted by publishDate (newest first)
- Categories included as metadata
- Simple text format with structured sections
- Maximum file size target: 100KB

## Relationships

```
Website (1) ──► (n) Article
   │                │
   └─────────────────┴──► llms.txt Output
```

**Description**:
- One Website contains many Articles
- Website and Articles together generate one llms.txt Output
- Articles are filtered and sorted for Output generation

## Data Flow

```
Hugo Content Files
       │
       ▼
Hugo Template Engine ── accesses ──► Site + RegularPages
       │                                    │
       ▼                                    ▼
llms.txt Template ◄─── processes ──── Article Collection
       │
       ▼
Generated llms.txt File
```

## Validation Rules

### Article Inclusion Criteria
- Must be published (draft: false)
- Must have valid front matter
- Must be in content/posts/ directory
- Must have non-empty title
- Must have valid date

### Output Format Constraints
- Total file size < 100KB
- Text encoding: UTF-8
- Line endings: Unix (LF)
- Structure: Header + Article List
- No HTML/Markdown formatting in output

### Error Handling
- Missing category: Use "uncategorized"
- Missing date: Use file modification time
- Missing title: Use filename without extension
- Empty article list: Generate header-only file