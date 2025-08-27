# AI Agent Task Template

📋 **AI agent-optimized template for creating, executing, and tracking distributed systems development tasks.**

> **Instructions**: This template is specifically designed for AI agents to create, manage, and execute tasks efficiently. Use all relevant sections and update progress systematically.

---

## [TASK-XXX] Task Title

**Status**: Ready/In Progress/Blocked/Completed  
**Priority**: High/Medium/Low  
**Effort**: X days/hours  
**Type**: Infrastructure/Feature/Bug/Research/Architecture/Integration  
**Epic**: Related epic name (if applicable)  
**Assignee**: AI Agent Name  
**Created**: YYYY-MM-DD HH:MM:SS [use current date and time]  
**Started**: YYYY-MM-DD HH:MM:SS  
**Completed**: YYYY-MM-DD HH:MM:SS  
**Target Release**: Version or timeframe  

---

## 🎯 Task Overview

### Description
Clear, concise description of what needs to be accomplished. Include context about why this task is needed and how it fits into the larger distributed systems architecture.

### Business Value & Learning Objectives
- **Learning Value**: What distributed systems concepts this teaches
- **Practical Experience**: Hands-on skills gained
- **Architecture Skills**: Architecture patterns or decisions involved
- **Portfolio Value**: How this demonstrates technical capability
- **Strategic Impact**: How this supports overall system goals

### Success Criteria
Clear, specific, testable criteria that define when this task is complete:
- [ ] Criterion 1: Specific, measurable outcome
- [ ] Criterion 2: Specific, measurable outcome
- [ ] Criterion 3: Specific, measurable outcome
- [ ] All edge cases are handled appropriately
- [ ] Error handling is implemented
- [ ] Performance requirements are met
- [ ] Documentation is updated
- [ ] Code is committed with tests

---

## 🏗️ Distributed Systems Context

### Architectural Impact
- **System Design Changes**: How this affects overall architecture
- **Component Relationships**: What services/components are involved
- **Data Flow Impact**: How data flows through the system
- **Integration Points**: What systems this connects to

### Scalability Considerations
- **Performance Implications**: Response times, throughput, resource usage
- **Growth Patterns**: How this scales with increased load
- **Resource Requirements**: CPU, memory, storage, network needs
- **Bottleneck Analysis**: Potential performance limitations

### Reliability Patterns
- **Fault Tolerance**: How the system handles failures
- **Error Handling**: Error scenarios and recovery mechanisms
- **Monitoring & Alerting**: What to monitor and alert on
- **Disaster Recovery**: Backup and recovery considerations

### Integration Complexity
- **Service Communication**: API contracts and protocols
- **Data Consistency**: How data stays consistent across services
- **Transaction Management**: Distributed transaction handling
- **Dependency Management**: Service dependencies and versioning

---

## 🚀 Implementation Strategy

### Technical Approach
- **Technology Choices**: What tools/frameworks to use and why
- **Version Requirements**: MUST use latest stable versions compatible with project requirements
- **Implementation Strategy**: High-level approach and methodology
- **Architecture Considerations**: How this fits into existing systems
- **Alternative Approaches**: What other solutions were considered

### 🔄 Technology Version Requirements
**CRITICAL**: Always use the latest stable versions of all technologies. Follow this process:

#### Version Verification Process
1. **Check Current Versions**: For each technology, verify the latest stable version:
   - **Kubernetes**: Check https://kubernetes.io/releases/ for latest stable release
   - **Go**: Check https://golang.org/dl/ for latest stable version
   - **Docker**: Check https://docs.docker.com/engine/release-notes/ for latest stable
   - **PostgreSQL**: Check https://www.postgresql.org/versions/ for current major version
   - **Redis**: Check https://redis.io/downloads for latest stable release
   - **Node.js**: Check https://nodejs.org/en/download/releases/ for LTS version
   - **Other technologies**: Check official documentation/release pages

2. **Compatibility Assessment**: Before selecting versions:
   - ✅ Review existing ADRs for any version constraints
   - ✅ Check project requirements for compatibility needs
   - ✅ Verify dependencies work with latest versions
   - ✅ Ensure no breaking changes affect current architecture
   - ✅ Test in development environment if major version change

3. **Version Documentation**: Document chosen versions:
   - **Exact version numbers** (e.g., Kubernetes 1.31.3, Go 1.23.4)
   - **Rationale** for version selection
   - **Compatibility notes** with existing systems
   - **Migration considerations** if upgrading

#### Version Selection Criteria (in order of priority):
1. **Latest Stable Release**: Always prefer latest stable over beta/alpha
2. **Security Updates**: Prioritize versions with latest security patches
3. **LTS Support**: For production systems, prefer LTS versions when available
4. **Breaking Changes**: Assess impact of breaking changes vs. benefits
5. **Ecosystem Compatibility**: Ensure version works with other technologies
6. **Performance Improvements**: Consider performance gains in new versions

