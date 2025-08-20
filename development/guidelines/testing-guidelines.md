# Testing Guidelines for Distributed Systems

## Overview

This document provides comprehensive testing guidelines for the Cloud Lab distributed systems project, implementing the testing strategy defined in ADR-014. These guidelines ensure consistent testing practices across all services, maintain high code quality, and demonstrate distributed systems concepts through comprehensive testing.

## Core Testing Principles

### 1. Testing Pyramid Implementation
- **Unit Tests**: 70% of test coverage - Fast, isolated, comprehensive
- **Integration Tests**: 20% of test coverage - Service boundaries, database operations
- **End-to-End Tests**: 10% of test coverage - Complete user workflows, business processes

### 2. Quality Gates
- **Test Coverage**: Minimum 80% line coverage, 90% for critical services
- **Code Quality**: Maximum 3% duplicated code, cyclomatic complexity ≤ 10
- **Security**: No critical or high-severity vulnerabilities
- **Performance**: API endpoints must respond within 200ms under normal load

### 3. Business Rule Validation
- All business logic must be thoroughly tested
- Saga patterns must be validated with compensation actions
- Data consistency models must be tested across services
- Compliance requirements (GDPR, PCI DSS) must be validated

## Go Testing Framework Standards

### Unit Testing with Go Testing Package

#### Test Function Naming Convention
```go
// Use TestXxx naming convention
func TestUserService_CreateUser(t *testing.T) { ... }
func TestOrderProcessor_ValidateOrder(t *testing.T) { ... }
func TestPaymentGateway_ProcessPayment(t *testing.T) { ... }
```

#### Table-Driven Tests
```go
func TestUserValidation(t *testing.T) {
    tests := []struct {
        name        string
        user        User
        expectError bool
        errorType   error
    }{
        {
            name: "valid user",
            user: User{
                Email:     "test@example.com",
                Password:  "securePassword123",
                Username:  "testuser",
            },
            expectError: false,
        },
        {
            name: "invalid email",
            user: User{
                Email:     "invalid-email",
                Password:  "securePassword123",
                Username:  "testuser",
            },
            expectError: true,
            errorType:   ErrInvalidEmail,
        },
        // Add more test cases...
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateUser(tt.user)
            if tt.expectError {
                assert.Error(t, err)
                if tt.errorType != nil {
                    assert.ErrorIs(t, err, tt.errorType)
                }
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

#### Subtests for Complex Scenarios
```go
func TestOrderProcessing(t *testing.T) {
    t.Run("successful order creation", func(t *testing.T) {
        // Test successful order creation
    })
    
    t.Run("insufficient inventory", func(t *testing.T) {
        // Test inventory validation
    })
    
    t.Run("payment failure", func(t *testing.T) {
        // Test payment failure handling
    })
    
    t.Run("compensation actions", func(t *testing.T) {
        // Test saga compensation
    })
}
```

#### Parallel Testing
```go
func TestParallelOperations(t *testing.T) {
    t.Parallel() // Enable parallel execution
    
    // Test operations that can run concurrently
    t.Run("concurrent user creation", func(t *testing.T) {
        t.Parallel()
        // Test concurrent user creation
    })
    
    t.Run("concurrent order processing", func(t *testing.T) {
        t.Parallel()
        // Test concurrent order processing
    })
}
```

### Testify Framework Integration

#### Assertions
```go
import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestUserService(t *testing.T) {
    // Use require for critical assertions that should stop the test
    user, err := userService.CreateUser(validUser)
    require.NoError(t, err)
    require.NotNil(t, user)
    
    // Use assert for non-critical assertions
    assert.Equal(t, validUser.Email, user.Email)
    assert.Equal(t, validUser.Username, user.Username)
    assert.NotEmpty(t, user.ID)
    
    // Custom assertions for domain-specific validation
    assertValidUser(t, user)
}

// Custom assertion functions for domain logic
func assertValidUser(t *testing.T, user *User) {
    t.Helper()
    assert.NotEmpty(t, user.ID)
    assert.NotEmpty(t, user.Email)
    assert.NotEmpty(t, user.Username)
    assert.NotZero(t, user.CreatedAt)
    assert.NotZero(t, user.UpdatedAt)
}
```

#### Mocking with Testify
```go
import (
    "testing"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/assert"
)

type MockPaymentGateway struct {
    mock.Mock
}

