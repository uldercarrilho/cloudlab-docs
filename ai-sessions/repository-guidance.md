# CloudLab Repository Guidance for AI Agents

**Document Purpose**: Instructions for AI agents to understand the purpose, scope, and appropriate use cases for each repository in the CloudLab distributed e-commerce platform.

## 🏗️ Project Overview

**CloudLab** is a distributed e-commerce and content platform system designed as a learning environment for distributed systems patterns, microservices architecture, and cloud-native technologies. The project emphasizes hands-on experience with real distributed system challenges while maintaining focus on architectural patterns over external service integrations.

### Business Domain
- **Multi-tenant marketplace** with vendor management
- **Real-time inventory management** across multiple warehouses  
- **Social features** (reviews, recommendations, user-generated content)
- **Content delivery** (product images, videos, documents)
- **Real-time analytics** and reporting dashboard
- **Payment processing** with multiple payment providers (mocked for learning)
- **Order fulfillment** with shipping integration (mocked for learning)

---

## 📁 Repository Structure & AI Agent Guidelines

### 🌐 **web** - Frontend Web Application
**Repository**: `cloudlab-web`
**Description**: Modern React/Next.js web application with responsive design, real-time features, and PWA capabilities. Provides intuitive user interface for the Cloud Lab distributed platform services.

**When to Use This Repository:**
- Building or modifying user interface components
- Implementing client-side features and user interactions
- Working on responsive design and mobile optimization
- Integrating with backend APIs via GraphQL/REST
- Implementing real-time features (WebSocket connections)
- Adding PWA capabilities and offline functionality
- Creating customer-facing e-commerce functionality

**Key Technologies**: React, Next.js, TypeScript, GraphQL, WebSocket, PWA
**Primary Concerns**: User experience, performance, accessibility, real-time updates

---

### ⚙️ **admin** - Administrative Dashboard
**Repository**: `cloudlab-admin`  
**Description**: Cloud Lab Admin Dashboard - Administrative interface built with React for system monitoring, user management, analytics, and platform configuration. Features real-time metrics, alerts, and operational controls.

**When to Use This Repository:**
- Building administrative interfaces and dashboards
- Implementing system monitoring and alerting features
- Creating user management and vendor management interfaces
- Developing analytics dashboards and reporting tools
- Working on platform configuration and settings
- Building operational control panels
- Implementing admin-only features and tools

**Key Technologies**: React, TypeScript, Dashboard Components, Real-time Analytics
**Primary Concerns**: Administrative workflows, system monitoring, data visualization, operational controls

---

### 🏗️ **platform** - Core Backend Services
**Repository**: `cloudlab-platform`
**Description**: Distributed microservices monorepo featuring auth, user management, content delivery, real-time analytics, and payment processing. Built with Go, gRPC, PostgreSQL, Redis, and Kafka for scalable cloud-native architecture.

**When to Use This Repository:**
- Implementing core business logic and microservices
- Building distributed system patterns (Saga, Circuit Breaker, Event Sourcing)
- Creating API endpoints and service integrations
- Working on authentication and authorization systems
- Implementing payment processing workflows (with mocked providers)
- Developing real-time analytics and event streaming
- Building user management and multi-tenant features
- Creating inventory management and order processing systems

**Key Services Include**:
- **Auth Service**: JWT authentication, OAuth2, RBAC
- **User Service**: Profile management, multi-tenancy 
- **Product Service**: Catalog management, inventory tracking
- **Order Service**: Order processing, saga patterns
- **Payment Service**: Payment workflows (mocked providers)
- **Analytics Service**: Real-time metrics, event processing
- **Content Service**: Media management, CDN integration
- **Search Service**: Elasticsearch-based search
- **Notification Service**: Multi-channel messaging

**Key Technologies**: Go, gRPC, PostgreSQL, Redis, Kafka, Event Sourcing
**Primary Concerns**: Distributed systems patterns, microservices architecture, data consistency, performance

---

### ☁️ **infrastructure** - Infrastructure as Code
**Repository**: `cloudlab-infrastructure`
**Description**: Infrastructure as Code (Terraform) and Kubernetes manifests for multi-cloud deployment. Includes auto-scaling, monitoring, service mesh, and CI/CD pipelines for production-ready distributed systems.

**When to Use This Repository:**
- Defining and managing cloud infrastructure resources
- Creating Kubernetes manifests and deployment configurations  
- Setting up monitoring, logging, and observability infrastructure
- Configuring service mesh (Istio) and networking
- Implementing CI/CD pipelines and GitOps workflows
- Managing multi-region deployments and disaster recovery
- Setting up auto-scaling and resource management
- Configuring security policies and network isolation

**Key Technologies**: Terraform, Kubernetes, Istio, AWS/GCP, ArgoCD, Prometheus, Grafana
**Primary Concerns**: Infrastructure automation, scalability, security, observability, deployment strategies

---

### 📚 **docs** - Comprehensive Documentation
**Repository**: `docs`
**Description**: Comprehensive documentation for architecture, ADRs, API specifications, runbooks, and development guides. Serves as the central knowledge base for distributed system design patterns and operational procedures.

