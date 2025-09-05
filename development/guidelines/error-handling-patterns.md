# Error Handling Patterns for Distributed Systems

## Table of Contents
1. [Overview](#overview)
2. [Error Classification](#error-classification)
3. [Circuit Breaker Pattern](#circuit-breaker-pattern)
4. [Retry Mechanisms](#retry-mechanisms)
5. [Error Propagation](#error-propagation)
6. [Graceful Degradation](#graceful-degradation)
7. [Error Monitoring](#error-monitoring)
8. [Error Recovery](#error-recovery)
9. [Testing Error Handling](#testing-error-handling)
10. [Best Practices](#best-practices)
11. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Purpose
This document establishes comprehensive error handling patterns for distributed systems, ensuring system resilience, fault tolerance, and maintainable error management across all services in the CloudLab platform.

### Scope
- **Distributed Error Handling**: Cross-service error propagation and handling
- **Resilience Patterns**: Circuit breakers, retries, and timeouts
- **Error Classification**: Categorization and appropriate response strategies
- **Monitoring Integration**: Error tracking and alerting
- **Recovery Strategies**: Compensation and recovery patterns

### Business Context
- **User Experience**: Graceful error handling maintains user experience during failures
- **System Reliability**: Proper error handling ensures system stability and availability
- **Operational Excellence**: Clear error patterns enable effective debugging and monitoring
- **Compliance**: Error handling supports audit trails and compliance requirements

---

## Error Classification

### Error Categories

#### 1. Transient Errors
**Definition**: Temporary failures that may succeed on retry
**Examples**: Network timeouts, temporary service unavailability, rate limiting
**Response Strategy**: Retry with exponential backoff

```go
// Transient error types
type TransientError struct {
    Message string
    RetryAfter time.Duration
    Cause error
}

func (e TransientError) Error() string {
    return fmt.Sprintf("transient error: %s (retry after %v)", e.Message, e.RetryAfter)
}

func (e TransientError) Unwrap() error {
    return e.Cause
}

func (e TransientError) IsTransient() bool {
    return true
}
```

#### 2. Permanent Errors
**Definition**: Errors that will not succeed on retry
**Examples**: Invalid input, authentication failures, resource not found
**Response Strategy**: Fail fast, no retry

```go
// Permanent error types
type PermanentError struct {
    Code    string
    Message string
    Cause   error
}

func (e PermanentError) Error() string {
    return fmt.Sprintf("permanent error [%s]: %s", e.Code, e.Message)
}

func (e PermanentError) Unwrap() error {
    return e.Cause
}

func (e PermanentError) IsTransient() bool {
    return false
}

// Common permanent error codes
const (
    ErrCodeInvalidInput     = "INVALID_INPUT"
    ErrCodeUnauthorized     = "UNAUTHORIZED"
    ErrCodeForbidden        = "FORBIDDEN"
    ErrCodeNotFound         = "NOT_FOUND"
    ErrCodeConflict         = "CONFLICT"
    ErrCodeValidationFailed = "VALIDATION_FAILED"
)
```

#### 3. Business Logic Errors
**Definition**: Domain-specific errors that require business logic handling
**Examples**: Insufficient funds, inventory unavailable, business rule violations
**Response Strategy**: Context-specific handling, potential compensation

```go
// Business logic error types
type BusinessError struct {
    Code        string
    Message     string
    Details     map[string]interface{}
    Compensatable bool
    Cause       error
}

func (e BusinessError) Error() string {
    return fmt.Sprintf("business error [%s]: %s", e.Code, e.Message)
}

func (e BusinessError) Unwrap() error {
    return e.Cause
}

func (e BusinessError) IsCompensatable() bool {
    return e.Compensatable
}

// Common business error codes
const (
    ErrCodeInsufficientFunds    = "INSUFFICIENT_FUNDS"
    ErrCodeInventoryUnavailable = "INVENTORY_UNAVAILABLE"
    ErrCodeBusinessRuleViolation = "BUSINESS_RULE_VIOLATION"
    ErrCodeOrderExpired         = "ORDER_EXPIRED"
)
```

### Error Context Preservation

```go
// Error context structure
type ErrorContext struct {
    RequestID    string                 `json:"request_id"`
    UserID       string                 `json:"user_id,omitempty"`
    ServiceName  string                 `json:"service_name"`
    Operation    string                 `json:"operation"`
    Timestamp    time.Time              `json:"timestamp"`
    TraceID      string                 `json:"trace_id,omitempty"`
    SpanID       string                 `json:"span_id,omitempty"`
    Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// Enhanced error with context
type ContextualError struct {
    Error   error
    Context ErrorContext
}

func (e ContextualError) Error() string {
    return fmt.Sprintf("[%s] %s: %v", e.Context.ServiceName, e.Context.Operation, e.Error)
}

func (e ContextualError) Unwrap() error {
    return e.Error
}

// Error context builder
type ErrorContextBuilder struct {
    context ErrorContext
}

func NewErrorContextBuilder() *ErrorContextBuilder {
    return &ErrorContextBuilder{
        context: ErrorContext{
            Timestamp: time.Now(),
            Metadata:  make(map[string]interface{}),
        },
    }
}

func (b *ErrorContextBuilder) WithRequestID(requestID string) *ErrorContextBuilder {
    b.context.RequestID = requestID
    return b
}

func (b *ErrorContextBuilder) WithUserID(userID string) *ErrorContextBuilder {
    b.context.UserID = userID
    return b
}

func (b *ErrorContextBuilder) WithService(serviceName, operation string) *ErrorContextBuilder {
    b.context.ServiceName = serviceName
    b.context.Operation = operation
    return b
}

func (b *ErrorContextBuilder) WithTrace(traceID, spanID string) *ErrorContextBuilder {
    b.context.TraceID = traceID
    b.context.SpanID = spanID
    return b
}

func (b *ErrorContextBuilder) WithMetadata(key string, value interface{}) *ErrorContextBuilder {
    b.context.Metadata[key] = value
    return b
}

func (b *ErrorContextBuilder) Build(err error) ContextualError {
    return ContextualError{
        Error:   err,
        Context: b.context,
    }
}
```

---

## Circuit Breaker Pattern

### Implementation

```go
// Circuit breaker states
type CircuitState int

const (
    StateClosed CircuitState = iota
    StateOpen
    StateHalfOpen
)

// Circuit breaker configuration
type CircuitBreakerConfig struct {
    MaxFailures     int           `json:"max_failures"`
    Timeout         time.Duration `json:"timeout"`
    ResetTimeout    time.Duration `json:"reset_timeout"`
    SuccessThreshold int          `json:"success_threshold"`
}

// Circuit breaker implementation
type CircuitBreaker struct {
    config      CircuitBreakerConfig
    state       CircuitState
    failures    int
    successes   int
    lastFailure time.Time
    mutex       sync.RWMutex
    metrics     CircuitBreakerMetrics
}

type CircuitBreakerMetrics struct {
    TotalRequests    int64 `json:"total_requests"`
    SuccessfulRequests int64 `json:"successful_requests"`
    FailedRequests   int64 `json:"failed_requests"`
    CircuitOpens     int64 `json:"circuit_opens"`
    CircuitCloses    int64 `json:"circuit_closes"`
}

func NewCircuitBreaker(config CircuitBreakerConfig) *CircuitBreaker {
    return &CircuitBreaker{
        config: config,
        state:  StateClosed,
    }
}

func (cb *CircuitBreaker) Execute(fn func() error) error {
    cb.mutex.Lock()
    defer cb.mutex.Unlock()

    cb.metrics.TotalRequests++

    if !cb.canExecute() {
        return ErrCircuitBreakerOpen
    }

    err := fn()
    cb.recordResult(err)
    return err
}

func (cb *CircuitBreaker) canExecute() bool {
    switch cb.state {
    case StateClosed:
        return true
    case StateOpen:
        if time.Since(cb.lastFailure) >= cb.config.ResetTimeout {
            cb.state = StateHalfOpen
            cb.successes = 0
            return true
        }
        return false
    case StateHalfOpen:
        return true
    default:
        return false
    }
}

func (cb *CircuitBreaker) recordResult(err error) {
    if err != nil {
        cb.failures++
        cb.metrics.FailedRequests++
        cb.lastFailure = time.Now()

        if cb.failures >= cb.config.MaxFailures {
            cb.state = StateOpen
            cb.metrics.CircuitOpens++
        }
    } else {
        cb.successes++
        cb.metrics.SuccessfulRequests++

        if cb.state == StateHalfOpen && cb.successes >= cb.config.SuccessThreshold {
            cb.state = StateClosed
            cb.failures = 0
            cb.metrics.CircuitCloses++
        }
    }
}

func (cb *CircuitBreaker) GetState() CircuitState {
    cb.mutex.RLock()
    defer cb.mutex.RUnlock()
    return cb.state
}

func (cb *CircuitBreaker) GetMetrics() CircuitBreakerMetrics {
    cb.mutex.RLock()
    defer cb.mutex.RUnlock()
    return cb.metrics
}

// Circuit breaker errors
var (
    ErrCircuitBreakerOpen = errors.New("circuit breaker is open")
    ErrCircuitBreakerTimeout = errors.New("circuit breaker timeout")
)
```

### Service Integration

```go
// Service with circuit breaker
type PaymentService struct {
    client         PaymentClient
    circuitBreaker *CircuitBreaker
    logger         Logger
}

func NewPaymentService(client PaymentClient, logger Logger) *PaymentService {
    config := CircuitBreakerConfig{
        MaxFailures:     5,
        Timeout:         30 * time.Second,
        ResetTimeout:    60 * time.Second,
        SuccessThreshold: 3,
    }

    return &PaymentService{
        client:         client,
        circuitBreaker: NewCircuitBreaker(config),
        logger:         logger,
    }
}

func (s *PaymentService) ProcessPayment(ctx context.Context, payment PaymentRequest) (*PaymentResult, error) {
    var result *PaymentResult
    var err error

    // Execute with circuit breaker
    err = s.circuitBreaker.Execute(func() error {
        ctx, cancel := context.WithTimeout(ctx, s.circuitBreaker.config.Timeout)
        defer cancel()

        result, err = s.client.ProcessPayment(ctx, payment)
        return err
    })

    if err != nil {
        s.logger.Error("payment processing failed",
            "error", err,
            "circuit_state", s.circuitBreaker.GetState(),
            "payment_id", payment.ID,
        )
        return nil, err
    }

    return result, nil
}
```

---

## Retry Mechanisms

### Exponential Backoff Retry

```go
// Retry configuration
type RetryConfig struct {
    MaxAttempts    int           `json:"max_attempts"`
    InitialDelay   time.Duration `json:"initial_delay"`
    MaxDelay       time.Duration `json:"max_delay"`
    BackoffFactor  float64       `json:"backoff_factor"`
    Jitter         bool          `json:"jitter"`
}

// Retry implementation
type RetryExecutor struct {
    config RetryConfig
    logger Logger
}

func NewRetryExecutor(config RetryConfig, logger Logger) *RetryExecutor {
    return &RetryExecutor{
        config: config,
        logger: logger,
    }
}

func (r *RetryExecutor) Execute(ctx context.Context, fn func() error) error {
    var lastErr error
    delay := r.config.InitialDelay

    for attempt := 1; attempt <= r.config.MaxAttempts; attempt++ {
        // Check context cancellation
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
        }

        // Execute function
        err := fn()
        if err == nil {
            if attempt > 1 {
                r.logger.Info("operation succeeded after retry",
                    "attempt", attempt,
                    "total_attempts", r.config.MaxAttempts,
                )
            }
            return nil
        }

        lastErr = err

        // Check if error is retryable
        if !r.isRetryableError(err) {
            r.logger.Warn("non-retryable error encountered",
                "error", err,
                "attempt", attempt,
            )
            return err
        }

        // Don't wait after last attempt
        if attempt == r.config.MaxAttempts {
            break
        }

        // Calculate next delay
        nextDelay := r.calculateDelay(delay, attempt)
        
        r.logger.Warn("operation failed, retrying",
            "error", err,
            "attempt", attempt,
            "next_attempt_in", nextDelay,
        )

        // Wait with context cancellation support
        select {
        case <-ctx.Done():
            return ctx.Err()
        case <-time.After(nextDelay):
            delay = nextDelay
        }
    }

    r.logger.Error("operation failed after all retries",
        "error", lastErr,
        "total_attempts", r.config.MaxAttempts,
    )

    return fmt.Errorf("operation failed after %d attempts: %w", r.config.MaxAttempts, lastErr)
}

func (r *RetryExecutor) isRetryableError(err error) bool {
    // Check for transient errors
    var transientErr TransientError
    if errors.As(err, &transientErr) {
        return true
    }

    // Check for specific retryable error types
    if errors.Is(err, context.DeadlineExceeded) ||
       errors.Is(err, context.Canceled) ||
       isNetworkError(err) ||
       isRateLimitError(err) {
        return true
    }

    return false
}

func (r *RetryExecutor) calculateDelay(baseDelay time.Duration, attempt int) time.Duration {
    // Exponential backoff
    delay := time.Duration(float64(baseDelay) * math.Pow(r.config.BackoffFactor, float64(attempt-1)))
    
    // Apply maximum delay limit
    if delay > r.config.MaxDelay {
        delay = r.config.MaxDelay
    }

    // Add jitter to prevent thundering herd
    if r.config.Jitter {
        jitter := time.Duration(rand.Float64() * float64(delay) * 0.1)
        delay += jitter
    }

    return delay
}

// Helper functions for error classification
func isNetworkError(err error) bool {
    // Check for network-related errors
    return strings.Contains(err.Error(), "connection refused") ||
           strings.Contains(err.Error(), "timeout") ||
           strings.Contains(err.Error(), "network unreachable")
}

func isRateLimitError(err error) bool {
    // Check for rate limiting errors
    return strings.Contains(err.Error(), "rate limit") ||
           strings.Contains(err.Error(), "too many requests") ||
           strings.Contains(err.Error(), "429")
}
```

### Retry with Circuit Breaker Integration

```go
// Combined retry and circuit breaker
type ResilientExecutor struct {
    retryExecutor   *RetryExecutor
    circuitBreaker  *CircuitBreaker
    logger          Logger
}

func NewResilientExecutor(retryConfig RetryConfig, circuitConfig CircuitBreakerConfig, logger Logger) *ResilientExecutor {
    return &ResilientExecutor{
        retryExecutor:  NewRetryExecutor(retryConfig, logger),
        circuitBreaker: NewCircuitBreaker(circuitConfig),
        logger:         logger,
    }
}

func (r *ResilientExecutor) Execute(ctx context.Context, fn func() error) error {
    return r.circuitBreaker.Execute(func() error {
        return r.retryExecutor.Execute(ctx, fn)
    })
}
```

---

## Error Propagation

### Error Wrapping and Context

```go
// Error propagation utilities
type ErrorPropagator struct {
    serviceName string
    logger      Logger
}

func NewErrorPropagator(serviceName string, logger Logger) *ErrorPropagator {
    return &ErrorPropagator{
        serviceName: serviceName,
        logger:      logger,
    }
}

func (ep *ErrorPropagator) WrapError(ctx context.Context, err error, operation string) error {
    if err == nil {
        return nil
    }

    // Extract context information
    requestID := getRequestID(ctx)
    userID := getUserID(ctx)
    traceID := getTraceID(ctx)
    spanID := getSpanID(ctx)

    // Create contextual error
    contextualErr := NewErrorContextBuilder().
        WithRequestID(requestID).
        WithUserID(userID).
        WithService(ep.serviceName, operation).
        WithTrace(traceID, spanID).
        Build(err)

    // Log error with context
    ep.logger.Error("operation failed",
        "error", err,
        "operation", operation,
        "request_id", requestID,
        "user_id", userID,
        "trace_id", traceID,
        "span_id", spanID,
    )

    return contextualErr
}

// Context extraction helpers
func getRequestID(ctx context.Context) string {
    if requestID, ok := ctx.Value("request_id").(string); ok {
        return requestID
    }
    return ""
}

func getUserID(ctx context.Context) string {
    if userID, ok := ctx.Value("user_id").(string); ok {
        return userID
    }
    return ""
}

func getTraceID(ctx context.Context) string {
    if traceID, ok := ctx.Value("trace_id").(string); ok {
        return traceID
    }
    return ""
}

func getSpanID(ctx context.Context) string {
    if spanID, ok := ctx.Value("span_id").(string); ok {
        return spanID
    }
    return ""
}
```

### Cross-Service Error Handling

```go
// Service error response format
type ServiceErrorResponse struct {
    Error struct {
        Code      string                 `json:"code"`
        Message   string                 `json:"message"`
        Details   map[string]interface{} `json:"details,omitempty"`
        RequestID string                 `json:"request_id"`
        TraceID   string                 `json:"trace_id,omitempty"`
    } `json:"error"`
}

// Error response builder
func BuildErrorResponse(ctx context.Context, err error) ServiceErrorResponse {
    requestID := getRequestID(ctx)
    traceID := getTraceID(ctx)

    response := ServiceErrorResponse{}
    response.Error.RequestID = requestID
    response.Error.TraceID = traceID

    // Classify error and set appropriate response
    switch {
    case errors.As(err, &TransientError{}):
        response.Error.Code = "SERVICE_UNAVAILABLE"
        response.Error.Message = "Service temporarily unavailable"
    case errors.As(err, &PermanentError{}):
        if pe, ok := err.(PermanentError); ok {
            response.Error.Code = pe.Code
            response.Error.Message = pe.Message
        }
    case errors.As(err, &BusinessError{}):
        if be, ok := err.(BusinessError); ok {
            response.Error.Code = be.Code
            response.Error.Message = be.Message
            response.Error.Details = be.Details
        }
    default:
        response.Error.Code = "INTERNAL_ERROR"
        response.Error.Message = "Internal server error"
    }

    return response
}
```

---

## Graceful Degradation

### Fallback Strategies

```go
// Fallback configuration
type FallbackConfig struct {
    Enabled     bool          `json:"enabled"`
    Timeout     time.Duration `json:"timeout"`
    CacheTTL    time.Duration `json:"cache_ttl"`
    DefaultData interface{}   `json:"default_data"`
}

// Fallback executor
type FallbackExecutor struct {
    config     FallbackConfig
    cache      Cache
    logger     Logger
}

func NewFallbackExecutor(config FallbackConfig, cache Cache, logger Logger) *FallbackExecutor {
    return &FallbackExecutor{
        config: config,
        cache:  cache,
        logger: logger,
    }
}

func (fe *FallbackExecutor) ExecuteWithFallback(
    ctx context.Context,
    primaryFn func() (interface{}, error),
    fallbackFn func() (interface{}, error),
    cacheKey string,
) (interface{}, error) {
    if !fe.config.Enabled {
        return primaryFn()
    }

    // Try primary operation
    result, err := fe.executeWithTimeout(ctx, primaryFn)
    if err == nil {
        // Cache successful result
        if cacheKey != "" {
            fe.cache.Set(cacheKey, result, fe.config.CacheTTL)
        }
        return result, nil
    }

    fe.logger.Warn("primary operation failed, attempting fallback",
        "error", err,
        "cache_key", cacheKey,
    )

    // Try fallback operation
    fallbackResult, fallbackErr := fe.executeWithTimeout(ctx, fallbackFn)
    if fallbackErr == nil {
        fe.logger.Info("fallback operation succeeded",
            "cache_key", cacheKey,
        )
        return fallbackResult, nil
    }

    // Try cached data as last resort
    if cacheKey != "" {
        if cachedData, found := fe.cache.Get(cacheKey); found {
            fe.logger.Info("using cached data as fallback",
                "cache_key", cacheKey,
            )
            return cachedData, nil
        }
    }

    // Return default data if available
    if fe.config.DefaultData != nil {
        fe.logger.Info("using default data as fallback")
        return fe.config.DefaultData, nil
    }

    return nil, fmt.Errorf("all fallback strategies failed: primary=%v, fallback=%v", err, fallbackErr)
}

func (fe *FallbackExecutor) executeWithTimeout(ctx context.Context, fn func() (interface{}, error)) (interface{}, error) {
    if fe.config.Timeout <= 0 {
        return fn()
    }

    type result struct {
        data interface{}
        err  error
    }

    resultChan := make(chan result, 1)
    go func() {
        data, err := fn()
        resultChan <- result{data: data, err: err}
    }()

    select {
    case res := <-resultChan:
        return res.data, res.err
    case <-time.After(fe.config.Timeout):
        return nil, errors.New("operation timeout")
    case <-ctx.Done():
        return nil, ctx.Err()
    }
}
```

### Service Degradation Examples

```go
// Order service with graceful degradation
type OrderService struct {
    paymentService    PaymentService
    inventoryService  InventoryService
    notificationService NotificationService
    fallbackExecutor  *FallbackExecutor
    logger            Logger
}

func (s *OrderService) CreateOrder(ctx context.Context, req CreateOrderRequest) (*Order, error) {
    // Check inventory (critical - no fallback)
    inventory, err := s.inventoryService.CheckAvailability(ctx, req.Items)
    if err != nil {
        return nil, fmt.Errorf("inventory check failed: %w", err)
    }

    if !inventory.Available {
        return nil, BusinessError{
            Code:    ErrCodeInventoryUnavailable,
            Message: "Requested items are not available",
            Details: map[string]interface{}{
                "unavailable_items": inventory.UnavailableItems,
            },
        }
    }

    // Create order
    order := &Order{
        ID:     generateOrderID(),
        UserID: req.UserID,
        Items:  req.Items,
        Status: OrderStatusPending,
    }

    // Process payment with fallback
    paymentResult, err := s.fallbackExecutor.ExecuteWithFallback(
        ctx,
        func() (interface{}, error) {
            return s.paymentService.ProcessPayment(ctx, PaymentRequest{
                OrderID: order.ID,
                Amount:  order.Total,
            })
        },
        func() (interface{}, error) {
            // Fallback: Mark payment as pending for manual processing
            return &PaymentResult{
                Status:    "pending_manual_review",
                PaymentID: generatePaymentID(),
            }, nil
        },
        fmt.Sprintf("payment_%s", order.ID),
    )

    if err != nil {
        return nil, fmt.Errorf("payment processing failed: %w", err)
    }

    payment := paymentResult.(*PaymentResult)
    order.PaymentID = payment.PaymentID
    order.Status = mapPaymentStatusToOrderStatus(payment.Status)

    // Send notification (non-critical - can fail silently)
    go func() {
        if err := s.notificationService.SendOrderConfirmation(ctx, order); err != nil {
            s.logger.Warn("failed to send order confirmation",
                "order_id", order.ID,
                "error", err,
            )
        }
    }()

    return order, nil
}
```

---

## Error Monitoring

### Error Metrics Collection

```go
// Error metrics structure
type ErrorMetrics struct {
    ServiceName     string            `json:"service_name"`
    ErrorType       string            `json:"error_type"`
    ErrorCode       string            `json:"error_code"`
    Count           int64             `json:"count"`
    LastOccurrence  time.Time         `json:"last_occurrence"`
    Metadata        map[string]string `json:"metadata"`
}

// Error metrics collector
type ErrorMetricsCollector struct {
    metrics    map[string]*ErrorMetrics
    mutex      sync.RWMutex
    exporter   MetricsExporter
    logger     Logger
}

func NewErrorMetricsCollector(exporter MetricsExporter, logger Logger) *ErrorMetricsCollector {
    return &ErrorMetricsCollector{
        metrics:  make(map[string]*ErrorMetrics),
        exporter: exporter,
        logger:   logger,
    }
}

func (emc *ErrorMetricsCollector) RecordError(ctx context.Context, err error, serviceName, operation string) {
    emc.mutex.Lock()
    defer emc.mutex.Unlock()

    // Extract error information
    errorType := getErrorType(err)
    errorCode := getErrorCode(err)
    key := fmt.Sprintf("%s:%s:%s", serviceName, errorType, errorCode)

    // Update or create metrics
    if metrics, exists := emc.metrics[key]; exists {
        metrics.Count++
        metrics.LastOccurrence = time.Now()
    } else {
        emc.metrics[key] = &ErrorMetrics{
            ServiceName:    serviceName,
            ErrorType:      errorType,
            ErrorCode:      errorCode,
            Count:          1,
            LastOccurrence: time.Now(),
            Metadata:       extractErrorMetadata(ctx, err),
        }
    }

    // Export metrics
    emc.exportMetrics(key)
}

func (emc *ErrorMetricsCollector) exportMetrics(key string) {
    if metrics, exists := emc.metrics[key]; exists {
        emc.exporter.ExportErrorMetrics(*metrics)
    }
}

func getErrorType(err error) string {
    switch {
    case errors.As(err, &TransientError{}):
        return "transient"
    case errors.As(err, &PermanentError{}):
        return "permanent"
    case errors.As(err, &BusinessError{}):
        return "business"
    default:
        return "unknown"
    }
}

func getErrorCode(err error) string {
    switch {
    case errors.As(err, &PermanentError{}):
        if pe, ok := err.(PermanentError); ok {
            return pe.Code
        }
    case errors.As(err, &BusinessError{}):
        if be, ok := err.(BusinessError); ok {
            return be.Code
        }
    }
    return "UNKNOWN"
}

func extractErrorMetadata(ctx context.Context, err error) map[string]string {
    metadata := make(map[string]string)
    
    if requestID := getRequestID(ctx); requestID != "" {
        metadata["request_id"] = requestID
    }
    if userID := getUserID(ctx); userID != "" {
        metadata["user_id"] = userID
    }
    if traceID := getTraceID(ctx); traceID != "" {
        metadata["trace_id"] = traceID
    }

    return metadata
}
```

### Error Alerting

```go
// Error alerting configuration
type ErrorAlertingConfig struct {
    Enabled           bool              `json:"enabled"`
    Thresholds        map[string]int64  `json:"thresholds"`
    CooldownPeriod    time.Duration     `json:"cooldown_period"`
    NotificationChannels []string       `json:"notification_channels"`
}

// Error alerting service
type ErrorAlertingService struct {
    config      ErrorAlertingConfig
    collector   *ErrorMetricsCollector
    notifier    NotificationService
    lastAlerts  map[string]time.Time
    mutex       sync.RWMutex
    logger      Logger
}

func NewErrorAlertingService(config ErrorAlertingConfig, collector *ErrorMetricsCollector, notifier NotificationService, logger Logger) *ErrorAlertingService {
    return &ErrorAlertingService{
        config:     config,
        collector:  collector,
        notifier:   notifier,
        lastAlerts: make(map[string]time.Time),
        logger:     logger,
    }
}

func (eas *ErrorAlertingService) CheckThresholds() {
    if !eas.config.Enabled {
        return
    }

    eas.mutex.RLock()
    metrics := eas.collector.GetAllMetrics()
    eas.mutex.RUnlock()

    for key, metrics := range metrics {
        threshold, exists := eas.config.Thresholds[metrics.ErrorCode]
        if !exists {
            continue
        }

        if metrics.Count >= threshold {
            eas.checkAndSendAlert(key, metrics)
        }
    }
}

func (eas *ErrorAlertingService) checkAndSendAlert(key string, metrics ErrorMetrics) {
    eas.mutex.Lock()
    defer eas.mutex.Unlock()

    lastAlert, exists := eas.lastAlerts[key]
    if exists && time.Since(lastAlert) < eas.config.CooldownPeriod {
        return // Still in cooldown period
    }

    // Send alert
    alert := Alert{
        Type:        "error_threshold_exceeded",
        Service:     metrics.ServiceName,
        ErrorCode:   metrics.ErrorCode,
        Count:       metrics.Count,
        Threshold:   eas.config.Thresholds[metrics.ErrorCode],
        Timestamp:   time.Now(),
        Metadata:    metrics.Metadata,
    }

    for _, channel := range eas.config.NotificationChannels {
        if err := eas.notifier.SendAlert(channel, alert); err != nil {
            eas.logger.Error("failed to send error alert",
                "channel", channel,
                "alert", alert,
                "error", err,
            )
        }
    }

    eas.lastAlerts[key] = time.Now()
}
```

---

## Error Recovery

### Compensation Patterns

```go
// Compensation action interface
type CompensationAction interface {
    Execute(ctx context.Context) error
    GetID() string
    GetDescription() string
}

// Compensation executor
type CompensationExecutor struct {
    actions map[string]CompensationAction
    logger  Logger
}

func NewCompensationExecutor(logger Logger) *CompensationExecutor {
    return &CompensationExecutor{
        actions: make(map[string]CompensationAction),
        logger:  logger,
    }
}

func (ce *CompensationExecutor) RegisterAction(action CompensationAction) {
    ce.actions[action.GetID()] = action
}

func (ce *CompensationExecutor) ExecuteCompensation(ctx context.Context, actionIDs []string) error {
    var errors []error

    // Execute compensation actions in reverse order
    for i := len(actionIDs) - 1; i >= 0; i-- {
        actionID := actionIDs[i]
        action, exists := ce.actions[actionID]
        if !exists {
            ce.logger.Warn("compensation action not found",
                "action_id", actionID,
            )
            continue
        }

        ce.logger.Info("executing compensation action",
            "action_id", actionID,
            "description", action.GetDescription(),
        )

        if err := action.Execute(ctx); err != nil {
            ce.logger.Error("compensation action failed",
                "action_id", actionID,
                "error", err,
            )
            errors = append(errors, fmt.Errorf("compensation action %s failed: %w", actionID, err))
        }
    }

    if len(errors) > 0 {
        return fmt.Errorf("compensation failed: %v", errors)
    }

    return nil
}

// Example compensation actions
type PaymentRefundAction struct {
    paymentService PaymentService
    paymentID      string
    amount         decimal.Decimal
}

func (p *PaymentRefundAction) Execute(ctx context.Context) error {
    return p.paymentService.Refund(ctx, p.paymentID, p.amount)
}

func (p *PaymentRefundAction) GetID() string {
    return fmt.Sprintf("payment_refund_%s", p.paymentID)
}

func (p *PaymentRefundAction) GetDescription() string {
    return fmt.Sprintf("Refund payment %s for amount %s", p.paymentID, p.amount.String())
}

type InventoryRestoreAction struct {
    inventoryService InventoryService
    items            []OrderItem
}

func (i *InventoryRestoreAction) Execute(ctx context.Context) error {
    return i.inventoryService.RestoreInventory(ctx, i.items)
}

func (i *InventoryRestoreAction) GetID() string {
    return fmt.Sprintf("inventory_restore_%d", len(i.items))
}

func (i *InventoryRestoreAction) GetDescription() string {
    return fmt.Sprintf("Restore inventory for %d items", len(i.items))
}
```

### Saga Pattern for Error Recovery

```go
// Saga step interface
type SagaStep interface {
    Execute(ctx context.Context) (CompensationAction, error)
    GetID() string
    GetDescription() string
}

// Saga orchestrator
type SagaOrchestrator struct {
    steps    []SagaStep
    executor *CompensationExecutor
    logger   Logger
}

func NewSagaOrchestrator(executor *CompensationExecutor, logger Logger) *SagaOrchestrator {
    return &SagaOrchestrator{
        executor: executor,
        logger:   logger,
    }
}

func (so *SagaOrchestrator) AddStep(step SagaStep) {
    so.steps = append(so.steps, step)
}

func (so *SagaOrchestrator) Execute(ctx context.Context) error {
    var executedActions []string

    for _, step := range so.steps {
        so.logger.Info("executing saga step",
            "step_id", step.GetID(),
            "description", step.GetDescription(),
        )

        compensationAction, err := step.Execute(ctx)
        if err != nil {
            so.logger.Error("saga step failed, starting compensation",
                "step_id", step.GetID(),
                "error", err,
            )

            // Execute compensation for all previously executed steps
            if compensationErr := so.executor.ExecuteCompensation(ctx, executedActions); compensationErr != nil {
                so.logger.Error("compensation failed",
                    "error", compensationErr,
                )
                return fmt.Errorf("saga failed and compensation failed: step_error=%v, compensation_error=%v", err, compensationErr)
            }

            return fmt.Errorf("saga failed at step %s: %w", step.GetID(), err)
        }

        // Register compensation action
        if compensationAction != nil {
            so.executor.RegisterAction(compensationAction)
            executedActions = append(executedActions, compensationAction.GetID())
        }
    }

    so.logger.Info("saga completed successfully",
        "total_steps", len(so.steps),
    )

    return nil
}
```

---

## Testing Error Handling

### Error Handling Test Utilities

```go
// Error testing utilities
type ErrorTestHelper struct {
    logger Logger
}

func NewErrorTestHelper(logger Logger) *ErrorTestHelper {
    return &ErrorTestHelper{logger: logger}
}

// Test circuit breaker behavior
func (eth *ErrorTestHelper) TestCircuitBreaker(t *testing.T, cb *CircuitBreaker, failureCount int) {
    // Test normal operation
    err := cb.Execute(func() error { return nil })
    assert.NoError(t, err)
    assert.Equal(t, StateClosed, cb.GetState())

    // Simulate failures
    for i := 0; i < failureCount; i++ {
        err := cb.Execute(func() error { return errors.New("test error") })
        assert.Error(t, err)
    }

    // Check circuit state
    assert.Equal(t, StateOpen, cb.GetState())

    // Test fast fail
    err = cb.Execute(func() error { return nil })
    assert.Error(t, err)
    assert.ErrorIs(t, err, ErrCircuitBreakerOpen)
}

// Test retry behavior
func (eth *ErrorTestHelper) TestRetryBehavior(t *testing.T, executor *RetryExecutor, shouldSucceed bool) {
    attemptCount := 0
    maxAttempts := 3

    err := executor.Execute(context.Background(), func() error {
        attemptCount++
        if shouldSucceed && attemptCount == maxAttempts {
            return nil // Succeed on last attempt
        }
        return errors.New("test error")
    })

    if shouldSucceed {
        assert.NoError(t, err)
        assert.Equal(t, maxAttempts, attemptCount)
    } else {
        assert.Error(t, err)
        assert.Equal(t, maxAttempts, attemptCount)
    }
}

// Test error propagation
func (eth *ErrorTestHelper) TestErrorPropagation(t *testing.T, propagator *ErrorPropagator, originalErr error) {
    ctx := context.WithValue(context.Background(), "request_id", "test-request-123")
    ctx = context.WithValue(ctx, "user_id", "test-user-456")

    wrappedErr := propagator.WrapError(ctx, originalErr, "test_operation")

    assert.Error(t, wrappedErr)
    assert.Contains(t, wrappedErr.Error(), "test_operation")
    assert.Contains(t, wrappedErr.Error(), "test-request-123")

    // Test error unwrapping
    var contextualErr ContextualError
    assert.True(t, errors.As(wrappedErr, &contextualErr))
    assert.Equal(t, "test-request-123", contextualErr.Context.RequestID)
    assert.Equal(t, "test-user-456", contextualErr.Context.UserID)
}
```

### Integration Test Examples

```go
// Integration test for error handling
func TestOrderService_ErrorHandling(t *testing.T) {
    // Setup test environment
    logger := NewTestLogger()
    paymentService := NewMockPaymentService()
    inventoryService := NewMockInventoryService()
    
    // Configure circuit breaker
    circuitConfig := CircuitBreakerConfig{
        MaxFailures:     3,
        Timeout:         5 * time.Second,
        ResetTimeout:    10 * time.Second,
        SuccessThreshold: 2,
    }
    
    // Configure retry
    retryConfig := RetryConfig{
        MaxAttempts:   3,
        InitialDelay:  100 * time.Millisecond,
        MaxDelay:      1 * time.Second,
        BackoffFactor: 2.0,
        Jitter:        true,
    }

    // Create service with error handling
    orderService := &OrderService{
        paymentService:   paymentService,
        inventoryService: inventoryService,
        fallbackExecutor: NewFallbackExecutor(FallbackConfig{Enabled: true}, NewMemoryCache(), logger),
        logger:          logger,
    }

    t.Run("payment service failure with circuit breaker", func(t *testing.T) {
        // Simulate payment service failures
        paymentService.SetFailureMode(true)
        defer paymentService.SetFailureMode(false)

        // First few requests should fail and open circuit breaker
        for i := 0; i < 3; i++ {
            _, err := orderService.CreateOrder(context.Background(), CreateOrderRequest{
                UserID: "user123",
                Items:  []OrderItem{{ProductID: "prod1", Quantity: 1}},
            })
            assert.Error(t, err)
        }

        // Circuit should be open now
        assert.Equal(t, StateOpen, orderService.paymentService.GetCircuitBreakerState())

        // Next request should fail fast
        _, err := orderService.CreateOrder(context.Background(), CreateOrderRequest{
            UserID: "user123",
            Items:  []OrderItem{{ProductID: "prod1", Quantity: 1}},
        })
        assert.Error(t, err)
        assert.ErrorIs(t, err, ErrCircuitBreakerOpen)
    })

    t.Run("inventory service failure with fallback", func(t *testing.T) {
        // Simulate inventory service failure
        inventoryService.SetFailureMode(true)
        defer inventoryService.SetFailureMode(false)

        // Request should fail due to inventory check (no fallback for critical operations)
        _, err := orderService.CreateOrder(context.Background(), CreateOrderRequest{
            UserID: "user123",
            Items:  []OrderItem{{ProductID: "prod1", Quantity: 1}},
        })
        assert.Error(t, err)
        assert.Contains(t, err.Error(), "inventory check failed")
    })

    t.Run("notification service failure with graceful degradation", func(t *testing.T) {
        // Simulate notification service failure (non-critical)
        notificationService.SetFailureMode(true)
        defer notificationService.SetFailureMode(false)

        // Order should still be created successfully
        order, err := orderService.CreateOrder(context.Background(), CreateOrderRequest{
            UserID: "user123",
            Items:  []OrderItem{{ProductID: "prod1", Quantity: 1}},
        })
        assert.NoError(t, err)
        assert.NotNil(t, order)
        assert.Equal(t, "completed", order.Status)
    })
}
```

---

## Best Practices

### 1. Error Classification
- **Always classify errors** as transient, permanent, or business logic errors
- **Use appropriate response strategies** based on error classification
- **Implement error context preservation** for debugging and monitoring

### 2. Circuit Breaker Implementation
- **Set appropriate thresholds** based on service characteristics
- **Monitor circuit breaker metrics** and adjust configuration as needed
- **Implement proper timeout handling** to prevent resource exhaustion

### 3. Retry Strategies
- **Use exponential backoff** with jitter to prevent thundering herd
- **Implement retry limits** to prevent infinite retry loops
- **Respect context cancellation** to support graceful shutdown

### 4. Error Propagation
- **Preserve error context** across service boundaries
- **Use structured error responses** for API consistency
- **Implement proper error logging** with correlation IDs

### 5. Graceful Degradation
- **Identify critical vs non-critical operations**
- **Implement fallback strategies** for non-critical operations
- **Use caching** to support fallback scenarios

### 6. Monitoring and Alerting
- **Collect comprehensive error metrics** for all services
- **Set appropriate alerting thresholds** based on business impact
- **Implement error correlation** across distributed systems

### 7. Recovery and Compensation
- **Implement compensation patterns** for distributed transactions
- **Use saga patterns** for complex multi-step operations
- **Test recovery scenarios** thoroughly

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Implement error classification system
- [ ] Create error context preservation utilities
- [ ] Set up error metrics collection
- [ ] Implement basic logging and monitoring

### Phase 2: Resilience Patterns
- [ ] Implement circuit breaker pattern
- [ ] Add retry mechanisms with exponential backoff
- [ ] Implement timeout handling
- [ ] Add graceful degradation support

### Phase 3: Advanced Features
- [ ] Implement error propagation across services
- [ ] Add compensation and recovery patterns
- [ ] Implement saga pattern for complex operations
- [ ] Add comprehensive error alerting

### Phase 4: Testing and Validation
- [ ] Create error handling test utilities
- [ ] Implement integration tests for error scenarios
- [ ] Add performance tests for error handling overhead
- [ ] Validate error handling in production-like environment

### Phase 5: Monitoring and Optimization
- [ ] Set up error monitoring dashboards
- [ ] Implement error alerting and notification
- [ ] Optimize error handling performance
- [ ] Document error handling procedures

---

## Related Documentation

- [Coding Standards](coding-standards.md) - General coding practices and error handling
- [Testing Guidelines](testing-guidelines.md) - Error handling testing strategies
- [Security Best Practices](security-best-practices.md) - Security considerations for error handling
- [Monitoring & Observability Standards](monitoring-observability-standards.md) - Error monitoring and alerting
- [Database Design Standards](database-design-standards.md) - Database error handling patterns
- [Event Sourcing Guidelines](event-sourcing-guidelines.md) - Event-driven error handling

---

**Document Version**: 1.0  
**Last Updated**: 2025-09-05