func (m *MockPaymentGateway) ProcessPayment(payment Payment) (*PaymentResult, error) {
    args := m.Called(payment)
    return args.Get(0).(*PaymentResult), args.Error(1)
}

func TestOrderService_ProcessOrder(t *testing.T) {
    mockPayment := new(MockPaymentGateway)
    orderService := NewOrderService(mockPayment)
    
    // Setup expectations
    expectedPayment := Payment{Amount: 100.00, Currency: "USD"}
    expectedResult := &PaymentResult{Status: "success", TransactionID: "tx123"}
    
    mockPayment.On("ProcessPayment", expectedPayment).Return(expectedResult, nil)
    
    // Execute test
    order := Order{Total: 100.00, Currency: "USD"}
    result, err := orderService.ProcessOrder(order)
    
    // Verify results
    assert.NoError(t, err)
    assert.Equal(t, "completed", result.Status)
    
    // Verify mock expectations
    mockPayment.AssertExpectations(t)
}
```

### GoMock Framework Best Practices

#### Interface Mock Generation
```bash
# Generate mocks for interfaces
mockgen -source=internal/services/payment.go -destination=internal/services/mocks/payment_mock.go
mockgen -source=internal/repositories/user.go -destination=internal/repositories/mocks/user_mock.go
```

#### Mock Setup and Expectations
```go
import (
    "testing"
    "github.com/golang/mock/gomock"
    "github.com/stretchr/testify/assert"
)

