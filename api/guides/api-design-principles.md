---
title: "API Design Principles"
description: "Standards and patterns for REST, GraphQL, and gRPC APIs"
category: "api"
subcategory: "design"
tags: ["api", "rest", "graphql", "grpc", "design"]
ai_consumption_optimized: true
---

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
    
    // Health and monitoring
    HealthEndpoint       = "/health"
    MetricsEndpoint      = "/metrics"
    ReadinessEndpoint    = "/ready"
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

## GraphQL Implementation

### 1. Schema Definition
```go
// GraphQL schema definition
type GraphQLSchema struct {
    Query    *QueryResolver
    Mutation *MutationResolver
    Subscription *SubscriptionResolver
}

type QueryResolver struct {
    // Product queries
    Products func(ctx context.Context, filter *ProductFilter) ([]*Product, error)
    Product  func(ctx context.Context, id string) (*Product, error)
    
    // User queries
    Users    func(ctx context.Context, filter *UserFilter) ([]*User, error)
    User     func(ctx context.Context, id string) (*User, error)
    
    // Order queries
    Orders   func(ctx context.Context, filter *OrderFilter) ([]*Order, error)
    Order    func(ctx context.Context, id string) (*Order, error)
}

type MutationResolver struct {
    // Product mutations
    CreateProduct func(ctx context.Context, input CreateProductInput) (*Product, error)
    UpdateProduct func(ctx context.Context, id string, input UpdateProductInput) (*Product, error)
    DeleteProduct func(ctx context.Context, id string) (bool, error)
    
    // User mutations
    CreateUser func(ctx context.Context, input CreateUserInput) (*User, error)
    UpdateUser func(ctx context.Context, id string, input UpdateUserInput) (*User, error)
    
    // Order mutations
    CreateOrder func(ctx context.Context, input CreateOrderInput) (*Order, error)
    UpdateOrderStatus func(ctx context.Context, id string, status OrderStatus) (*Order, error)
}

type SubscriptionResolver struct {
    OrderStatusChanged func(ctx context.Context, orderID string) (<-chan *OrderStatusUpdate, error)
    ProductUpdated     func(ctx context.Context, productID string) (<-chan *Product, error)
}
```

### 2. Resolver Implementation
```go
// Example resolver implementation
func (r *QueryResolver) Products(ctx context.Context, filter *ProductFilter) ([]*Product, error) {
    // Extract user from context
    user := ctx.Value("user").(*Claims)
    
    // Apply authorization
    if !hasPermission(user, "products:read") {
        return nil, errors.New("insufficient permissions")
    }
    
    // Apply filters and fetch from database
    products, err := r.productService.GetProducts(ctx, filter)
    if err != nil {
        return nil, err
    }
    
    return products, nil
}

func (r *MutationResolver) CreateProduct(ctx context.Context, input CreateProductInput) (*Product, error) {
    // Validate input
    if err := input.Validate(); err != nil {
        return nil, err
    }
    
    // Create product
    product, err := r.productService.CreateProduct(ctx, input)
    if err != nil {
        return nil, err
    }
    
    // Publish event
    r.eventBus.Publish("product.created", product)
    
    return product, nil
}
```

## gRPC Service Definitions

