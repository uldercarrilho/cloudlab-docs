# ADR Enhancement and Consistency Check Prompt

## Purpose
This prompt is designed to analyze Architecture Decision Record (ADR) documents against their corresponding task documents to identify missing content, inconsistencies, and areas for improvement. It ensures ADRs fully satisfy task requirements and maintain high quality standards.

## Usage
Use this prompt when you need to:
- Verify ADR completeness against task requirements
- Identify gaps between task specifications and ADR implementation
- Enhance ADR documents with missing technical details
- Ensure consistency across documentation
- Improve ADR quality and comprehensiveness

## Prompt Template

```
I need you to analyze the document @[TASK-XXX-description.md] which was used to create the document @[ADR-XXX-description.md]. 

Please check if something is missing or if there are inconsistencies between the task document and the ADR document. If issues are found, create a plan to fix them and then implement the necessary changes.

## Analysis Requirements:
1. **Content Completeness**: Verify all task requirements are addressed in the ADR
2. **Technical Depth**: Check if technical details are sufficiently comprehensive
3. **Consistency**: Identify any contradictions or misalignments
4. **Quality**: Assess if the ADR meets professional documentation standards

## Expected Output:
1. **Analysis Results**: Detailed comparison showing what's covered and what's missing
2. **Fix Plan**: Specific actions needed to resolve issues
3. **Implementation**: Execute the plan to enhance the ADR document
4. **Verification**: Confirm all issues are resolved

## Focus Areas:
- Decision matrices and evaluation criteria
- Technical implementation details
- Risk assessment and mitigation strategies
- Monitoring and observability requirements
- Operational procedures and runbooks
- Integration patterns and architectural diagrams
```

## Example Usage

### Input:
```
The document @TASK-005-message-queue-event-streaming-adr.md was used to create the document @ADR-005-message-queue-event-streaming.md. Check if something is missing or inconsistency and create a plan to fix it, if necessary.
```

### Expected Analysis:
1. **Content Gap Analysis**: Identify missing elements from task requirements
2. **Inconsistency Detection**: Find contradictions between documents
3. **Enhancement Opportunities**: Areas where ADR could be improved
4. **Implementation Plan**: Specific steps to resolve issues

### Common Issues Found:
- Missing decision matrices with weighted criteria
- Incomplete technical implementation details
- Insufficient risk mitigation strategies
- Limited monitoring and observability requirements
- Missing operational procedures
- Incomplete integration patterns

## Best Practices

### Before Using:
- Ensure both task and ADR documents are accessible
- Verify document versions are current
- Check if any recent updates might affect analysis

### During Analysis:
- Compare acceptance criteria line by line
- Verify technical depth meets professional standards
- Check for architectural consistency
- Ensure operational procedures are documented

### After Implementation:
- Verify all identified issues are resolved
- Confirm ADR quality meets standards
- Update task status if necessary
- Document lessons learned for future use

## Success Criteria
- [ ] All task requirements addressed in ADR
- [ ] No inconsistencies between documents
- [ ] Technical depth meets professional standards
- [ ] Operational procedures documented
- [ ] Risk mitigation strategies comprehensive
- [ ] Monitoring requirements detailed

## Related Prompts
- Architecture Review and Design Discussion
- Documentation Writing and Improvement
- Problem-solving and Troubleshooting
- Code Generation and Refactoring

## Version History
- v1.0: Initial prompt creation based on ADR-005 enhancement experience
- Based on successful completion of message queue event streaming ADR enhancement
