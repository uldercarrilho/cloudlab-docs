# CloudLab Documentation

📚 **Comprehensive documentation for architecture, RFCs, ADRs, API specifications, runbooks, and development guides.**

This repository serves as the central knowledge base for distributed system design patterns and operational procedures.

## 🔗 Quick Navigation

- **Architecture Overview**: `architecture/overview/`
- **ADRs (Decision Records)**: `architecture/decisions/`
- **API Specs (OpenAPI)**: `api/specifications/openapi/`
- **API Guides**: `api/guides/`
- **Runbooks**: `operations/runbooks/`
- **Development Setup**: `development/setup/`
- **Development Guidelines**: `development/guidelines/`
- **Knowledge Base**: `knowledge/`

## 🗂️ Repository Structure

### 🏗️ Architecture
- **`architecture/decisions/`** – Architecture Decision Records (ADRs) for significant technical decisions
- **`architecture/rfcs/`** – Request for Comments (RFCs) for proposed changes and new features
- **`architecture/diagrams/`** – Visual system architecture, service interactions, and data flows

> **Note:** ADRs and RFCs now use the unified PRD + ADR hybrid template for better consistency and AI collaboration.

### 🔌 API Documentation
- **`api/specifications/openapi/`** – OpenAPI/Swagger specifications for all services
- **`api/testing/postman-collections/`** – Postman collections and environments

### 📖 Runbooks
- **`operations/runbooks/deployment/`** – Production deployment and rollback procedures
- **`operations/runbooks/troubleshooting/`** – Common issues, debugging, and performance tuning
- **`operations/runbooks/operations/`** – Backup, scaling, security, and maintenance procedures
- **`operations/runbooks/incidents/`** – Post-mortem reports and incident analysis

### 💻 Development
- **`development/`** – Getting started guides, coding standards, and contribution guidelines
- **`development/environments/`** – Local development and environment setup
- **`development/tools/`** – CI/CD pipelines and development tooling

### 💼 Business
- **`business/backlog/`** – AI-assisted backlog management system with TODO capture, prioritized tasks, and workflow tracking
- **`business/requirements/`** – Functional and non-functional requirements
- **`business/workflows/`** – Business processes and user journeys
- **`business/user-stories/`** – User stories and epics
- **`business/compliance/`** – Compliance documentation and requirements

### 🤖 AI Sessions
- **`ai-sessions/chat-history/`** – Organized AI assistant interaction history
- **`ai-sessions/prompts/`** – Reusable prompts and templates
- **`ai-sessions/insights/`** – Key insights and recommendations from AI sessions

### 📝 Templates
- **`templates/`** – Document templates for consistency, including:
  - `prd-adr-template.md` – PRD + ADR hybrid template for features and decisions
  - `runbook-template.md` – Runbook template
  - `post-mortem-template.md` – Post-mortem template

## 🚀 Getting Started

1. **Browse by category** using the folder structure above.
2. **Use templates** in `/templates/` for creating new documents (see available templates listed above).
3. **Follow naming conventions**: `YYYY-MM-DD-topic.md` for time-based docs.
4. **Check README files** in each folder for specific guidelines.

## 🔍 Finding Information

- **Architecture decisions & features**: See `architecture/decisions/` and `architecture/overview/`
- **API integration**: Start with `api/specifications/openapi/`
- **Operational issues**: Look in `operations/runbooks/troubleshooting/`
- **Development setup**: Begin with `development/setup/`
- **Business context**: Explore `business/requirements/`
- **Task management**: Use `business/backlog/` for project planning and AI-assisted execution

## 📋 Contributing

Please use the document templates in `/templates/` and follow the review processes outlined in each section's README file.
