# API Design Principles Guide

## Overview
This document outlines comprehensive API design principles for the distributed e-commerce platform, implementing the communication patterns from ADR-006 and ensuring consistency across all service interfaces.

## Core Design Principles

### 1. RESTful Design
- Use HTTP methods correctly (GET, POST, PUT, DELETE, PATCH)
- Resource-oriented URLs
- Stateless operations
- Consistent response formats

### 2. GraphQL Integration
- Single endpoint for complex queries
- Schema-first design
- Introspection for documentation
- Efficient data fetching

### 3. gRPC for Internal Communication
- High-performance service-to-service communication
- Protocol Buffers for schema definition
- Bidirectional streaming support
- Strong typing and validation

## API Structure & Standards

### 1. URL Design
```go
// RESTful URL patterns
const (
    // User management
    UsersEndpoint        = "/api/v1/users"
    UserEndpoint         = "/api/v1/users/{id}"
    UserProfileEndpoint  = "/api/v1/users/{id}/profile"
    
    // Product catalog
    ProductsEndpoint     = "/api/v1/products"
    ProductEndpoint      = "/api/v1/products/{id}"
    ProductReviewsEndpoint = "/api/v1/products/{id}/reviews"
    
    // Orders
    OrdersEndpoint       = "/api/v1/orders"
    OrderEndpoint        = "/api/v1/orders/{id}"
    OrderItemsEndpoint   = "/api/v1/orders/{id}/items"
)
```

### 2. HTTP Status Codes
```go
// Standard HTTP status codes
const (
    // Success
    StatusOK                  = 200
    StatusCreated             = 201
    StatusAccepted            = 202
    StatusNoContent           = 204
    
    // Client errors
    StatusBadRequest          = 400
    StatusUnauthorized        = 401
    StatusForbidden           = 403
    StatusNotFound            = 404
    StatusConflict            = 409
    StatusUnprocessableEntity = 422
    StatusTooManyRequests     = 429
    
    // Server errors
    StatusInternalServerError = 500
    StatusBadGateway          = 502
    StatusServiceUnavailable  = 503
)
```

### 3. Response Format
```go
// Standard API response structure
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   *APIError  `json:"error,omitempty"`
    Meta    *MetaInfo  `json:"meta,omitempty"`
}

type APIError struct {
    Code       string `json:"code"`
    Message    string `json:"message"`
    Details    string `json:"details,omitempty"`
    RequestID  string `json:"request_id"`
    Timestamp  string `json:"timestamp"`
}

type MetaInfo struct {
    Pagination *Pagination `json:"pagination,omitempty"`
    RateLimit  *RateLimit  `json:"rate_limit,omitempty"`
    Version    string      `json:"version"`
}
```

## Authentication & Authorization

