# 🤖 AI Agent Complex Task Execution Protocol

## Purpose
This prompt template is designed for executing complex, multi-step tasks in the CloudLab distributed systems project. It maximizes AI Agent potential while managing context limitations through structured session handoffs and comprehensive progress tracking.

## When to Use
- **Complex tasks** with multiple implementation steps and subtasks
- **Long-running tasks** that exceed single AI session context limits
- **Tasks requiring** multiple technical decisions and architectural choices
- **Projects needing** consistent quality gates and progress documentation

## Context & Project Standards
You are executing tasks for the CloudLab distributed e-commerce platform project. This is a learning-focused distributed systems implementation using:
- **ADR-First Approach**: All architectural decisions require ADRs
- **AI-Driven Development**: Human oversight with AI implementation
- **Conventional Commits**: Strict commit message standards
- **Quality Gates**: Mandatory validation at each step
- **Documentation-First**: All changes must be documented

## Current Task: [TASK-ID-NAME]
**File Location**: `docs/backlog/active/[TASK-FILE].md`

## Execution Strategy

### Phase 1: Task Analysis & Planning (Current Session)
1. **Read and analyze the complete task file**
2. **Identify all implementation steps and subtasks**
3. **Create detailed execution plan with dependencies**
4. **Identify potential blockers and risks**
5. **Set up progress tracking structure**
6. **Commit initial analysis and plan**

### Phase 2: Incremental Execution (Multi-Session)
Execute ONE COMPLETE IMPLEMENTATION STEP per session, following this protocol:

#### Session Protocol:
```
SESSION OBJECTIVE: [Step X: Description]
DELIVERABLES: [List from task file]
ESTIMATED TIME: [Based on complexity]
DEPENDENCIES: [Prerequisites needed]
```

#### Per-Session Workflow:
1. **Context Setup** (5 min)
   - Read current task status and progress
   - Review project standards and related ADRs
   - Confirm prerequisites are met

2. **Implementation** (45-90 min)
   - Execute ALL deliverables for current step
   - Follow project coding/documentation standards
   - Create/update ADRs if architectural decisions made
   - Implement quality assurance measures

3. **Validation & Documentation** (10-15 min)
   - Test all implementations
   - Update task file with detailed progress
   - Document decisions and learnings
   - Update any related documentation

4. **Git Workflow** (5 min)
   - Commit changes with conventional commit messages
   - Push changes to repository
   - Update task status in backlog system

5. **Session Handoff** (5 min)
   - Update task file with current status
   - Identify next steps and any blockers
   - Provide clear handoff summary for next session

## Task File Update Format
After each session, update the task file with:

```markdown
### Progress Update - [Date/Time]
**Session Objective**: [What was accomplished]
**Status**: [In Progress/Completed/Blocked]
**Deliverables Completed**:
- [x] Deliverable 1 - Description and notes
- [x] Deliverable 2 - Description and notes
- [ ] Pending deliverable - Reason if blocked

**Technical Decisions Made**:
- Decision 1: Rationale and impact
- Decision 2: Rationale and impact

**Files Created/Modified**:
- `path/to/file1` - Purpose and changes
- `path/to/file2` - Purpose and changes

**Quality Gate Status**:
- [ ] All deliverables tested and validated
- [ ] Documentation updated
- [ ] Standards compliance verified
- [ ] ADRs updated if needed

**Next Session Requirements**:
- Prerequisites: [What must be ready]
- Estimated Time: [Time estimate]
- Focus Area: [Next implementation step]

**Blockers/Issues**:
- None / [Description of any blockers]

**Commits Made**:
- commit_hash: "feat(step-x): implement deliverable 1"
- commit_hash: "docs: update task progress and decisions"
```

## Quality Assurance Protocol

### Before Starting Each Session:
- [ ] Verify all prerequisites are met
- [ ] Review related ADRs and project standards
- [ ] Check for any blockers or dependencies
- [ ] Confirm available time matches estimated complexity

