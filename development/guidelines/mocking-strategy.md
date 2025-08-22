# External Service Mocking Strategy

## Overview
This document outlines the strategy for mocking external services in the distributed e-commerce platform to avoid overengineering and focus on learning core distributed systems concepts. The goal is to maintain architectural simplicity while providing realistic behavior for development and testing.

## Mocking Philosophy

### Learning-First Approach
- **Primary Goal**: Learn distributed systems concepts, not build production integrations
- **Complexity Management**: Use mocks to avoid overengineering external service integrations
- **Focus Areas**: Core distributed systems patterns, not third-party service complexity
- **Realistic Behavior**: Mocks should behave like real services for authentic learning

### Mock vs. Integrate Decision Matrix
| Service Type | Mock Decision | Rationale | Implementation Complexity |
|--------------|---------------|------------|--------------------------|
| **Payment Providers** | Mock | Focus on payment flows, not provider APIs | Low |
| **Shipping Carriers** | Mock | Focus on logistics patterns, not carrier integration | Low |
| **Email/SMS Services** | Mock | Focus on notification patterns, not delivery | Low |
| **Content Moderation APIs** | Mock | Focus on moderation workflows, not AI services | Low |
| **Analytics Services** | Mock | Focus on data patterns, not external analytics | Low |
| **Database Systems** | Real | Core distributed systems learning | High |
| **Message Queues** | Real | Core distributed systems learning | High |
| **Container Orchestration** | Real | Core distributed systems learning | High |

## Mock Service Implementations

### 1. Payment Provider Mock

#### Mock Implementation
```go
// Mock payment provider service
type MockPaymentProvider struct {
    successRate    float64
    responseDelay  time.Duration
    failureModes   map[string]bool
    mu             sync.RWMutex
}

func NewMockPaymentProvider(successRate float64, responseDelay time.Duration) *MockPaymentProvider {
    return &MockPaymentProvider{
        successRate:   successRate,
        responseDelay: responseDelay,
        failureModes:  make(map[string]bool),
    }
}

// Process payment with realistic behavior
func (mpp *MockPaymentProvider) ProcessPayment(payment *PaymentRequest) (*PaymentResponse, error) {
    // Simulate network delay
    time.Sleep(mpp.responseDelay)
    
    // Simulate random failures
    if rand.Float64() > mpp.successRate {
        return nil, &PaymentError{
            Code:    "DECLINED",
            Message: "Card declined by issuer",
            Details: "Insufficient funds",
        }
    }
    
    // Simulate fraud detection
    if mpp.isFraudulent(payment) {
        return nil, &PaymentError{
            Code:    "FRAUD_DETECTED",
            Message: "Transaction flagged for fraud",
            Details: "Risk score exceeded threshold",
        }
    }
    
    // Generate successful response
    return &PaymentResponse{
        TransactionID: generateTransactionID(),
        Status:        "APPROVED",
        Amount:        payment.Amount,
        Currency:      payment.Currency,
        Timestamp:     time.Now(),
        AuthCode:      generateAuthCode(),
    }, nil
}

// Simulate fraud detection
func (mpp *MockPaymentProvider) isFraudulent(payment *PaymentRequest) bool {
    // Simple fraud detection logic for learning
    if payment.Amount > 10000 {
        return true // High-value transactions flagged
    }
    
    if payment.CardNumber == "4111111111111111" {
        return true // Known test card for fraud scenarios
    }
    
    return false
}
```

#### Configuration Options
```yaml
# Mock payment provider configuration
mock_payment:
  success_rate: 0.95          # 95% success rate
  response_delay: 200ms       # Simulate network latency
  failure_modes:
    declined: true            # Enable declined transactions
    fraud_detected: true      # Enable fraud detection
    network_error: true       # Enable network failures
    timeout: true             # Enable timeouts
  fraud_scenarios:
    high_value_threshold: 10000
    suspicious_cards: ["4111111111111111", "5555555555554444"]
```

### 2. Shipping Carrier Mock