### 1. Protocol Buffer Definitions
```protobuf
// product_service.proto
syntax = "proto3";

package ecommerce.product;

import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";

service ProductService {
  rpc GetProduct(GetProductRequest) returns (Product);
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse);
  rpc CreateProduct(CreateProductRequest) returns (Product);
  rpc UpdateProduct(UpdateProductRequest) returns (Product);
  rpc DeleteProduct(DeleteProductRequest) returns (google.protobuf.Empty);
  
  // Streaming for real-time updates
  rpc WatchProduct(WatchProductRequest) returns (stream ProductUpdate);
}

message Product {
  string id = 1;
  string name = 2;
  string description = 3;
  double price = 4;
  int32 stock = 5;
  google.protobuf.Timestamp created_at = 6;
  google.protobuf.Timestamp updated_at = 7;
}

message GetProductRequest {
  string product_id = 1;
}

message ListProductsRequest {
  int32 page_size = 1;
  string page_token = 2;
  string filter = 3;
  string order_by = 4;
}

message ListProductsResponse {
  repeated Product products = 1;
  string next_page_token = 2;
  int32 total_size = 3;
}

message CreateProductRequest {
  string name = 1;
  string description = 2;
  double price = 3;
  int32 stock = 4;
}

message UpdateProductRequest {
  string product_id = 1;
  Product product = 2;
  google.protobuf.FieldMask update_mask = 3;
}

message DeleteProductRequest {
  string product_id = 1;
}

message WatchProductRequest {
  string product_id = 1;
}

message ProductUpdate {
  Product product = 1;
  UpdateType update_type = 2;
}

enum UpdateType {
  UPDATE_TYPE_UNSPECIFIED = 0;
  UPDATE_TYPE_CREATED = 1;
  UPDATE_TYPE_UPDATED = 2;
  UPDATE_TYPE_DELETED = 3;
}
```

### 2. gRPC Service Implementation
```go
// gRPC service implementation
type ProductServiceServer struct {
    productService domain.ProductService
    eventBus       event.EventBus
    logger         *log.Logger
}

func (s *ProductServiceServer) GetProduct(ctx context.Context, req *pb.GetProductRequest) (*pb.Product, error) {
    // Extract metadata
    md, ok := metadata.FromIncomingContext(ctx)
    if !ok {
        return nil, status.Error(codes.InvalidArgument, "missing metadata")
    }
    
    // Validate request
    if req.ProductId == "" {
        return nil, status.Error(codes.InvalidArgument, "product_id is required")
    }
    
    // Get product from service
    product, err := s.productService.GetProduct(ctx, req.ProductId)
    if err != nil {
        if errors.Is(err, domain.ErrProductNotFound) {
            return nil, status.Error(codes.NotFound, "product not found")
        }
        return nil, status.Error(codes.Internal, "internal server error")
    }
    
    // Convert to protobuf
    return s.toProtoProduct(product), nil
}

func (s *ProductServiceServer) WatchProduct(req *pb.WatchProductRequest, stream pb.ProductService_WatchProductServer) error {
    // Subscribe to product updates
    updates := s.eventBus.Subscribe("product." + req.ProductId)
    defer s.eventBus.Unsubscribe("product." + req.ProductId, updates)
    
    for {
        select {
        case update := <-updates:
            productUpdate := &pb.ProductUpdate{
                Product:     s.toProtoProduct(update.Product),
                UpdateType:  s.toProtoUpdateType(update.Type),
            }
            
            if err := stream.Send(productUpdate); err != nil {
                return status.Error(codes.Internal, "failed to send update")
            }
            
        case <-stream.Context().Done():
            return stream.Context().Err()
        }
    }
}
```

## Webhook Integration

### 1. Webhook Configuration
```go
// Webhook configuration and management
type WebhookConfig struct {
    ID           string            `json:"id"`
    URL          string            `json:"url"`
    Events       []string          `json:"events"`
    Secret       string            `json:"secret"`
    Headers      map[string]string `json:"headers"`
    RetryPolicy  RetryPolicy      `json:"retry_policy"`
    IsActive     bool              `json:"is_active"`
    CreatedAt    time.Time         `json:"created_at"`
    LastDelivery *WebhookDelivery  `json:"last_delivery,omitempty"`
}

type WebhookDelivery struct {
    ID        string    `json:"id"`
    Status    int       `json:"status"`
    Response  string    `json:"response"`
    Attempts  int       `json:"attempts"`
    DeliveredAt time.Time `json:"delivered_at"`
    Error     string    `json:"error,omitempty"`
}

type RetryPolicy struct {
    MaxAttempts     int           `json:"max_attempts"`
    InitialDelay    time.Duration `json:"initial_delay"`
    MaxDelay        time.Duration `json:"max_delay"`
    BackoffMultiplier float64     `json:"backoff_multiplier"`
}
```

