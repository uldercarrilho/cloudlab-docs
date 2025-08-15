# Authorization Implementation Guide

## Overview
This document provides comprehensive guidance for implementing authorization in the distributed e-commerce platform, following the security architecture decisions outlined in ADR-009 and implementing Role-Based Access Control (RBAC) patterns.

## Role-Based Access Control (RBAC) Implementation

### 1. Core RBAC Structures
```go
// Core RBAC data structures
type Permission struct {
    ID          string `json:"id"`
    Resource    string `json:"resource"`
    Action      string `json:"action"`
    Scope       string `json:"scope"`
    Conditions  map[string]interface{} `json:"conditions,omitempty"`
}

type Role struct {
    ID          string       `json:"id"`
    Name        string       `json:"name"`
    Description string       `json:"description"`
    Permissions []Permission `json:"permissions"`
    TenantID    string       `json:"tenant_id,omitempty"`
    CreatedAt   time.Time    `json:"created_at"`
    UpdatedAt   time.Time    `json:"updated_at"`
}

type UserRole struct {
    UserID    string    `json:"user_id"`
    RoleID    string    `json:"role_id"`
    TenantID  string    `json:"tenant_id,omitempty"`
    GrantedAt time.Time `json:"granted_at"`
    GrantedBy string    `json:"granted_by"`
    ExpiresAt *time.Time `json:"expires_at,omitempty"`
}
```

### 2. RBAC Service Implementation
```go
// RBAC service for managing roles and permissions
type RBACService struct {
    roleStore       RoleStore
    permissionStore PermissionStore
    userRoleStore   UserRoleStore
    cache           Cache
    mu              sync.RWMutex
}

func NewRBACService(roleStore RoleStore, permissionStore PermissionStore, userRoleStore UserRoleStore, cache Cache) *RBACService {
    return &RBACService{
        roleStore:       roleStore,
        permissionStore: permissionStore,
        userRoleStore:   userRoleStore,
        cache:           cache,
    }
}

// Check if user has specific permission
func (rbs *RBACService) HasPermission(userID, resource, action, scope string) (bool, error) {
    cacheKey := fmt.Sprintf("permission:%s:%s:%s:%s", userID, resource, action, scope)
    
    // Check cache first
    if cached, found := rbs.cache.Get(cacheKey); found {
        return cached.(bool), nil
    }
    
    // Get user roles
    userRoles, err := rbs.userRoleStore.GetUserRoles(userID)
    if err != nil {
        return false, err
    }
    
    // Check each role for the required permission
    for _, userRole := range userRoles {
        role, err := rbs.roleStore.GetRole(userRole.RoleID)
        if err != nil {
            continue
        }
        
        if rbs.roleHasPermission(role, resource, action, scope) {
            // Cache positive result
            rbs.cache.Set(cacheKey, true, 5*time.Minute)
            return true, nil
        }
    }
    
    // Cache negative result
    rbs.cache.Set(cacheKey, false, 5*time.Minute)
    return false, nil
}
```

### 3. Permission Checking Logic
```go
// Check if a role has specific permission
func (rbs *RBACService) roleHasPermission(role *Role, resource, action, scope string) bool {
    for _, permission := range role.Permissions {
        if permission.Resource == resource && 
           permission.Action == action && 
           permission.Scope == scope {
            
            // Check conditions if any
            if len(permission.Conditions) > 0 {
                if !rbs.evaluateConditions(permission.Conditions) {
                    continue
                }
            }
            
            return true
        }
    }
    return false
}

// Evaluate permission conditions
func (rbs *RBACService) evaluateConditions(conditions map[string]interface{}) bool {
    for key, value := range conditions {
        switch key {
        case "time_restriction":
            if !rbs.evaluateTimeRestriction(value) {
                return false
            }
        case "ip_restriction":
            if !rbs.evaluateIPRestriction(value) {
                return false
            }
        case "device_restriction":
            if !rbs.evaluateDeviceRestriction(value) {
                return false
            }
        }
    }
    return true
}
```

## Multi-Tenant Authorization