### During Implementation:
- [ ] Follow CloudLab coding standards and patterns
- [ ] Test implementations thoroughly
- [ ] Document all technical decisions
- [ ] Maintain conventional commit practices

### Before Session End:
- [ ] All deliverables for current step completed
- [ ] Task file updated with detailed progress
- [ ] All changes committed and pushed
- [ ] Next session clearly planned
- [ ] Quality gates verified

## Context Management Strategy

### Session Handoff Protocol:
1. **Previous Session Summary**: Read latest progress update
2. **Context Reconstruction**: Review relevant files and decisions
3. **Current State Validation**: Verify system state before proceeding
4. **Execution Continuation**: Pick up exactly where left off

### Information Preservation:
- All decisions and rationale documented in task file
- Technical details preserved in code comments
- Architecture decisions captured in ADRs
- Progress clearly marked with timestamps

## Decision Making Authority

### AI Agent Authorized:
- Implementation details and technical approaches
- Code architecture and patterns (within project standards)
- Tool and library selections (within approved stack)
- Performance optimizations and best practices

### Requires Human Approval:
- Architectural changes requiring new ADRs
- Technology stack additions/changes
- Major design pattern deviations
- Timeline or scope modifications

## Emergency Protocols

### If Blocked:
1. Document the specific blocker in task file
2. Identify potential workarounds or alternatives
3. Mark current step as "BLOCKED" with clear description
4. Suggest next steps for human review
5. Commit progress made so far

### If Context Limit Reached:
1. Complete current subtask if possible
2. Document exact stopping point
3. Update task file with detailed status
4. Commit all progress
5. Provide clear handoff instructions

## Success Criteria
Each session is successful when:
- [ ] All planned deliverables for current step are completed
- [ ] Quality gates are passed
- [ ] Progress is properly documented and committed
- [ ] Next session is clearly planned
- [ ] No blockers exist for continuation

## Session Initiation Command
To start execution, confirm:
"I understand the CloudLab project standards and am ready to execute [STEP-NAME] following the established protocol. I will complete all deliverables, update progress, and provide clear handoff for next session."

## Usage Instructions

### 1. Customize the Prompt
- Replace `[TASK-ID-NAME]` with your actual task identifier
- Update `[TASK-FILE]` with the actual filename
- Adjust time estimates based on task complexity

### 2. Task Preparation
- Ensure task is moved to `docs/backlog/active/` directory
- Verify all prerequisites are met
- Review related ADRs and project standards

### 3. Session Management
- Execute one complete implementation step per session
- Update task file after each session
- Commit all progress before session end
- Provide clear handoff instructions

### 4. Quality Control
- Follow all quality gates and validation steps
- Update ADRs for architectural decisions
- Maintain conventional commit standards
- Document all technical decisions

## Example Session Initialization

```
I'm ready to execute Step 1 of TASK-021: Environment Setup and Project Structure. 

Following the CloudLab AI Agent protocol, I will:
- Create complete Kubernetes manifests directory structure
- Set up Helm chart templates for core services  
- Configure Kustomize base and overlay structure
- Establish naming conventions and labeling strategy

All deliverables will be completed, tested, documented, and committed with proper progress tracking.

Confirm to proceed with execution.
```

## Benefits of This Approach

1. **Context Efficiency**: Complete implementation steps per session rather than individual subtasks
2. **Reduced Overhead**: Less session setup/teardown time, more actual implementation
3. **Better Quality**: Each session produces complete, testable deliverables rather than fragments
4. **Clearer Progress**: Implementation steps map directly to project milestones
5. **Maintained Standards**: Full integration with CloudLab's ADR-first approach and quality gates

## Related Documents
- [CloudLab Repository Guidance](../../ai-sessions/repository-guidance.md)
- [Business Rules](../../product/PRD-001-business-rules.md)
- [Development Plan](../../product/PRD-002-development-plan.md)
- [System Overview](../../architecture/overview/system-overview.md)
- [Backlog Management](../../backlog/README.md)

---

**Template Version**: 1.0  
**Created**: 2025-08-27  
**Last Updated**: 2025-08-27  
**Status**: Ready for Use