### 1. JWT Token Implementation
```go
// JWT authentication middleware
func JWTAuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := extractToken(r)
        if token == "" {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        
        claims, err := validateToken(token)
        if err != nil {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }
        
        // Add claims to request context
        ctx := context.WithValue(r.Context(), "user", claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### 2. Role-Based Access Control
```go
// RBAC middleware
func RBACMiddleware(requiredRole string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            user := r.Context().Value("user").(*Claims)
            
            if !hasRole(user, requiredRole) {
                http.Error(w, "Forbidden", http.StatusForbidden)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}
```

## Data Validation & Sanitization

### 1. Input Validation
```go
// Comprehensive input validation
type ValidationRule struct {
    Field       string
    Required    bool
    MinLength   int
    MaxLength   int
    Pattern     string
    Custom      func(interface{}) error
}

func ValidateRequest(r *http.Request, rules []ValidationRule) error {
    // Implementation of validation logic
    // SQL injection prevention
    // XSS prevention
    // Path traversal prevention
}
```

### 2. Data Sanitization
```go
// Data sanitization functions
func SanitizeString(input string) string {
    // Remove potentially dangerous characters
    // HTML entity encoding
    // SQL injection prevention
}

func SanitizeEmail(email string) string {
    // Email validation and sanitization
    // Remove whitespace and normalize
}
```

## Error Handling

### 1. Error Response Structure
```go
// Standardized error responses
func RespondWithError(w http.ResponseWriter, status int, code, message string) {
    error := &APIError{
        Code:      code,
        Message:   message,
        RequestID: getRequestID(),
        Timestamp: time.Now().UTC().Format(time.RFC3339),
    }
    
    response := &APIResponse{
        Success: false,
        Error:   error,
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(response)
}
```

### 2. Error Logging
```go
// Structured error logging
func LogAPIError(r *http.Request, err error, status int) {
    logEntry := map[string]interface{}{
        "timestamp":   time.Now().UTC(),
        "method":      r.Method,
        "path":        r.URL.Path,
        "status":      status,
        "error":       err.Error(),
        "request_id":  getRequestID(),
        "user_agent":  r.UserAgent(),
        "remote_addr": r.RemoteAddr,
    }
    
    log.Printf("API Error: %+v", logEntry)
}
```

## Rate Limiting & Throttling

### 1. Rate Limiting Implementation
```go
// Rate limiting middleware
type RateLimiter struct {
    store    RateLimitStore
    limits   map[string]Limit
    window   time.Duration
}

func RateLimitMiddleware(limiter *RateLimiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            key := getClientKey(r)
            
            allowed, err := limiter.Allow(key)
            if err != nil {
                log.Printf("Rate limiting error: %v", err)
                next.ServeHTTP(w, r)
                return
            }
            
            if !allowed {
                RespondWithError(w, http.StatusTooManyRequests, "RATE_LIMIT_EXCEEDED", "Rate limit exceeded")
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}
```

## Versioning Strategy

### 1. API Versioning
```go
// Version handling in URLs
const (
    APIVersionV1 = "v1"
    APIVersionV2 = "v2"
)

func VersionMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        version := extractAPIVersion(r.URL.Path)
        
        // Add version to context
        ctx := context.WithValue(r.Context(), "api_version", version)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### 2. Backward Compatibility
- Maintain backward compatibility for at least 2 versions
- Deprecation warnings in responses
- Graceful degradation for removed features
- Migration guides for breaking changes

## Documentation & Testing

### 1. OpenAPI/Swagger Integration
```yaml
# OpenAPI specification example
openapi: 3.0.0
info:
  title: E-commerce Platform API
  version: 1.0.0
  description: API for the distributed e-commerce platform

paths:
  /api/v1/users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
```

### 2. API Testing
```go
// API testing examples
func TestUserEndpoint(t *testing.T) {
    // Test user creation
    // Test user retrieval
    // Test user update
    // Test user deletion
    // Test validation errors
    // Test authentication
    // Test authorization
}
```

## Performance & Monitoring

### 1. Response Time Monitoring
```go
// Response time middleware
func ResponseTimeMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Wrap response writer to capture status
        wrapped := &responseWriter{ResponseWriter: w}
        
        next.ServeHTTP(wrapped, r)
        
        duration := time.Since(start)
        
        // Log response time
        log.Printf("Request %s %s completed in %v with status %d", 
            r.Method, r.URL.Path, duration, wrapped.status)
    })
}
```

### 2. Caching Headers
```go
// Cache control headers
func CacheControlMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Set appropriate cache headers based on resource type
        if strings.Contains(r.URL.Path, "/products") {
            w.Header().Set("Cache-Control", "public, max-age=300") // 5 minutes
        } else if strings.Contains(r.URL.Path, "/users") {
            w.Header().Set("Cache-Control", "private, no-cache")
        }
        
        next.ServeHTTP(w, r)
    })
}
```

## References
- [ADR-006: API Communication Patterns](../ADR-006-api-communication-patterns.md)
- [ADR-009: Security & Authentication Architecture](../ADR-009-security-authentication.md)
- [REST API Design Best Practices](https://restfulapi.net/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [gRPC Documentation](https://grpc.io/docs/)
- [OpenAPI Specification](https://swagger.io/specification/)
