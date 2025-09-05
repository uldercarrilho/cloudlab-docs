# Monitoring & Observability Standards

## Overview

This document establishes comprehensive monitoring and observability standards for the CloudLab distributed e-commerce platform. These standards ensure operational excellence, rapid incident response, and data-driven decision making across all microservices and infrastructure components.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Metrics Collection Standards](#metrics-collection-standards)
3. [Logging Standards](#logging-standards)
4. [Distributed Tracing Standards](#distributed-tracing-standards)
5. [Health Check Implementation](#health-check-implementation)
6. [Alerting and Notification](#alerting-and-notification)
7. [Dashboard Standards](#dashboard-standards)
8. [Performance Monitoring](#performance-monitoring)
9. [Security and Compliance](#security-and-compliance)
10. [Implementation Guidelines](#implementation-guidelines)
11. [Testing and Validation](#testing-and-validation)
12. [Best Practices Summary](#best-practices-summary)

---

## Architecture Overview

### Observability Stack

Our monitoring architecture follows ADR-008 and implements a comprehensive observability stack:

- **Metrics**: Prometheus + Grafana
- **Logging**: Loki + Grafana (operational), ELK Stack (business analytics)
- **Tracing**: Jaeger with OpenTelemetry
- **Alerting**: PagerDuty integration
- **APM**: Custom instrumentation

### Data Flow Architecture

```
┌─────────────┐      ┌─────────────┐    ┌─────────────┐     ┌─────────────┐
│   Service   │────▶│  Prometheus │───▶│   Grafana   │───▶│   Alerts    │
│  (Metrics)  │      │ (Scraping)  │    │(Dashboards) │     │(PagerDuty)  │
└─────────────┘      └─────────────┘    └─────────────┘     └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Service   │───▶│     Loki     │───▶│   Grafana   │───▶│     Log     │
│   (Logs)    │     │  (Log Agg)  │     │ (Log Views) │     │   Analysis  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Service   │───▶│    Jaeger    │───▶│   Jaeger    │───▶│    Trace    │
│  (Traces)   │     │ (Collector) │     │  (Query UI) │     │  Analysis   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Data Retention Policies

- **Metrics (Prometheus)**: 15 days high-resolution, 1 year aggregated
- **Logs (Loki)**: 1 year application logs, 7 years audit logs
- **Business Analytics (ELK)**: 2 years detailed, 7 years aggregated
- **Traces (Jaeger)**: 7 days detailed, 30 days aggregated
- **Compliance Data**: 7 years minimum retention

---

## Metrics Collection Standards

### Prometheus Integration

#### Basic Metrics Setup

```go
// internal/monitoring/metrics.go
package monitoring

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
    // HTTP Request Metrics
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status", "service"},
    )
    
    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint", "service"},
    )
    
    // Business Metrics
    ordersProcessed = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "orders_processed_total",
            Help: "Total number of orders processed",
        },
        []string{"status", "payment_method", "service"},
    )
    
    // System Metrics
    activeConnections = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "active_connections",
            Help: "Number of active connections",
        },
        []string{"service", "connection_type"},
    )
)

func init() {
    prometheus.MustRegister(
        httpRequestsTotal,
        httpRequestDuration,
        ordersProcessed,
        activeConnections,
    )
}
```

#### Middleware Implementation

```go
// internal/middleware/metrics.go
package middleware

import (
    "strconv"
    "time"
    
    "github.com/gin-gonic/gin"
    "github.com/prometheus/client_golang/prometheus"
)

func MetricsMiddleware(serviceName string) gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        
        c.Next()
        
        duration := time.Since(start).Seconds()
        status := strconv.Itoa(c.Writer.Status())
        
        // Record metrics
        httpRequestsTotal.WithLabelValues(
            c.Request.Method,
            c.Request.URL.Path,
            status,
            serviceName,
        ).Inc()
        
        httpRequestDuration.WithLabelValues(
            c.Request.Method,
            c.Request.URL.Path,
            serviceName,
        ).Observe(duration)
    }
}
```

### Service Level Indicators (SLIs)

#### Availability SLI
```promql
# Availability percentage over 5-minute windows
(
  sum(rate(http_requests_total{status=~"2..|3.."}[5m])) /
  sum(rate(http_requests_total[5m]))
) * 100
```

#### Latency SLI
```promql
# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### Error Rate SLI
```promql
# Error rate percentage
(
  sum(rate(http_requests_total{status=~"4..|5.."}[5m])) /
  sum(rate(http_requests_total[5m]))
) * 100
```

#### Throughput SLI
```promql
# Requests per second
sum(rate(http_requests_total[5m]))
```

### Service Level Objectives (SLOs)

- **Availability**: 99.9% uptime over 30-day rolling window
- **Latency**: 95% of requests complete within 200ms
- **Error Rate**: < 0.1% error rate over 5-minute windows
- **Throughput**: Handle 1000 RPS without degradation

---

## Logging Standards

### Structured Logging Implementation

#### Logger Setup

```go
// internal/logging/logger.go
package logging

import (
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

func SetupLogger(serviceName string) *zap.Logger {
    config := zap.NewProductionConfig()
    config.EncoderConfig.TimeKey = "timestamp"
    config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
    config.EncoderConfig.MessageKey = "message"
    config.EncoderConfig.LevelKey = "level"
    config.EncoderConfig.CallerKey = "caller"
    
    // Add service name to all logs
    config.InitialFields = map[string]interface{}{
        "service": serviceName,
    }
    
    logger, err := config.Build()
    if err != nil {
        panic(err)
    }
    
    return logger
}
```

#### Logging Patterns

```go
// Usage in services
func (h *Handler) ProcessOrder(c *gin.Context) {
    logger := h.logger.With(
        zap.String("user_id", c.GetString("user_id")),
        zap.String("order_id", c.Param("order_id")),
        zap.String("trace_id", c.GetHeader("X-Trace-ID")),
        zap.String("request_id", c.GetHeader("X-Request-ID")),
    )
    
    logger.Info("Processing order request",
        zap.String("action", "order_processing_started"),
        zap.String("payment_method", c.GetHeader("X-Payment-Method")),
    )
    
    // ... order processing logic
    
    logger.Info("Order processed successfully",
        zap.String("action", "order_processing_completed"),
        zap.String("status", "completed"),
        zap.Duration("processing_time", time.Since(start)),
        zap.Float64("order_value", orderValue),
    )
}
```

### Log Levels and Usage

- **ERROR**: System errors, exceptions, failures
- **WARN**: Warning conditions, degraded performance
- **INFO**: General information, business events
- **DEBUG**: Detailed debugging information (development only)

### Log Format Standards

```json
{
  "timestamp": "2025-01-27T18:00:00Z",
  "level": "info",
  "service": "order-service",
  "message": "Order processed successfully",
  "user_id": "user_123",
  "order_id": "order_456",
  "trace_id": "trace_789",
  "request_id": "req_101",
  "action": "order_processing_completed",
  "status": "completed",
  "processing_time": "150ms",
  "order_value": 99.99
}
```

---

## Distributed Tracing Standards

### OpenTelemetry Integration

#### Tracer Setup

```go
// internal/tracing/tracer.go
package tracing

import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/jaeger"
    "go.opentelemetry.io/otel/sdk/trace"
    "go.opentelemetry.io/otel/sdk/resource"
    semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

func SetupTracing(serviceName string) (*trace.TracerProvider, error) {
    // Jaeger exporter
    exp, err := jaeger.New(jaeger.WithCollectorEndpoint(
        jaeger.WithEndpoint("http://jaeger:14268/api/traces"),
    ))
    if err != nil {
        return nil, err
    }
    
    tp := trace.NewTracerProvider(
        trace.WithBatcher(exp),
        trace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String(serviceName),
            semconv.ServiceVersionKey.String("1.0.0"),
        )),
    )
    
    otel.SetTracerProvider(tp)
    return tp, nil
}
```

#### Tracing Implementation

```go
// Usage in HTTP handlers
func (h *Handler) GetUser(c *gin.Context) {
    ctx := c.Request.Context()
    tracer := otel.Tracer("user-service")
    
    ctx, span := tracer.Start(ctx, "GetUser")
    defer span.End()
    
    span.SetAttributes(
        attribute.String("user.id", c.Param("id")),
        attribute.String("request.method", c.Request.Method),
        attribute.String("request.path", c.Request.URL.Path),
    )
    
    // Database call with child span
    ctx, dbSpan := tracer.Start(ctx, "Database.GetUser")
    user, err := h.userRepo.GetByID(ctx, userID)
    dbSpan.End()
    
    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
        return
    }
    
    span.SetAttributes(
        attribute.String("user.email", user.Email),
        attribute.String("user.status", user.Status),
    )
    
    span.SetStatus(codes.Ok, "User retrieved successfully")
    c.JSON(http.StatusOK, user)
}
```

### Trace Context Propagation

```go
// HTTP client with trace propagation
func (c *HTTPClient) DoWithTracing(ctx context.Context, req *http.Request) (*http.Response, error) {
    // Propagate trace context
    req = req.WithContext(ctx)
    
    // Add trace headers
    propagator := otel.GetTextMapPropagator()
    propagator.Inject(ctx, propagation.HeaderCarrier(req.Header))
    
    return c.client.Do(req)
}
```

---

## Health Check Implementation

### Health Check Endpoints

```go
// internal/health/health.go
package health

import (
    "context"
    "net/http"
    "time"
)

type HealthStatus struct {
    Status    string            `json:"status"`
    Timestamp time.Time         `json:"timestamp"`
    Version   string            `json:"version"`
    Checks    map[string]Check  `json:"checks"`
}

type Check struct {
    Status  string `json:"status"`
    Message string `json:"message"`
    Latency string `json:"latency,omitempty"`
}

func (h *Handler) HealthCheck(c *gin.Context) {
    health := &HealthStatus{
        Status:    "healthy",
        Timestamp: time.Now().UTC(),
        Version:   h.version,
        Checks:    make(map[string]Check),
    }
    
    // Database health check
    start := time.Now()
    if err := h.db.Ping(); err != nil {
        health.Status = "unhealthy"
        health.Checks["database"] = Check{
            Status:  "unhealthy",
            Message: err.Error(),
        }
    } else {
        health.Checks["database"] = Check{
            Status:  "healthy",
            Message: "connected",
            Latency: time.Since(start).String(),
        }
    }
    
    // Redis health check
    start = time.Now()
    if err := h.redis.Ping(); err != nil {
        health.Status = "unhealthy"
        health.Checks["redis"] = Check{
            Status:  "unhealthy",
            Message: err.Error(),
        }
    } else {
        health.Checks["redis"] = Check{
            Status:  "healthy",
            Message: "connected",
            Latency: time.Since(start).String(),
        }
    }
    
    // External service health checks
    for name, client := range h.externalClients {
        start = time.Now()
        if err := client.HealthCheck(context.Background()); err != nil {
            health.Status = "unhealthy"
            health.Checks[name] = Check{
                Status:  "unhealthy",
                Message: err.Error(),
            }
        } else {
            health.Checks[name] = Check{
                Status:  "healthy",
                Message: "connected",
                Latency: time.Since(start).String(),
            }
        }
    }
    
    if health.Status == "healthy" {
        c.JSON(http.StatusOK, health)
    } else {
        c.JSON(http.StatusServiceUnavailable, health)
    }
}
```

### Kubernetes Probe Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  template:
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        env:
        - name: SERVICE_NAME
          value: "user-service"
        - name: VERSION
          value: "1.0.0"
```

---

## Alerting and Notification

### Alert Severity Levels

1. **Critical (P0)**: Service down, database unavailable, payment failures
2. **High (P1)**: High error rates (>5%), performance degradation (>500ms)
3. **Medium (P2)**: Warning thresholds, high resource utilization
4. **Low (P3)**: Informational alerts, capacity planning

### Prometheus Alert Rules

```yaml
# alerts.yml
groups:
- name: service-alerts
  rules:
  - alert: ServiceDown
    expr: up{job="user-service"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.job }} is down"
      description: "Service {{ $labels.job }} has been down for more than 1 minute"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 2m
    labels:
      severity: high
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }}"
      
  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.2
    for: 2m
    labels:
      severity: high
    annotations:
      summary: "High latency detected"
      description: "95th percentile latency is {{ $value }}s"
      
  - alert: DatabaseConnectionFailure
    expr: mysql_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failure"
      description: "Database {{ $labels.instance }} is unreachable"
