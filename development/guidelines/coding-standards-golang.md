# Go Coding Standards

## Table of Contents
1. [Overview](#overview)
2. [Code Formatting](#code-formatting)
3. [Naming Conventions](#naming-conventions)
4. [Package Organization](#package-organization)
5. [Error Handling](#error-handling)
6. [Interface Design](#interface-design)
7. [Testing Standards](#testing-standards)
8. [Documentation](#documentation)
9. [Performance Guidelines](#performance-guidelines)
10. [Security Best Practices](#security-best-practices)
11. [Tooling & Automation](#tooling--automation)
12. [Code Review Guidelines](#code-review-guidelines)

## Overview

This document establishes coding standards for our Go projects, following the official Go style guide and community best practices. These standards ensure code quality, maintainability, and consistency across our distributed systems codebase.

**Core Principles:**
- Clear is better than clever
- Simple is better than complex
- Readability is paramount
- Consistency across the codebase

## Code Formatting

### Automatic Formatting
- **Always use `gofmt`**: All code must be formatted with `gofmt` or `go fmt`
- **No manual formatting**: Let the tool handle all spacing, indentation, and alignment
- **CI enforcement**: Formatting is automatically enforced in CI/CD pipelines

### Line Length
- **Soft limit**: 120 characters
- **Hard limit**: 140 characters
- **Break long lines**: At logical points (operators, commas, function calls)

### Spacing and Indentation
```go
// Good: Proper spacing around operators
if a == b && c == d {
    return true
}

// Good: Proper spacing in function calls
result := processData(
    input,
    options,
    context,
)

// Avoid: Inconsistent spacing
if a==b&&c==d{
    return true
}
```

## Naming Conventions

### Package Names
- **Use lowercase**: Single words, no underscores or mixed caps
- **Be descriptive**: Package name should clearly indicate its purpose
- **Avoid generic names**: Don't use names like `util`, `common`, `shared`

```go
// Good
package orderprocessing
package userauthentication
package paymentgateway

// Avoid
package utils
package common
package shared
```

### Variable Names
- **Use camelCase**: Start with lowercase, capitalize subsequent words
- **Be descriptive**: Names should clearly indicate purpose
- **Avoid abbreviations**: Use full words unless the abbreviation is universally understood

```go
// Good
var orderProcessor OrderProcessor
var maxRetryAttempts int
var userAuthenticationService UserAuthService

// Avoid
var op OrderProcessor
var mra int
var uas UserAuthService
```

### Function Names
- **Use camelCase**: Same rules as variables
- **Be action-oriented**: Function names should describe what they do
- **Use consistent prefixes**: For similar operations

```go
// Good
func ProcessOrder(ctx context.Context, order Order) error
func ValidateUserInput(input UserInput) error
func GetUserByID(id string) (*User, error)

// Avoid
func Order(ctx context.Context, order Order) error
func Check(input UserInput) error
func User(id string) (*User, error)
```

### Exported Names
- **Start with uppercase**: For public APIs and interfaces
- **Start with lowercase**: For internal/private functions and variables
- **Be consistent**: Use the same naming pattern for similar concepts

```go
// Exported (public)
type OrderProcessor interface {
    Process(ctx context.Context, order Order) error
}

func NewOrderProcessor(repo Repository) OrderProcessor {
    return &orderProcessor{repo: repo}
}

// Unexported (private)
type orderProcessor struct {
    repo Repository
}

func (p *orderProcessor) process(ctx context.Context, order Order) error {
    // Implementation
}
```

## Package Organization

### Directory Structure
```
project/
├── cmd/                    # Application entry points
│   ├── api-server/         # API server binary
│   └── worker/             # Background worker binary
├── internal/               # Private application code
│   ├── domain/             # Business logic and entities
│   ├── infrastructure/     # External system integrations
│   ├── application/        # Use cases and application services
│   └── interfaces/         # API handlers and adapters
├── pkg/                    # Public libraries (if any)
├── api/                    # API definitions (protobuf, OpenAPI)
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
├── test/                   # Integration tests
├── go.mod                  # Go module file
├── go.sum                  # Go module checksums
├── Makefile                # Build automation
├── Dockerfile              # Container definition
└── README.md               # Project overview
```

### Package Design Principles
- **Single responsibility**: Each package should have one clear purpose
- **Minimal dependencies**: Keep package dependencies minimal
- **Clear boundaries**: Package interfaces should be well-defined
- **Avoid circular dependencies**: Use dependency injection and interfaces

### Internal vs. External
- **`internal/`**: Code that should not be imported by other projects
- **`pkg/`**: Code that can be safely imported by other projects
- **`cmd/`**: Application binaries and entry points

## Error Handling

### Error Types
- **Use structured errors**: Create custom error types for different error categories
- **Provide context**: Always wrap errors with relevant context
- **Use `%w` verb**: For error wrapping in Go 1.13+

```go
// Custom error types
type ValidationError struct {
    Field   string      `json:"field"`
    Value   interface{} `json:"value"`
    Message string      `json:"message"`
}

func (e ValidationError) Error() string {
    return fmt.Sprintf("validation failed for field %s: %s", e.Field, e.Message)
}

type NotFoundError struct {
    Resource string `json:"resource"`
    ID       string `json:"id"`
}

func (e NotFoundError) Error() string {
    return fmt.Sprintf("%s with id %s not found", e.Resource, e.ID)
}

// Error wrapping with context
func (s *OrderService) ProcessOrder(ctx context.Context, order Order) error {
    if err := s.validateOrder(order); err != nil {
        return fmt.Errorf("failed to validate order %s: %w", order.ID, err)
    }
    
    if err := s.saveOrder(ctx, order); err != nil {
        return fmt.Errorf("failed to save order %s: %w", order.ID, err)
    }
    
    return nil
}
```

### Error Handling Patterns
- **Don't ignore errors**: Always handle or return errors
- **Log errors appropriately**: Use structured logging with error context
- **Return errors early**: Fail fast when errors occur
- **Use sentinel errors**: For specific error conditions

```go
// Good: Early return on error
func (s *UserService) CreateUser(ctx context.Context, req CreateUserRequest) (*User, error) {
    if err := req.Validate(); err != nil {
        return nil, fmt.Errorf("invalid request: %w", err)
    }
    
    user, err := s.repo.Create(ctx, req)
    if err != nil {
        return nil, fmt.Errorf("failed to create user: %w", err)
    }
    
    return user, nil
}

// Avoid: Ignoring errors
func badExample() {
    json.Marshal(data) // Error ignored!
}
```

### Error Logging
```go
// Structured error logging
func (s *OrderService) processOrder(ctx context.Context, order Order) error {
    if err := s.validateOrder(order); err != nil {
        s.logger.Error("order validation failed",
            "order_id", order.ID,
            "error", err,
            "user_id", order.UserID,
        )
        return fmt.Errorf("order validation failed: %w", err)
    }
    
    return nil
}
```

## Interface Design

### Interface Principles
- **Keep interfaces small**: Aim for 1-3 methods
- **Define behavior, not data**: Interfaces should describe what something does, not what it contains
- **Place interfaces where they're used**: Not where they're implemented
- **Use interfaces for testing**: Mock external dependencies

```go
// Good: Small, focused interface
type OrderRepository interface {
    Create(ctx context.Context, order Order) error
    GetByID(ctx context.Context, id string) (*Order, error)
}

// Good: Interface defined where it's used
type OrderService struct {
    repo OrderRepository
    logger Logger
}

// Avoid: Large interface with many methods
type BadInterface interface {
    Create(ctx context.Context, order Order) error
    GetByID(ctx context.Context, id string) (*Order, error)
    Update(ctx context.Context, order Order) error
    Delete(ctx context.Context, id string) error
    List(ctx context.Context, filter Filter) ([]Order, error)
    Search(ctx context.Context, query string) ([]Order, error)
    // ... many more methods
}
```

### Interface Composition
```go
// Compose interfaces when needed
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

// Compose interfaces
type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
```

## Testing Standards

### Test Organization
- **Test files**: Same name as source file with `_test.go` suffix
- **Test packages**: Use `package main` for integration tests, same package for unit tests
- **Test structure**: Use table-driven tests for multiple test cases

### Unit Tests
```go
// Table-driven tests
func TestOrderValidation(t *testing.T) {
    tests := []struct {
        name    string
        order   Order
        wantErr bool
        errType error
    }{
        {
            name: "valid order",
            order: Order{
                ID:     "order-123",
                UserID: "user-456",
                Amount: 1000,
            },
            wantErr: false,
        },
        {
            name: "invalid amount",
            order: Order{
                ID:     "order-124",
                UserID: "user-456",
                Amount: -100,
            },
            wantErr: true,
            errType: &ValidationError{},
        },
        {
            name: "missing user ID",
            order: Order{
                ID:     "order-125",
                UserID: "",
                Amount: 1000,
            },
            wantErr: true,
            errType: &ValidationError{},
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateOrder(tt.order)
            
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateOrder() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            
            if tt.wantErr && tt.errType != nil {
                if !errors.As(err, &tt.errType) {
                    t.Errorf("ValidateOrder() error type = %T, want %T", err, tt.errType)
                }
            }
        })
    }
}
```

### Test Coverage
- **Minimum coverage**: 80% for new code
- **Critical paths**: 100% coverage for business logic
- **Integration tests**: Test external dependencies and API endpoints
- **Performance tests**: Benchmark critical functions

### Mocking
```go
// Use interfaces for mocking
type MockOrderRepository struct {
    orders map[string]*Order
    mu     sync.RWMutex
}

func (m *MockOrderRepository) Create(ctx context.Context, order Order) error {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    m.orders[order.ID] = &order
    return nil
}

func (m *MockOrderRepository) GetByID(ctx context.Context, id string) (*Order, error) {
    m.mu.RLock()
    defer m.mu.RUnlock()
    
    order, exists := m.orders[id]
    if !exists {
        return nil, &NotFoundError{Resource: "order", ID: id}
    }
    
    return order, nil
}
```

## Documentation

### Code Comments
- **Document exported functions**: All public APIs must have comments
- **Use complete sentences**: Start with the function name
- **Explain the "why"**: Not just the "what"
- **Keep comments up to date**: Update when code changes

```go
// OrderService handles order processing operations including creation,
// validation, and status updates. It coordinates between the order
// repository and external payment systems.
type OrderService struct {
    repo     OrderRepository
    payment  PaymentProcessor
    logger   Logger
}

// ProcessOrder creates a new order and initiates payment processing.
// It returns the created order or an error if processing fails.
// The function validates the order data, saves it to the repository,
// and triggers payment processing asynchronously.
func (s *OrderService) ProcessOrder(ctx context.Context, req CreateOrderRequest) (*Order, error) {
    // Implementation
}
```

### README Files
- **Project overview**: Clear description of what the project does
- **Setup instructions**: How to build and run the project
- **API documentation**: How to use the public APIs
- **Contributing guidelines**: How to contribute to the project

### API Documentation
- **OpenAPI/Swagger**: For REST APIs
- **Protocol Buffers**: For gRPC services
- **Examples**: Provide usage examples for all endpoints

## Performance Guidelines

### General Principles
- **Profile first**: Don't optimize without measuring
- **Clear over fast**: Readability is more important than premature optimization
- **Use benchmarks**: Measure performance impact of changes

### Memory Management
- **Avoid allocations**: Reuse objects when possible
- **Use sync.Pool**: For frequently allocated/deallocated objects
- **Minimize garbage collection**: Reduce object creation in hot paths

### Concurrency
```go
// Use context for cancellation
func (s *OrderService) ProcessOrders(ctx context.Context, orders []Order) error {
    results := make(chan error, len(orders))
    
    for _, order := range orders {
        go func(o Order) {
            select {
            case <-ctx.Done():
                results <- ctx.Err()
            default:
                results <- s.processOrder(ctx, o)
            }
        }(order)
    }
    
    // Collect results
    for i := 0; i < len(orders); i++ {
        if err := <-results; err != nil {
            return err
        }
    }
    
    return nil
}
```

## Security Best Practices

### Input Validation
- **Validate all inputs**: Check data at boundaries
- **Use whitelist approach**: Allow only known good values
- **Sanitize data**: Clean user input before processing

### Authentication & Authorization
- **Use JWT tokens**: For stateless authentication
- **Implement RBAC**: Role-based access control
- **Validate permissions**: Check access rights for all operations

### Data Protection
- **Encrypt sensitive data**: At rest and in transit
- **Use HTTPS**: For all external communications
- **Implement rate limiting**: Prevent abuse

```go
// Input validation example
func ValidateOrderRequest(req CreateOrderRequest) error {
    if req.Amount <= 0 {
        return &ValidationError{
            Field:   "amount",
            Value:   req.Amount,
            Message: "amount must be positive",
        }
    }
    
    if req.UserID == "" {
        return &ValidationError{
            Field:   "user_id",
            Value:   req.UserID,
            Message: "user_id is required",
        }
    }
    
    // Validate UUID format
    if _, err := uuid.Parse(req.UserID); err != nil {
        return &ValidationError{
            Field:   "user_id",
            Value:   req.UserID,
            Message: "invalid UUID format",
        }
    }
    
    return nil
}
```

## Tooling & Automation

### Required Tools
- **gofmt**: Code formatting
- **golangci-lint**: Comprehensive linting
- **go vet**: Built-in analysis
- **go mod**: Dependency management

### Linting Configuration
```yaml
# .golangci.yml
run:
  timeout: 5m
  go: "1.21"

linters:
  enable:
    - gofmt
    - golint
    - govet
    - staticcheck
    - errcheck
    - gosimple
    - ineffassign
    - unused
    - misspell
    - gosec
    - prealloc
    - gocritic

linters-settings:
  gocritic:
    enabled-tags:
      - diagnostic
      - experimental
      - opinionated
      - performance
      - style

issues:
  exclude-rules:
    - path: _test\.go
      linters:
        - errcheck
```

### CI/CD Integration
```yaml
# GitHub Actions example
name: Go CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Go
      uses: actions/setup-go@v3
      with:
        go-version: 1.21
    
    - name: Install dependencies
      run: go mod download
    
    - name: Run linters
      run: |
        golangci-lint run
        go vet ./...
    
    - name: Run tests
      run: go test -race -coverprofile=coverage.txt -covermode=atomic ./...
    
    - name: Check coverage
      run: |
        go tool cover -func=coverage.txt
        go tool cover -html=coverage.txt -o coverage.html
```

## Code Review Guidelines

### What to Look For
- **Code formatting**: Ensure `gofmt` compliance
- **Error handling**: All errors properly handled
- **Testing**: Adequate test coverage
- **Documentation**: Public APIs documented
- **Performance**: No obvious performance issues
- **Security**: Input validation and proper access control

### Review Process
- **Small changes**: Focus on correctness and style
- **Large changes**: Also review architecture and design
- **Security changes**: Require security team review
- **Performance changes**: Require benchmark results

### Review Checklist
- [ ] Code follows formatting standards
- [ ] All errors are properly handled
- [ ] Tests are included and pass
- [ ] Public APIs are documented
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Code is readable and maintainable

---

## Related Guidelines

### **Core Development Standards**
- [Comprehensive Coding Standards](coding-standards.md) - Distributed systems coding principles
- [Database Design Standards](database-design-standards.md) - Database patterns and Go integration
- [Testing Guidelines](testing-guidelines.md) - Go testing strategies and quality gates
- [Code Review Guidelines](code-review-guidelines.md) - Go-specific review criteria
- [Error Handling Patterns](error-handling-patterns.md) - Go error handling strategies

### **API & Communication Standards**
- [API Design Principles](../../api/guides/api-design-principles.md) - Go API implementation patterns
- [Authorization Guidelines](../../api/guides/authorization.md) - Go security implementation
- [JWT Implementation](../../api/guides/jwt-implementation.md) - Go JWT handling
- [OAuth 2.0 Setup](../../api/guides/oauth-setup.md) - Go OAuth implementation
- [Rate Limiting](../../api/guides/rate-limiting.md) - Go rate limiting patterns

### **Infrastructure & Operations**
- [Deployment Guidelines](deployment-guidelines.md) - Go service deployment
- [Service Mesh Configuration](service-mesh-configuration-standards.md) - Go service mesh integration
- [Monitoring & Observability](monitoring-observability-standards.md) - Go observability patterns
- [Performance Standards](performance-standards.md) - Go performance optimization

### **Quick Reference**
- [Coding Standards Quick Reference](coding-standards-quick-reference.md) - Go daily checklist
- [Coding Standards Implementation Guide](coding-standards-implementation-guide.md) - Go implementation steps

### **Architecture References**
- [System Overview](../../architecture/overview/system-overview.md) - Go service architecture
- [Distributed Patterns](../../architecture/patterns/distributed-patterns.md) - Go implementation patterns
- [Architecture Decision Records](../../architecture/decisions/) - Go-related technical decisions

## References

- [Effective Go](https://golang.org/doc/effective_go.html)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Go Blog](https://blog.golang.org/)
- [Go Time Podcast](https://changelog.com/gotime)
- [Go Community Code of Conduct](https://golang.org/conduct)

## Version History

- **v1.0.0**: Initial version based on Go official style guide and community conventions
- **v1.1.0**: Added structured error handling and security best practices
- **v1.2.0**: Enhanced testing standards and tooling configuration
