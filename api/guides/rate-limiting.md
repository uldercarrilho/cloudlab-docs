---
title: "Rate Limiting Implementation Guide"
description: "Token bucket, sliding window, fixed window strategies and distributed implementations"
category: "api"
subcategory: "performance"
tags: ["rate-limiting", "throttling", "redis", "performance"]
ai_consumption_optimized: true
---

# Rate Limiting Implementation Guide

## Overview
This document provides comprehensive guidance for implementing rate limiting in the distributed e-commerce platform, following the security architecture decisions outlined in ADR-009 and API design principles from ADR-006.

## Rate Limiting Strategies

### 1. Token Bucket Algorithm

**Pros:**
- **Burst Handling**: Allows for burst traffic up to bucket capacity
- **Smooth Rate**: Provides consistent, predictable rate limiting
- **Memory Efficient**: Uses minimal memory regardless of request volume
- **Fair Distribution**: Ensures fair distribution of requests over time
- **Real-time Refill**: Tokens refill continuously, not just at window boundaries

**Cons:**
- **Burst Potential**: Can allow sudden spikes if tokens accumulate
- **Complexity**: Slightly more complex implementation than fixed window
- **Clock Dependency**: Sensitive to system clock accuracy
- **Initial Delay**: New users may experience initial delays if bucket is empty

**Best For:**
- APIs that need to handle burst traffic gracefully
- Services requiring smooth, consistent rate limiting
- Real-time applications where predictable latency is important
- Systems with variable traffic patterns

```go
// Token bucket rate limiter implementation
type TokenBucket struct {
    capacity     int           // Maximum tokens in bucket
    tokens       int           // Current tokens available
    refillRate   float64       // Tokens per second
    lastRefill   time.Time     // Last time bucket was refilled
    mu           sync.Mutex    // Mutex for thread safety
}

func NewTokenBucket(capacity int, refillRate float64) *TokenBucket {
    return &TokenBucket{
        capacity:   capacity,
        tokens:     capacity,
        refillRate: refillRate,
        lastRefill: time.Now(),
    }
}

func (tb *TokenBucket) Allow() bool {
    tb.mu.Lock()
    defer tb.mu.Unlock()
    
    // Refill tokens based on time elapsed
    now := time.Now()
    elapsed := now.Sub(tb.lastRefill).Seconds()
    tokensToAdd := int(elapsed * tb.refillRate)
    
    if tokensToAdd > 0 {
        tb.tokens = min(tb.capacity, tb.tokens+tokensToAdd)
        tb.lastRefill = now
    }
    
    // Check if tokens are available
    if tb.tokens > 0 {
        tb.tokens--
        return true
    }
    
    return false
}
```

### 2. Sliding Window Rate Limiter

**Pros:**
- **Accurate Counting**: Provides precise request counting within the sliding window
- **Smooth Transitions**: Eliminates the boundary effect seen in fixed windows
- **Fair Distribution**: More evenly distributes requests across time boundaries
- **Real-time Updates**: Continuously updates as requests come in and expire
- **Predictable Behavior**: Consistent rate limiting regardless of when requests arrive

**Cons:**
- **Memory Usage**: Memory consumption grows with request volume
- **Performance Overhead**: Requires cleanup of expired requests on each check
- **Complexity**: More complex implementation than fixed window
- **CPU Intensive**: Regular cleanup operations can impact performance under high load

**Best For:**
- APIs requiring precise rate limiting without boundary effects
- High-traffic services where accuracy is more important than performance
- Systems that need smooth rate limiting transitions
- Applications where memory usage is not a primary concern

```go
// Sliding window rate limiter
type SlidingWindow struct {
    windowSize   time.Duration
    maxRequests  int
    requests     []time.Time
    mu           sync.Mutex
}

func NewSlidingWindow(windowSize time.Duration, maxRequests int) *SlidingWindow {
    return &SlidingWindow{
        windowSize:  windowSize,
        maxRequests: maxRequests,
        requests:    make([]time.Time, 0),
    }
}

func (sw *SlidingWindow) Allow() bool {
    sw.mu.Lock()
    defer sw.mu.Unlock()
    
    now := time.Now()
    cutoff := now.Add(-sw.windowSize)
    
    // Remove expired requests
    validRequests := make([]time.Time, 0)
    for _, req := range sw.requests {
        if req.After(cutoff) {
            validRequests = append(validRequests, req)
        }
    }
    sw.requests = validRequests
    
    // Check if we can allow another request
    if len(sw.requests) < sw.maxRequests {
        sw.requests = append(sw.requests, now)
        return true
    }
    
    return false
}
```

### 3. Fixed Window Rate Limiter