### Implementation Steps
1. **Step 1**: Specific action with clear deliverable
2. **Step 2**: Specific action with clear deliverable
3. **Step 3**: Specific action with clear deliverable
4. **Step 4**: Testing and validation
5. **Step 5**: Documentation and handoff

### Resource Requirements
- **Prerequisites**: What must be completed before this task
- **Tools & Dependencies**: Required software, libraries, services
- **External Dependencies**: APIs, third-party services, data sources
- **Knowledge Requirements**: Required expertise or documentation

---

## 🤖 AI Agent Execution Guide

### Decision Log
<!-- Record all significant decisions made during execution -->
- **YYYY-MM-DD HH:MM:SS**: Decision made - Reasoning
- **YYYY-MM-DD HH:MM:SS**: Alternative considered - Why rejected
- **YYYY-MM-DD HH:MM:SS**: Architecture choice - Trade-offs

### Technology Version Log
<!-- Document all technology versions used and rationale -->
- **Technology 1**: Version X.Y.Z - Selected because [reason] - Checked on YYYY-MM-DD
- **Technology 2**: Version X.Y.Z - Selected because [reason] - Checked on YYYY-MM-DD
- **Dependencies**: List all major dependencies with their versions

### Alternative Analysis
<!-- Document what other approaches were considered -->
- **Approach 1**: Description - Pros/Cons - Why not chosen
- **Approach 2**: Description - Pros/Cons - Why not chosen
- **Selected Approach**: Why this was the best choice

### Learning Capture
<!-- Document new insights and knowledge gained -->
- **Concept 1**: What was learned - How it applies
- **Pattern 1**: New pattern discovered - When to use it
- **Best Practice 1**: Best practice identified - Implementation details

### Error Handling & Troubleshooting
<!-- Document issues encountered and how they were resolved -->
- **Issue 1**: Description - Root cause - Resolution
- **Issue 2**: Description - Root cause - Resolution
- **Prevention**: How to avoid similar issues in the future

---

## 📊 Progress Tracking

### Progress Log
<!-- Update systematically as work progresses -->
- **YYYY-MM-DD HH:MM:SS**: Task started - Initial planning
- **YYYY-MM-DD HH:MM:SS**: Phase 1 completed - What was accomplished
- **YYYY-MM-DD HH:MM:SS**: Phase 2 completed - What was accomplished
- **YYYY-MM-DD HH:MM:SS**: Testing completed - Results
- **YYYY-MM-DD HH:MM:SS**: Documentation updated - What was documented
- **YYYY-MM-DD HH:MM:SS**: Task completed - Final status

### Quality Gates
<!-- Built-in validation checkpoints -->
- [ ] **Version Verification**: Latest compatible versions confirmed and documented
- [ ] **Design Review**: Architecture approach validated
- [ ] **Implementation Review**: Code quality and standards met
- [ ] **Testing Review**: All tests passing and coverage adequate
- [ ] **Documentation Review**: Documentation complete and accurate
- [ ] **Integration Review**: System integration validated
- [ ] **Performance Review**: Performance requirements met
- [ ] **Security Review**: Security considerations addressed

### Blockers & Dependencies
<!-- Track what's blocking progress -->
- **Blocker 1**: Description - Impact - Resolution plan
- **Dependency 1**: What's needed - When needed - Status
- **External Block**: External factor - Contact - Timeline

---

## 🧪 Testing & Validation

### Testing Strategy
- **Unit Testing**: What needs unit test coverage
- **Integration Testing**: Systems that need integration testing
- **Performance Testing**: Load, stress, or benchmark testing needed
- **Security Testing**: Security validation requirements
- **User Acceptance Testing**: How to validate user requirements

### Validation Criteria
- **Functional Validation**: Does it work as expected?
- **Performance Validation**: Does it meet performance requirements?
- **Security Validation**: Are security requirements satisfied?
- **Integration Validation**: Does it work with other components?
- **Documentation Validation**: Is documentation complete and accurate?

---

## 📚 Documentation & Knowledge Management

### Documentation Requirements
- **Technical Documentation**: API docs, architecture updates, code comments
- **User Documentation**: What users need to know
- **Process Documentation**: Any process changes or new procedures
- **Training Materials**: What training might be needed

### Knowledge Transfer
- **Key Learnings**: What was discovered during implementation
- **Best Practices**: New best practices identified
- **Common Pitfalls**: What to avoid in similar tasks
- **Reference Materials**: Links to relevant resources and documentation

---

## ⚠️ Risk Management

### Risk Assessment
- **Technical Risks**: What could go wrong technically
- **Business Risks**: Impact on business if this fails
- **Integration Risks**: Risks related to system integration
- **Performance Risks**: Performance and scalability risks

### Mitigation Strategies
- **Risk 1**: Description - Mitigation approach - Contingency plan
- **Risk 2**: Description - Mitigation approach - Contingency plan
- **Risk 3**: Description - Mitigation approach - Contingency plan

---

## ✅ Definition of Done