```

### PagerDuty Integration

```yaml
# pagerduty.yml
global:
  pagerduty_url: "https://events.pagerduty.com/v2/enqueue"

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'pagerduty'

receivers:
- name: 'pagerduty'
  pagerduty_configs:
  - routing_key: 'YOUR_ROUTING_KEY'
    description: '{{ .GroupLabels.alertname }}'
    details:
      summary: '{{ .CommonAnnotations.summary }}'
      description: '{{ .CommonAnnotations.description }}'
```

---

## Dashboard Standards

### Grafana Dashboard Structure

#### System Overview Dashboard
- CPU Usage (per service, per node)
- Memory Usage (per service, per node)
- Network I/O (inbound/outbound traffic)
- Disk I/O (read/write operations)
- Service Status (health check results)

#### Service Performance Dashboard
- Request Rate (RPS per endpoint)
- Response Time (P50, P95, P99 latencies)
- Error Rate (4xx, 5xx error percentages)
- Throughput (requests per second)
- Queue Depth (message queue lengths)

#### Business Metrics Dashboard
- Order Volume (orders per hour/day)
- Revenue (revenue per hour/day)
- User Activity (active users, sessions)
- Conversion Rate (cart to purchase ratio)
- Inventory Levels (stock availability)

### Dashboard Configuration

```json
{
  "dashboard": {
    "title": "User Service Dashboard",
    "tags": ["user-service", "microservices"],
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{service=\"user-service\"}[5m]))",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service=\"user-service\"}[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

---

## Performance Monitoring

### Key Performance Indicators (KPIs)

1. **Response Time**: < 200ms for API endpoints
2. **Throughput**: 1000 RPS per service
3. **Error Rate**: < 0.1% error rate
4. **Availability**: 99.9% uptime
5. **Resource Utilization**: < 80% CPU, < 85% memory

### Performance Metrics Collection

```go
// Performance monitoring middleware
func PerformanceMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        
        c.Next()
        
        duration := time.Since(start)
        
        // Record performance metrics
        performanceHistogram.WithLabelValues(
            c.Request.Method,
            c.Request.URL.Path,
            strconv.Itoa(c.Writer.Status()),
        ).Observe(duration.Seconds())
        
        // Log slow requests
        if duration > 500*time.Millisecond {
            logger.Warn("Slow request detected",
                zap.String("method", c.Request.Method),
                zap.String("path", c.Request.URL.Path),
                zap.Duration("duration", duration),
            )
        }
    }
}
```

---

## Security and Compliance

### Data Protection

- **Metrics**: No PII in metrics, only aggregated data
- **Logs**: PII masking for sensitive fields (passwords, tokens)
- **Traces**: No sensitive data in trace spans
- **Access Control**: Role-based access to dashboards

### Network Security

- **Internal Only**: Monitoring stack not exposed externally
- **TLS**: All internal communication encrypted
- **Authentication**: Grafana with SSO integration
- **Audit Logging**: All access attempts logged

### Compliance Monitoring

#### GDPR Compliance
- Data access tracking
- Data deletion verification
- Consent management monitoring
- Data retention compliance

#### PCI DSS Compliance
- Payment processing security
- Fraud detection monitoring
- Access control monitoring
- Security incident response

---

## Implementation Guidelines

### Service Integration Checklist

- [ ] Prometheus metrics instrumentation
- [ ] Structured logging implementation
- [ ] Distributed tracing setup
- [ ] Health check endpoints
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Business metrics collection

### Configuration Management

```yaml
# monitoring-config.yml
monitoring:
  prometheus:
    enabled: true
    port: 9090
    scrape_interval: 15s
    
  jaeger:
    enabled: true
    endpoint: "http://jaeger:14268/api/traces"
    sampling_rate: 0.1
    
  logging:
    level: "info"
    format: "json"
    loki_endpoint: "http://loki:3100"
    
  health_checks:
    enabled: true
    interval: 30s
    timeout: 5s
```

---

## Testing and Validation

### Monitoring Tests

```go
// internal/monitoring/monitoring_test.go
package monitoring

import (
    "testing"
    "time"
    
    "github.com/stretchr/testify/assert"
)

func TestMetricsCollection(t *testing.T) {
    // Test metrics collection
    httpRequestsTotal.WithLabelValues("GET", "/users", "200", "user-service").Inc()
    
    // Verify metric was recorded
    metric, err := prometheus.DefaultGatherer.Gather()
    assert.NoError(t, err)
    assert.NotEmpty(t, metric)
}

func TestHealthCheck(t *testing.T) {
    // Test health check endpoint
    req := httptest.NewRequest("GET", "/health", nil)
    w := httptest.NewRecorder()
    
    handler := &Handler{
        db:    mockDB,
        redis: mockRedis,
    }
    
    handler.HealthCheck(gin.New().Context())
    
    assert.Equal(t, http.StatusOK, w.Code)
}
```

### Validation Checklist

- [ ] All services instrumented with metrics
- [ ] Logging configured and working
- [ ] Tracing functional across services
- [ ] Health checks responding correctly
- [ ] Alerts configured and tested
- [ ] Dashboards displaying data
- [ ] Performance targets met

---

## Best Practices Summary

### Metrics Best Practices

1. **Use consistent naming conventions**
2. **Include relevant labels for filtering**
3. **Avoid high-cardinality metrics**
4. **Set appropriate retention policies**
5. **Monitor metric collection overhead**

### Logging Best Practices

1. **Use structured logging (JSON)**
2. **Include correlation IDs**
3. **Avoid logging sensitive data**
4. **Use appropriate log levels**
5. **Implement log rotation**

### Tracing Best Practices

1. **Use meaningful span names**
2. **Include relevant attributes**
3. **Propagate trace context**
4. **Set appropriate sampling rates**
5. **Handle trace failures gracefully**

### Alerting Best Practices

1. **Set meaningful thresholds**
2. **Avoid alert fatigue**
3. **Include runbook links**
4. **Test alerting regularly**
5. **Use appropriate severity levels**

### Dashboard Best Practices

1. **Keep dashboards focused**
2. **Use consistent time ranges**
3. **Include relevant context**
4. **Make dashboards actionable**
5. **Regular dashboard reviews**

---

## References

### Related Documents
- [ADR-008: Monitoring & Observability Architecture](../../architecture/decisions/ADR-008-monitoring-observability.md)
- [Deployment Guidelines](deployment-guidelines.md)
- [Security Best Practices](security-best-practices.md)
- [Testing Guidelines](testing-guidelines.md)

### External Resources
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)

---

**Document Version**: 1.0
**Last Updated**: 2025-09-05