### 2. Webhook Delivery Service
```go
// Webhook delivery service
type WebhookService struct {
    configs    map[string]*WebhookConfig
    httpClient *http.Client
    queue      queue.MessageQueue
    logger     *log.Logger
}

func (s *WebhookService) DeliverWebhook(ctx context.Context, event string, payload interface{}) error {
    // Find webhooks for this event
    webhooks := s.getWebhooksForEvent(event)
    
    for _, webhook := range webhooks {
        if !webhook.IsActive {
            continue
        }
        
        // Create delivery task
        delivery := &WebhookDeliveryTask{
            WebhookID: webhook.ID,
            Event:     event,
            Payload:   payload,
            URL:       webhook.URL,
            Secret:    webhook.Secret,
            Headers:   webhook.Headers,
        }
        
        // Queue for delivery
        if err := s.queue.Publish("webhook.delivery", delivery); err != nil {
            s.logger.Printf("Failed to queue webhook delivery: %v", err)
        }
    }
    
    return nil
}

func (s *WebhookService) ProcessWebhookDelivery(ctx context.Context, task *WebhookDeliveryTask) error {
    // Prepare payload
    payloadBytes, err := json.Marshal(task.Payload)
    if err != nil {
        return err
    }
    
    // Create request
    req, err := http.NewRequestWithContext(ctx, "POST", task.URL, bytes.NewBuffer(payloadBytes))
    if err != nil {
        return err
    }
    
    // Set headers
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-Webhook-Event", task.Event)
    req.Header.Set("X-Webhook-Signature", s.generateSignature(payloadBytes, task.Secret))
    
    for key, value := range task.Headers {
        req.Header.Set(key, value)
    }
    
    // Send request
    resp, err := s.httpClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    // Record delivery
    s.recordDelivery(task.WebhookID, resp.StatusCode, resp.Body)
    
    return nil
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

// Enhanced validation with specific error types
type ValidationError struct {
    Field   string `json:"field"`
    Message string `json:"message"`
    Code    string `json:"code"`
}

type ValidationErrors []ValidationError

func (ve ValidationErrors) Error() string {
    return fmt.Sprintf("validation failed: %d errors", len(ve))
}

func (ve ValidationErrors) ToAPIError() *APIError {
    return &APIError{
        Code:    "VALIDATION_ERROR",
        Message: "Request validation failed",
        Details: ve.Error(),
    }
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

// Enhanced error handling with specific error types
type DomainError struct {
    Code    string
    Message string
    Cause   error
}

func (de *DomainError) Error() string {
    if de.Cause != nil {
        return fmt.Sprintf("%s: %v", de.Message, de.Cause)
    }
    return de.Message
}

func (de *DomainError) ToAPIError() *APIError {
    return &APIError{
        Code:      de.Code,
        Message:   de.Message,
        RequestID: getRequestID(),
        Timestamp: time.Now().UTC().Format(time.RFC3339),
    }
}

// Error mapping to HTTP status codes
func MapErrorToStatus(err error) (int, *APIError) {
    switch {
    case errors.Is(err, domain.ErrNotFound):
        return http.StatusNotFound, &APIError{
            Code:    "NOT_FOUND",
            Message: "Resource not found",
        }
    case errors.Is(err, domain.ErrUnauthorized):
        return http.StatusUnauthorized, &APIError{
            Code:    "UNAUTHORIZED",
            Message: "Authentication required",
        }
    case errors.Is(err, domain.ErrForbidden):
        return http.StatusForbidden, &APIError{
            Code:    "FORBIDDEN",
            Message: "Insufficient permissions",
        }
    case errors.Is(err, domain.ErrValidation):
        return http.StatusBadRequest, &APIError{
            Code:    "VALIDATION_ERROR",
            Message: "Invalid request data",
        }
    default:
        return http.StatusInternalServerError, &APIError{
            Code:    "INTERNAL_ERROR",
            Message: "Internal server error",
        }
    }
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

## Middleware Chaining

### 1. Middleware Composition
```go
// Middleware chaining and composition
type Middleware func(http.Handler) http.Handler

