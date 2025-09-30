# Implementation Plan - llms.txt Feature
**Created**: 2025-09-30
**Branch**: 002-llms-txt
**Source**: /Users/lizc/code/Joe/specs/002-llms-txt/tasks.md

## Source Analysis
- **Source Type**: Implementation tasks from feature specification
- **Core Features**: Generate llms.txt file for LLM content discovery
- **Dependencies**: Hugo static site generator, existing PaperMod theme
- **Complexity**: Low-Medium (40 tasks, mostly configuration and templates)

## Target Integration
- **Integration Points**: Hugo build system, template engine
- **Affected Files**:
  - hugo.toml (configuration)
  - layouts/_default/home.llmstxt (new template)
- **Pattern Matching**: Hugo Go template syntax, TOML configuration

## Implementation Tasks

### Phase 3.1: Setup & Configuration
- [ ] T001 Back up current hugo.toml configuration
- [ ] T002 Add custom output format configuration to hugo.toml
- [ ] T003 Create layouts/_default directory if not exists

### Phase 3.2: Tests First (TDD)
- [ ] T004 [P] Test verify hugo.toml has llmstxt output format configured
- [ ] T005 [P] Test verify home.llmstxt template file exists
- [ ] T006 [P] Test verify public/llms.txt is generated after hugo build
- [ ] T007 [P] Test verify llms.txt header contains site metadata
- [ ] T008 [P] Test verify llms.txt contains article list sorted by date
- [ ] T009 [P] Test verify article format matches contract
- [ ] T010 [P] Test verify category mapping
- [ ] T011 [P] Test verify empty content state
- [ ] T012 [P] Test verify file size under 100KB
- [ ] T013 [P] Test verify UTF-8 encoding and Unix line endings

### Phase 3.3: Core Implementation
- [ ] T014 Add outputFormats.llmstxt configuration to hugo.toml
- [ ] T015 Add outputs.home configuration to include llmstxt
- [ ] T016 Create layouts/_default/home.llmstxt template file
- [ ] T017 Implement header section with site metadata
- [ ] T018 Implement article iteration logic
- [ ] T019 Implement date sorting with .ByDate.Reverse
- [ ] T020 Implement category extraction and mapping logic
- [ ] T021 Implement draft filtering
- [ ] T022 Implement article format output
- [ ] T023 Implement empty content state handling
- [ ] T024 Add missing category fallback
- [ ] T025 Add missing date fallback handling
- [ ] T026 Add missing title fallback handling

### Phase 3.4: Integration & Validation
- [ ] T027 Run hugo build to generate llms.txt
- [ ] T028 Verify public/llms.txt file exists
- [ ] T029 Test with hugo server
- [ ] T030 Verify article categories are mapped
- [ ] T031 Verify article URLs are absolute
- [ ] T032 Verify article dates are in YYYY-MM-DD format
- [ ] T033 Verify file size is reasonable
- [ ] T034 Test empty content scenario

### Phase 3.5: Polish & Documentation
- [ ] T035 [P] Run hugo -v to check for warnings
- [ ] T036 [P] Validate llms.txt format against contract
- [ ] T037 [P] Test with existing articles in all categories
- [ ] T038 [P] Verify special characters in titles
- [ ] T039 [P] Verify build time impact is minimal
- [ ] T040 Update CLAUDE.md if needed

## Current Progress
**Phase**: 3.1 Setup & Configuration
**Next Task**: T001 - Back up current hugo.toml configuration
**Completed**: 0/40 tasks

## Validation Checklist
- [ ] All features implemented
- [ ] Tests written and passing
- [ ] No broken functionality
- [ ] Documentation updated
- [ ] Integration points verified
- [ ] Performance acceptable

## Risk Mitigation
- **Potential Issues**:
  - Hugo version compatibility
  - Template syntax errors
  - Build failures
- **Rollback Strategy**:
  - Git checkpoints after each phase
  - Backup of hugo.toml before modifications