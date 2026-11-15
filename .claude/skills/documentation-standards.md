---
name: documentation-standards
description: Standards and guidelines for organizing, structuring, and maintaining documentation in the ARKHE ZERO repository
---

# ARKHE ZERO Documentation Standards

## Documentation Organization

### Internal Documentation (development/docs/)
**Purpose:** Documentation for developers working on ARKHE ZERO itself
**Location:** `development/docs/`
**Files:**
- `DEVELOPMENT.md` - Development setup and workflows
- `PUBLISHING.md` - NPM package publishing process
- `DOCKER.md` - Docker setup and troubleshooting

### User-Facing Documentation (docs/)
**Purpose:** Documentation for ARKHE ZERO users and integrators
**Location:** `docs/` (at project root)
**Files:**
- `guides/getting-started.md` - User onboarding
- `api/cli-reference.md` - Command reference

### Project-Level Documentation (root)
**Purpose:** Standard project files that belong at repository root
**Files:**
- `README.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md` (o en .github/planning/)
- `LICENSE`
- `ROADMAP.md`
- `SECURITY.md`

### AI Skills (.claude/skills/)
**Purpose:** Knowledge base for AI assistants
**Location:** `.claude/skills/`
**Files:**
- `arkhe-standards.md` - 51/49 rules and seals
- `documentation-standards.md` - This file

## Rules for Documentation Placement

### When to use development/docs/
✅ CI/CD, Docker, internal build processes.
❌ User tutorials.

### When to use docs/
✅ User guides, CLI reference, API docs.
❌ Internal CI/CD workflows.

### When to use .claude/skills/
✅ AI instructions, 51/49 rules, security guidelines.
❌ General user guides.

---
## Version
**Last Updated:** 2026-11-15
**Applies To:** ARKHE ZERO v1.1.0
