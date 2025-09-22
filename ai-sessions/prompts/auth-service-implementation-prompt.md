# AI Agent Prompt: Auth Service Implementation

## 🎯 Task Overview
You are tasked with implementing **TASK-024: Auth Service Implementation** for the CloudLab distributed e-commerce platform. This is a comprehensive authentication service using OAuth 2.0 + OpenID Connect with multi-tenant support, JWT tokens, MFA, and RBAC.

## 📋 Available Resources & Guidelines

### 🏗️ **Service Template Foundation**
Use the **platform/service-template** as your foundation. This provides:
- **Go 1.25** microservice structure with clean architecture
- **Configuration management** with hot-reload support
- **Database integration** (PostgreSQL, Redis, ClickHouse, Elasticsearch)
- **Observability** (Prometheus metrics, Jaeger tracing, structured logging)
- **API patterns** (REST, GraphQL, gRPC)
- **Middleware** (validation, logging, recovery, request ID)
- **Session management** (Redis-based with security features)
- **Testing framework** (unit, integration, contract, performance)

### 🔐 **Security Architecture References**
Follow these established patterns:

#### **ADR-001: User Management & Authentication**
- **OAuth 2.0 + OpenID Connect** implementation
- **Multi-tenant isolation** with zero cross-tenant access
- **JWT token management** (24h access, 30d refresh)
- **Role-based access control** with granular permissions
- **Session management** with Redis backend

#### **ADR-009: Security & Authentication Architecture**
- **HashiCorp Vault** for secret management
- **TLS 1.3 + AES-256** encryption
- **RBAC implementation** with hierarchical inheritance
- **Multi-tenant security** with complete data isolation
- **Comprehensive audit logging**

### 📚 **Implementation Guides**
Use these detailed guides:

#### **JWT Implementation** (`docs/api/guides/jwt-implementation.md`)
```go
// JWT Claims structure
type Claims struct {
    UserID    string                 `json:"user_id"`
    Email     string                 `json:"email"`
    Role      string                 `json:"role"`
    TenantID  string                 `json:"tenant_id,omitempty"`
    IssuedAt  int64                  `json:"iat"`
    ExpiresAt int64                  `json:"exp"`
    // ... standard claims
}
```

#### **OAuth 2.0 Setup** (`docs/api/guides/oauth-setup.md`)
- Authorization code flow implementation
- Token endpoint with refresh token support
- OpenID Connect discovery and user info endpoints
- PKCE support for public clients
- CSRF protection with state parameters

#### **Authorization Patterns** (`docs/api/guides/authorization.md`)
- RBAC service with permission checking
- Multi-tenant authorization with isolation
- ABAC for dynamic permission evaluation
- HTTP middleware for authorization
- Policy management and validation

### 🛡️ **Security Best Practices** (`docs/development/guidelines/security-best-practices.md`)
- **Argon2id** password hashing
- **Rate limiting** with token bucket algorithm
- **Input validation** with custom validators
- **Session security** with secure cookies
- **Audit logging** for all security events

### 🏛️ **Architecture Diagram** (`docs/architecture/diagrams/c4-models/C4-Level3-Authentication.puml`)
Follow the component architecture:
- JWT Token Manager
- OAuth2 Handler
- RBAC Engine
- Session Manager
- Rate Limiter
- Password Manager
- MFA Handler
- Audit Logger
- Secret Manager

## 🚀 **Implementation Strategy**

### **Phase 1: Service Foundation (Days 1-2)**
1. **Copy and adapt service-template**
   ```bash
   cp -r platform/service-template platform/auth-service
   cd platform/auth-service
   ```

2. **Update configuration** for auth-specific settings:
   - Add JWT secret configuration
   - Configure OAuth 2.0 settings
   - Set up MFA configuration
   - Add tenant isolation settings

3. **Database schema** with ENUM types:
   ```sql
   -- User roles enum
   CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin', 'support');
   -- User status enum  
   CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'deleted');
   -- MFA status enum
   CREATE TYPE mfa_status AS ENUM ('disabled', 'enabled', 'required');
   ```

