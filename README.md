# CloudLab Documentation

📚 **Comprehensive documentation for architecture, ADRs, API specifications, runbooks, and development guides.**

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
- **`architecture/diagrams/`** – Visual system architecture, service interactions, and data flows (C4 models, sequence diagrams)
- **`architecture/overview/`** – System overview, architecture principles, and technology stack
- **`architecture/patterns/`** – Distributed system patterns, failure patterns, and integration patterns

> **Note:** ADRs use the unified PRD + ADR hybrid template for better consistency and AI collaboration.

### 🔌 API Documentation
- **`api/specifications/openapi/`** – OpenAPI/Swagger specifications for all services
- **`api/guides/`** – API design principles, authentication, authorization, and implementation guides
- **`api/testing/`** – Postman collections and testing resources

### 📖 Runbooks
- **`operations/runbooks/deployment/`** – Production deployment and rollback procedures
- **`operations/runbooks/troubleshooting/`** – Common issues, debugging, and performance tuning
- **`operations/runbooks/operations/`** – Backup, scaling, security, and maintenance procedures
- **`operations/runbooks/incidents/`** – Post-mortem reports and incident analysis

### 💻 Development
- **`development/setup/`** – Getting started guides and environment setup
- **`development/guidelines/`** – Coding standards, security best practices, and contribution guidelines
- **`development/environments/`** – Local development and environment configuration
- **`development/tools/`** – CI/CD pipelines and development tooling
- **`development/troubleshooting/`** – Common development issues and solutions

### 💼 Business
- **`business/backlog/`** – AI-assisted backlog management system with TODO capture, prioritized tasks, and workflow tracking
- **`business/requirements/`** – Functional and non-functional requirements
- **`business/workflows/`** – Business processes and user journeys
- **`business/user-stories/`** – User stories and epics
- **`business/compliance/`** – Compliance documentation and requirements

### 🤖 AI Sessions
- **`ai-sessions/chat-history/`** – Organized AI assistant interaction history and insights
- **`ai-sessions/prompts/`** – Reusable prompts and templates for AI collaboration
- **`ai-sessions/insights/`** – Key insights and recommendations from AI sessions

### 📝 Templates
- **`templates/`** – Document templates for consistency, including:
  - `prd-adr-template.md` – PRD + ADR hybrid template for features and decisions
  - `runbook-template.md` – Runbook template for operational procedures
  - `post-mortem-template.md` – Post-mortem template for incident analysis

## 🚀 Getting Started

1. **Browse by category** using the folder structure above
2. **Use templates** in `/templates/` for creating new documents
3. **Follow naming conventions**: `YYYY-MM-DD-topic.md` for time-based docs
4. **Check README files** in each folder for specific guidelines

## 🔍 Finding Information

- **Architecture decisions & features**: See `architecture/decisions/` and `architecture/overview/`
- **API integration**: Start with `api/specifications/openapi/` and `api/guides/`
- **Operational issues**: Look in `operations/runbooks/troubleshooting/`
- **Development setup**: Begin with `development/setup/`
- **Business context**: Explore `business/requirements/` and `business/backlog/`
- **Task management**: Use `business/backlog/` for project planning and AI-assisted execution

## 📋 Contributing

Please use the document templates in `/templates/` and follow the review processes outlined in each section's README file.