**When to Use This Repository:**
- Understanding system architecture and design decisions
- Researching architectural decision records (ADRs)
- Finding API specifications and integration guides
- Accessing runbooks and operational procedures
- Learning about distributed systems patterns and concepts
- Contributing to documentation and knowledge management
- Creating new ADRs for architectural decisions
- Updating development guidelines and best practices

**Key Content Areas**:
- **Architecture**: ADRs, diagrams, system overview, patterns
- **API**: OpenAPI specifications, guides, testing resources
- **Operations**: Runbooks, deployment procedures, troubleshooting
- **Development**: Setup guides, coding standards, environments
- **Product**: Business requirements and development plans
- **Knowledge**: Distributed systems concepts and tutorials

**Primary Concerns**: Knowledge management, architectural guidance, operational procedures, learning resources

---

## 🎯 Repository Selection Guidelines for AI Agents

### When Working on Features:
1. **User-facing features** → `web` (customer interface) or `admin` (administrative interface)
2. **Business logic and APIs** → `platform` (core services and microservices)
3. **Infrastructure changes** → `infrastructure` (Terraform, Kubernetes, monitoring)
4. **Documentation updates** → `docs` (ADRs, guides, specifications)

### When Troubleshooting:
1. **UI/UX issues** → `web` or `admin`
2. **API or service issues** → `platform` 
3. **Deployment or infrastructure issues** → `infrastructure`
4. **Need architectural context** → `docs` (check ADRs and system overview)

### When Planning Architecture:
1. **Start with** → `docs` (review existing ADRs and system overview)
2. **Document decisions** → `docs` (create new ADRs)
3. **Implement infrastructure** → `infrastructure` (Terraform/K8s changes)
4. **Build services** → `platform` (microservices implementation)
5. **Create interfaces** → `web`/`admin` (user-facing components)

---

## 🔧 Development Workflow Guidance

### Standard Development Flow:
1. **Research** → Review `docs` for existing patterns and decisions
2. **Plan** → Create or update ADRs in `docs` for architectural decisions
3. **Infrastructure** → Update `infrastructure` for resource requirements
4. **Backend** → Implement in `platform` for business logic and APIs
5. **Frontend** → Build interfaces in `web` (customer) or `admin` (administrative)
6. **Document** → Update `docs` with implementation details and runbooks

### Repository Dependencies:
- `web` and `admin` depend on `platform` APIs
- `platform` services depend on `infrastructure` resources
- All repositories should reference `docs` for architectural guidance
- `docs` should be updated to reflect changes in other repositories

---

## 🚨 Important Context for AI Agents

### Learning-First Approach:
- **Primary Goal**: Learn distributed systems patterns and concepts
- **Mock External Services**: Payment providers, shipping, notifications are mocked
- **Focus**: Architectural patterns over external integrations
- **Complexity**: Prioritize learning value over production complexity

### Key Distributed Systems Concepts to Emphasize:
- **Microservices Architecture**: Service decomposition and communication
- **Event-Driven Patterns**: Kafka-based event streaming and saga patterns
- **Data Consistency**: CAP theorem trade-offs, eventual consistency
- **Fault Tolerance**: Circuit breakers, bulkheads, graceful degradation
- **Scalability**: Horizontal scaling, load balancing, auto-scaling
- **Observability**: Distributed tracing, monitoring, logging

### Technology Standards:
- **Backend**: Go microservices with gRPC communication
- **Frontend**: React/Next.js with TypeScript
- **Infrastructure**: Kubernetes with Istio service mesh
- **Data**: PostgreSQL (OLTP), ClickHouse (OLAP), Redis (Cache)
- **Messaging**: Apache Kafka for event streaming
- **Observability**: Prometheus, Grafana, Jaeger

---

## 📋 Quick Reference Checklist

**Before making changes to any repository:**
- [ ] Check `docs/architecture/decisions/` for relevant ADRs
- [ ] Review `docs/architecture/overview/system-overview.md` for context
- [ ] Understand the distributed systems concepts being demonstrated
- [ ] Consider impact on other repositories and services
- [ ] Plan documentation updates for significant changes

**When creating new features:**
- [ ] Start with ADR if architectural decision is needed
- [ ] Plan infrastructure requirements first
- [ ] Implement backend services before frontend
- [ ] Consider event-driven patterns for service communication
- [ ] Include observability and monitoring from the start
- [ ] Update documentation and runbooks

**For troubleshooting:**
- [ ] Check `docs/operations/runbooks/` for common issues
- [ ] Review service logs and distributed traces
- [ ] Consider impact on other services in the distributed system
- [ ] Document solutions in appropriate runbooks

---

## 🔗 Additional Resources

- **System Architecture**: `docs/architecture/overview/system-overview.md`
- **Technology Stack**: `docs/architecture/overview/technology-stack.md`
- **Business Rules**: `docs/product/PRD-001-business-rules.md`
- **Development Guidelines**: `docs/development/guidelines/`
- **API Documentation**: `docs/api/specifications/`
- **Runbooks**: `docs/operations/runbooks/`

This guidance document should be referenced at the beginning of any development session to ensure proper repository selection and approach alignment with the project's distributed systems learning objectives.
