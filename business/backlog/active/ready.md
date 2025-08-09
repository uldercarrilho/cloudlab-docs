# Ready Tasks

🎯 **Tasks that are refined, prioritized, and ready for immediate pickup.**

> **Solo Development**: Each task is stored in a separate file in the `../tasks/` directory for detailed tracking.

## 📋 Available Tasks

### High Priority
- **[TASK-001](../tasks/TASK-001-example-microservice-setup.md)** - Setup Basic Microservice Architecture (2 days)

### Medium Priority
- **[TASK-002](../tasks/TASK-002-example-distributed-database.md)** - Implement Distributed Database Pattern (3 days)

### Low Priority  
*No low priority tasks currently ready*

---

## 🎯 Quick Task Overview

| Task ID | Title | Priority | Effort | Type | Status |
|---------|-------|----------|--------|------|--------|
| TASK-001 | Microservice Setup | High | 2 days | Infrastructure | Ready |
| TASK-002 | Distributed Database | Medium | 3 days | Infrastructure | Ready |

---

## 📝 Adding New Tasks

1. **Create task file** in `../tasks/` using format: `TASK-XXX-brief-description.md`
2. **Add reference here** in appropriate priority section
3. **Update overview table** with task details

---

## 📊 Ready Queue Health

- **Total Ready Tasks**: 2
- **High Priority**: 1
- **Medium Priority**: 1
- **Low Priority**: 0
- **Average Age**: 0 days (recently created)
- **Oldest Task**: TASK-001 (2024-01-15)

## 🤖 AI Agent Instructions

When picking up tasks from this queue:

1. **Select by Priority**: Start with highest priority tasks
2. **Check Dependencies**: Ensure all dependencies are resolved
3. **Verify Readiness**: Confirm task has clear acceptance criteria
4. **Update Status**: Move to `in-progress.md` with timestamp
5. **Begin Execution**: Follow the task template structure

### Task Selection Criteria
- Priority level (High > Medium > Low)
- Dependencies resolved
- Clear acceptance criteria
- Appropriate skill match
- Available capacity

## 🔄 Queue Management

### Adding Tasks
Tasks are added here by:
1. Creating detailed task file in `../tasks/`
2. Adding reference to appropriate priority section above
3. Updating the overview table

### Removing Tasks
Tasks are moved to:
- `in-progress.md` when work begins
- `blocked.md` if dependencies are discovered
- Back to `../tasks/` directory if not ready (update status in task file)

### Regular Maintenance
- Review task age and relevance
- Update priorities based on business changes
- Ensure acceptance criteria are still valid
- Verify technical approaches remain sound