### **Phase 2: Core Authentication (Days 3-4)**
1. **JWT Token Management**
   - Use the JWT implementation guide
   - Implement token generation and validation
   - Add token refresh mechanism
   - Integrate with Redis for token blacklisting

2. **OAuth 2.0 + OpenID Connect**
   - Follow the OAuth setup guide
   - Implement authorization endpoints
   - Add token endpoints
   - Create OpenID Connect discovery

3. **User Registration & Login**
   - Customer registration workflow
   - Vendor registration with business verification
   - Login endpoint with password validation
   - Email verification system

### **Phase 3: Security Features (Days 5-6)**
1. **Multi-Factor Authentication**
   - TOTP-based 2FA using RFC 6238
   - SMS fallback implementation
   - MFA enforcement for vendors/admins
   - Recovery mechanisms

2. **Session Management**
   - Extend existing session manager
   - Add concurrent session limits (max 5 per user)
   - Implement automatic logout on inactivity
   - Add session rotation

### **Phase 4: Authorization & Multi-tenancy (Days 7-8)**
1. **Role-Based Access Control**
   - Implement RBAC service from authorization guide
   - Add permission checking middleware
   - Create tenant isolation at database level
   - Add audit logging for access attempts

2. **API Security**
   - Rate limiting per user and IP
   - Brute force protection
   - API key management for service-to-service
   - CORS and security headers

### **Phase 5: Integration & Testing (Days 9-10)**
1. **Service Integration**
   - Publish authentication events to Kafka
   - Create authentication middleware for other services
   - Set up service discovery integration
   - Configure monitoring and metrics

2. **Testing & Validation**
   - Unit tests (>90% coverage)
   - Integration tests for OAuth flows
   - Security testing (penetration testing simulation)
   - Performance testing and load validation

## 🔧 **Key Implementation Details**

### **Database Schema Design**
Follow the schema from TASK-024 with comprehensive comments:
```sql
-- User profiles table with multi-tenant isolation
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- Multi-tenant isolation
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id hash
    role user_role NOT NULL DEFAULT 'customer',
    status user_status NOT NULL DEFAULT 'pending',
    mfa_enabled mfa_status NOT NULL DEFAULT 'disabled',
    mfa_secret VARCHAR(255), -- TOTP secret (encrypted)
    phone_number VARCHAR(20), -- For SMS 2FA
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) COMMENT 'User profiles with multi-tenant isolation and security features';
```

### **API Endpoints**
Implement all endpoints from TASK-024:
- **Authentication**: `/oauth/authorize`, `/oauth/token`, `/oauth/revoke`
- **User Management**: `/api/v1/users/register`, `/api/v1/users/login`, `/api/v1/users/profile`
- **MFA**: `/api/v1/mfa/setup`, `/api/v1/mfa/verify`, `/api/v1/mfa/disable`
- **Admin**: `/api/v1/admin/users`, `/api/v1/admin/sessions`

### **Configuration Extensions**
Add auth-specific configuration to the service template:
```yaml
auth:
  jwt:
    secret: "${JWT_SECRET}"
    access_token_ttl: "24h"
    refresh_token_ttl: "720h" # 30 days
  oauth2:
    issuer: "https://auth.cloudlab.com"
    client_id: "${OAUTH_CLIENT_ID}"
    client_secret: "${OAUTH_CLIENT_SECRET}"
  mfa:
    totp_issuer: "CloudLab"
    sms_provider: "twilio"
  rate_limiting:
    login_attempts: 5
    window: "15m"
    lockout_duration: "30m"
```

### **Security Implementation**
1. **Password Security**
   - Use Argon2id hashing (from security best practices)
   - Implement password complexity validation
   - Add breach detection
   - Prevent password reuse (last 5 passwords)

2. **Token Security**
   - Short-lived access tokens (24 hours)
   - Secure refresh token storage
   - Token rotation on refresh
   - Token blacklisting for logout

3. **Session Security**
   - Extend existing session manager
   - Add concurrent session limits
   - Implement automatic timeout
   - Secure cookie settings

