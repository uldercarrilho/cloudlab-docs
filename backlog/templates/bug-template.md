# Bug Report Template

🐛 **Template for reporting and tracking software defects and issues.**

> **Instructions**: Use this template to create comprehensive bug reports that help developers understand, reproduce, and fix issues quickly and effectively.

---

## [BUG-ID] Bug Title

**Summary**: One-line description of the issue

### Bug Classification
**Severity**: Critical/High/Medium/Low
**Priority**: High/Medium/Low
**Type**: Functional/Performance/UI/Security/Data/Integration
**Status**: New/In Progress/Testing/Resolved/Closed
**Assignee**: Developer or team responsible
**Reporter**: Person who found the bug
**Date Reported**: YYYY-MM-DD

### Environment Information
**Environment**: Production/Staging/Development/Local
**Browser**: Chrome/Firefox/Safari/Edge (version)
**Operating System**: Windows/macOS/Linux (version)
**Device**: Desktop/Mobile/Tablet (specific device if mobile)
**Application Version**: Version number or build
**Database Version**: If applicable
**Server Environment**: If applicable

### 🔄 Version Tracking for Bug Analysis
**CRITICAL**: Document exact versions to aid in bug investigation and resolution:
- **Framework/Runtime Versions**: (e.g., Go 1.23.4, Node.js 20.10.0)
- **Database Versions**: (e.g., PostgreSQL 16.6, Redis 7.4.0)
- **Infrastructure Versions**: (e.g., Kubernetes 1.31.3, Docker 27.0.0)
- **Dependency Versions**: List key dependencies and their versions
- **Last Known Working Versions**: If bug is a regression, note previous working versions

### Bug Description

#### What Happened
Clear, detailed description of the issue:
- What the user was trying to do
- What actually happened
- How this differs from expected behavior
- When the issue was first noticed

#### Expected Behavior
What should have happened instead:
- Correct functionality description
- Expected user experience
- Reference to requirements or specifications

#### Actual Behavior
Detailed description of what actually occurs:
- Specific error messages or symptoms
- Incorrect data or calculations
- UI problems or display issues
- Performance problems

### Steps to Reproduce
**Reproducibility**: Always/Often/Sometimes/Rarely/Unable to Reproduce

**Prerequisites** (if any):
- Required user permissions
- Specific data setup needed
- Configuration requirements
- Environmental conditions

**Step-by-step instructions**:
1. Step 1: Specific action to take
2. Step 2: Specific action to take
3. Step 3: Specific action to take
4. **Expected result**: What should happen
5. **Actual result**: What actually happens

### Impact Assessment

#### User Impact
- **Users affected**: Number or percentage of users impacted
- **User types**: Which user roles or segments are affected
- **Functionality impact**: What functionality is broken or degraded
- **Workaround available**: Is there a way users can work around this?

#### Business Impact
- **Revenue impact**: Does this affect revenue generation?
- **Customer satisfaction**: How does this affect user experience?
- **Operational impact**: Does this affect business operations?
- **Compliance impact**: Does this create compliance issues?

#### Technical Impact
- **System stability**: Does this affect system reliability?
- **Performance impact**: Does this slow down the system?
- **Data integrity**: Is data at risk of corruption?
- **Security impact**: Are there security implications?

### Severity Guidelines

#### Critical
- System crashes or is completely unusable
- Data loss or corruption
- Security vulnerabilities
- Complete loss of functionality for core features

#### High
- Major functionality is broken
- Significant performance degradation
- Affects large number of users
- No reasonable workaround available

#### Medium
- Minor functionality issues
- Cosmetic problems that affect usability
- Issues with workarounds available
- Affects small number of users

#### Low
- Minor cosmetic issues
- Enhancement requests
- Issues that don't affect core functionality
- Documentation errors

### Supporting Information

#### Screenshots/Videos
- [ ] Screenshots attached showing the issue
- [ ] Screen recording demonstrating the problem
- [ ] Before/after comparisons if applicable
- [ ] Error dialogs or messages captured

#### Log Files and Error Messages
```
Paste relevant log entries, error messages, or stack traces here.
Include timestamps and any relevant context.
```

#### Additional Context
- **Related bugs**: Links to similar or related issues
- **Recent changes**: Any recent deployments or changes that might be related
- **User feedback**: What users have reported about this issue
- **Frequency**: How often this occurs