**Pros:**
- **Simple Implementation**: Easy to understand and implement
- **Low Memory Usage**: Constant memory usage regardless of request volume
- **High Performance**: Minimal computational overhead per request
- **Predictable Reset**: Clear window boundaries make behavior predictable
- **Easy Debugging**: Simple state makes troubleshooting straightforward

**Cons:**
- **Boundary Effect**: Can allow traffic spikes at window boundaries
- **Less Accurate**: May not provide smooth rate limiting across boundaries
- **Potential Abuse**: Users can exploit window resets for burst traffic
- **Rigid Timing**: Fixed windows don't adapt to traffic patterns

**Best For:**
- Simple applications requiring basic rate limiting
- High-performance systems where overhead must be minimized
- Development and testing environments
- Systems where exact rate limiting precision is not critical

```go
// Fixed window rate limiter
type FixedWindow struct {
    windowSize   time.Duration
    maxRequests  int
    requests     int
    windowStart  time.Time
    mu           sync.Mutex
}

func NewFixedWindow(windowSize time.Duration, maxRequests int) *FixedWindow {
    return &FixedWindow{
        windowSize:  windowSize,
        maxRequests: maxRequests,
        requests:    0,
        windowStart: time.Now(),
    }
}

func (fw *FixedWindow) Allow() bool {
    fw.mu.Lock()
    defer fw.mu.Unlock()
    
    now := time.Now()
    
    // Check if we need to reset the window
    if now.Sub(fw.windowStart) >= fw.windowSize {
        fw.requests = 0
        fw.windowStart = now
    }
    
    // Check if we can allow another request
    if fw.requests < fw.maxRequests {
        fw.requests++
        return true
    }
    
    return false
}
```

## Strategy Selection Guide

When choosing a rate limiting strategy, consider the following factors:

| Strategy | Use When | Avoid When |
|----------|----------|------------|
| **Token Bucket** | You need burst handling, smooth rate limiting, or are building real-time applications | Memory is extremely constrained or you need strict request counting |
| **Sliding Window** | You need precise rate limiting without boundary effects and can afford the memory overhead | Performance is critical or memory usage is a concern |
| **Fixed Window** | You need simple, high-performance rate limiting or are in development/testing | You need smooth rate limiting or are concerned about boundary effects |

**Additional Considerations:**
- **Hybrid Approaches**: Consider combining strategies for different endpoints or user tiers
- **Performance Testing**: Always benchmark your chosen strategy under expected load
- **Monitoring**: Implement metrics to track the effectiveness of your rate limiting strategy
- **Configuration**: Make rate limits configurable to adjust based on real-world usage patterns

## Multi-Tier Rate Limiting

### 1. Global Rate Limiter
```go
// Global rate limiter for the entire platform
type GlobalRateLimiter struct {
    limiters map[string]RateLimiter
    mu       sync.RWMutex
}

func NewGlobalRateLimiter() *GlobalRateLimiter {
    return &GlobalRateLimiter{
        limiters: make(map[string]RateLimiter),
    }
}

func (grl *GlobalRateLimiter) GetLimiter(key string) RateLimiter {
    grl.mu.RLock()
    limiter, exists := grl.limiters[key]
    grl.mu.RUnlock()
    
    if exists {
        return limiter
    }
    
    // Create new limiter if it doesn't exist
    grl.mu.Lock()
    defer grl.mu.Unlock()
    
    // Double-check after acquiring write lock
    if limiter, exists = grl.limiters[key]; exists {
        return limiter
    }
    
    // Create new limiter with default settings
    limiter = NewTokenBucket(100, 10.0) // 100 requests, 10 per second
    grl.limiters[key] = limiter
    return limiter
}
```

### 2. Per-User Rate Limiter
```go
// Per-user rate limiting
type UserRateLimiter struct {
    userLimiters map[string]RateLimiter
    mu           sync.RWMutex
    defaultLimit int
    defaultRate  float64
}

func NewUserRateLimiter(defaultLimit int, defaultRate float64) *UserRateLimiter {
    return &UserRateLimiter{
        userLimiters: make(map[string]RateLimiter),
        defaultLimit: defaultLimit,
        defaultRate:  defaultRate,
    }
}

func (url *UserRateLimiter) Allow(userID string) bool {
    limiter := url.getUserLimiter(userID)
    return limiter.Allow()
}

func (url *UserRateLimiter) getUserLimiter(userID string) RateLimiter {
    url.mu.RLock()
    limiter, exists := url.userLimiters[userID]
    url.mu.RUnlock()
    
    if exists {
        return limiter
    }
    
    // Create new limiter for user
    url.mu.Lock()
    defer url.mu.Unlock()
    
    if limiter, exists = url.userLimiters[userID]; exists {
        return limiter
    }
    
    limiter = NewTokenBucket(url.defaultLimit, url.defaultRate)
    url.userLimiters[userID] = limiter
    return limiter
}
```