#### Mock Implementation
```go
// Mock shipping carrier service
type MockShippingCarrier struct {
    carriers       map[string]CarrierInfo
    responseDelay  time.Duration
    failureRate    float64
}

type CarrierInfo struct {
    Name           string
    BaseRate       float64
    ExpressRate    float64
    DeliveryDays   map[string]int
    TrackingPrefix string
}

func NewMockShippingCarrier() *MockShippingCarrier {
    return &MockShippingCarrier{
        carriers: map[string]CarrierInfo{
            "fedex": {
                Name:           "FedEx",
                BaseRate:       15.99,
                ExpressRate:    25.99,
                DeliveryDays:   map[string]int{"standard": 3, "express": 1},
                TrackingPrefix: "FDX",
            },
            "ups": {
                Name:           "UPS",
                BaseRate:       12.99,
                ExpressRate:    22.99,
                DeliveryDays:   map[string]int{"standard": 4, "express": 2},
                TrackingPrefix: "UPS",
            },
        },
        responseDelay: 150 * time.Millisecond,
        failureRate:   0.05,
    }
}

// Calculate shipping rates
func (msc *MockShippingCarrier) CalculateRates(request *ShippingRequest) (*ShippingResponse, error) {
    time.Sleep(msc.responseDelay)
    
    // Simulate random failures
    if rand.Float64() < msc.failureRate {
        return nil, errors.New("carrier service temporarily unavailable")
    }
    
    carrier, exists := msc.carriers[request.Carrier]
    if !exists {
        return nil, errors.New("unsupported carrier")
    }
    
    // Calculate rates based on weight and service type
    baseRate := carrier.BaseRate
    if request.ServiceType == "express" {
        baseRate = carrier.ExpressRate
    }
    
    // Add weight-based charges
    weightCharge := request.Weight * 0.5
    totalRate := baseRate + weightCharge
    
    return &ShippingResponse{
        Carrier:      carrier.Name,
        ServiceType:  request.ServiceType,
        Rate:         totalRate,
        DeliveryDays: carrier.DeliveryDays[request.ServiceType],
        TrackingNumber: fmt.Sprintf("%s%s", carrier.TrackingPrefix, generateTrackingNumber()),
    }, nil
}
```

### 3. Email/SMS Service Mock

#### Mock Implementation
```go
// Mock notification service
type MockNotificationService struct {
    emailQueue     chan *EmailMessage
    smsQueue      chan *SMSMessage
    pushQueue     chan *PushMessage
    deliveryDelay time.Duration
    failureRate   float64
}

func NewMockNotificationService() *MockNotificationService {
    mns := &MockNotificationService{
        emailQueue:     make(chan *EmailMessage, 1000),
        smsQueue:       make(chan *SMSMessage, 1000),
        pushQueue:      make(chan *PushMessage, 1000),
        deliveryDelay:  100 * time.Millisecond,
        failureRate:    0.02,
    }
    
    // Start mock delivery workers
    go mns.emailWorker()
    go mns.smsWorker()
    go mns.pushWorker()
    
    return mns
}

// Send email with realistic behavior
func (mns *MockNotificationService) SendEmail(email *EmailMessage) error {
    // Simulate random failures
    if rand.Float64() < mns.failureRate {
        return errors.New("email service temporarily unavailable")
    }
    
    // Queue email for delivery
    select {
    case mns.emailQueue <- email:
        return nil
    default:
        return errors.New("email queue full")
    }
}

// Mock email delivery worker
func (mns *MockNotificationService) emailWorker() {
    for email := range mns.emailQueue {
        // Simulate delivery delay
        time.Sleep(mns.deliveryDelay)
        
        // Simulate delivery success/failure using failureRate
        if rand.Float64() >= mns.failureRate {
            log.Printf("Mock email delivered: %s -> %s", email.From, email.To)
        } else {
            log.Printf("Mock email failed: %s -> %s", email.From, email.To)
        }
    }
}
```

### 4. Content Moderation API Mock

