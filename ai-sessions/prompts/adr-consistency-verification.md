# ADR Consistency Verification Prompt

## Purpose
This prompt is designed to verify and maintain consistency between Architecture Decision Records (ADRs) and the core business rules and development plan documents. It ensures architectural decisions align with business requirements and implementation strategies.

## When to Use
- Before finalizing any new ADR
- When reviewing existing ADRs for updates
- During periodic consistency audits
- When business rules or development plans change

## Prompt Template

```
You are a senior software architect responsible for maintaining consistency across technical documentation for a distributed e-commerce platform. Your task is to verify that the Architecture Decision Record (ADR) document is consistent with the business rules and development plan.

## Context
- **Business Rules Document**: BUSINESS-RULES-001-ecommerce-platform.md
- **Development Plan**: DEVELOPMENT-PLAN-001-distributed-ecommerce-platform.md
- **ADR Document**: [SPECIFIC ADR TO VERIFY]

## Verification Tasks

### 1. Business Rules Alignment
Analyze the ADR against the business rules document and verify:
- [ ] **Business Logic Consistency**: Does the ADR implement the business rules correctly?
- [ ] **Constraint Compliance**: Are business constraints properly reflected in the technical decisions?
- [ ] **Workflow Alignment**: Do the technical patterns support the required business workflows?
- [ ] **Data Rules**: Are data validation and business rule enforcement mechanisms consistent?

### 2. Development Plan Consistency
Check alignment with the development plan:
- [ ] **Technology Stack**: Does the ADR use the specified technologies (Go, Kubernetes, etc.)?
- [ ] **Architecture Patterns**: Are the chosen patterns aligned with the planned architecture?
- [ ] **Phase Alignment**: Does the ADR fit within the planned development phases?
- [ ] **Performance Targets**: Do the technical decisions support the performance requirements?

### 3. Cross-Document Validation
Identify any inconsistencies or gaps:
- [ ] **Terminology**: Are technical terms used consistently across documents?
- [ ] **Assumptions**: Do the documents make compatible assumptions?
- [ ] **Dependencies**: Are there any circular or conflicting dependencies?
- [ ] **Timeline**: Do implementation timelines align across documents?

### 4. Specific Areas to Check

#### Business Rules Consistency
- User management and authentication patterns
- Order processing workflows (Saga pattern)
- Payment processing security
- Multi-tenancy implementation
- Data consistency models
- Compliance requirements (GDPR, PCI DSS)

#### Development Plan Alignment
- Microservices architecture decisions
- Database technology choices
- Event-driven patterns
- Security implementation
- Monitoring and observability
- Deployment strategies

## Output Format

### Consistency Report
**Document**: [ADR Name]
**Review Date**: [Date]
**Overall Consistency**: [High/Medium/Low]

#### ✅ Aligned Areas
- [List specific areas where documents are consistent]

#### ⚠️ Minor Inconsistencies
- [List minor issues that need attention]

#### ❌ Major Inconsistencies
- [List critical issues that must be resolved]

#### 🔧 Recommendations
- [Specific actions to improve consistency]

### Detailed Analysis
For each major inconsistency found, provide:
1. **Issue Description**: Clear explanation of the inconsistency
2. **Impact Assessment**: How this affects the overall system
3. **Resolution Options**: Specific ways to resolve the inconsistency
4. **Priority**: High/Medium/Low for resolution

## Quality Gates
The ADR is considered consistent if:
- [ ] All business rules are properly addressed
- [ ] Technology choices align with the development plan
- [ ] No major inconsistencies exist
- [ ] Implementation approach supports business objectives
- [ ] Performance and security requirements are met

## Next Steps
If inconsistencies are found:
1. **Immediate**: Document the issues in the ADR
2. **Short-term**: Update affected documents to resolve conflicts
3. **Long-term**: Establish processes to prevent future inconsistencies

## Example Usage
"Please verify the consistency of ADR-003-container-orchestration-service-mesh.md against the business rules and development plan documents. Focus on how the container orchestration decisions support the multi-tenant requirements and the planned Go microservices architecture."
```

## Usage Instructions

1. **Copy the prompt template** above
2. **Replace placeholders** with specific document names and details
3. **Execute the verification** with your AI assistant
4. **Review the consistency report** and address any issues
5. **Update documents** as needed to resolve inconsistencies
6. **Document the verification** in your project tracking system

## Best Practices

- **Regular Reviews**: Verify consistency monthly or when major changes occur
- **Documentation Updates**: Keep all documents synchronized when changes are made
- **Version Control**: Track changes and maintain document version history
- **Team Communication**: Share consistency findings with stakeholders
- **Continuous Improvement**: Use findings to improve documentation processes

## Expected Outcomes

- **Consistent Architecture**: All technical decisions align with business requirements
- **Reduced Risk**: Fewer implementation conflicts and rework
- **Better Planning**: Clear understanding of how technical choices support business goals
- **Improved Communication**: Stakeholders have confidence in technical direction
- **Quality Assurance**: Higher quality architectural decisions and implementations