func TestUserService_AuthenticateUser(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()
    
    mockUserRepo := NewMockUserRepository(ctrl)
    userService := NewUserService(mockUserRepo)
    
    // Setup test data
    email := "test@example.com"
    password := "securePassword123"
    expectedUser := &User{
        ID:       "user123",
        Email:    email,
        Username: "testuser",
    }
    
    // Setup mock expectations
    mockUserRepo.EXPECT().
        FindByEmail(gomock.Any(), email).
        Return(expectedUser, nil).
        Times(1)
    
    // Execute test
    user, err := userService.AuthenticateUser(email, password)
    
    // Verify results
    assert.NoError(t, err)
    assert.Equal(t, expectedUser, user)
}
```

#### Error Simulation Testing
```go
func TestUserService_AuthenticateUser_Error(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()
    
    mockUserRepo := NewMockUserRepository(ctrl)
    userService := NewUserService(mockUserRepo)
    
    email := "test@example.com"
    password := "securePassword123"
    
    // Setup mock to return error
    mockUserRepo.EXPECT().
        FindByEmail(gomock.Any(), email).
        Return(nil, ErrUserNotFound).
        Times(1)
    
    // Execute test
    user, err := userService.AuthenticateUser(email, password)
    
    // Verify error handling
    assert.Error(t, err)
    assert.ErrorIs(t, err, ErrUserNotFound)
    assert.Nil(t, user)
}
```

## HTTP Testing with httptest

### HTTP Handler Testing
```go
import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestUserHandler_CreateUser(t *testing.T) {
    // Setup
    userService := NewMockUserService()
    handler := NewUserHandler(userService)
    
    // Create test request
    userData := map[string]interface{}{
        "email":    "test@example.com",
        "username": "testuser",
        "password": "securePassword123",
    }
    
    body, _ := json.Marshal(userData)
    req := httptest.NewRequest("POST", "/users", bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")
    
    // Create response recorder
    w := httptest.NewRecorder()
    
    // Execute handler
    handler.CreateUser(w, req)
    
    // Verify response
    assert.Equal(t, http.StatusCreated, w.Code)
    
    var response map[string]interface{}
    err := json.Unmarshal(w.Body.Bytes(), &response)
    assert.NoError(t, err)
    
    assert.NotEmpty(t, response["id"])
    assert.Equal(t, userData["email"], response["email"])
    assert.Equal(t, userData["username"], response["username"])
}
```

### Middleware Testing
```go
func TestAuthMiddleware(t *testing.T) {
    // Setup
    authMiddleware := NewAuthMiddleware("secret")
    testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("authenticated"))
    })
    
    // Test with valid token
    req := httptest.NewRequest("GET", "/protected", nil)
    req.Header.Set("Authorization", "Bearer valid-token")
    w := httptest.NewRecorder()
    
    authMiddleware(testHandler).ServeHTTP(w, req)
    assert.Equal(t, http.StatusOK, w.Code)
    
    // Test with invalid token
    req = httptest.NewRequest("GET", "/protected", nil)
    req.Header.Set("Authorization", "Bearer invalid-token")
    w = httptest.NewRecorder()
    
    authMiddleware(testHandler).ServeHTTP(w, req)
    assert.Equal(t, http.StatusUnauthorized, w.Code)
}
```

## Integration Testing with TestContainers

### Database Integration Testing
```go
import (
    "context"
    "testing"
    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/wait"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestUserRepository_Integration(t *testing.T) {
    // Setup PostgreSQL container
    ctx := context.Background()
    req := testcontainers.ContainerRequest{
        Image:        "postgres:15-alpine",
        ExposedPorts: []string{"5432/tcp"},
        Env: map[string]string{
            "POSTGRES_DB":       "testdb",
            "POSTGRES_USER":     "testuser",
            "POSTGRES_PASSWORD": "testpass",
        },
        WaitingFor: wait.ForLog("database system is ready to accept connections"),
    }
    
    postgres, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
        ContainerRequest: req,
        Started:          true,
    })
    require.NoError(t, err)
    defer postgres.Terminate(ctx)
    
    // Get container host and port
    host, err := postgres.Host(ctx)
    require.NoError(t, err)
    port, err := postgres.MappedPort(ctx, "5432")
    require.NoError(t, err)
    
    // Setup database connection
    dsn := fmt.Sprintf("host=%s port=%s user=testuser password=testpass dbname=testdb sslmode=disable",
        host, port.Port())
    
    db, err := sql.Open("postgres", dsn)
    require.NoError(t, err)
    defer db.Close()
    
    // Run migrations
    err = RunMigrations(db)
    require.NoError(t, err)
    
    // Test user creation
    userRepo := NewUserRepository(db)
    user := &User{
        Email:    "test@example.com",
        Username: "testuser",
        Password: "securePassword123",
    }
    
    createdUser, err := userRepo.Create(ctx, user)
    assert.NoError(t, err)
    assert.NotEmpty(t, createdUser.ID)
    
    // Test user retrieval
    retrievedUser, err := userRepo.FindByEmail(ctx, user.Email)
    assert.NoError(t, err)
    assert.Equal(t, user.Email, retrievedUser.Email)
    assert.Equal(t, user.Username, retrievedUser.Username)
}
```

### Service Integration Testing
```go
func TestOrderService_Integration(t *testing.T) {
    // Setup test containers for all dependencies
    ctx := context.Background()
    
    // PostgreSQL container
    postgres := setupPostgreSQLContainer(t, ctx)
    defer postgres.Terminate(ctx)
    
    // Redis container
    redis := setupRedisContainer(t, ctx)
    defer redis.Terminate(ctx)
    
    // Kafka container
    kafka := setupKafkaContainer(t, ctx)
    defer kafka.Terminate(ctx)
    
    // Setup services with real dependencies
    orderService := setupOrderService(t, ctx, postgres, redis, kafka)
    
    // Test complete order workflow
    t.Run("complete order workflow", func(t *testing.T) {
        // Create order
        order := &Order{
            UserID:    "user123",
            Items:     []OrderItem{{ProductID: "prod123", Quantity: 2}},
            Total:     100.00,
            Currency:  "USD",
        }
        
        createdOrder, err := orderService.CreateOrder(ctx, order)
        assert.NoError(t, err)
        assert.Equal(t, "pending", createdOrder.Status)
        
        // Process payment
        paymentResult, err := orderService.ProcessPayment(ctx, createdOrder.ID)
        assert.NoError(t, err)
        assert.Equal(t, "completed", paymentResult.Status)
        
        // Verify order status update
        updatedOrder, err := orderService.GetOrder(ctx, createdOrder.ID)
        assert.NoError(t, err)
        assert.Equal(t, "paid", updatedOrder.Status)
        
        // Verify inventory update
        inventory, err := orderService.GetInventory(ctx, "prod123")
        assert.NoError(t, err)
        assert.Equal(t, 8, inventory.Quantity) // Assuming initial quantity was 10
    })
}
```

## Distributed Systems Testing Patterns

### Saga Pattern Testing
```go
func TestOrderSaga_Complete(t *testing.T) {
    // Setup saga orchestrator
    sagaOrchestrator := NewSagaOrchestrator()
    
    // Test successful saga execution
    t.Run("successful saga execution", func(t *testing.T) {
        order := &Order{ID: "order123", Total: 100.00}
        
        // Execute saga
        result, err := sagaOrchestrator.ExecuteOrderSaga(context.Background(), order)
        assert.NoError(t, err)
        assert.Equal(t, "completed", result.Status)
        
        // Verify all saga steps completed
        assert.Equal(t, "reserved", result.InventoryStatus)
        assert.Equal(t, "paid", result.PaymentStatus)
        assert.Equal(t, "confirmed", result.OrderStatus)
    })
    
    // Test saga compensation
    t.Run("saga compensation on payment failure", func(t *testing.T) {
        order := &Order{ID: "order124", Total: 100.00}
        
        // Mock payment service to fail
        mockPaymentService.On("ProcessPayment", gomock.Any()).Return(nil, ErrPaymentFailed)
        
        // Execute saga
        result, err := sagaOrchestrator.ExecuteOrderSaga(context.Background(), order)
        assert.Error(t, err)
        assert.Equal(t, "failed", result.Status)
        
        // Verify compensation actions
        assert.Equal(t, "released", result.InventoryStatus) // Inventory released
        assert.Equal(t, "failed", result.PaymentStatus)     // Payment failed
        assert.Equal(t, "cancelled", result.OrderStatus)    // Order cancelled
    })
}
```

### Circuit Breaker Testing
```go
func TestCircuitBreaker_PaymentService(t *testing.T) {
    circuitBreaker := NewCircuitBreaker(3, 5*time.Second, 10*time.Second)
    paymentService := NewPaymentService(circuitBreaker)
    
    // Test circuit breaker states
    t.Run("circuit breaker state transitions", func(t *testing.T) {
        // Closed state - normal operation
        assert.Equal(t, "closed", circuitBreaker.GetState())
        
        // Simulate failures to open circuit
        for i := 0; i < 3; i++ {
            _, err := paymentService.ProcessPayment(&Payment{Amount: 100.00})
            assert.Error(t, err)
        }
        
        // Circuit should be open
        assert.Equal(t, "open", circuitBreaker.GetState())
        
        // Requests should fail fast
        _, err := paymentService.ProcessPayment(&Payment{Amount: 100.00})
        assert.Error(t, err)
        assert.ErrorIs(t, err, ErrCircuitOpen)
        
        // Wait for timeout and test half-open state
        time.Sleep(5 * time.Second)
        assert.Equal(t, "half-open", circuitBreaker.GetState())
        
        // Successful request should close circuit
        mockPaymentGateway.On("ProcessPayment", gomock.Any()).Return(&PaymentResult{Status: "success"}, nil)
        _, err = paymentService.ProcessPayment(&Payment{Amount: 100.00})
        assert.NoError(t, err)
        assert.Equal(t, "closed", circuitBreaker.GetState())
    })
}
```

### Event-Driven Testing
```go
func TestEventSourcing_OrderEvents(t *testing.T) {
    eventStore := NewEventStore()
    orderService := NewOrderService(eventStore)
    
    t.Run("event sourcing workflow", func(t *testing.T) {
        // Create order
        order := &Order{ID: "order125", Total: 100.00}
        createdOrder, err := orderService.CreateOrder(context.Background(), order)
        assert.NoError(t, err)
        
        // Verify events were stored
        events, err := eventStore.GetEvents("order125")
        assert.NoError(t, err)
        assert.Len(t, events, 1)
        assert.Equal(t, "OrderCreated", events[0].Type)
        
        // Process payment
        _, err = orderService.ProcessPayment(context.Background(), order.ID)
        assert.NoError(t, err)
        
        // Verify additional events
        events, err = eventStore.GetEvents("order125")
        assert.NoError(t, err)
        assert.Len(t, events, 2)
        assert.Equal(t, "PaymentProcessed", events[1].Type)
        
        // Test event replay
        replayedOrder, err := orderService.ReplayEvents("order125")
        assert.NoError(t, err)
        assert.Equal(t, "paid", replayedOrder.Status)
    })
}
```

## Performance Testing

### Benchmark Testing
```go
import "testing"