#### Mock Implementation
```go
// Mock content moderation service
type MockContentModeration struct {
    rules          []ModerationRule
    responseDelay  time.Duration
    accuracy       float64
}

type ModerationRule struct {
    Pattern     string
    Category    string
    Severity    string
    Action      string
}

func NewMockContentModeration() *MockContentModeration {
    return &MockContentModeration{
        rules: []ModerationRule{
            {Pattern: "spam", Category: "spam", Severity: "low", Action: "flag"},
            {Pattern: "inappropriate", Category: "content", Severity: "high", Action: "block"},
            {Pattern: "copyright", Category: "legal", Severity: "medium", Action: "review"},
        },
        responseDelay: 300 * time.Millisecond,
        accuracy:      0.85, // 85% accuracy for realistic behavior
    }
}

// Moderate content with realistic behavior
func (mcm *MockContentModeration) ModerateContent(content string) (*ModerationResult, error) {
    time.Sleep(mcm.responseDelay)
    
    // Apply moderation rules
    var flags []ModerationFlag
    for _, rule := range mcm.rules {
        if strings.Contains(strings.ToLower(content), rule.Pattern) {
            // Simulate accuracy issues
            if rand.Float64() <= mcm.accuracy {
                flags = append(flags, ModerationFlag{
                    Category: rule.Category,
                    Severity: rule.Severity,
                    Action:   rule.Action,
                    Pattern:  rule.Pattern,
                })
            }
        }
    }
    
    // Determine overall action
    action := "approve"
    if len(flags) > 0 {
        action = flags[0].Action
    }
    
    return &ModerationResult{
        ContentID:   generateContentID(),
        Action:      action,
        Flags:       flags,
        Confidence:  rand.Float64() * 0.3 + 0.7, // 70-100% confidence
        Timestamp:   time.Now(),
    }, nil
}
```

## Mock Service Configuration

### Environment-Based Configuration
```yaml
# Development environment
environment: development
mocks:
  enabled: true
  realistic_behavior: true
  failure_simulation: true
  
# Testing environment
environment: testing
mocks:
  enabled: true
  realistic_behavior: false
  failure_simulation: true
  deterministic: true
  
# Production environment
environment: production
mocks:
  enabled: false
  realistic_behavior: false
  failure_simulation: false
```

### Mock Behavior Profiles
```yaml
# Realistic profile for development
mock_profile: realistic
payment:
  success_rate: 0.95
  response_delay: 200ms
  fraud_detection: true
  
shipping:
  success_rate: 0.98
  response_delay: 150ms
  rate_calculation: true
  
notifications:
  delivery_rate: 0.98
  delivery_delay: 100ms
  queue_management: true
  
moderation:
  accuracy: 0.85
  response_delay: 300ms
  rule_application: true

# Deterministic profile for testing
mock_profile: deterministic
payment:
  success_rate: 1.0
  response_delay: 0ms
  fraud_detection: false
  
shipping:
  success_rate: 1.0
  response_delay: 0ms
  rate_calculation: true
  
notifications:
  delivery_rate: 1.0
  delivery_delay: 0ms
  queue_management: false
  
moderation:
  accuracy: 1.0
  response_delay: 0ms
  rule_application: true
```

## Integration with Real Services

### Gradual Migration Path
```go
// Service interface that supports both mock and real implementations
type PaymentService interface {
    ProcessPayment(payment *PaymentRequest) (*PaymentResponse, error)
    RefundPayment(refund *RefundRequest) (*RefundResponse, error)
    GetTransactionStatus(transactionID string) (*TransactionStatus, error)
}

// Service factory that can switch between mock and real
type PaymentServiceFactory struct {
    config *Config
}

func (psf *PaymentServiceFactory) CreateService() PaymentService {
    if psf.config.UseMocks {
        return NewMockPaymentProvider(
            psf.config.MockSuccessRate,
            psf.config.MockResponseDelay,
        )
    }
    
    return NewStripePaymentProvider(
        psf.config.StripeAPIKey,
        psf.config.StripeWebhookSecret,
    )
}
```

### Feature Flags for Service Switching
```go
// Feature flag for switching between mock and real services
type ServiceFeatureFlags struct {
    UseMockPayment      bool
    UseMockShipping     bool
    UseMockNotifications bool
    UseMockModeration   bool
}

func (sff *ServiceFeatureFlags) ShouldUseMock(serviceType string) bool {
    switch serviceType {
    case "payment":
        return sff.UseMockPayment
    case "shipping":
        return sff.UseMockShipping
    case "notifications":
        return sff.UseMockNotifications
    case "moderation":
        return sff.UseMockModeration
    default:
        return false
    }
}
```

## Testing with Mock Services

### Unit Testing
```go
func TestPaymentService(t *testing.T) {
    // Use mock service for testing
    mockProvider := NewMockPaymentProvider(1.0, 0) // 100% success, no delay
    paymentService := NewPaymentService(mockProvider)
    
    // Test successful payment
    payment := &PaymentRequest{
        Amount:    100.00,
        Currency:  "USD",
        CardNumber: "4111111111111111",
    }
    
    response, err := paymentService.ProcessPayment(payment)
    assert.NoError(t, err)
    assert.Equal(t, "APPROVED", response.Status)
}
```

