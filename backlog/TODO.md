# TODO - Raw Ideas and Notes

📝 **Quick capture space for ideas, tasks, and notes that need refinement before entering the formal backlog.**

> **Purpose**: This file serves as a scratchpad for capturing thoughts, requirements, and tasks that need further analysis before being properly structured and prioritized in the backlog.

## 💡 How to Use This File

1. **Quick Capture**: Add ideas as they come up - don't worry about perfect formatting
2. **Regular Review**: Periodically review items and move refined ones to the appropriate backlog
3. **Collaborative**: Multiple people can add items here for later discussion
4. **AI Friendly**: Structure items so AI agents can help with refinement

## 📋 Current Items

### 🚀 Features & Enhancements
<!-- Add new feature ideas here -->

### 🐛 Bugs & Issues
<!-- Add bug reports and issues here -->

### 🔧 Technical Debt
<!-- Add technical improvements here -->
- [ ] [INFRASTRUCTURE] Kafka Production Readiness Enhancements
  - Context: Current Kafka setup is optimized for development but needs production-ready configurations
  - Impact: Improves system reliability, fault tolerance, and scalability for distributed messaging
  - Notes: Based on log analysis - need to implement clustering, replication, monitoring, and performance optimizations
- [ ] [INFRASTRUCTURE] Review docker-compose.yml
  - Context: Current docker-compose setup is `restart: no`, but it's better to setup as `restart: unless-stopped`
  - Notes: I changed it because I was testing the deployment
- [ ] [INFRASTRUCTURE] Review security on docker-compose services
  - Context: As a workaround to fix some issues on login of ElasticSearch, Kibana, and Portainer, I changed the settings
  - Notes: It's important to review the settings for development and production environment
- [ ] [PLATFORM] Review `service-template` scaffold
  - Context: The project was created by AI Agent following a TASK document but it lacks of consistency with ADRs and Guidelines
  - Notes: Create a prompt to automate the validation with ADRs and Guidelines
- [ ] [PLATFORM] Review and update `go.mod`
  - Notes: Use the latest version of each module
- [ ] [PLATFORM] Add Swagger doc generation
  - Notes: See file `platform\service-template\api\rest\openapi\v1\service.yaml`
- [ ] [PLATFORM] Check consistency between OpenAPI definition and endpoints available
  - Notes: Automate the validation
- [ ] [PLATFORM] Organize the codebase in handler/controller, service, etc.?
  - Notes: See file `platform\service-template\internal\handlers\rest.go`
- [ ] [PLATFORM] Check config managment
  - Context: The config managment match '.' with '_' in environment variables.
  - Notes: The identifier `SERVICE_DATABASE_POSTGRESQL_MAX_CONN` is recognized as `database.postgresql.max_conn`?

### 📚 Documentation
<!-- Add documentation tasks here -->

### 🧪 Research & Investigation
<!-- Add research tasks and spikes here -->
- [ ] [TECHNICAL] Design a Golang project scaffold
  - Context: Establish a robust foundation for new Go projects to ensure maintainability and scalability.
  - Impact: Enables consistent project structure, easier onboarding, and alignment with best practices.
  - Notes: Evaluate approaches such as Package Oriented Design, Clean Architecture, and Domain Driven Design for suitability.

### 🎨 UX/UI Improvements
<!-- Add user experience improvements here -->

## 📝 Notes and Context

### Meeting Notes
<!-- Add relevant meeting notes that might generate tasks -->

### Stakeholder Feedback
<!-- Add feedback from users, customers, or stakeholders -->

### Ideas from Team
<!-- Add brainstorming results and team suggestions -->

## 🔄 Refinement Process

When ready to refine items from this TODO:

1. **Analyze** the item for completeness and clarity
2. **Estimate** effort and complexity
3. **Define** acceptance criteria
4. **Prioritize** based on business value and urgency
5. **Create detailed task file**:
   - Create [tasks/TASK-XXX-brief-description.md](tasks/) using the task template
- Add reference to [active/ready.md](active/ready.md) in appropriate priority section
   - Update the task overview table

## 🤖 AI Agent Instructions

When processing items from this TODO:

1. **Group related items** together for better context
2. **Suggest priorities** based on business impact
3. **Identify dependencies** between items
4. **Recommend templates** for proper task structure
5. **Flag incomplete items** that need more information

---

**Quick Add Template:**
```
- [ ] [CATEGORY] Brief description
  - Context: Why is this needed?
  - Impact: Who benefits and how?
  - Notes: Any additional considerations
```
