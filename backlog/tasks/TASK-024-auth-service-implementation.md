# TASK-024: Auth Service Implementation - ORY Kratos + Custom Go Services

**Status**: Ready  
**Priority**: High  
**Effort**: 10-12 days  
**Type**: Feature/Infrastructure  
**Created**: 2025-09-22 14:30:00  
**Updated**: 2025-09-23 10:45:00  
**Started**:  
**Completed**:  

## 🎯 Task Summary
Implement a comprehensive Authentication Service for the distributed e-commerce platform using ORY Kratos as the identity provider with custom Go services for business logic, supporting multi-tenant user management, OAuth 2.0 + OpenID Connect, multi-factor authentication, and role-based access control for customers, vendors, and administrators.

## 📋 Business Context
**Problem**: The distributed e-commerce platform requires a robust authentication system that can handle multiple user types (customers, vendors, admins, support), provide secure authentication, and enforce business rules for user registration, verification, and access control.

**Business Value**:
- **Production-Ready Security**: Enterprise-grade authentication using battle-tested ORY Kratos
- **Compliance**: Meets PCI DSS and GDPR requirements for user data handling
- **Multi-tenant Support**: Enables secure isolation between vendors and customers
- **Scalability**: Supports 100,000+ concurrent users with <200ms response times
- **Learning Value**: Demonstrates microservices integration, OAuth 2.0, MFA, and distributed authentication patterns
- **Professional Standards**: Industry-standard solution with custom business logic integration

## 🎯 Acceptance Criteria

### Core Authentication Features
- [ ] **ORY Kratos Integration**: Complete ORY Kratos deployment with OAuth 2.0 + OpenID Connect
- [ ] **JWT Token Management**: 24-hour access tokens, 30-day refresh tokens with automatic rotation
- [ ] **Multi-Factor Authentication**: TOTP-based 2FA with SMS fallback for vendors/admins via ORY Kratos
- [ ] **Session Management**: ORY Kratos session management with Redis backend and concurrent session limits
- [ ] **Password Policies**: ORY Kratos password policies with Argon2id hashing and complexity requirements

### User Management Features
- [ ] **ORY Kratos User Registration**: Customer and vendor registration workflows with email verification
- [ ] **Custom Go RBAC Service**: Granular permissions for customers, vendors, admins, support
- [ ] **Multi-tenant Isolation**: Complete data segregation between tenants with zero cross-tenant access
- [ ] **Custom Go Profile Service**: User profile CRUD operations with business logic validation
- [ ] **Account Security**: ORY Kratos account lockout, password reset, secure logout

### Security & Compliance
- [ ] **Data Encryption**: All data encrypted in transit (TLS) and at rest (AES-256)
- [ ] **Audit Logging**: Comprehensive access and change logging for compliance
- [ ] **GDPR Compliance**: Data subject rights, data retention, and privacy controls
- [ ] **PCI DSS Compliance**: Secure handling of payment-related user data
- [ ] **Rate Limiting**: API rate limiting and brute force protection

### Performance & Reliability
- [ ] **Response Times**: <200ms authentication (95th percentile), <50ms token validation
- [ ] **Availability**: 99.9% uptime with health checks and monitoring
- [ ] **Scalability**: Horizontal scaling with load balancer and database read replicas
- [ ] **Error Handling**: Graceful degradation and comprehensive error responses

## 🏗️ Technical Architecture

### ORY Kratos + Custom Go Services Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  ORY Kratos     │    │  Identity Store │
│                 │◄──►│                 │◄──►│   (PostgreSQL)  │
│ - Rate Limiting │    │ - OAuth 2.0     │    │ - Identities    │
│ - Auth Check    │    │ - OpenID Connect│    │ - Sessions      │
│ - Routing       │    │ - MFA           │    │ - Credentials   │
└─────────────────┘    │ - Password Mgmt │    └─────────────────┘
         │             └─────────────────┘             │
         │                       │                     │
         │                       ▼                     │
         │              ┌─────────────────┐            │
         │              │  Custom Go      │            │
         │              │  Business Logic │            │
         │              │  Services       │            │
         │              │                 │            │
         │              │ - Multi-tenant  │            │
         │              │ - RBAC          │            │
         │              │ - Event Pub     │            │
         │              └─────────────────┘            │
         │                       │                     │
         │                       ▼                     │
         │              ┌─────────────────┐            │
         │              │   Event Bus     │            │
         │              │   (Kafka)       │            │
         │              │                 │            │
         │              │ - User Created  │            │
         │              │ - User Updated  │            │
         │              │ - Auth Events   │            │
         └──────────────┴─────────────────┴────────────┘