### Test Data
If specific test data is needed to reproduce:
- **Test accounts**: User accounts that demonstrate the issue
- **Test data sets**: Specific data that triggers the problem
- **Configuration**: Special settings or configuration needed
- **Sample inputs**: Example inputs that cause the issue

### Root Cause Analysis (for developers)

#### Investigation Notes
- Findings from initial investigation
- Code areas that might be involved
- Potential causes identified
- Related system components

#### Root Cause
- Specific cause of the issue
- Why the issue occurred
- Contributing factors
- Code or configuration problems

### Resolution Plan

#### Proposed Solution
- How the issue will be fixed
- Code changes required
- Configuration updates needed
- Testing approach

#### Version Upgrade Considerations
- **Version Update Required**: Does fixing this bug require upgrading any components?
- **Latest Version Benefits**: Could upgrading to latest stable versions resolve this issue?
- **Breaking Changes**: What breaking changes exist in newer versions?
- **Migration Path**: What's the migration strategy for version upgrades?

#### Impact Assessment
- Risk of the proposed fix
- Other areas that might be affected
- Regression testing needed
- Deployment considerations
- Version compatibility implications

#### Timeline
- Estimated time to fix
- Testing time required
- Deployment timeline
- User communication plan

### Testing and Verification

#### Test Cases
Specific tests to verify the fix:
- [ ] Test case 1: Description
- [ ] Test case 2: Description
- [ ] Test case 3: Description

#### Regression Testing
Areas to test to ensure the fix doesn't break other functionality:
- [ ] Related functionality 1
- [ ] Related functionality 2
- [ ] Integration points

#### User Acceptance
- [ ] Original reporter verifies fix
- [ ] Affected users test the resolution
- [ ] Business stakeholders approve fix

### Definition of Done
- [ ] Root cause identified and documented
- [ ] Technology versions verified and updated if needed for fix
- [ ] Fix implemented and code reviewed
- [ ] Unit tests written/updated
- [ ] Integration tests passing
- [ ] Regression testing completed
- [ ] Fix verified in staging environment
- [ ] Documentation updated if needed
- [ ] Fix deployed to production
- [ ] Original reporter confirms resolution
- [ ] Monitoring shows issue is resolved

---

## 🔍 Bug Triage Guidelines

### Severity Assignment
Consider these factors when assigning severity:
- **User impact**: How many users are affected?
- **Functionality impact**: What functionality is broken?
- **Business impact**: How does this affect business operations?
- **Data impact**: Is data at risk?
- **Workaround availability**: Can users work around the issue?

### Priority Assignment
Priority should consider:
- **Business criticality**: How important is this to the business?
- **User criticality**: How important is this to users?
- **Timeline sensitivity**: Are there deadlines or commitments?
- **Resource availability**: Do we have resources to fix this now?

## 🤖 AI Agent Bug Handling

### Automated Bug Analysis
AI agents can help with:
- **Version Analysis**: Check if bug is related to specific versions or version mismatches
- **Pattern recognition**: Identify similar bugs or patterns
- **Impact assessment**: Analyze user and business impact
- **Root cause suggestions**: Suggest potential causes based on symptoms
- **Update Recommendations**: Identify if latest versions contain fixes for similar issues
- **Test case generation**: Create comprehensive test cases
- **Documentation**: Ensure all required information is captured

### Bug Resolution Support
- **Code analysis**: Analyze code to identify potential fixes
- **Testing automation**: Generate and run automated tests
- **Documentation updates**: Update relevant documentation
- **Communication**: Notify stakeholders of progress and resolution

## 📊 Bug Metrics

### Quality Metrics
- **Bug discovery rate**: How many bugs are found over time
- **Bug resolution rate**: How quickly bugs are fixed
- **Bug escape rate**: How many bugs make it to production
- **Customer-reported vs internal**: Ratio of external to internal bug reports

### Process Metrics
- **Time to triage**: How quickly bugs are assessed and assigned
- **Time to resolution**: How long it takes to fix bugs
- **First-time fix rate**: Percentage of bugs fixed correctly the first time
- **Reopen rate**: How often resolved bugs are reopened

## 🎯 Bug Prevention

### Proactive Measures
- **Code reviews**: Catch bugs before they reach production
- **Automated testing**: Comprehensive test coverage
- **Static analysis**: Use tools to identify potential issues
- **User testing**: Get user feedback before release

### Process Improvements
- **Root cause analysis**: Learn from bugs to prevent similar issues
- **Process refinement**: Improve development and testing processes
- **Tool improvements**: Better tools for development and testing
- **Training**: Keep team skills current and comprehensive