### 3. Per-API Endpoint Rate Limiter
```go
// Per-endpoint rate limiting
type EndpointRateLimiter struct {
    endpointLimiters map[string]RateLimiter
    mu               sync.RWMutex
    config           map[string]LimitConfig
}

type LimitConfig struct {
    Limit      int
    Rate       float64
    WindowSize time.Duration
}

func NewEndpointRateLimiter() *EndpointRateLimiter {
    return &EndpointRateLimiter{
        endpointLimiters: make(map[string]RateLimiter),
        config: map[string]LimitConfig{
            "/api/v1/products": {Limit: 1000, Rate: 100.0, WindowSize: time.Minute},
            "/api/v1/orders":   {Limit: 100, Rate: 10.0, WindowSize: time.Minute},
            "/api/v1/users":    {Limit: 500, Rate: 50.0, WindowSize: time.Minute},
        },
    }
}

func (erl *EndpointRateLimiter) Allow(endpoint string) bool {
    limiter := erl.getEndpointLimiter(endpoint)
    return limiter.Allow()
}
```

## Redis-Based Distributed Rate Limiting

### 1. Redis Rate Limiter
```go
// Redis-based rate limiter for distributed systems
type RedisRateLimiter struct {
    client  *redis.Client
    script  *redis.Script
}

func NewRedisRateLimiter(client *redis.Client) *RedisRateLimiter {
    // Lua script for atomic rate limiting
    script := redis.NewScript(`
        local key = KEYS[1]
        local limit = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local current = tonumber(ARGV[3])
        
        local count = redis.call('ZCARD', key)
        if count < limit then
            redis.call('ZADD', key, current, current)
            redis.call('EXPIRE', key, window)
            return 1
        else
            return 0
        end
    `)
    
    return &RedisRateLimiter{
        client: client,
        script: script,
    }
}

func (rrl *RedisRateLimiter) Allow(key string, limit int, window time.Duration) (bool, error) {
    now := time.Now().Unix()
    
    result, err := rrl.script.Run(
        rrl.client,
        []string{key},
        limit,
        int(window.Seconds()),
        now,
    ).Result()
    
    if err != nil {
        return false, err
    }
    
    return result.(int64) == 1, nil
}
```

### 2. Cluster-Aware Rate Limiting
```go
// Cluster-aware rate limiter
type ClusterRateLimiter struct {
    redisClient *redis.Client
    nodeID      string
    limiters    map[string]*RedisRateLimiter
    mu          sync.RWMutex
}

func NewClusterRateLimiter(client *redis.Client, nodeID string) *ClusterRateLimiter {
    return &ClusterRateLimiter{
        redisClient: client,
        nodeID:      nodeID,
        limiters:    make(map[string]*RedisRateLimiter),
    }
}

func (crl *ClusterRateLimiter) Allow(key string, limit int, window time.Duration) (bool, error) {
    // Add node ID to key for cluster isolation
    clusterKey := fmt.Sprintf("%s:%s", crl.nodeID, key)
    
    limiter := crl.getLimiter(key)
    return limiter.Allow(clusterKey, limit, window)
}
```

## HTTP Middleware Integration

### 1. Rate Limiting Middleware
```go
// HTTP middleware for rate limiting
func RateLimitMiddleware(limiter RateLimiter, keyExtractor func(*http.Request) string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            key := keyExtractor(r)
            
            allowed := limiter.Allow(key)
            if !allowed {
                // Set rate limit headers
                w.Header().Set("X-RateLimit-Limit", "100")
                w.Header().Set("X-RateLimit-Remaining", "0")
                w.Header().Set("X-RateLimit-Reset", time.Now().Add(time.Minute).Format(time.RFC1123))
                
                // Return rate limit error
                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusTooManyRequests)
                
                errorResponse := map[string]interface{}{
                    "error": "Rate limit exceeded",
                    "code":  "RATE_LIMIT_EXCEEDED",
                    "retry_after": 60,
                }
                
                json.NewEncoder(w).Encode(errorResponse)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}
```

### 2. Key Extraction Strategies
```go
// Different strategies for extracting rate limiting keys
func ExtractUserKey(r *http.Request) string {
    // Extract user ID from JWT token or session
    user := r.Context().Value("user")
    if user != nil {
        if claims, ok := user.(*Claims); ok {
            return fmt.Sprintf("user:%s", claims.UserID)
        }
    }
    return "anonymous"
}

func ExtractIPKey(r *http.Request) string {
    // Extract IP address
    ip := r.Header.Get("X-Forwarded-For")
    if ip == "" {
        ip = r.Header.Get("X-Real-IP")
    }
    if ip == "" {
        ip = r.RemoteAddr
    }
    return fmt.Sprintf("ip:%s", ip)
}

func ExtractEndpointKey(r *http.Request) string {
    // Extract API endpoint
    return fmt.Sprintf("endpoint:%s:%s", r.Method, r.URL.Path)
}
```