func Chain(middlewares ...Middleware) Middleware {
    return func(next http.Handler) http.Handler {
        for i := len(middlewares) - 1; i >= 0; i-- {
            next = middlewares[i](next)
        }
        return next
    }
}

// Example usage
func SetupRoutes() {
    // Compose middleware chain
    commonMiddleware := Chain(
        LoggingMiddleware,
        RecoveryMiddleware,
        CORSMiddleware,
        RequestIDMiddleware,
    )
    
    // Apply to routes
    http.Handle("/api/v1/", commonMiddleware(APIHandler))
    
    // Apply additional middleware for protected routes
    protectedMiddleware := Chain(
        commonMiddleware,
        JWTAuthMiddleware,
        RateLimitMiddleware(rateLimiter),
    )
    
    http.Handle("/api/v1/admin/", protectedMiddleware(AdminHandler))
}

// Request ID middleware
func RequestIDMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        requestID := r.Header.Get("X-Request-ID")
        if requestID == "" {
            requestID = generateRequestID()
        }
        
        ctx := context.WithValue(r.Context(), "request_id", requestID)
        w.Header().Set("X-Request-ID", requestID)
        
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Recovery middleware
func RecoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Panic recovered: %v", err)
                http.Error(w, "Internal Server Error", http.StatusInternalServerError)
            }
        }()
        
        next.ServeHTTP(w, r)
    })
}
```

## Health Checks & Monitoring

### 1. Health Check Endpoints
```go
// Health check implementation
type HealthChecker struct {
    services map[string]HealthCheck
    logger   *log.Logger
}

type HealthCheck func(ctx context.Context) HealthStatus

type HealthStatus struct {
    Status    string                 `json:"status"`
    Message   string                 `json:"message,omitempty"`
    Details   map[string]interface{} `json:"details,omitempty"`
    Timestamp time.Time              `json:"timestamp"`
}

func (hc *HealthChecker) HealthHandler(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
    defer cancel()
    
    overallStatus := "healthy"
    serviceStatuses := make(map[string]HealthStatus)
    
    // Check all services
    for name, check := range hc.services {
        status := check(ctx)
        serviceStatuses[name] = status
        
        if status.Status != "healthy" {
            overallStatus = "unhealthy"
        }
    }
    
    response := map[string]interface{}{
        "status":  overallStatus,
        "time":    time.Now().UTC(),
        "version": "1.0.0",
        "services": serviceStatuses,
    }
    
    statusCode := http.StatusOK
    if overallStatus != "healthy" {
        statusCode = http.StatusServiceUnavailable
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    json.NewEncoder(w).Encode(response)
}

func (hc *HealthChecker) ReadinessHandler(w http.ResponseWriter, r *http.Request) {
    // Check if service is ready to receive traffic
    ready := hc.isReady()
    
    if ready {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("ready"))
    } else {
        w.WriteHeader(http.StatusServiceUnavailable)
        w.Write([]byte("not ready"))
    }
}

// Database health check
func (hc *HealthChecker) DatabaseHealthCheck(ctx context.Context) HealthStatus {
    db := hc.getDatabase()
    
    if err := db.PingContext(ctx); err != nil {
        return HealthStatus{
            Status:  "unhealthy",
            Message: "Database connection failed",
            Details: map[string]interface{}{
                "error": err.Error(),
            },
            Timestamp: time.Now(),
        }
    }
    
    return HealthStatus{
        Status:    "healthy",
        Message:   "Database connection successful",
        Timestamp: time.Now(),
    }
}

// Cache health check
func (hc *HealthChecker) CacheHealthCheck(ctx context.Context) HealthStatus {
    cache := hc.getCache()
    
    if err := cache.Ping(ctx); err != nil {
        return HealthStatus{
            Status:  "unhealthy",
            Message: "Cache connection failed",
            Details: map[string]interface{}{
                "error": err.Error(),
            },
            Timestamp: time.Now(),
        }
    }
    
    return HealthStatus{
        Status:    "healthy",
        Message:   "Cache connection successful",
        Timestamp: time.Now(),
    }
}
```

### 2. Metrics Collection
```go
// Prometheus metrics collection
import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )
    
    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint"},
    )
    
    activeConnections = prometheus.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_connections",
            Help: "Number of active connections",
        },
    )
)