```

### Technology Stack
- **Identity Provider**: ORY Kratos v1.3.1 (latest stable)
- **Custom Services**: Go 1.25 (latest stable with security patches)
- **Web Framework**: Gin v1.10.0 (high-performance HTTP router)
- **Database**: PostgreSQL 17 (primary data store)
- **Cache**: Redis 7.4.0 (session management and caching)
- **Event Streaming**: Apache Kafka 3.7.0 (user events)
- **Container Runtime**: Docker 26.0.0 (containerization)
- **Orchestration**: Kubernetes 1.31 (deployment)

## 🔄 Version Verification Requirements
**CRITICAL**: Before implementation, verify and document exact versions:

1. **ORY Kratos**: v1.3.1 - Latest stable with security patches and OAuth 2.0 support
2. **Go Version**: 1.25 - Latest stable with security patches
3. **PostgreSQL**: 17 - Latest stable with performance improvements
4. **Redis**: 7.4.0 - Latest stable with security updates
5. **Gin Framework**: 1.10.0 - Latest stable with improved middleware
6. **Docker**: 26.0.0 - Latest stable for containerization
7. **Kubernetes**: 1.31 - Latest stable for orchestration
8. **Kafka**: 3.7.0 - Latest stable for event streaming

## 🚀 Implementation Strategy

### Phase 1: ORY Kratos Setup (Days 1-3)
1. **ORY Kratos Deployment**
   - Deploy ORY Kratos using Docker Compose with PostgreSQL backend
   - Configure ORY Kratos with OAuth 2.0 and OpenID Connect settings
   - Set up identity schemas for customers, vendors, admins, and support
   - Configure self-service flows for registration, login, and recovery

2. **Database Configuration**
   - Set up PostgreSQL database for ORY Kratos identity store
   - Configure ORY Kratos database migrations
   - Set up Redis for session management
   - Create initial admin user and tenant configurations

### Phase 2: Custom Go Business Logic Services (Days 4-6)
1. **Multi-tenant RBAC Service**
   - Create Go service for role-based access control
   - Implement tenant isolation at application level
   - Create permission checking middleware
   - Add audit logging for all access attempts

2. **User Profile Management Service**
   - Create Go service for business-specific user data
   - Implement user profile CRUD operations
   - Add business rule validation and data integrity checks
   - Create tenant-specific user management APIs

### Phase 3: ORY Kratos Integration (Days 7-8)
1. **OAuth 2.0 + OpenID Connect Integration**
   - Configure ORY Kratos OAuth 2.0 flows
   - Set up OpenID Connect provider endpoints
   - Implement JWT token validation in Go services
   - Create token refresh and revocation mechanisms

2. **Multi-Factor Authentication Setup**
   - Configure ORY Kratos MFA with TOTP and SMS
   - Implement MFA enforcement for vendors and admins
   - Create MFA recovery mechanisms
   - Add MFA status management in Go services

### Phase 4: Event-Driven Integration (Days 9-10)
1. **Event Publishing System**
   - Create Go services for publishing user events to Kafka
   - Implement user lifecycle event handlers
   - Add authentication event streaming
   - Create event-driven user management workflows

2. **Service Integration**
   - Create authentication middleware for other services
   - Implement service discovery integration
   - Set up monitoring and metrics collection
   - Add health checks and observability

### Phase 5: Testing & Validation (Days 11-12)
1. **Comprehensive Testing**
   - Unit tests for Go business logic services (>90% coverage)
   - Integration tests for ORY Kratos API interactions
   - Security testing for authentication bypass attempts
   - Performance testing and load validation

2. **Security & Compliance Validation**
   - Penetration testing simulation
   - GDPR and PCI DSS compliance validation
   - Multi-tenant isolation verification
   - Rate limiting and brute force protection testing

## 🎓 Learning Objectives

### Distributed Systems Concepts
- **Microservices Integration**: API communication patterns with ORY Kratos
- **OAuth 2.0 & OpenID Connect**: Industry-standard authentication protocols via ORY Kratos
- **Multi-tenant Architecture**: Data isolation and tenant-specific security
- **Event-driven Architecture**: Publishing authentication events to other services
- **Service Discovery**: Health checks and service registration patterns

### Security Patterns
- **Identity Provider Integration**: Professional-grade authentication with ORY Kratos
- **Multi-Factor Authentication**: TOTP and SMS-based 2FA via ORY Kratos
- **Rate Limiting**: API protection against abuse and brute force attacks
- **Audit Logging**: Comprehensive security event tracking
- **Encryption**: Data protection in transit and at rest

### Go Development Skills
- **Microservice Architecture**: Clean architecture patterns in Go
- **API Integration**: RESTful API communication with external services
- **Database Integration**: PostgreSQL with proper connection management
- **Event Streaming**: Kafka integration for user lifecycle events
- **Testing Strategies**: Unit, integration, and security testing in Go

## 📊 Database Schema Design

### ORY Kratos Identity Store
ORY Kratos manages its own identity store with the following structure:
- **Identities**: Core user identity data managed by ORY Kratos
- **Sessions**: Active user sessions managed by ORY Kratos
- **Credentials**: Password hashes and MFA secrets managed by ORY Kratos
- **Recovery Tokens**: Password reset and account recovery tokens

### Custom Go Services Business Data
```sql
-- User roles enum for business logic
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin', 'support');