## Configuration Management

### 1. Rate Limit Configuration
```go
// Configuration structure for rate limiting
type RateLimitConfig struct {
    Global struct {
        Enabled bool `yaml:"enabled"`
        Limit   int  `yaml:"limit"`
        Rate    float64 `yaml:"rate"`
        Window  string `yaml:"window"`
    } `yaml:"global"`
    
    Users struct {
        Enabled bool `yaml:"enabled"`
        Limit   int  `yaml:"limit"`
        Rate    float64 `yaml:"rate"`
        Window  string `yaml:"window"`
    } `yaml:"users"`
    
    Endpoints map[string]struct {
        Enabled bool `yaml:"enabled"`
        Limit   int  `yaml:"limit"`
        Rate    float64 `yaml:"rate"`
        Window  string `yaml:"window"`
    } `yaml:"endpoints"`
}
```

### 2. Dynamic Configuration Updates
```go
// Dynamic rate limit configuration updates
type DynamicRateLimiter struct {
    config     *RateLimitConfig
    limiters   map[string]RateLimiter
    mu         sync.RWMutex
    configChan chan *RateLimitConfig
}

func (drl *DynamicRateLimiter) UpdateConfig(newConfig *RateLimitConfig) {
    drl.configChan <- newConfig
}

func (drl *DynamicRateLimiter) configUpdater() {
    for config := range drl.configChan {
        drl.mu.Lock()
        drl.config = config
        drl.updateLimiters()
        drl.mu.Unlock()
    }
}
```

## Monitoring and Metrics

### 1. Rate Limiting Metrics
```go
// Metrics collection for rate limiting
type RateLimitMetrics struct {
    requestsTotal    prometheus.Counter
    requestsAllowed  prometheus.Counter
    requestsBlocked  prometheus.Counter
    currentRequests  prometheus.Gauge
}

func NewRateLimitMetrics() *RateLimitMetrics {
    return &RateLimitMetrics{
        requestsTotal: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "rate_limit_requests_total",
            Help: "Total number of rate limit requests",
        }),
        requestsAllowed: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "rate_limit_requests_allowed",
            Help: "Number of rate limit requests allowed",
        }),
        requestsBlocked: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "rate_limit_requests_blocked",
            Help: "Number of rate limit requests blocked",
        }),
        currentRequests: prometheus.NewGauge(prometheus.GaugeOpts{
            Name: "rate_limit_current_requests",
            Help: "Current number of requests in rate limit window",
        }),
    }
}
```

### 2. Alerting and Notifications
```go
// Alerting for rate limit violations
type RateLimitAlerting struct {
    alertManager AlertManager
    thresholds   map[string]int
}

func (rla *RateLimitAlerting) CheckThresholds(key string, blockedCount int) {
    threshold, exists := rla.thresholds[key]
    if exists && blockedCount >= threshold {
        alert := Alert{
            Level:     "warning",
            Message:   fmt.Sprintf("Rate limit threshold exceeded for %s", key),
            Count:     blockedCount,
            Threshold: threshold,
            Timestamp: time.Now(),
        }
        
        rla.alertManager.SendAlert(alert)
    }
}
```

## Testing

### 1. Unit Tests
```go
func TestTokenBucket(t *testing.T) {
    bucket := NewTokenBucket(5, 1.0) // 5 tokens, 1 per second
    
    // Should allow 5 requests initially
    for i := 0; i < 5; i++ {
        assert.True(t, bucket.Allow())
    }
    
    // Should block the 6th request
    assert.False(t, bucket.Allow())
    
    // Wait for token refill
    time.Sleep(1100 * time.Millisecond)
    
    // Should allow 1 more request
    assert.True(t, bucket.Allow())
}
```

### 2. Integration Tests
```go
func TestRateLimitMiddleware(t *testing.T) {
    limiter := NewTokenBucket(10, 10.0)
    middleware := RateLimitMiddleware(limiter, ExtractIPKey)
    
    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    })
    
    server := httptest.NewServer(middleware(handler))
    defer server.Close()
    
    // Test rate limiting behavior
    // ...
}
```

## References
- [ADR-006: API Communication Patterns](../../architecture/decisions/ADR-006-api-communication-patterns.md)
- [ADR-009: Security & Authentication Architecture](../../architecture/decisions/ADR-009-security-authentication.md)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Redis Rate Limiting](https://redis.io/commands/incr/)
- [HTTP Rate Limiting Headers](https://tools.ietf.org/html/draft-polli-ratelimit-headers-03)