### Core Completion Criteria
- [ ] **Version Compliance**: All technologies use latest stable compatible versions
- [ ] **Functionality**: Core functionality implemented and working
- [ ] **Testing**: All tests written and passing
- [ ] **Code Quality**: Code follows coding standards and best practices
- [ ] **Documentation**: Documentation updated and accurate
- [ ] **Integration**: System integration validated
- [ ] **Performance**: Performance requirements met
- [ ] **Security**: Security considerations addressed

### Quality Assurance
- [ ] **Code Review**: Code review completed and approved
- [ ] **Testing Coverage**: Adequate test coverage achieved
- [ ] **Documentation Review**: Documentation reviewed and approved
- [ ] **Integration Testing**: Integration with other systems validated
- [ ] **Performance Testing**: Performance benchmarks met
- [ ] **Security Review**: Security review completed (if required)

### Deployment & Handoff
- [ ] **Staging Deployment**: Feature deployed to staging environment
- [ ] **User Acceptance**: User acceptance testing completed
- [ ] **Production Deployment**: Feature deployed to production
- [ ] **Monitoring**: Monitoring and alerting in place
- [ ] **Knowledge Transfer**: Team trained on new functionality
- [ ] **Post-Deployment**: Post-deployment verification completed

---

## 📈 Success Metrics & KPIs

### Implementation Metrics
- **Time to Complete**: Actual vs. estimated time
- **Quality Score**: Code quality and test coverage metrics
- **Bug Count**: Number of issues found and resolved
- **Documentation Completeness**: Documentation coverage percentage

### Business Impact Metrics
- **Performance Improvement**: Measurable performance gains
- **User Satisfaction**: User feedback and satisfaction scores
- **System Reliability**: Uptime and error rate improvements
- **Development Velocity**: Impact on future development speed

---

## 🔄 Follow-up & Future Work

### Immediate Follow-up
- **TASK-XXX**: Related task that should be done next
- **TASK-XXX**: Bug fixes or improvements identified
- **TASK-XXX**: Documentation updates needed

### Future Considerations
- **Enhancement 1**: Future improvements to consider
- **Scalability 1**: How this could be enhanced for scale
- **Integration 1**: Future integration opportunities
- **Learning 1**: What to study next based on this experience

---

## 📝 AI Agent Usage Notes

### Template Usage Guidelines
1. **Fill All Relevant Sections**: Don't skip sections unless they truly don't apply
2. **Update Progress Systematically**: Use consistent timestamp format and update regularly
3. **Document Decisions**: Record all significant choices and reasoning
4. **Capture Learnings**: Document new knowledge and insights gained
5. **Track Blockers**: Immediately document anything blocking progress
6. **Validate Quality Gates**: Complete each quality gate before proceeding

### Best Practices for AI Agents
1. **Start with Planning**: Complete the overview and strategy sections first
2. **Verify Technology Versions**: ALWAYS check for latest versions before implementation
3. **Update Progress Regularly**: Log progress at least daily or per major milestone
4. **Document Everything**: Capture decisions, alternatives, and learnings
5. **Validate Continuously**: Use quality gates to ensure quality throughout
6. **Think Architecturally**: Always consider distributed systems implications
7. **Plan for Failure**: Consider what could go wrong and how to handle it
8. **Focus on Learning**: Treat each task as a learning opportunity

### Version Management Best Practices
1. **Check Before Starting**: Verify latest versions during planning phase
2. **Document Decisions**: Record why specific versions were chosen
3. **Test Compatibility**: Validate new versions work with existing systems
4. **Update Dependencies**: Ensure all dependencies are compatible
5. **Monitor Security**: Stay aware of security updates and patches
6. **Consider Stability**: Balance new features with system stability
7. **Review ADRs**: Ensure version choices align with architectural decisions

### Quality Checklist
Before marking a task complete:
- [ ] All acceptance criteria are met
- [ ] All quality gates are passed
- [ ] Latest technology versions are verified and documented
- [ ] Progress log is complete and up-to-date
- [ ] Decision log captures all significant choices
- [ ] Learning capture documents key insights
- [ ] Documentation is complete and accurate
- [ ] Code is tested and follows standards
- [ ] Integration is validated
- [ ] Knowledge transfer is complete

---

## 🎯 Template Customization

### For Different Task Types
- **Infrastructure Tasks**: Emphasize architecture impact and scalability
- **Feature Development**: Focus on user value and integration complexity
- **Bug Fixes**: Prioritize root cause analysis and prevention
- **Research Tasks**: Emphasize learning objectives and knowledge capture
- **Architecture Decisions**: Focus on trade-offs and long-term implications

### For Different Complexity Levels
- **Simple Tasks (1-2 days)**: Use streamlined version focusing on core sections
- **Medium Tasks (3-5 days)**: Use full template with emphasis on planning
- **Complex Tasks (1+ weeks)**: Add additional planning and risk management sections

---

**Note**: This template is designed to optimize AI agent workflow while maintaining high standards for distributed systems development. Use it consistently to build a comprehensive knowledge base and improve execution efficiency over time.
