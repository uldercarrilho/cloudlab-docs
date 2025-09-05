# Performance Standards for Distributed Systems

## Table of Contents
1. [Overview](#overview)
2. [Performance Principles](#performance-principles)
3. [Performance Targets & SLAs](#performance-targets--slas)
4. [Caching Strategies](#caching-strategies)
5. [Database Performance Optimization](#database-performance-optimization)
6. [API Performance Optimization](#api-performance-optimization)
7. [Resource Utilization Standards](#resource-utilization-standards)
8. [Performance Testing & Benchmarking](#performance-testing--benchmarking)
9. [Performance Monitoring & Alerting](#performance-monitoring--alerting)
10. [Implementation Guidelines](#implementation-guidelines)
11. [Best Practices Summary](#best-practices-summary)
12. [Validation Checklist](#validation-checklist)

---

## Overview

### Purpose
This document establishes comprehensive performance standards for the CloudLab distributed e-commerce platform, ensuring consistent performance optimization practices across all services and components. These standards align with business requirements for sub-200ms response times, 99.9% availability, and 10x traffic spike handling capabilities.

### Scope
- **Application Performance**: Response times, throughput, and resource utilization
- **Database Performance**: Query optimization, indexing, and connection management
- **Caching Performance**: Multi-level caching strategies and hit rates
- **API Performance**: Endpoint optimization and rate limiting
- **Infrastructure Performance**: Resource allocation and scaling strategies
- **Monitoring Performance**: Observability overhead and data collection efficiency

### Business Context
- **User Experience**: Sub-200ms response times for 95% of requests
- **Scalability**: Handle 10x traffic spikes during sales events
- **Cost Efficiency**: Optimize infrastructure costs while maintaining performance
- **Reliability**: 99.9% system uptime with graceful degradation
- **Compliance**: Performance monitoring for audit and compliance requirements

---

## Performance Principles

### 1. Performance by Design
- **Early Optimization**: Consider performance implications in design phase
- **Proactive Monitoring**: Implement performance monitoring from day one
- **Scalable Architecture**: Design for horizontal scaling and load distribution
- **Resource Efficiency**: Optimize resource utilization without compromising functionality

### 2. Distributed Systems Performance
- **Network Optimization**: Minimize network latency and bandwidth usage
- **Data Locality**: Keep data close to processing for reduced latency
- **Async Processing**: Use asynchronous patterns for non-critical operations
- **Circuit Breakers**: Implement fault tolerance to prevent cascade failures

### 3. Performance-First Development
- **Performance Testing**: Include performance tests in CI/CD pipeline
- **Benchmarking**: Establish baseline performance metrics for all components
- **Continuous Optimization**: Regular performance reviews and optimization cycles
- **Performance Budgets**: Set and enforce performance budgets for releases

---

## Performance Targets & SLAs

### Response Time Targets
| Operation Type | Target (95th percentile) | Maximum Acceptable | Critical Threshold |
|----------------|-------------------------|-------------------|-------------------|
| **API Endpoints** | < 200ms | < 500ms | < 1000ms |
| **Database Queries** | < 50ms | < 100ms | < 200ms |
| **Cache Operations** | < 10ms | < 25ms | < 50ms |
| **File Operations** | < 100ms | < 250ms | < 500ms |
| **External API Calls** | < 300ms | < 1000ms | < 2000ms |

### Throughput Targets
| Service Type | Target RPS | Peak RPS | Burst Capacity |
|--------------|------------|----------|----------------|
| **User Service** | 1,000 RPS | 5,000 RPS | 10,000 RPS |
| **Product Service** | 2,000 RPS | 10,000 RPS | 20,000 RPS |
| **Order Service** | 500 RPS | 2,500 RPS | 5,000 RPS |
| **Payment Service** | 200 RPS | 1,000 RPS | 2,000 RPS |
| **Analytics Service** | 100 RPS | 500 RPS | 1,000 RPS |

### Availability Targets
- **System Uptime**: 99.9% (8.77 hours downtime/year)
- **Service Availability**: 99.95% per service
- **Database Availability**: 99.99% with failover
- **Cache Availability**: 99.9% with fallback to database

### Resource Utilization Targets
| Resource Type | Target Utilization | Warning Threshold | Critical Threshold |
|---------------|-------------------|-------------------|-------------------|
| **CPU** | 60-70% | 80% | 90% |
| **Memory** | 70-80% | 85% | 95% |
| **Network** | 60-70% | 80% | 90% |
| **Disk I/O** | 70-80% | 85% | 95% |
| **Database Connections** | 60-70% | 80% | 90% |

---

## Caching Strategies

### Multi-Level Caching Architecture
Based on [ADR-011: Performance & Caching Architecture](../architecture/decisions/ADR-011-performance-caching.md)

#### 1. Application-Level Caching (Redis Cluster)
```go
// Cache configuration
type CacheConfig struct {
    Hosts           []string      `json:"hosts"`
    Password        string        `json:"password"`
    DB              int           `json:"db"`
    MaxRetries      int           `json:"max_retries"`
    DialTimeout     time.Duration `json:"dial_timeout"`
    ReadTimeout     time.Duration `json:"read_timeout"`
    WriteTimeout    time.Duration `json:"write_timeout"`
    PoolSize        int           `json:"pool_size"`
    MinIdleConns    int           `json:"min_idle_conns"`
    MaxConnAge      time.Duration `json:"max_conn_age"`
    PoolTimeout     time.Duration `json:"pool_timeout"`
    IdleTimeout     time.Duration `json:"idle_timeout"`
    IdleCheckFreq   time.Duration `json:"idle_check_freq"`
}

// Cache implementation
type CacheService struct {
    client *redis.ClusterClient
    config CacheConfig
}

func (c *CacheService) Get(ctx context.Context, key string) (string, error) {
    start := time.Now()
    defer func() {
        metrics.CacheOperationDuration.WithLabelValues("get").Observe(time.Since(start).Seconds())
    }()
    
    result, err := c.client.Get(ctx, key).Result()
    if err == redis.Nil {
        metrics.CacheMisses.WithLabelValues("get").Inc()
        return "", ErrCacheMiss
    }
    if err != nil {
        metrics.CacheErrors.WithLabelValues("get").Inc()
        return "", err
    }
    
    metrics.CacheHits.WithLabelValues("get").Inc()
    return result, nil
}

func (c *CacheService) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
    start := time.Now()
    defer func() {
        metrics.CacheOperationDuration.WithLabelValues("set").Observe(time.Since(start).Seconds())
    }()
    
    err := c.client.Set(ctx, key, value, expiration).Err()
    if err != nil {
        metrics.CacheErrors.WithLabelValues("set").Inc()
        return err
    }
    
    metrics.CacheOperations.WithLabelValues("set").Inc()
    return nil
}
```

#### 2. Cache-Aside Pattern
```go
func (s *UserService) GetUser(ctx context.Context, userID string) (*User, error) {
    // Try cache first
    cacheKey := fmt.Sprintf("user:%s", userID)
    cachedUser, err := s.cache.Get(ctx, cacheKey)
    if err == nil {
        var user User
        if err := json.Unmarshal([]byte(cachedUser), &user); err == nil {
            return &user, nil
        }
    }
    
    // Cache miss - fetch from database
    user, err := s.userRepo.GetByID(ctx, userID)
    if err != nil {
        return nil, err
    }
    
    // Update cache asynchronously
    go func() {
        userData, _ := json.Marshal(user)
        s.cache.Set(context.Background(), cacheKey, userData, 15*time.Minute)
    }()
    
    return user, nil
}
```

#### 3. Write-Through Pattern
```go
func (s *UserService) UpdateUser(ctx context.Context, user *User) error {
    // Update database first
    if err := s.userRepo.Update(ctx, user); err != nil {
        return err
    }
    
    // Update cache
    cacheKey := fmt.Sprintf("user:%s", user.ID)
    userData, err := json.Marshal(user)
    if err != nil {
        return err
    }
    
    return s.cache.Set(ctx, cacheKey, userData, 15*time.Minute)
}
```

#### 4. Cache Invalidation Strategies
```go
// TTL-based expiration
const (
    UserCacheTTL     = 15 * time.Minute
    ProductCacheTTL  = 30 * time.Minute
    OrderCacheTTL    = 5 * time.Minute
    SessionCacheTTL  = 24 * time.Hour
)

// Event-based invalidation
func (s *UserService) OnUserUpdated(ctx context.Context, event UserUpdatedEvent) {
    cacheKey := fmt.Sprintf("user:%s", event.UserID)
    s.cache.Delete(ctx, cacheKey)
    
    // Invalidate related caches
    s.cache.Delete(ctx, fmt.Sprintf("user_profile:%s", event.UserID))
    s.cache.Delete(ctx, fmt.Sprintf("user_preferences:%s", event.UserID))
}
```

### Cache Performance Targets
- **Hit Rate**: > 95% for read operations
- **Response Time**: < 10ms for cache operations
- **Availability**: 99.9% with database fallback
- **Memory Usage**: < 80% of allocated cache memory

---

## Database Performance Optimization

### Query Optimization Standards

#### 1. Indexing Strategy
```sql
-- Primary indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY idx_products_category_id ON products(category_id);
CREATE INDEX CONCURRENTLY idx_orders_user_id_created_at ON orders(user_id, created_at);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY idx_orders_status_created_at ON orders(status, created_at);
CREATE INDEX CONCURRENTLY idx_products_category_status ON products(category_id, status);

-- Partial indexes for filtered queries
CREATE INDEX CONCURRENTLY idx_orders_active ON orders(user_id) WHERE status IN ('pending', 'processing');
CREATE INDEX CONCURRENTLY idx_products_available ON products(category_id) WHERE status = 'active' AND stock > 0;
```

#### 2. Query Performance Standards
```go
// Query timeout configuration
const (
    DefaultQueryTimeout = 30 * time.Second
    ReadQueryTimeout    = 10 * time.Second
    WriteQueryTimeout   = 30 * time.Second
    AnalyticsQueryTimeout = 5 * time.Minute
)

// Query performance monitoring
func (r *UserRepository) GetByID(ctx context.Context, id string) (*User, error) {
    start := time.Now()
    defer func() {
        duration := time.Since(start)
        metrics.DatabaseQueryDuration.WithLabelValues("users", "get_by_id").Observe(duration.Seconds())
        
        if duration > 100*time.Millisecond {
            log.Warn("Slow query detected", 
                "operation", "get_by_id",
                "table", "users",
                "duration", duration,
                "user_id", id)
        }
    }()
    
    ctx, cancel := context.WithTimeout(ctx, ReadQueryTimeout)
    defer cancel()
    
    var user User
    err := r.db.GetContext(ctx, &user, "SELECT * FROM users WHERE id = $1", id)
    return &user, err
}
```

#### 3. Connection Pool Management
```go
type DatabaseConfig struct {
    Host            string        `json:"host"`
    Port            int           `json:"port"`
    Database        string        `json:"database"`
    Username        string        `json:"username"`
    Password        string        `json:"password"`
    SSLMode         string        `json:"ssl_mode"`
    MaxOpenConns    int           `json:"max_open_conns"`
    MaxIdleConns    int           `json:"max_idle_conns"`
    ConnMaxLifetime time.Duration `json:"conn_max_lifetime"`
    ConnMaxIdleTime time.Duration `json:"conn_max_idle_time"`
}

func NewDatabase(config DatabaseConfig) (*sql.DB, error) {
    dsn := fmt.Sprintf("host=%s port=%d dbname=%s user=%s password=%s sslmode=%s",
        config.Host, config.Port, config.Database, config.Username, config.Password, config.SSLMode)
    
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, err
    }
    
    // Configure connection pool
    db.SetMaxOpenConns(config.MaxOpenConns)
    db.SetMaxIdleConns(config.MaxIdleConns)
    db.SetConnMaxLifetime(config.ConnMaxLifetime)
    db.SetConnMaxIdleTime(config.ConnMaxIdleTime)
    
    // Test connection
    if err := db.Ping(); err != nil {
        return nil, err
    }
    
    return db, nil
}
```

### Database Performance Targets
- **Query Response Time**: < 50ms for 95% of queries
- **Connection Pool Utilization**: 60-70% under normal load
- **Index Usage**: > 90% of queries use indexes
- **Lock Wait Time**: < 10ms for 95% of operations

---

## API Performance Optimization

### 1. Response Time Optimization
```go
// API middleware for performance monitoring
func PerformanceMiddleware() gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        start := time.Now()
        
        c.Next()
        
        duration := time.Since(start)
        status := c.Writer.Status()
        
        // Record metrics
        metrics.APIRequestDuration.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
            strconv.Itoa(status),
        ).Observe(duration.Seconds())
        
        // Log slow requests
        if duration > 200*time.Millisecond {
            log.Warn("Slow API request",
                "method", c.Request.Method,
                "path", c.FullPath(),
                "status", status,
                "duration", duration,
                "user_agent", c.Request.UserAgent(),
                "ip", c.ClientIP())
        }
    })
}
```

### 2. Request/Response Optimization
```go
// Response compression
func CompressionMiddleware() gin.HandlerFunc {
    return gzip.Gzip(gzip.DefaultCompression)
}

// Request size limiting
func RequestSizeLimitMiddleware() gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        if c.Request.ContentLength > 10*1024*1024 { // 10MB limit
            c.JSON(http.StatusRequestEntityTooLarge, gin.H{
                "error": "Request entity too large",
                "max_size": "10MB",
            })
            c.Abort()
            return
        }
        c.Next()
    })
}

// Response pagination
type PaginationParams struct {
    Page     int `form:"page" binding:"min=1"`
    PageSize int `form:"page_size" binding:"min=1,max=100"`
}

func (p *PaginationParams) Offset() int {
    return (p.Page - 1) * p.PageSize
}

func (p *PaginationParams) Limit() int {
    if p.PageSize == 0 {
        return 20 // default page size
    }
    return p.PageSize
}
```

### 3. Rate Limiting Implementation
```go
// Rate limiting based on ADR-006
type RateLimiter struct {
    limiter *rate.Limiter
    burst   int
}

func NewRateLimiter(rps int, burst int) *RateLimiter {
    return &RateLimiter{
        limiter: rate.NewLimiter(rate.Limit(rps), burst),
        burst:   burst,
    }
}

func (rl *RateLimiter) Allow() bool {
    return rl.limiter.Allow()
}

func (rl *RateLimiter) Wait(ctx context.Context) error {
    return rl.limiter.Wait(ctx)
}

// Rate limiting middleware
func RateLimitMiddleware(rps int, burst int) gin.HandlerFunc {
    limiter := NewRateLimiter(rps, burst)
    
    return gin.HandlerFunc(func(c *gin.Context) {
        if !limiter.Allow() {
            c.JSON(http.StatusTooManyRequests, gin.H{
                "error": "Rate limit exceeded",
                "retry_after": time.Until(time.Now().Add(time.Second)),
            })
            c.Abort()
            return
        }
        c.Next()
    })
}
```

### API Performance Targets
- **Response Time**: < 200ms for 95% of requests
- **Throughput**: Meet service-specific RPS targets
- **Error Rate**: < 0.1% for successful operations
- **Availability**: 99.9% uptime per service

---

## Resource Utilization Standards

### 1. CPU Optimization
```go
// CPU profiling configuration
func EnableCPUProfiling() {
    if os.Getenv("ENABLE_CPU_PROFILING") == "true" {
        f, err := os.Create("cpu.prof")
        if err != nil {
            log.Fatal("Could not create CPU profile: ", err)
        }
        defer f.Close()
        
        if err := pprof.StartCPUProfile(f); err != nil {
            log.Fatal("Could not start CPU profile: ", err)
        }
        defer pprof.StopCPUProfile()
    }
}

// Goroutine pool for CPU-intensive tasks
type WorkerPool struct {
    workers    int
    jobQueue   chan Job
    workerPool chan chan Job
    quit       chan bool
}

func NewWorkerPool(workers int, jobQueue chan Job) *WorkerPool {
    return &WorkerPool{
        workers:    workers,
        jobQueue:   jobQueue,
        workerPool: make(chan chan Job, workers),
        quit:       make(chan bool),
    }
}

func (wp *WorkerPool) Start() {
    for i := 0; i < wp.workers; i++ {
        worker := NewWorker(wp.workerPool)
        worker.Start()
    }
    
    go wp.dispatch()
}

func (wp *WorkerPool) dispatch() {
    for {
        select {
        case job := <-wp.jobQueue:
            go func(job Job) {
                jobChannel := <-wp.workerPool
                jobChannel <- job
            }(job)
        case <-wp.quit:
            return
        }
    }
}
```

### 2. Memory Optimization
```go
// Memory monitoring
func MonitorMemoryUsage() {
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        var m runtime.MemStats
        runtime.ReadMemStats(&m)
        
        metrics.MemoryAllocated.Set(float64(m.Alloc))
        metrics.MemoryTotalAllocated.Set(float64(m.TotalAlloc))
        metrics.MemorySystem.Set(float64(m.Sys))
        metrics.GCPauseTotal.Set(float64(m.PauseTotalNs))
        
        // Alert if memory usage is high
        if m.Alloc > 1024*1024*1024 { // 1GB
            log.Warn("High memory usage detected",
                "allocated", m.Alloc,
                "total_allocated", m.TotalAlloc,
                "system", m.Sys)
        }
    }
}

// Object pooling for frequently allocated objects
var userPool = sync.Pool{
    New: func() interface{} {
        return &User{}
    },
}

func GetUser() *User {
    return userPool.Get().(*User)
}

func PutUser(user *User) {
    // Reset user fields
    *user = User{}
    userPool.Put(user)
}
```

### 3. Network Optimization
```go
// HTTP client optimization
func NewOptimizedHTTPClient() *http.Client {
    transport := &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        IdleConnTimeout:     90 * time.Second,
        TLSHandshakeTimeout: 10 * time.Second,
        DisableKeepAlives:   false,
    }
    
    return &http.Client{
        Transport: transport,
        Timeout:   30 * time.Second,
    }
}

// Connection reuse
type HTTPClientPool struct {
    clients []*http.Client
    current int64
    mutex   sync.Mutex
}

func (p *HTTPClientPool) Get() *http.Client {
    p.mutex.Lock()
    defer p.mutex.Unlock()
    
    client := p.clients[p.current%int64(len(p.clients))]
    p.current++
    return client
}
```

### Resource Utilization Targets
- **CPU Usage**: 60-70% under normal load, < 90% under peak load
- **Memory Usage**: 70-80% under normal load, < 95% under peak load
- **Network Bandwidth**: 60-70% utilization, < 90% under peak load
- **Disk I/O**: 70-80% utilization, < 95% under peak load

---

## Performance Testing & Benchmarking

### 1. Load Testing Framework
```go
// Load testing configuration
type LoadTestConfig struct {
    Duration    time.Duration `json:"duration"`
    RPS         int           `json:"rps"`
    Users       int           `json:"users"`
    RampUp      time.Duration `json:"ramp_up"`
    Endpoints   []string      `json:"endpoints"`
    Headers     map[string]string `json:"headers"`
}

// Load test implementation
func RunLoadTest(config LoadTestConfig) error {
    client := NewOptimizedHTTPClient()
    
    // Create workers
    for i := 0; i < config.Users; i++ {
        go func(workerID int) {
            ticker := time.NewTicker(time.Second / time.Duration(config.RPS/config.Users))
            defer ticker.Stop()
            
            for range ticker.C {
                endpoint := config.Endpoints[rand.Intn(len(config.Endpoints))]
                start := time.Now()
                
                req, err := http.NewRequest("GET", endpoint, nil)
                if err != nil {
                    continue
                }
                
                // Add headers
                for key, value := range config.Headers {
                    req.Header.Set(key, value)
                }
                
                resp, err := client.Do(req)
                duration := time.Since(start)
                
                if err != nil {
                    metrics.LoadTestErrors.WithLabelValues(endpoint).Inc()
                    continue
                }
                resp.Body.Close()
                
                // Record metrics
                metrics.LoadTestDuration.WithLabelValues(endpoint, strconv.Itoa(resp.StatusCode)).Observe(duration.Seconds())
                metrics.LoadTestRequests.WithLabelValues(endpoint).Inc()
            }
        }(i)
    }
    
    time.Sleep(config.Duration)
    return nil
}
```

### 2. Benchmark Testing
```go
// Benchmark for critical functions
func BenchmarkUserService_GetUser(b *testing.B) {
    service := setupUserService()
    userID := "test-user-id"
    
    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            _, err := service.GetUser(context.Background(), userID)
            if err != nil {
                b.Fatal(err)
            }
        }
    })
}

func BenchmarkCacheService_Get(b *testing.B) {
    cache := setupCacheService()
    key := "test-key"
    value := "test-value"
    
    // Pre-populate cache
    cache.Set(context.Background(), key, value, time.Hour)
    
    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            _, err := cache.Get(context.Background(), key)
            if err != nil {
                b.Fatal(err)
            }
        }
    })
}
```

### 3. Performance Regression Testing
```go
// Performance regression test
func TestPerformanceRegression(t *testing.T) {
    // Baseline performance metrics
    baselineMetrics := map[string]float64{
        "api_response_time_p95": 200.0, // ms
        "database_query_time_p95": 50.0, // ms
        "cache_hit_rate": 95.0, // %
        "memory_usage_p95": 80.0, // %
    }
    
    // Run performance tests
    results := runPerformanceTests()
    
    // Check for regressions
    for metric, baseline := range baselineMetrics {
        current := results[metric]
        if current > baseline*1.1 { // 10% tolerance
            t.Errorf("Performance regression detected for %s: baseline=%.2f, current=%.2f", 
                metric, baseline, current)
        }
    }
}
```

### Performance Testing Targets
- **Load Testing**: Validate 10x traffic spike handling
- **Stress Testing**: Identify breaking points and failure modes
- **Endurance Testing**: Validate performance over extended periods
- **Spike Testing**: Test sudden traffic increases and decreases

---

## Performance Monitoring & Alerting

### 1. Metrics Collection
```go
// Performance metrics
var (
    APIRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "api_request_duration_seconds",
            Help: "API request duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint", "status"},
    )
    
    DatabaseQueryDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "database_query_duration_seconds",
            Help: "Database query duration in seconds",
            Buckets: []float64{0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0},
        },
        []string{"table", "operation"},
    )
    
    CacheHitRate = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "cache_hit_rate",
            Help: "Cache hit rate percentage",
        },
        []string{"cache_type"},
    )
    
    ResourceUtilization = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "resource_utilization_percent",
            Help: "Resource utilization percentage",
        },
        []string{"resource_type"},
    )
)

func init() {
    prometheus.MustRegister(APIRequestDuration)
    prometheus.MustRegister(DatabaseQueryDuration)
    prometheus.MustRegister(CacheHitRate)
    prometheus.MustRegister(ResourceUtilization)
}
```

### 2. Alerting Rules
```yaml
# Prometheus alerting rules
groups:
- name: performance_alerts
  rules:
  - alert: HighAPIResponseTime
    expr: histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m])) > 0.2
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High API response time detected"
      description: "95th percentile API response time is {{ $value }}s, exceeding 200ms threshold"
  
  - alert: HighDatabaseQueryTime
    expr: histogram_quantile(0.95, rate(database_query_duration_seconds_bucket[5m])) > 0.05
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High database query time detected"
      description: "95th percentile database query time is {{ $value }}s, exceeding 50ms threshold"
  
  - alert: LowCacheHitRate
    expr: cache_hit_rate < 90
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Low cache hit rate detected"
      description: "Cache hit rate is {{ $value }}%, below 90% threshold"
  
  - alert: HighResourceUtilization
    expr: resource_utilization_percent > 90
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High resource utilization detected"
      description: "{{ $labels.resource_type }} utilization is {{ $value }}%, exceeding 90% threshold"
```

### 3. Performance Dashboards
```json
{
  "dashboard": {
    "title": "Performance Monitoring Dashboard",
    "panels": [
      {
        "title": "API Response Time (95th percentile)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{endpoint}}"
          }
        ]
      },
      {
        "title": "Database Query Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(database_query_duration_seconds_bucket[5m]))",
            "legendFormat": "{{table}} - {{operation}}"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "cache_hit_rate",
            "legendFormat": "{{cache_type}}"
          }
        ]
      },
      {
        "title": "Resource Utilization",
        "type": "graph",
        "targets": [
          {
            "expr": "resource_utilization_percent",
            "legendFormat": "{{resource_type}}"
          }
        ]
      }
    ]
  }
}
```

### Monitoring Targets
- **Response Time Monitoring**: Real-time API and database performance tracking
- **Resource Monitoring**: CPU, memory, network, and disk utilization tracking
- **Cache Monitoring**: Hit rates, miss rates, and eviction patterns
- **Error Rate Monitoring**: Failed requests and error patterns

---

## Implementation Guidelines

### 1. Performance-First Development Process

#### Design Phase
- [ ] **Performance requirements defined** - Clear performance targets established
- [ ] **Scalability considered** - System designed to handle expected load growth
- [ ] **Caching strategy defined** - Appropriate caching layers identified and planned
- [ ] **Database optimization planned** - Query optimization and indexing strategy defined

#### Implementation Phase
- [ ] **Performance tests written** - Unit and integration performance tests implemented
- [ ] **Benchmarking completed** - Baseline performance metrics established
- [ ] **Resource usage validated** - Memory, CPU, and I/O usage within acceptable limits
- [ ] **Monitoring implemented** - Performance metrics collection and alerting configured

#### Testing Phase
- [ ] **Load testing completed** - System tested under expected production load
- [ ] **Performance regression tested** - Changes don't degrade existing performance
- [ ] **Stress testing completed** - System behavior under extreme load conditions
- [ ] **Endurance testing completed** - Long-running performance stability validated

#### Validation Requirements
- [ ] Performance requirements must be defined before implementation
- [ ] Performance tests must be written and passing
- [ ] Load testing must be completed with acceptable results

### 2. Performance Code Review Guidelines

#### Code Quality
- [ ] **Efficient algorithms used** - Appropriate algorithms selected for performance requirements
- [ ] **Unnecessary allocations avoided** - Memory allocations minimized and optimized
- [ ] **Proper error handling implemented** - Error handling doesn't impact performance
- [ ] **Resource cleanup implemented** - Proper cleanup of resources to prevent leaks

#### Performance Patterns
- [ ] **Caching implemented** - Appropriate caching strategies applied where beneficial
- [ ] **Async processing used** - Non-blocking operations implemented where appropriate
- [ ] **Connection pooling used** - Database and external service connections pooled
- [ ] **Batch processing used** - Bulk operations implemented for efficiency

#### Monitoring
- [ ] **Metrics instrumented** - Performance metrics collected at key points
- [ ] **Logging optimized** - Logging doesn't impact performance in production
- [ ] **Tracing implemented** - Distributed tracing for performance analysis
- [ ] **Alerting configured** - Performance degradation alerts properly configured

### 3. Performance Optimization Workflow

#### Step 1: Measure
- [ ] **Baseline metrics established** - Current performance metrics documented
- [ ] **Current metrics collected** - Performance data gathered from production/monitoring
- [ ] **Key performance indicators identified** - Critical metrics for optimization focus

#### Step 2: Analyze
- [ ] **Bottlenecks identified** - Performance bottlenecks located and documented
- [ ] **Optimization areas prioritized** - Areas with highest impact potential identified
- [ ] **Root cause analysis completed** - Underlying causes of performance issues understood

#### Step 3: Optimize
- [ ] **Optimization plan created** - Specific optimizations planned with expected impact
- [ ] **Impact assessment completed** - Expected performance improvements quantified
- [ ] **Effort estimation done** - Development effort required for each optimization estimated
- [ ] **Risk assessment completed** - Potential risks and mitigation strategies identified

#### Step 4: Validate
- [ ] **Post-optimization metrics collected** - Performance after optimization measured
- [ ] **Improvement percentage calculated** - Actual vs expected improvements compared
- [ ] **Regression testing completed** - No negative impact on other system areas
- [ ] **Long-term monitoring established** - Ongoing performance tracking implemented

#### Optimization Documentation Template
For each optimization, document:
- **Area**: Which system component is being optimized
- **Description**: What specific optimization is being implemented
- **Impact**: Expected performance improvement (quantified)
- **Effort**: Development time and complexity required
- **Risk**: Potential negative impacts and mitigation strategies

---

## Best Practices Summary

### 1. Performance by Design
- **Early Optimization**: Consider performance implications in design phase
- **Scalable Architecture**: Design for horizontal scaling and load distribution
- **Resource Efficiency**: Optimize resource utilization without compromising functionality
- **Proactive Monitoring**: Implement performance monitoring from day one

### 2. Caching Best Practices
- **Multi-Level Caching**: Implement application, database, and CDN caching
- **Cache-Aside Pattern**: Use for read-heavy workloads
- **Write-Through Pattern**: Use for write-heavy workloads with consistency requirements
- **Cache Invalidation**: Implement TTL and event-based invalidation strategies

### 3. Database Optimization
- **Indexing Strategy**: Create indexes for common query patterns
- **Query Optimization**: Use EXPLAIN ANALYZE for query performance analysis
- **Connection Pooling**: Configure appropriate connection pool sizes
- **Query Timeouts**: Implement query timeouts to prevent resource exhaustion

### 4. API Performance
- **Response Compression**: Use gzip compression for large responses
- **Pagination**: Implement pagination for large result sets
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Request Size Limits**: Set appropriate request size limits

### 5. Resource Management
- **CPU Optimization**: Use worker pools for CPU-intensive tasks
- **Memory Management**: Implement object pooling and memory monitoring
- **Network Optimization**: Use connection pooling and keep-alive connections
- **Resource Monitoring**: Monitor resource utilization and set appropriate thresholds

### 6. Testing and Monitoring
- **Performance Testing**: Include performance tests in CI/CD pipeline
- **Load Testing**: Validate system behavior under expected load
- **Stress Testing**: Identify breaking points and failure modes
- **Continuous Monitoring**: Implement real-time performance monitoring and alerting

---

## Validation Checklist

### Performance Requirements Validation
- [ ] **Response Time Targets**: All services meet < 200ms response time for 95% of requests
- [ ] **Throughput Targets**: All services meet defined RPS targets
- [ ] **Availability Targets**: System maintains 99.9% uptime
- [ ] **Resource Utilization**: CPU, memory, and network utilization within targets

### Caching Implementation Validation
- [ ] **Cache Hit Rate**: > 95% hit rate for read operations
- [ ] **Cache Response Time**: < 10ms for cache operations
- [ ] **Cache Availability**: 99.9% availability with fallback
- [ ] **Cache Invalidation**: Proper TTL and event-based invalidation

### Database Performance Validation
- [ ] **Query Performance**: < 50ms for 95% of database queries
- [ ] **Index Usage**: > 90% of queries use appropriate indexes
- [ ] **Connection Pool**: Proper connection pool configuration and utilization
- [ ] **Query Timeouts**: Appropriate timeout configuration

### API Performance Validation
- [ ] **Response Compression**: gzip compression implemented
- [ ] **Rate Limiting**: Appropriate rate limiting configured
- [ ] **Request Size Limits**: Proper request size limits set
- [ ] **Error Handling**: Proper error responses and status codes

### Monitoring and Alerting Validation
- [ ] **Metrics Collection**: All performance metrics collected
- [ ] **Alerting Rules**: Appropriate alerting thresholds configured
- [ ] **Dashboards**: Performance dashboards created and accessible
- [ ] **Incident Response**: Performance incident response procedures defined

### Testing Validation
- [ ] **Load Testing**: System handles expected load
- [ ] **Stress Testing**: Breaking points identified
- [ ] **Performance Regression**: No performance regressions detected
- [ ] **Benchmarking**: Baseline performance metrics established

---

## References

### Architecture Decision Records
- [ADR-011: Performance & Caching Architecture](../architecture/decisions/ADR-011-performance-caching.md)
- [ADR-008: Monitoring & Observability](../architecture/decisions/ADR-008-monitoring-observability.md)
- [ADR-004: Data Storage & Consistency Patterns](../architecture/decisions/ADR-004-data-storage-consistency-patterns.md)

### Related Guidelines
- [Database Design Standards](./database-design-standards.md)
- [Monitoring & Observability Standards](./monitoring-observability-standards.md)
- [Error Handling Patterns](./error-handling-patterns.md)
- [Testing Guidelines](./testing-guidelines.md)

### External Resources
- [Go Performance Best Practices](https://golang.org/doc/diagnostics.html)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Prometheus Monitoring](https://prometheus.io/docs/guides/go-application/)

---

**Document Version**: 1.0  
**Created**: 2025-09-05