func BenchmarkUserService_CreateUser(b *testing.B) {
    userService := NewUserService(nil)
    user := &User{
        Email:    "test@example.com",
        Username: "testuser",
        Password: "securePassword123",
    }
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _, err := userService.CreateUser(user)
        if err != nil {
            b.Fatal(err)
        }
    }
}

func BenchmarkOrderService_ProcessOrder(b *testing.B) {
    orderService := NewOrderService(nil)
    order := &Order{
        UserID:   "user123",
        Total:    100.00,
        Currency: "USD",
    }
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _, err := orderService.ProcessOrder(order)
        if err != nil {
            b.Fatal(err)
        }
    }
}
```

### Load Testing with Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
    - duration: 120
      arrivalRate: 500
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'
      Authorization: 'Bearer {{ $randomString() }}'

scenarios:
  - name: "User registration flow"
    weight: 30
    flow:
      - post:
          url: "/users"
          json:
            email: "{{ $randomEmail() }}"
            username: "{{ $randomString() }}"
            password: "securePassword123"
      - think: 1
      - get:
          url: "/users/{{ userId }}"

  - name: "Order processing flow"
    weight: 70
    flow:
      - post:
          url: "/orders"
          json:
            items: [{"productId": "prod123", "quantity": 2}]
            total: 100.00
            currency: "USD"
      - think: 2
      - post:
          url: "/orders/{{ orderId }}/pay"
          json:
            paymentMethod: "credit_card"
            amount: 100.00
```