func init() {
    prometheus.MustRegister(httpRequestsTotal)
    prometheus.MustRegister(httpRequestDuration)
    prometheus.MustRegister(activeConnections)
}

// Metrics middleware
func MetricsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Wrap response writer to capture status
        wrapped := &responseWriter{ResponseWriter: w}
        
        next.ServeHTTP(wrapped, r)
        
        duration := time.Since(start).Seconds()
        
        // Record metrics
        httpRequestsTotal.WithLabelValues(r.Method, r.URL.Path, strconv.Itoa(wrapped.status)).Inc()
        httpRequestDuration.WithLabelValues(r.Method, r.URL.Path).Observe(duration)
    })
}

// Metrics endpoint
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    promhttp.Handler().ServeHTTP(w, r)
}
```

## Circuit Breaker Pattern

### 1. Circuit Breaker Implementation
```go
// Circuit breaker for external service calls
type CircuitBreaker struct {
    failures    int
    threshold   int
    timeout     time.Duration
    lastFailure time.Time
    state       CircuitState
    mutex       sync.RWMutex
}

type CircuitState int

const (
    StateClosed CircuitState = iota
    StateOpen
    StateHalfOpen
)

func (cb *CircuitBreaker) Execute(command func() error) error {
    cb.mutex.RLock()
    state := cb.state
    cb.mutex.RUnlock()
    
    switch state {
    case StateOpen:
        if time.Since(cb.lastFailure) > cb.timeout {
            cb.mutex.Lock()
            cb.state = StateHalfOpen
            cb.mutex.Unlock()
        } else {
            return errors.New("circuit breaker is open")
        }
    case StateClosed:
        // Continue normally
    case StateHalfOpen:
        // Allow one request to test
    }
    
    // Execute command
    err := command()
    
    cb.mutex.Lock()
    defer cb.mutex.Unlock()
    
    if err != nil {
        cb.failures++
        cb.lastFailure = time.Now()
        
        if cb.failures >= cb.threshold {
            cb.state = StateOpen
        }
    } else {
        cb.failures = 0
        cb.state = StateClosed
    }
    
    return err
}

// Circuit breaker middleware for HTTP clients
func CircuitBreakerMiddleware(cb *CircuitBreaker) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            err := cb.Execute(func() error {
                // Create a channel to signal completion
                done := make(chan error, 1)
                
                go func() {
                    // Execute the actual handler
                    next.ServeHTTP(w, r)
                    done <- nil
                }()
                
                // Wait for completion or timeout
                select {
                case err := <-done:
                    return err
                case <-time.After(30 * time.Second):
                    return errors.New("request timeout")
                }
            })
            
            if err != nil {
                http.Error(w, "Service temporarily unavailable", http.StatusServiceUnavailable)
            }
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

