# Individual Task Files

📁 **Directory for individual task files in distributed systems development project.**

> **Solo Development Approach**: Each refined task gets its own file for detailed tracking and documentation.

## 📂 File Organization

### Naming Convention
```
tasks/
├── README.md                                  # This file
├── TASK-001-example-microservice-setup.md     # Individual task files
├── TASK-002-example-distributed-database.md
├── TASK-003-example-load-balancer.md
└── ...                                        # Future tasks
```

**Format**: `TASK-XXX-brief-description.md`
- **XXX**: Sequential task number (001, 002, 003...)
- **brief-description**: Lowercase, hyphen-separated description

### Task States
Tasks move through directories based on status:
- **`../TODO.md`** → Raw ideas and notes
- **`tasks/`** → Refined, ready for work (this directory)
- **`../active/in-progress.md`** → Reference to current task
- **`../archived/completed/`** → Completed task files

## 📋 Task File Template

Each task file should follow this structure (use `../templates/task-template-simplified.md` for new tasks):

```markdown
# [TASK-XXX] Task Title

**Status**: Ready/In Progress/Completed
**Priority**: High/Medium/Low
**Effort**: X hours/days
**Type**: Feature/Bug/Infrastructure/Research
**Created**: YYYY-MM-DD
**Started**: YYYY-MM-DD (when moved to in-progress)
**Completed**: YYYY-MM-DD (when finished)

## Description
What needs to be accomplished and why.

## Acceptance Criteria
- [ ] Specific, testable criterion 1
- [ ] Specific, testable criterion 2

## Technical Approach
Implementation strategy and technology choices.

## Progress Log
- YYYY-MM-DD: Progress update
- YYYY-MM-DD: Progress update

## Resources
- Links to documentation
- Related repositories
- Reference materials

## Completion Notes
Final notes on implementation and lessons learned.
```

## 🔄 Workflow for Solo Development

1. **Capture Ideas**: Add to `../TODO.md`
2. **Refine Task**: Create detailed file in `tasks/`
3. **Start Work**: Update `../active/in-progress.md` with reference
4. **Track Progress**: Update task file with progress log
5. **Complete**: Move file to `../archived/completed/`

## 📊 Task Tracking

### Current Tasks Overview
Use `../active/ready.md` to maintain a simple list of available tasks:

```markdown
### Available Tasks
- [TASK-001](tasks/TASK-001-example-microservice-setup.md) - Setup Basic Microservice Architecture (High, 2 days)
- [TASK-002](tasks/TASK-002-example-distributed-database.md) - Implement Distributed Database Pattern (Medium, 3 days)
```

### In-Progress Tracking
Use `../active/in-progress.md` to track your current work:

```markdown
### Currently Working On
- [TASK-001](../tasks/TASK-001-example-microservice-setup.md) - Started 2024-01-15, 60% complete
```

## 💡 Solo Development Tips

### Task Sizing
- **Small tasks**: 1-4 hours (ideal for focused sessions)
- **Medium tasks**: 1-2 days (can be completed in a sprint)
- **Large tasks**: Break down into smaller tasks

### Priority Guidelines
- **High**: Critical for system functionality
- **Medium**: Important improvements or features
- **Low**: Nice-to-have or experimental work

### Progress Tracking
- Update task files daily with progress
- Keep a simple log of what was accomplished
- Note any blockers or discoveries
- Document decisions and rationale