## Security Testing

### Dependency Vulnerability Scanning
```bash
# Scan Go modules for vulnerabilities
govulncheck ./...

# Scan Docker images
trivy image myapp:latest

# Scan for secrets in code
gitleaks detect --source .
```

### Security Test Examples
```go
func TestSecurity_Authentication(t *testing.T) {
    t.Run("password strength validation", func(t *testing.T) {
        weakPasswords := []string{
            "123456",
            "password",
            "qwerty",
            "abc123",
        }
        
        for _, password := range weakPasswords {
            err := ValidatePasswordStrength(password)
            assert.Error(t, err)
            assert.ErrorIs(t, err, ErrWeakPassword)
        }
        
        strongPasswords := []string{
            "SecurePass123!",
            "MyP@ssw0rd2024",
            "Str0ng#P@ss",
        }
        
        for _, password := range strongPasswords {
            err := ValidatePasswordStrength(password)
            assert.NoError(t, err)
        }
    })
    
    t.Run("SQL injection prevention", func(t *testing.T) {
        maliciousInputs := []string{
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES ('hacker', 'hacked'); --",
        }
        
        for _, input := range maliciousInputs {
            // Test that malicious input is properly escaped
            escaped := EscapeSQLInput(input)
            assert.NotContains(t, escaped, "DROP TABLE")
            assert.NotContains(t, escaped, "INSERT INTO")
        }
    })
}
```

## Test Data Management

### Test Data Factories
```go
// internal/testing/factories/user_factory.go
package factories

import "github.com/cloudlab/internal/models"

type UserFactory struct{}

func (f *UserFactory) CreateUser(overrides ...func(*models.User)) *models.User {
    user := &models.User{
        ID:        GenerateUUID(),
        Email:     "test@example.com",
        Username:  "testuser",
        Password:  "securePassword123",
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }
    
    // Apply overrides
    for _, override := range overrides {
        override(user)
    }
    
    return user
}

func (f *UserFactory) CreateUserWithEmail(email string) *models.User {
    return f.CreateUser(func(u *models.User) {
        u.Email = email
    })
}

func (f *UserFactory) CreateAdminUser() *models.User {
    return f.CreateUser(func(u *models.User) {
        u.Role = "admin"
        u.IsAdmin = true
    })
}

// Usage in tests
func TestUserService(t *testing.T) {
    factory := &factories.UserFactory{}
    
    user := factory.CreateUser()
    adminUser := factory.CreateAdminUser()
    customUser := factory.CreateUserWithEmail("custom@example.com")
    
    // Use in tests...
}
```