### **Multi-Tenant Isolation**
1. **Database Level**
   - Tenant ID in all user tables
   - Foreign key constraints
   - Row-level security policies

2. **Application Level**
   - Tenant context in all requests
   - Permission checking with tenant scope
   - Data access validation

3. **API Level**
   - Tenant-scoped endpoints
   - Rate limiting per tenant
   - Audit logging with tenant context

## 🧪 **Testing Requirements**

### **Unit Testing (>90% Coverage)**
- Authentication logic (OAuth flows, JWT handling)
- User management (registration, login, profile)
- MFA implementation (TOTP, SMS)
- RBAC system (permission checking)
- Security features (rate limiting, validation)

### **Integration Testing**
- Database operations with tenant isolation
- Redis session management
- OAuth flow testing
- Multi-tenant data segregation
- API endpoint testing

### **Security Testing**
- Authentication bypass attempts
- Authorization escalation testing
- MFA bypass attempts
- Rate limiting validation
- Data isolation verification

### **Performance Testing**
- Load testing (1000+ concurrent requests)
- Token validation performance
- Database query optimization
- Session management scalability

## 📊 **Success Metrics**

### **Technical Metrics**
- Authentication success rate >99.5%
- Response time P95 <200ms
- Availability 99.9%
- Error rate <0.1%

### **Security Metrics**
- Zero security breaches
- 100% GDPR and PCI DSS compliance
- <24 hours for critical vulnerability remediation
- 100% unauthorized access prevention

## 🚨 **Critical Requirements**

### **Version Verification**
Before implementation, verify and document:
- **Go Version**: 1.25 (latest stable)
- **PostgreSQL**: 17 (latest stable)
- **Redis**: 7.4.0 (latest stable)
- **JWT Library**: v5.3.0 (latest with security improvements)
- **OIDC Library**: v3.15.0 (latest with OpenID Connect 1.0 support)

### **Compliance Requirements**
- **PCI DSS Level 1** compliance for payment-related users
- **GDPR compliance** for EU user data handling
- **Multi-tenant isolation** with zero cross-tenant access
- **Comprehensive audit logging** for all security events

### **Performance Requirements**
- Support **100,000+ concurrent users**
- Authentication response time **<200ms** (95th percentile)
- Token validation **<50ms**
- **99.9% uptime** with health checks

## 🔗 **Integration Points**

### **Event Publishing**
- Publish authentication events to Kafka
- User registration events
- Login/logout events
- Security events (failed attempts, MFA)

### **Service Integration**
- Create authentication middleware for other services
- JWT validation middleware
- Permission checking middleware
- Tenant context middleware

### **Monitoring Integration**
- Prometheus metrics for authentication
- Jaeger tracing for request flows
- Structured logging for security events
- Health checks for all dependencies

## 📝 **Documentation Requirements**

### **API Documentation**
- Complete OpenAPI 3.0 specification
- Authentication flow diagrams
- Error response documentation
- Rate limiting documentation

### **Database Documentation**
- Schema documentation with comments
- Migration scripts with rollback
- Index optimization documentation
- Performance tuning guidelines

### **Security Documentation**
- Security architecture overview
- Threat model documentation
- Incident response procedures
- Compliance validation reports

## 🎯 **AI Agent Success Criteria**

1. **Follow the service template structure** exactly
2. **Use all provided guides** (JWT, OAuth, Authorization, Security)
3. **Implement all TASK-024 requirements** completely
4. **Maintain code quality** with comprehensive testing
5. **Document everything** for future AI agents
6. **Validate compliance** with PCI DSS and GDPR
7. **Ensure performance** meets all specified metrics
8. **Test thoroughly** with security and performance tests

## 🚀 **Getting Started**

1. **Read TASK-024** thoroughly to understand all requirements
2. **Study the service template** to understand the foundation
3. **Review all provided guides** for implementation patterns
4. **Start with Phase 1** and work through each phase systematically
5. **Test continuously** as you implement each feature
6. **Document decisions** and rationale throughout the process

Remember: This is a **production-ready authentication service** that will be the security foundation for the entire CloudLab platform. Quality, security, and compliance are paramount.
