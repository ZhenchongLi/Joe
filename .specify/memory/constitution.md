<!--
Sync Impact Report:
Version change: Initial → 1.0.0
Added sections:
- Core Principles (Issue-First Development, PR-First Implementation, Main Branch Protection, Content Quality Standards, Deployment Integrity)
- Development Workflow
- Quality Gates
Modified templates requiring updates:
- ✅ Updated: All templates aligned with issue-PR workflow
- Follow-up TODOs: None - all placeholders filled
-->

# Joe's Personal Website Constitution

## Core Principles

### I. Issue-First Development
Every development task MUST begin with a GitHub issue. Issues provide clear documentation of intent, requirements, and acceptance criteria. No code changes should be implemented without a corresponding issue that defines the problem and expected outcome.

### II. PR-First Implementation
All code changes MUST be implemented through Pull Requests linked to issues. PRs enable code review, discussion, and controlled integration. Direct commits to main branch are prohibited except for critical hotfixes with immediate issue creation.

### III. Main Branch Protection
The main branch represents production-ready code. All changes MUST merge through PRs after review. PRs are closed only when changes are successfully merged to main, ensuring clean commit history and proper change tracking.

### IV. Content Quality Standards
All content MUST be well-written, properly formatted, and serve the website's educational purpose. Blog posts require clear structure, proper metadata, and value-driven content. Hugo conventions MUST be followed for all content creation and organization.

### V. Deployment Integrity
Site builds MUST be validated before merging. Changes affecting site functionality, layout, or performance MUST be tested locally using `hugo server`. Broken builds or degraded user experience are unacceptable.

## Development Workflow

### Issue Management
- Create detailed issues with clear problem statements and acceptance criteria
- Label issues appropriately (bug, enhancement, content, etc.)
- Link PRs to issues using closing keywords (fixes #123, closes #456)
- Update issues with progress and resolution notes

### Pull Request Process
- Branch naming: `issue-###-descriptive-name`
- PR titles must reference issue: `Fix navigation bug (#123)`
- Include testing steps in PR description
- Require review before merge (when collaborating)
- Delete feature branches after successful merge

### Content Workflow
- New posts in `content/posts/` with proper front matter
- Images optimized and placed in appropriate directories
- Local testing with `hugo server -D` before submission
- Verify responsive design and cross-browser compatibility

## Quality Gates

### Pre-merge Requirements
- Hugo build succeeds without errors or warnings
- Local site preview functions correctly
- Content follows Hugo PaperMod theme conventions
- All links are functional and properly formatted
- Images are optimized and display correctly

### Post-merge Validation
- Netlify deployment completes successfully
- Live site functionality verified
- SEO metadata properly generated
- Site performance remains within acceptable limits

## Governance

All development MUST follow the issue → PR → main branch workflow. Constitution compliance is verified during PR review process. Code quality, content standards, and deployment integrity are non-negotiable requirements.

Changes to this constitution require documentation of rationale and impact assessment. Emergency deviations must be documented with immediate constitution update.

**Version**: 1.0.0 | **Ratified**: 2025-09-29 | **Last Amended**: 2025-09-29