### 1. Tenant Isolation
```go
// Multi-tenant authorization service
type MultiTenantRBAC struct {
    rbacService *RBACService
    tenantStore TenantStore
}

func (mtr *MultiTenantRBAC) HasPermission(userID, resource, action, scope, tenantID string) (bool, error) {
    // Check if user belongs to the tenant
    userTenant, err := mtr.tenantStore.GetUserTenant(userID)
    if err != nil {
        return false, err
    }
    
    // Enforce tenant isolation
    if userTenant != tenantID {
        return false, nil
    }
    
    // Check permission within tenant context
    return mtr.rbacService.HasPermission(userID, resource, action, scope)
}

// Get user's accessible tenants
func (mtr *MultiTenantRBAC) GetUserTenants(userID string) ([]string, error) {
    userRoles, err := mtr.rbacService.userRoleStore.GetUserRoles(userID)
    if err != nil {
        return nil, err
    }
    
    tenantSet := make(map[string]bool)
    for _, userRole := range userRoles {
        if userRole.TenantID != "" {
            tenantSet[userRole.TenantID] = true
        }
    }
    
    tenants := make([]string, 0, len(tenantSet))
    for tenant := range tenantSet {
        tenants = append(tenants, tenant)
    }
    
    return tenants, nil
}
```

### 2. Cross-Tenant Operations
```go
// Cross-tenant operations with proper authorization
type CrossTenantRBAC struct {
    rbacService *RBACService
    auditLogger AuditLogger
}

func (ctr *CrossTenantRBAC) PerformCrossTenantOperation(userID, sourceTenant, targetTenant, operation string) error {
    // Check if user has cross-tenant permission
    hasPermission, err := ctr.rbacService.HasPermission(userID, "cross_tenant", operation, "global")
    if err != nil {
        return err
    }
    
    if !hasPermission {
        ctr.auditLogger.LogAccessDenied(userID, "cross_tenant", operation, sourceTenant, targetTenant)
        return errors.New("insufficient permissions for cross-tenant operation")
    }
    
    // Log the operation
    ctr.auditLogger.LogCrossTenantOperation(userID, operation, sourceTenant, targetTenant)
    
    return nil
}
```

## Attribute-Based Access Control (ABAC)

### 1. ABAC Implementation
```go
// ABAC for dynamic permission evaluation
type ABACService struct {
    policyStore PolicyStore
    contextProvider ContextProvider
}

type Policy struct {
    ID          string                 `json:"id"`
    Name        string                 `json:"name"`
    Effect      string                 `json:"effect"` // "allow" or "deny"
    Resources   []string               `json:"resources"`
    Actions     []string               `json:"actions"`
    Conditions  map[string]interface{} `json:"conditions"`
    Priority    int                    `json:"priority"`
}

type Context struct {
    User        *User                  `json:"user"`
    Resource    *Resource              `json:"resource"`
    Action      string                 `json:"action"`
    Environment map[string]interface{} `json:"environment"`
    Request     *http.Request          `json:"request"`
}

func (abac *ABACService) EvaluatePolicy(policy *Policy, context *Context) (bool, error) {
    // Check if policy applies to the resource and action
    if !abac.policyApplies(policy, context.Resource, context.Action) {
        return false, nil
    }
    
    // Evaluate conditions
    conditionsMet, err := abac.evaluateConditions(policy.Conditions, context)
    if err != nil {
        return false, err
    }
    
    if !conditionsMet {
        return false, nil
    }
    
    return policy.Effect == "allow", nil
}
```

