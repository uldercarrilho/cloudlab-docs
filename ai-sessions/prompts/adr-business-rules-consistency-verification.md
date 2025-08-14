# ADR & Business Rules Consistency Verification Prompt

## Purpose
Comprehensive consistency verification between Architecture Decision Records (ADRs) and Business Rules documents for distributed systems projects.

## Category
Architecture Review & Design Discussion

## Usage
Use this prompt when you need to:
- Verify alignment between technical decisions and business requirements
- Identify gaps in architectural coverage
- Ensure consistency across multiple ADR documents
- Validate that business rules have corresponding technical implementations

## Context Requirements
- Access to AI General Rules document (`.cursor\rules\general-rules.mdc`)
- Access to all ADR documents in `/architecture/adrs/` folder
- Access to Business Rules document (`/business/backlog/BUSINESS-RULES-001-ecommerce-platform.md`)
- Understanding of distributed systems architecture principles
- Familiarity with e-commerce platform business requirements

## Expected Output
- Executive summary with consistency score
- Detailed analysis report with specific examples
- Action plan with prioritized recommendations
- Specific document updates needed

---

# ADR Consistency Verification Task

## Context
You are tasked with performing a comprehensive consistency verification between Architecture Decision Records (ADRs) and the Business Rules document for a distributed e-commerce platform. This is a critical task to ensure architectural decisions align with business requirements and there are no conflicts between different ADRs.

## Your Mission
Analyze all ADR documents and the Business Rules document to identify inconsistencies, gaps, and conflicts. Create a detailed report with specific recommendations for resolution.

## Required Analysis

### 1. Document Structure Analysis
- Review all ADRs in the `/architecture/adrs/` folder
- Analyze the Business Rules document (`/business/backlog/BUSINESS-RULES-001-ecommerce-platform.md`)
- Identify the format and structure of each document type

### 2. Cross-Reference Mapping
- Create a matrix showing which business rules are covered by which ADRs
- Identify business rules that lack corresponding ADR decisions
- Map ADR decisions to specific business requirements

### 3. Consistency Validation
- **Technology Alignment**: Verify ADR technology choices support business requirements
- **Constraint Validation**: Check if business constraints are properly addressed in ADRs
- **Cross-ADR Consistency**: Ensure no conflicting decisions between different ADRs
- **Business Rule Coverage**: Verify all critical business rules have ADR decisions
- **References Validation**: Check if all links for local and external documents and websites actually works
- **Up-to-date information**: Check if any value or information is up-to-date

### 4. Gap Analysis
- **Missing ADRs**: Identify business areas without corresponding ADRs
- **Incomplete Coverage**: Find ADRs that don't fully address business requirements
- **Conflicting Decisions**: Identify any contradictions between ADRs or with business rules
- **Missing links**: Find references for local and external documents, or websites without a proper markdown link format

### 5. Recommendations
- **Immediate Actions**: Critical inconsistencies that must be resolved
- **Missing ADRs**: New ADRs needed for uncovered business areas
- **Document Updates**: Specific changes needed in existing ADRs
- **Business Rule Updates**: Changes needed in business rules based on ADR decisions

## Deliverables

### 1. Executive Summary
- Overall consistency score (1-10)
- Critical issues count
- Missing ADRs count
- Recommendations priority order

### 2. Detailed Analysis Report
- **Consistency Matrix**: Business Rules vs ADR coverage
- **Conflict Analysis**: Specific inconsistencies with examples
- **Gap Analysis**: Missing decisions and coverage areas
- **Cross-ADR Dependencies**: How ADRs relate to each other

### 3. Action Plan
- **Phase 1**: Critical fixes (immediate)
- **Phase 2**: Missing ADR creation (short-term)
- **Phase 3**: Document updates (medium-term)
- **Phase 4**: Validation and testing (long-term)

### 4. Specific Recommendations
- **ADR Updates**: Exact changes needed in each ADR
- **New ADRs**: Complete ADR documents for missing areas
- **Business Rule Updates**: Changes needed in business rules
- **Consistency Matrix**: Reference document for future maintenance

## Success Criteria
- All business rules have corresponding ADR decisions
- No conflicting decisions between ADRs
- Technology choices fully support business requirements
- Clear action plan for resolving identified issues
- Comprehensive documentation for future maintenance

## Important Notes
- Focus on practical, actionable recommendations
- Provide specific examples of inconsistencies
- Consider the impact of changes on existing decisions
- Maintain the educational value of the documentation
- Ensure all recommendations align with the project's distributed systems learning goals

## Output Format
Please structure your response as a comprehensive report with clear sections, tables, and actionable recommendations. Use markdown formatting for readability and include specific file references and line numbers where applicable.

---

## Version History
- **v1.0** (2025-01-27): Initial prompt creation for ADR consistency verification