// Version-specific handlers
func VersionHandler(w http.ResponseWriter, r *http.Request) {
    version := r.Context().Value("api_version").(string)
    
    switch version {
    case APIVersionV1:
        handleV1Request(w, r)
    case APIVersionV2:
        handleV2Request(w, r)
    default:
        http.Error(w, "Unsupported API version", http.StatusBadRequest)
    }
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

### 2. API Testing Strategy

#### Unit Testing
```go
// Unit tests for API handlers
func TestUserEndpoint(t *testing.T) {
    // Test user creation
    // Test user retrieval
    // Test user update
    // Test user deletion
    // Test validation errors
    // Test authentication
    // Test authorization
}

// Mock service for testing
type MockUserService struct {
    users map[string]*User
    mu    sync.RWMutex
}

func (m *MockUserService) CreateUser(ctx context.Context, user *User) error {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    if user.ID == "" {
        user.ID = generateID()
    }
    
    m.users[user.ID] = user
    return nil
}

func (m *MockUserService) GetUser(ctx context.Context, id string) (*User, error) {
    m.mu.RLock()
    defer m.mu.RUnlock()
    
    user, exists := m.users[id]
    if !exists {
        return nil, domain.ErrNotFound
    }
    
    return user, nil
}
```

#### Integration Testing
```go
// Integration tests with test database
func TestUserAPI_Integration(t *testing.T) {
    // Setup test database
    db := setupTestDatabase(t)
    defer cleanupTestDatabase(t, db)
    
    // Create test server
    server := createTestServer(t, db)
    defer server.Close()
    
    // Test user creation flow
    t.Run("CreateUser", func(t *testing.T) {
        userData := map[string]interface{}{
            "name":     "Test User",
            "email":    "test@example.com",
            "password": "password123",
        }
        
        resp, err := http.Post(server.URL+"/api/v1/users", "application/json", 
            strings.NewReader(mustMarshal(t, userData)))
        require.NoError(t, err)
        require.Equal(t, http.StatusCreated, resp.StatusCode)
        
        // Verify user was created in database
        var createdUser User
        err = json.NewDecoder(resp.Body).Decode(&createdUser)
        require.NoError(t, err)
        require.NotEmpty(t, createdUser.ID)
    })
}

// Test utilities
func setupTestDatabase(t *testing.T) *sql.DB {
    // Create test database connection
    db, err := sql.Open("postgres", testDBConnString)
    require.NoError(t, err)
    
    // Run migrations
    err = runMigrations(db)
    require.NoError(t, err)
    
    return db
}

func createTestServer(t *testing.T, db *sql.DB) *httptest.Server {
    // Create test server with test database
    userService := service.NewUserService(db)
    userHandler := handler.NewUserHandler(userService)
    
    mux := http.NewServeMux()
    mux.Handle("/api/v1/users", userHandler)
    
    return httptest.NewServer(mux)
}
```

#### Performance Testing
```go
// Load testing with vegeta
func TestAPI_Performance(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping performance test in short mode")
    }
    
    // Define test scenarios
    scenarios := []struct {
        name     string
        rate     int
        duration time.Duration
        target   string
    }{
        {
            name:     "User Creation - Low Load",
            rate:     10,
            duration: 30 * time.Second,
            target:   "POST /api/v1/users",
        },
        {
            name:     "User Retrieval - High Load",
            rate:     100,
            duration: 30 * time.Second,
            target:   "GET /api/v1/users",
        },
    }
    
    for _, scenario := range scenarios {
        t.Run(scenario.name, func(t *testing.T) {
            // Run load test
            results := runLoadTest(t, scenario)
            
            // Assert performance requirements
            require.Less(t, results.Latencies.P95, 200*time.Millisecond)
            require.Greater(t, results.Success, 0.95)
        })
    }
}

func runLoadTest(t *testing.T, scenario struct {
    name     string
    rate     int
    duration time.Duration
    target   string
}) vegeta.Results {
    // Implementation of load testing with vegeta
    // This would use the vegeta library to generate load
    return vegeta.Results{}
}
```

#### Mocking Strategy
```go
// Mock external dependencies
type MockPaymentGateway struct {
    payments map[string]*Payment
    mu       sync.RWMutex
}

func (m *MockPaymentGateway) ProcessPayment(ctx context.Context, payment *Payment) error {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    // Simulate payment processing
    if payment.Amount <= 0 {
        return errors.New("invalid amount")
    }
    
    payment.ID = generateID()
    payment.Status = "completed"
    payment.ProcessedAt = time.Now()
    
    m.payments[payment.ID] = payment
    return nil
}

// Mock event bus
type MockEventBus struct {
    events map[string][]interface{}
    mu     sync.RWMutex
}

func (m *MockEventBus) Publish(event string, data interface{}) error {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    if m.events[event] == nil {
        m.events[event] = make([]interface{}, 0)
    }
    
    m.events[event] = append(m.events[event], data)
    return nil
}

func (m *MockEventBus) GetEvents(event string) []interface{} {
    m.mu.RLock()
    defer m.mu.RUnlock()
    
    return m.events[event]
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
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
- [Vegeta Load Testing](https://github.com/tsenart/vegeta)
