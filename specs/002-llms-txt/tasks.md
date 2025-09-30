# Tasks: 添加 llms.txt 支持

**Input**: Design documents from `/specs/002-llms-txt/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
Hugo static site structure:
- **Templates**: `layouts/_default/`, `layouts/partials/`
- **Configuration**: `hugo.toml` at repository root
- **Generated output**: `public/` (build artifact)

## Phase 3.1: Setup & Configuration
- [ ] T001 Back up current hugo.toml configuration
- [ ] T002 Add custom output format configuration to hugo.toml
- [ ] T003 Create layouts/_default directory if not exists

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T004 [P] Create test to verify hugo.toml has llmstxt output format configured
- [ ] T005 [P] Create test to verify home.llmstxt template file exists at layouts/_default/home.llmstxt
- [ ] T006 [P] Create test to verify public/llms.txt is generated after hugo build
- [ ] T007 [P] Create test to verify llms.txt header contains site metadata (title, baseURL, language)
- [ ] T008 [P] Create test to verify llms.txt contains article list sorted by date (newest first)
- [ ] T009 [P] Create test to verify article format matches contract: [Date] [Category] [Title] - [URL]
- [ ] T010 [P] Create test to verify category mapping (人工智能 → AI, thinking → Thinking, etc.)
- [ ] T011 [P] Create test to verify empty content state generates header-only file
- [ ] T012 [P] Create test to verify file size is under 100KB
- [ ] T013 [P] Create test to verify UTF-8 encoding and Unix line endings

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Configuration
- [ ] T014 Add outputFormats.llmstxt configuration to hugo.toml
- [ ] T015 Add outputs.home configuration to include llmstxt in hugo.toml

### Template Implementation
- [ ] T016 Create layouts/_default/home.llmstxt template file
- [ ] T017 Implement header section with site metadata in home.llmstxt
- [ ] T018 Implement article iteration logic using .Site.RegularPages in home.llmstxt
- [ ] T019 Implement date sorting with .ByDate.Reverse in home.llmstxt
- [ ] T020 Implement category extraction and mapping logic in home.llmstxt
- [ ] T021 Implement draft filtering (exclude draft articles) in home.llmstxt
- [ ] T022 Implement article format output: [Date] [Category] [Title] - [URL] in home.llmstxt
- [ ] T023 Implement empty content state handling in home.llmstxt

### Error Handling
- [ ] T024 Add missing category fallback to "Uncategorized" in home.llmstxt
- [ ] T025 Add missing date fallback handling in home.llmstxt
- [ ] T026 Add missing title fallback handling in home.llmstxt

## Phase 3.4: Integration & Validation
- [ ] T027 Run hugo build to generate llms.txt
- [ ] T028 Verify public/llms.txt file exists and contains expected content
- [ ] T029 Test with hugo server -D and verify http://localhost:1313/llms.txt is accessible
- [ ] T030 Verify all article categories are properly mapped
- [ ] T031 Verify article URLs are absolute and correct
- [ ] T032 Verify article dates are in YYYY-MM-DD format
- [ ] T033 Verify file size is reasonable (<100KB)
- [ ] T034 Test empty content scenario (temporarily move articles)

## Phase 3.5: Polish & Documentation
- [ ] T035 [P] Run hugo -v to check for build warnings or errors
- [ ] T036 [P] Validate llms.txt format against contract specification
- [ ] T037 [P] Test with existing articles in all categories (AI, thinking, products, leetcode)
- [ ] T038 [P] Verify special characters in titles are handled correctly
- [ ] T039 [P] Verify build time impact is minimal (<1 second)
- [ ] T040 Update CLAUDE.md with llms.txt feature information if needed

## Dependencies

**Phase Order**:
1. Setup (T001-T003) must complete first
2. Tests (T004-T013) must complete and FAIL before implementation
3. Configuration (T014-T015) must complete before template implementation
4. Template implementation (T016-T026) can proceed after configuration
5. Integration (T027-T034) requires all implementation complete
6. Polish (T035-T040) requires all tests passing

**Specific Dependencies**:
- T014, T015 must complete before T027 (build requires config)
- T016 must exist before T017-T026 (file must exist to edit)
- T027 blocks T028-T034 (build must complete before validation)
- All T004-T013 must fail before starting T014
- All T004-T013 must pass after T026

## Parallel Execution Examples

### Phase 3.2: All Tests (run together after setup)
```bash
# These tests can all be created in parallel since they test different aspects
Task: "Create test to verify hugo.toml has llmstxt output format configured"
Task: "Create test to verify home.llmstxt template file exists"
Task: "Create test to verify public/llms.txt is generated after hugo build"
Task: "Create test to verify llms.txt header contains site metadata"
Task: "Create test to verify llms.txt contains article list sorted by date"
Task: "Create test to verify article format matches contract"
Task: "Create test to verify category mapping"
Task: "Create test to verify empty content state"
Task: "Create test to verify file size under 100KB"
Task: "Create test to verify UTF-8 encoding and Unix line endings"
```

### Phase 3.5: Polish Tasks (run together after integration passes)
```bash
# These polish tasks are independent and can run in parallel
Task: "Run hugo -v to check for build warnings or errors"
Task: "Validate llms.txt format against contract specification"
Task: "Test with existing articles in all categories"
Task: "Verify special characters in titles are handled correctly"
Task: "Verify build time impact is minimal"
```

## Notes

### TDD Approach
- Write ALL tests first (T004-T013)
- Verify tests FAIL (expected behavior before implementation)
- Implement features (T014-T026)
- Verify tests PASS (confirms correct implementation)

### Hugo-Specific Considerations
- Hugo templates are Go templates, not separate code files
- Build process generates static files (no runtime)
- Testing requires actual hugo build execution
- Configuration changes affect build behavior

### File Modification Patterns
- T014-T015: Modify hugo.toml (sequential, same file)
- T016: Create new file (no conflicts)
- T017-T026: Modify home.llmstxt (sequential, same file)
- Tests: Each test is independent (parallel OK)

### Validation
- Manual testing checklist from quickstart.md
- Contract compliance per llms-txt-format.md
- Data model validation per data-model.md

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - llms-txt-format.md → 10 contract tests (T004-T013) [P]
   - hugo-template-interface.md → template implementation tasks (T016-T026)

2. **From Data Model**:
   - Website entity → configuration tasks (T014-T015)
   - Article entity → iteration and formatting tasks (T018-T022)
   - llms.txt output entity → header and structure tasks (T017, T023)

3. **From Quickstart**:
   - Validation checklist → integration test tasks (T027-T034)
   - Troubleshooting scenarios → polish tasks (T035-T040)

4. **Ordering**:
   - Setup → Tests → Configuration → Template → Integration → Polish
   - Tests must fail before implementation starts
   - Configuration before template (Hugo needs output format defined)

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have implementation tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path or action
- [x] No task modifies same file as another [P] task
- [x] TDD workflow enforced (tests fail → implement → tests pass)