### Integration Testing
```go
func TestOrderProcessingWithMocks(t *testing.T) {
    // Set up mock services
    mockPayment := NewMockPaymentProvider(1.0, 100*time.Millisecond)
    mockShipping := NewMockShippingCarrier()
    mockNotifications := NewMockNotificationService()
    
    // Create order service with mocks
    orderService := NewOrderService(mockPayment, mockShipping, mockNotifications)
    
    // Test complete order flow
    order := &Order{
        ID:       "order123",
        Amount:   150.00,
        Currency: "USD",
    }
    
    result, err := orderService.ProcessOrder(order)
    assert.NoError(t, err)
    assert.Equal(t, "completed", result.Status)
}
```

### Performance Testing
```go
func BenchmarkPaymentProcessing(b *testing.B) {
    // Test with mock service for consistent performance
    mockProvider := NewMockPaymentProvider(1.0, 0)
    paymentService := NewPaymentService(mockProvider)
    
    payment := &PaymentRequest{
        Amount:    100.00,
        Currency:  "USD",
        CardNumber: "4111111111111111",
    }
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _, err := paymentService.ProcessPayment(payment)
        if err != nil {
            b.Fatal(err)
        }
    }
}
```

## Monitoring and Observability

### Mock Service Metrics
```go
// Metrics for mock services
type MockServiceMetrics struct {
    requestCount    prometheus.Counter
    responseTime    prometheus.Histogram
    failureCount    prometheus.Counter
    successRate     prometheus.Gauge
}

func (msm *MockServiceMetrics) RecordRequest(duration time.Duration, success bool) {
    msm.requestCount.Inc()
    msm.responseTime.Observe(duration.Seconds())
    
    if !success {
        msm.failureCount.Inc()
    }
    
    // Calculate success rate
    total := float64(msm.requestCount)
    failures := float64(msm.failureCount)
    if total > 0 {
        msm.successRate.Set((total - failures) / total)
    }
}
```

### Mock Service Health Checks
```go
// Health check for mock services
func (mpp *MockPaymentProvider) HealthCheck() *HealthStatus {
    return &HealthStatus{
        Service:     "mock-payment-provider",
        Status:      "healthy",
        Timestamp:   time.Now(),
        Details: map[string]interface{}{
            "success_rate": mpp.successRate,
            "response_delay": mpp.responseDelay,
            "failure_modes_enabled": len(mpp.failureModes),
        },
    }
}
```

## Benefits of Mocking Strategy

### Learning Benefits
1. **Focus on Core Concepts**: Learn distributed systems patterns without external complexity
2. **Controlled Failure Scenarios**: Simulate specific failure modes for learning
3. **Predictable Behavior**: Consistent behavior for testing and development
4. **Rapid Iteration**: No external dependencies to slow development

### Development Benefits
1. **Faster Development**: No need to set up external service accounts
2. **Cost Reduction**: No charges for external service usage during development
3. **Offline Development**: Work without internet connectivity
4. **Parallel Development**: Multiple developers can work independently

### Testing Benefits
1. **Deterministic Tests**: Consistent test results regardless of external factors
2. **Faster Test Execution**: No network calls to external services
3. **Failure Scenario Testing**: Easy to test error conditions and edge cases
4. **Isolated Testing**: Tests don't depend on external service availability

## Future Considerations

### When to Replace Mocks
1. **Production Deployment**: Replace mocks with real services for production
2. **Integration Testing**: Use real services for end-to-end integration tests
3. **Performance Testing**: Use real services for accurate performance measurements
4. **Compliance Requirements**: Use real services when compliance validation is needed

### Migration Strategy
1. **Feature Flags**: Use feature flags to switch between mock and real services
2. **Gradual Rollout**: Migrate services one at a time
3. **Fallback Support**: Keep mocks as fallbacks during migration
4. **Monitoring**: Monitor real service performance and reliability

## References
- [ADR-005: Message Queue & Event Streaming](../../architecture/decisions/ADR-005-message-queue-event-streaming.md)
- [ADR-006: API Communication Patterns](../../architecture/decisions/ADR-006-api-communication-patterns.md)
- [ADR-009: Security & Authentication Architecture](../../architecture/decisions/ADR-009-security-authentication.md)
- [Mocking Best Practices](https://martinfowler.com/articles/mocksArentStubs.html)
- [Service Virtualization](https://en.wikipedia.org/wiki/Service_virtualization)