### 2. Dynamic Context Evaluation
```go
// Dynamic context evaluation for ABAC
func (abac *ABACService) evaluateConditions(conditions map[string]interface{}, context *Context) (bool, error) {
    for key, value := range conditions {
        switch key {
        case "time_based":
            if !abac.evaluateTimeCondition(value, context) {
                return false, nil
            }
        case "location_based":
            if !abac.evaluateLocationCondition(value, context) {
                return false, nil
            }
        case "risk_based":
            if !abac.evaluateRiskCondition(value, context) {
                return false, nil
            }
        case "custom":
            if !abac.evaluateCustomCondition(value, context) {
                return false, nil
            }
        }
    }
    return true, nil
}

func (abac *ABACService) evaluateTimeCondition(condition interface{}, context *Context) bool {
    timeCond, ok := condition.(map[string]interface{})
    if !ok {
        return false
    }
    
    now := time.Now()
    
    if startTime, exists := timeCond["start_time"]; exists {
        if start, ok := startTime.(string); ok {
            if startTime, err := time.Parse("15:04", start); err == nil {
                if now.Before(startTime) {
                    return false
                }
            }
        }
    }
    
    if endTime, exists := timeCond["end_time"]; exists {
        if end, ok := endTime.(string); ok {
            if endTime, err := time.Parse("15:04", end); err == nil {
                if now.After(endTime) {
                    return false
                }
            }
        }
    }
    
    return true
}
```

## HTTP Middleware Integration

### 1. Authorization Middleware
```go
// HTTP middleware for authorization
func AuthorizationMiddleware(rbacService *RBACService, resource, action, scope string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Extract user from context (set by authentication middleware)
            user := r.Context().Value("user")
            if user == nil {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            
            claims, ok := user.(*Claims)
            if !ok {
                http.Error(w, "Invalid user context", http.StatusInternalServerError)
                return
            }
            
            // Check permission
            hasPermission, err := rbacService.HasPermission(claims.UserID, resource, action, scope)
            if err != nil {
                http.Error(w, "Authorization error", http.StatusInternalServerError)
                return
            }
            
            if !hasPermission {
                http.Error(w, "Forbidden", http.StatusForbidden)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}
```

### 2. Dynamic Authorization Middleware
```go
// Dynamic authorization middleware based on request context
func DynamicAuthorizationMiddleware(rbacService *RBACService) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Extract user from context
            user := r.Context().Value("user")
            if user == nil {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            
            claims, ok := user.(*Claims)
            if !ok {
                http.Error(w, "Invalid user context", http.StatusInternalServerError)
                return
            }
            
            // Determine resource and action from request
            resource := determineResource(r)
            action := determineAction(r)
            scope := determineScope(r)
            
            // Check permission
            hasPermission, err := rbacService.HasPermission(claims.UserID, resource, action, scope)
            if err != nil {
                http.Error(w, "Authorization error", http.StatusInternalServerError)
                return
            }
            
            if !hasPermission {
                http.Error(w, "Forbidden", http.StatusForbidden)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}

func determineResource(r *http.Request) string {
    path := r.URL.Path
    parts := strings.Split(path, "/")
    
    if len(parts) >= 3 && parts[1] == "api" {
        return parts[2] // e.g., "v1" -> "users", "products", etc.
    }
    
    return "unknown"
}

func determineAction(r *http.Request) string {
    switch r.Method {
    case "GET":
        return "read"
    case "POST":
        return "create"
    case "PUT", "PATCH":
        return "update"
    case "DELETE":
        return "delete"
    default:
        return "unknown"
    }
}

func determineScope(r *http.Request) string {
    // Extract scope from query parameters or headers
    if scope := r.URL.Query().Get("scope"); scope != "" {
        return scope
    }
    
    if scope := r.Header.Get("X-Scope"); scope != "" {
        return scope
    }
    
    return "default"
}
```

## Policy Management

### 1. Policy CRUD Operations
```go
// Policy management service
type PolicyService struct {
    policyStore PolicyStore
    rbacService *RBACService
    cache       Cache
}

func (ps *PolicyService) CreatePolicy(policy *Policy) error {
    // Validate policy
    if err := ps.validatePolicy(policy); err != nil {
        return err
    }
    
    // Create policy
    if err := ps.policyStore.CreatePolicy(policy); err != nil {
        return err
    }
    
    // Clear related caches
    ps.clearPolicyCache(policy)
    
    return nil
}

func (ps *PolicyService) UpdatePolicy(policy *Policy) error {
    // Validate policy
    if err := ps.validatePolicy(policy); err != nil {
        return err
    }
    
    // Update policy
    if err := ps.policyStore.UpdatePolicy(policy); err != nil {
        return err
    }
    
    // Clear related caches
    ps.clearPolicyCache(policy)
    
    return nil
}

func (ps *PolicyService) DeletePolicy(policyID string) error {
    // Delete policy
    if err := ps.policyStore.DeletePolicy(policyID); err != nil {
        return err
    }
    
    // Clear related caches
    ps.clearPolicyCacheByID(policyID)
    
    return nil
}
```