-- User status enum for business logic
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'deleted');

-- MFA status enum for business logic
CREATE TYPE mfa_status AS ENUM ('disabled', 'enabled', 'required');

-- Business user profiles table (extends ORY Kratos identities)
CREATE TABLE business_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kratos_identity_id UUID NOT NULL, -- Reference to ORY Kratos identity
    tenant_id UUID NOT NULL, -- Multi-tenant isolation
    role user_role NOT NULL DEFAULT 'customer',
    status user_status NOT NULL DEFAULT 'pending',
    mfa_enabled mfa_status NOT NULL DEFAULT 'disabled',
    phone_number VARCHAR(20), -- For SMS 2FA
    business_verification_status VARCHAR(50), -- For vendors
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_business_profile_kratos FOREIGN KEY (kratos_identity_id) REFERENCES identities(id),
    CONSTRAINT fk_business_profile_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) COMMENT 'Business user profiles extending ORY Kratos identities with multi-tenant isolation';

-- User permissions table for RBAC
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    granted_by UUID,
    CONSTRAINT fk_permission_user FOREIGN KEY (user_id) REFERENCES business_user_profiles(id),
    CONSTRAINT fk_permission_granter FOREIGN KEY (granted_by) REFERENCES business_user_profiles(id)
) COMMENT 'User permissions for role-based access control';
```

## 🔧 API Endpoints Specification

### ORY Kratos Authentication Endpoints
- `GET /.well-known/openid_configuration` - OpenID Connect discovery
- `POST /oauth2/auth` - OAuth 2.0 authorization endpoint
- `POST /oauth2/token` - OAuth 2.0 token endpoint
- `POST /oauth2/revoke` - Token revocation endpoint
- `GET /oauth2/userinfo` - User information endpoint
- `GET /self-service/login/api` - Self-service login API
- `GET /self-service/registration/api` - Self-service registration API
- `GET /self-service/recovery/api` - Self-service recovery API
- `GET /self-service/settings/api` - Self-service settings API

### Custom Go Business Logic Endpoints
- `GET /api/v1/users/profile` - Get business user profile
- `PUT /api/v1/users/profile` - Update business user profile
- `GET /api/v1/users/permissions` - Get user permissions
- `POST /api/v1/users/permissions` - Grant user permissions
- `DELETE /api/v1/users/permissions/:id` - Revoke user permissions

### Multi-tenant Management Endpoints
- `GET /api/v1/tenants/:id/users` - List users by tenant
- `POST /api/v1/tenants/:id/users` - Create user in tenant
- `PUT /api/v1/tenants/:id/users/:userId/role` - Update user role in tenant
- `GET /api/v1/tenants/:id/analytics` - Get tenant analytics

### Admin Endpoints
- `GET /api/v1/admin/users` - List all users (admin only)
- `PUT /api/v1/admin/users/:id/status` - Update user status
- `GET /api/v1/admin/tenants` - List all tenants
- `POST /api/v1/admin/tenants` - Create new tenant
- `GET /api/v1/admin/audit-logs` - Get audit logs

## 🧪 Testing Strategy

### Unit Testing (>90% Coverage)
- **Go Business Logic Services**: RBAC, user profile management, event publishing
- **ORY Kratos Integration**: API client interactions, token validation
- **Multi-tenant Logic**: Tenant isolation, permission checking
- **Event Handling**: Kafka event publishing and consumption
- **Security Features**: Rate limiting, audit logging

### Integration Testing
- **ORY Kratos API Integration**: Complete authentication flows with ORY Kratos
- **Database Integration**: Business data CRUD operations, tenant isolation
- **Redis Integration**: Session storage and retrieval via ORY Kratos
- **Kafka Integration**: Event publishing and consumption
- **Multi-tenant Testing**: Cross-tenant data access prevention

### Security Testing
- **Authentication Bypass**: Attempt to bypass ORY Kratos authentication
- **Authorization Testing**: Permission escalation attempts in Go services
- **MFA Bypass**: Attempt to circumvent ORY Kratos multi-factor authentication
- **Rate Limiting**: Validate rate limiting and brute force protection
- **Data Isolation**: Verify multi-tenant data segregation

### Performance Testing
- **Load Testing**: 1000+ concurrent authentication requests through ORY Kratos
- **Stress Testing**: System behavior under extreme load
- **Token Validation**: Performance of JWT validation under load
- **API Performance**: Go services response times under load
- **Database Performance**: Business data queries and tenant isolation performance

## 📚 Resources & References

### Technical Documentation
- [ADR-001: User Management & Authentication](../architecture/decisions/ADR-001-user-management-authentication.md)
- [Brainstorm Session: Custom Auth Service vs Keycloak](../../ai-sessions/brainstorm-auth-service-vs-keycloak.md)
- [Business Rules Document](../../product/PRD-001-business-rules.md) - Section 3.1 User Management
- [Development Plan](../../product/PRD-002-development-plan.md) - Phase 2 Core Services

### ORY Kratos Resources
- [ORY Kratos Documentation](https://www.ory.sh/docs/kratos/)
- [ORY Kratos API Reference](https://www.ory.sh/docs/kratos/reference/api)
- [ORY Kratos Configuration](https://www.ory.sh/docs/kratos/guides/configuration)
- [ORY Kratos Self-Service Flows](https://www.ory.sh/docs/kratos/self-hosted/self-service-flows)
- [ORY Kratos Multi-Factor Authentication](https://www.ory.sh/docs/kratos/self-hosted/mfa)

### OAuth & Security Resources
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)

### Go Development Resources
- [Gin Web Framework Documentation](https://gin-gonic.com/docs/)
- [PostgreSQL Go Driver](https://pkg.go.dev/github.com/lib/pq)
- [Redis Go Client](https://pkg.go.dev/github.com/go-redis/redis/v8)
- [Kafka Go Client](https://pkg.go.dev/github.com/segmentio/kafka-go)
- [ORY Kratos Go Client](https://pkg.go.dev/github.com/ory/kratos-client-go)

## 🔗 Dependencies

### Prerequisites
- **TASK-023**: GitHub Actions CI/CD templates (completed)
- **Database Setup**: PostgreSQL 17 instance available
- **Cache Setup**: Redis 7.4.0 instance available
- **Event Bus**: Kafka cluster for publishing authentication events
- **Monitoring**: Prometheus and Grafana for metrics collection

### Blocking Dependencies
- **Service Mesh**: Istio configuration for service-to-service communication
- **API Gateway**: Rate limiting and routing configuration
- **Secret Management**: HashiCorp Vault for secure secret storage
- **Monitoring Setup**: Logging and metrics collection infrastructure

### Related Tasks
- **TASK-025**: User Service Implementation (depends on Auth Service)
- **TASK-026**: API Gateway Configuration (integrates with Auth Service)
- **TASK-027**: Service Mesh Setup (includes Auth Service routing)
- **TASK-028**: Monitoring & Observability (includes Auth Service metrics)

## ⚠️ Risk Assessment

### Technical Risks
- **OAuth Implementation Complexity**: OAuth 2.0 + OpenID Connect is complex
  - *Mitigation*: Use proven libraries, extensive testing, security review
- **JWT Security**: Token-based authentication has security implications
  - *Mitigation*: Short token lifetimes, secure storage, token blacklisting
- **Multi-tenant Isolation**: Risk of data leakage between tenants
  - *Mitigation*: Database-level isolation, comprehensive testing, audit logging

### Security Risks
- **Authentication Bypass**: Risk of circumventing authentication
  - *Mitigation*: Comprehensive security testing, penetration testing, code review
- **MFA Bypass**: Risk of multi-factor authentication circumvention
  - *Mitigation*: Rate limiting, fallback mechanisms, security testing
- **Session Hijacking**: Risk of session token compromise
  - *Mitigation*: Secure token storage, automatic rotation, monitoring

### Compliance Risks
- **GDPR Violations**: User data handling may not meet requirements
  - *Mitigation*: Privacy by design, data subject rights, regular audits
- **PCI DSS Non-compliance**: Payment-related user data security
  - *Mitigation*: Encryption, access controls, security testing

## 📈 Success Metrics

### Technical Metrics
- **Authentication Success Rate**: >99.5% successful authentications
- **Response Time**: P95 <200ms, P99 <500ms for authentication requests
- **Availability**: 99.9% uptime with health checks and monitoring
- **Error Rate**: <0.1% for authentication failures

### Security Metrics
- **Security Incidents**: 0 critical security breaches
- **Compliance**: 100% GDPR and PCI DSS compliance validation
- **Vulnerability Management**: <24 hours for critical vulnerability remediation
- **Access Control**: 100% unauthorized access prevention

### Business Metrics
- **User Onboarding**: <5 minutes for customer registration completion
- **Vendor Onboarding**: <3 business days for vendor approval
- **User Satisfaction**: >4.5/5 rating for authentication experience
- **Support Tickets**: <5% of tickets related to authentication issues

## 🎯 AI Agent Decision Points

### Technology Choices
1. **Identity Provider**: ORY Kratos vs. Custom Auth Service vs. Keycloak
   - *Decision*: ORY Kratos for production-ready security with microservices-native architecture
2. **Business Logic**: ORY Kratos only vs. ORY Kratos + Custom Go Services
   - *Decision*: ORY Kratos + Custom Go Services for professional security with custom business rules
3. **MFA Implementation**: ORY Kratos MFA vs. Custom MFA vs. External MFA
   - *Decision*: ORY Kratos MFA for production-ready security with TOTP and SMS support

### Architecture Decisions
1. **User Storage**: ORY Kratos identity store vs. Custom user database
   - *Decision*: ORY Kratos identity store for core auth data, custom database for business data
2. **Multi-tenancy**: ORY Kratos multi-tenancy vs. Custom multi-tenant isolation
   - *Decision*: Custom Go services for multi-tenant business logic with ORY Kratos for authentication
3. **Event Publishing**: ORY Kratos events vs. Custom event system
   - *Decision*: Custom Go services for business event publishing to Kafka

### Implementation Strategies
1. **Integration Pattern**: Direct API calls vs. SDK vs. gRPC
   - *Decision*: Direct REST API calls to ORY Kratos for simplicity and learning value
2. **Data Synchronization**: Real-time vs. Event-driven vs. Batch
   - *Decision*: Event-driven synchronization via Kafka for performance and reliability
3. **Error Handling**: ORY Kratos errors vs. Custom error handling
   - *Decision*: Custom Go services for business-specific error handling and user experience

## 📝 Progress Log
<!-- Update as work progresses using the current date and time -->
- 2025-09-22 14:30:00: Task created and requirements analyzed
- 2025-09-22 14:30:00: Architecture design completed
- 2025-09-22 14:30:00: Implementation strategy defined
- 2025-01-27 16:45:00: Updated to ORY Kratos + Custom Go Services architecture
- 2025-01-27 16:45:00: Revised implementation strategy for ORY Kratos integration
- 2025-01-27 16:45:00: Updated database schema for ORY Kratos + business data separation

## ✅ Definition of Done

### Core Implementation
- [ ] Latest compatible versions verified and documented (ORY Kratos v1.0.0, Go 1.25, PostgreSQL 17, Redis 7.4.0)
- [ ] ORY Kratos deployment complete with OAuth 2.0 + OpenID Connect configuration
- [ ] JWT token management with 24-hour access and 30-day refresh tokens via ORY Kratos
- [ ] Multi-factor authentication (TOTP + SMS) implemented and tested via ORY Kratos
- [ ] Session management with Redis backend and concurrent session limits via ORY Kratos
- [ ] Custom Go RBAC service with granular permissions
- [ ] Multi-tenant isolation with zero cross-tenant data access in Go services

### Security & Compliance
- [ ] ORY Kratos password policies enforced with Argon2id hashing
- [ ] Rate limiting and brute force protection implemented in Go services
- [ ] Audit logging for all authentication and authorization events
- [ ] GDPR compliance features (data subject rights, retention policies)
- [ ] PCI DSS compliance validation completed
- [ ] Security testing passed (penetration testing simulation)

### Testing & Quality
- [ ] Unit test coverage >90% for Go business logic services
- [ ] Integration tests for ORY Kratos API interactions and database operations
- [ ] Security tests for authentication bypass and authorization escalation
- [ ] Performance tests validate <200ms response times under load
- [ ] Load tests validate 1000+ concurrent authentication requests through ORY Kratos

### Documentation & Operations
- [ ] API documentation complete with OpenAPI specifications
- [ ] Database schema documented with comprehensive comments
- [ ] Deployment procedures documented and tested
- [ ] Monitoring and alerting configured for authentication metrics
- [ ] Health checks implemented and validated

### Integration & Deployment
- [ ] User lifecycle events published to Kafka for other services
- [ ] ORY Kratos integration middleware created for service integration
- [ ] Service discovery integration completed
- [ ] Docker containerization with health checks for ORY Kratos and Go services
- [ ] CI/CD pipeline integration with automated testing

## 🚀 Follow-up Tasks
- **TASK-025**: User Service Implementation (depends on Auth Service completion)
- **TASK-026**: API Gateway Configuration (integrates Auth Service routing)
- **TASK-027**: Service Mesh Setup (includes Auth Service in Istio configuration)
- **TASK-028**: Monitoring & Observability (includes Auth Service metrics and dashboards)
- **TASK-029**: Security Testing & Penetration Testing (comprehensive security validation)

## 📋 Completion Notes
<!-- Add notes upon completion -->

---

## 🤖 AI Agent Usage Instructions

### For AI Agents Executing This Task
1. **Start with Version Verification**: Always verify and document exact technology versions before implementation
2. **Follow Phased Approach**: Implement in phases as outlined, completing each phase before moving to the next
3. **ORY Kratos First**: Deploy and configure ORY Kratos before implementing custom Go services
4. **Security First**: Implement security features early and test thoroughly at each phase
5. **Document Decisions**: Record all architectural and implementation decisions with rationale
6. **Test Continuously**: Write tests as you implement, don't leave testing for the end
7. **Validate Compliance**: Ensure GDPR and PCI DSS compliance at each implementation step

### Key Success Factors
- **ORY Kratos Integration**: Master ORY Kratos configuration and API integration patterns
- **Comprehensive Testing**: Security testing is as important as functional testing
- **Performance Validation**: Validate response times and scalability throughout development
- **Documentation Quality**: Clear, AI-friendly documentation for future maintenance
- **Security Review**: Regular security validation and penetration testing simulation
- **Integration Testing**: Thorough testing of ORY Kratos flows and Go service integration

### Common Pitfalls to Avoid
- **ORY Kratos Configuration**: Don't underestimate ORY Kratos configuration complexity
- **Security Oversights**: Ensure all security features are properly implemented and tested
- **Multi-tenant Isolation**: Verify tenant isolation at multiple levels (database, application, API)
- **Performance Issues**: Monitor and optimize performance throughout development
- **Compliance Gaps**: Ensure GDPR and PCI DSS compliance from the start, not as an afterthought
- **API Integration**: Ensure proper error handling and retry logic for ORY Kratos API calls