### Test Data Cleanup
```go
func TestMain(m *testing.M) {
    // Setup test environment
    setupTestEnvironment()
    
    // Run tests
    code := m.Run()
    
    // Cleanup test environment
    cleanupTestEnvironment()
    
    os.Exit(code)
}

func setupTestEnvironment() {
    // Setup test databases, containers, etc.
}

func cleanupTestEnvironment() {
    // Cleanup test data, containers, etc.
}

// Individual test cleanup
func TestUserService_CreateUser(t *testing.T) {
    // Setup test data
    user := createTestUser(t)
    
    // Ensure cleanup after test
    t.Cleanup(func() {
        deleteTestUser(t, user.ID)
    })
    
    // Test implementation...
}
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test and Quality Assurance

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        go-version: [1.21, 1.22]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: ${{ matrix.go-version }}
    
    - name: Cache Go modules
      uses: actions/cache@v3
      with:
        path: ~/go/pkg/mod
        key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
        restore-keys: |
          ${{ runner.os }}-go-
    
    - name: Install dependencies
      run: go mod download
    
    - name: Run unit tests
      run: go test -v -race -coverprofile=coverage.out ./...
    
    - name: Run integration tests
      run: go test -v -tags=integration ./...
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.out
    
    - name: Run security scan
      run: govulncheck ./...
    
    - name: Run performance tests
      run: artillery run artillery-config.yml
    
    - name: Quality gates
      run: |
        # Check test coverage
        coverage=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | sed 's/%//')
        if (( $(echo "$coverage < 80" | bc -l) )); then
          echo "Test coverage $coverage% is below 80% threshold"
          exit 1
        fi
        
        # Check for security vulnerabilities
        if govulncheck ./... | grep -q "VULNERABILITY"; then
          echo "Security vulnerabilities found"
          exit 1
        fi
```

## Testing Best Practices

### 1. Test Organization
- Group related tests using subtests
- Use descriptive test names that explain the scenario
- Organize tests by functionality and complexity
- Keep tests focused and single-purpose

### 2. Test Data Management
- Use factories for creating test data
- Ensure test data isolation between tests
- Clean up test data after each test
- Use realistic but minimal test data

### 3. Mocking Strategy
- Mock external dependencies and services
- Use interfaces for better testability
- Verify mock expectations
- Keep mocks simple and focused

### 4. Performance Considerations
- Run tests in parallel when possible
- Use test containers efficiently
- Cache test dependencies
- Monitor test execution time

### 5. Error Testing
- Test both success and failure scenarios
- Test edge cases and boundary conditions
- Validate error messages and types
- Test error handling and recovery

### 6. Integration Testing
- Test service boundaries thoroughly
- Use real databases and external services in containers
- Test data consistency across services
- Validate business workflows end-to-end

## Monitoring and Reporting

### Test Metrics Collection
```go
// internal/testing/metrics/collector.go
type TestMetrics struct {
    TestCount      int64
    PassedCount    int64
    FailedCount    int64
    ExecutionTime  time.Duration
    Coverage       float64
}

type MetricsCollector struct {
    metrics TestMetrics
    mu      sync.RWMutex
}

func (c *MetricsCollector) RecordTestResult(passed bool, duration time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    c.metrics.TestCount++
    if passed {
        c.metrics.PassedCount++
    } else {
        c.metrics.FailedCount++
    }
    c.metrics.ExecutionTime += duration
}

func (c *MetricsCollector) GetMetrics() TestMetrics {
    c.mu.RLock()
    defer c.mu.RUnlock()
    
    return c.metrics
}
```

### Test Reporting
```go
func TestMain(m *testing.M) {
    // Setup metrics collection
    collector := NewMetricsCollector()
    
    // Run tests
    start := time.Now()
    code := m.Run()
    duration := time.Since(start)
    
    // Generate report
    metrics := collector.GetMetrics()
    generateTestReport(metrics, duration)
    
    os.Exit(code)
}

func generateTestReport(metrics TestMetrics, totalDuration time.Duration) {
    report := fmt.Sprintf(`
Test Execution Report
====================
Total Tests: %d
Passed: %d
Failed: %d
Success Rate: %.2f%%
Total Execution Time: %v
Average Test Time: %v
`,
        metrics.TestCount,
        metrics.PassedCount,
        metrics.FailedCount,
        float64(metrics.PassedCount)/float64(metrics.TestCount)*100,
        totalDuration,
        totalDuration/time.Duration(metrics.TestCount),
    )
    
    fmt.Print(report)
}
```

## Conclusion

These testing guidelines ensure that all distributed systems concepts are thoroughly tested and validated. By following these standards, we maintain high code quality, catch issues early, and provide confidence in system reliability.

Remember to:
- Write comprehensive tests for all business logic
- Test distributed patterns thoroughly
- Maintain high test coverage
- Use appropriate testing tools for each scenario
- Integrate testing into CI/CD pipelines
- Monitor test quality and performance

For additional guidance, refer to:
- [ADR-014: Testing & Quality Assurance](../architecture/decisions/ADR-014-testing-quality-assurance.md)
- [Go Testing Package Documentation](https://golang.org/pkg/testing/)
- [Testify Framework Documentation](https://github.com/stretchr/testify)
- [GoMock Documentation](https://github.com/uber-go/mock)