### 2. Policy Validation
```go
// Policy validation
func (ps *PolicyService) validatePolicy(policy *Policy) error {
    if policy.Name == "" {
        return errors.New("policy name is required")
    }
    
    if len(policy.Resources) == 0 {
        return errors.New("policy must specify at least one resource")
    }
    
    if len(policy.Actions) == 0 {
        return errors.New("policy must specify at least one action")
    }
    
    if policy.Effect != "allow" && policy.Effect != "deny" {
        return errors.New("policy effect must be 'allow' or 'deny'")
    }
    
    if policy.Priority < 0 {
        return errors.New("policy priority must be non-negative")
    }
    
    return nil
}
```

## Audit and Logging

### 1. Authorization Audit Logging
```go
// Authorization audit logging
type AuthorizationAuditLogger struct {
    auditStore AuditStore
    metrics    MetricsCollector
}

type AuthorizationEvent struct {
    ID          string    `json:"id"`
    Timestamp   time.Time `json:"timestamp"`
    UserID      string    `json:"user_id"`
    Resource    string    `json:"resource"`
    Action      string    `json:"action"`
    Scope       string    `json:"scope"`
    Result      string    `json:"result"` // "allow" or "deny"
    Reason      string    `json:"reason,omitempty"`
    IPAddress   string    `json:"ip_address"`
    UserAgent   string    `json:"user_agent"`
    RequestID   string    `json:"request_id"`
}

func (aal *AuthorizationAuditLogger) LogAuthorizationEvent(event *AuthorizationEvent) error {
    // Store audit event
    if err := aal.auditStore.StoreAuthorizationEvent(event); err != nil {
        return err
    }
    
    // Update metrics
    aal.metrics.IncrementAuthorizationEvent(event.Result, event.Resource, event.Action)
    
    return nil
}
```

### 2. Real-time Authorization Monitoring
```go
// Real-time authorization monitoring
type AuthorizationMonitor struct {
    auditLogger *AuthorizationAuditLogger
    alertManager AlertManager
    thresholds   map[string]int
}

func (am *AuthorizationMonitor) MonitorAuthorizationEvents() {
    // Monitor for suspicious patterns
    go am.detectAnomalies()
    
    // Monitor for policy violations
    go am.detectPolicyViolations()
    
    // Monitor for privilege escalation attempts
    go am.detectPrivilegeEscalation()
}

func (am *AuthorizationMonitor) detectAnomalies() {
    // Implementation for detecting unusual authorization patterns
    // e.g., user accessing resources they never accessed before
    // e.g., unusual time patterns for access
    // e.g., unusual geographic patterns for access
}
```

## Testing

### 1. Unit Tests
```go
func TestRBACService(t *testing.T) {
    // Test permission checking
    // Test role management
    // Test user-role assignment
    // Test permission inheritance
    // Test multi-tenant isolation
}

func TestABACService(t *testing.T) {
    // Test policy evaluation
    // Test condition evaluation
    // Test context handling
    // Test policy priority
}
```

### 2. Integration Tests
```go
func TestAuthorizationMiddleware(t *testing.T) {
    // Test authorization middleware
    // Test permission enforcement
    // Test error handling
    // Test audit logging
}
```

## References
- [ADR-009: Security & Authentication Architecture](../ADR-009-security-authentication.md)
- [RBAC Implementation Guide](https://en.wikipedia.org/wiki/Role-based_access_control)
- [ABAC Implementation Guide](https://en.wikipedia.org/wiki/Attribute-based_access_control)
- [OAuth 2.0 Authorization](https://oauth.net/2/)
- [NIST RBAC Standard](https://csrc.nist.gov/projects/role-based-access-control)
