# Blocked Tasks

🚫 **Tasks that are currently blocked by external dependencies, issues, or waiting for decisions.**

> **Goal**: Minimize blocked tasks through proactive dependency management and clear escalation paths.

## 🚧 Currently Blocked Tasks

<!-- 
Tasks moved here when blockers are discovered.
Include clear blocker description and resolution path.
-->

*No tasks currently blocked.*

---

## 📊 Blocked Tasks Summary

- **Total Blocked**: 0
- **High Priority Blocked**: 0
- **Average Block Duration**: N/A
- **Oldest Blocked Task**: N/A

## 🔍 Block Categories

### External Dependencies
- Third-party service integrations
- Vendor deliverables
- Partner API availability
- External team deliverables

### Internal Dependencies
- Other team deliverables
- Infrastructure provisioning
- Design approvals
- Architecture decisions

### Resource Constraints
- Budget approval needed
- Specialist expertise required
- Tool/license procurement
- Environment availability

### Decision Pending
- Product direction unclear
- Technical approach undecided
- Priority conflicts
- Stakeholder alignment needed

## 📋 Blocked Task Format

```markdown
## [TASK-ID] Task Title

**Blocked Since**: YYYY-MM-DD
**Blocker Type**: External/Internal/Resource/Decision
**Priority**: High/Medium/Low
**Assignee**: Team Member or AI Agent

### Block Description
Clear description of what is preventing progress.

### Impact
- Business impact of the delay
- Dependencies on other work
- Customer/user impact

### Resolution Path
1. Step 1 to resolve blocker
2. Step 2 to resolve blocker
3. Step 3 to resolve blocker

### Owner of Resolution
- **Blocker Owner**: Who needs to resolve this
- **Follow-up Date**: When to check status
- **Escalation Path**: Who to escalate to if not resolved

### Original Task Details
Brief context about the task that's blocked.

### Progress Made Before Block
- [x] Completed work before block
- [ ] Work that can't continue

### Workarounds Considered
- Alternative approaches evaluated
- Temporary solutions assessed
- Risk/benefit analysis of workarounds

### Communication Log
- **2024-01-15**: Blocker identified and stakeholder notified
- **2024-01-16**: Follow-up with blocker owner
- **2024-01-17**: Escalated to management
```

## 🔄 Unblocking Process

When blockers are resolved:

1. **Verify resolution** with blocker owner
2. **Update task status** and remove block details
3. **Move to appropriate queue**:
   - Back to `ready.md` if no rework needed
   - To `in-progress.md` if work can continue immediately
4. **Document lessons learned**
5. **Update processes** to prevent similar blocks

## 📈 Block Prevention Strategies

### Proactive Measures
- **Dependency mapping** during planning
- **Early stakeholder engagement**
- **Risk assessment** for external dependencies
- **Buffer time** for critical path items

### Process Improvements
- **Regular dependency reviews**
- **Clear escalation procedures**
- **Stakeholder communication protocols**
- **Alternative solution planning**

## 🤖 AI Agent Instructions

When encountering blocks:

1. **Identify the blocker** clearly and specifically
2. **Assess workarounds** and document evaluation
3. **Move task immediately** to blocked.md
4. **Notify relevant stakeholders** through appropriate channels
5. **Continue with other ready tasks** if capacity allows
6. **Follow up regularly** on blocker resolution

### Block Documentation Requirements
- Clear, specific blocker description
- Business impact assessment
- Proposed resolution steps
- Timeline for resolution
- Alternative approaches considered

## 📊 Metrics and Reporting

### Weekly Block Report
- New blocks introduced
- Blocks resolved
- Average block duration
- Block categories breakdown
- Impact on sprint goals

### Monthly Trends
- Block prevention effectiveness
- Escalation path usage
- Resolution time improvements
- Process optimization opportunities

## 🎯 Success Metrics

- **Block Rate**: < 10% of active tasks
- **Resolution Time**: Average < 3 days
- **Repeat Blocks**: < 5% recurrence rate
- **Escalation Rate**: < 20% require escalation
