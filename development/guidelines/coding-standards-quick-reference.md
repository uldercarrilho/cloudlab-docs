# 🚀 Coding Standards Quick Reference

## 📋 **Daily Checklist**

### **Before Committing**
- [ ] Code formatted (`go fmt`, `terraform fmt`)
- [ ] Linting passes (`golangci-lint run`, `tflint`)
- [ ] Tests pass (`go test ./...`)
- [ ] No TODO/FIXME comments in production code
- [ ] Error handling implemented
- [ ] Logging appropriate
- [ ] Security considerations addressed

### **Before Code Review**
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Performance impact assessed
- [ ] Rollback plan documented

---

## 🐹 **Go Standards**

### **Naming**
```go
// ✅ Good
var orderProcessor OrderProcessor
var maxRetryAttempts int
var userAuthService UserAuthService

// ❌ Avoid
var op OrderProcessor
var mra int
var uas UserAuthService
```

### **Error Handling**
```go
// ✅ Good
if err := validateInput(req); err != nil {
    return nil, fmt.Errorf("input validation failed: %w", err)
}

// ❌ Avoid
if err != nil {
    return err
}
```

### **Interface Design**
```go
// ✅ Good - Focused interface
type OrderRepository interface {
    Create(ctx context.Context, order *Order) error
    GetByID(ctx context.Context, id string) (*Order, error)
}

// ❌ Avoid - Too broad
type OrderRepository interface {
    Create(ctx context.Context, order *Order) error
    ProcessPayment(ctx context.Context, payment PaymentRequest) error
    SendEmail(ctx context.Context, email EmailRequest) error
}
```

### **Testing**
```go
// ✅ Good - Table-driven tests
func TestOrderValidation(t *testing.T) {
    tests := []struct {
        name    string
        order   Order
        wantErr bool
    }{
        {"valid order", Order{UserID: "user_123"}, false},
        {"empty user ID", Order{UserID: ""}, true},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.order.Validate()
            if tt.wantErr {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

---

## 🏗️ **Terraform Standards**

### **Naming Convention**
```hcl
# ✅ Good
resource "aws_eks_cluster" "main" {
  name = "${var.environment}-${var.project_name}-cluster"
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    Owner       = var.team_name
  }
}

# ❌ Avoid
resource "aws_eks_cluster" "cluster" {
  name = "my-cluster"
}
```

### **Variable Definition**
```hcl
# ✅ Good
variable "vpc_cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr_block, 0))
    error_message = "Must be a valid CIDR block."
  }
}
```

---

## ☸️ **Kubernetes Standards**

### **Resource Organization**
```yaml
# ✅ Good
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: ecommerce
  labels:
    app: order-service
    version: v1.0.0
    environment: production
    team: backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: order-service
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
```

---

## 🔌 **API Design Standards**

### **REST Endpoints**
```
# ✅ Good
GET    /api/v1/orders                    # List orders
POST   /api/v1/orders                    # Create order
GET    /api/v1/orders/{id}              # Get specific order
PUT    /api/v1/orders/{id}              # Update order
DELETE /api/v1/orders/{id}              # Delete order
GET    /api/v1/orders/{id}/items        # Get order items
```

### **Response Format**
```json
// ✅ Good
{
  "data": {
    "id": "order_123",
    "status": "pending",
    "total": 99.99
  },
  "meta": {
    "request_id": "req_456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// ✅ Good Error Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order data",
    "details": [
      {
        "field": "total",
        "message": "Total must be greater than 0"
      }
    ]
  }
}
```

---

## 🔒 **Security Standards**

### **Input Validation**
```go
// ✅ Good
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    var req CreateOrderRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }
    
    if err := req.Validate(); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Process order...
}

// ❌ Avoid
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    var req CreateOrderRequest
    json.NewDecoder(r.Body).Decode(&req) // No error handling!
    
    // Process order without validation...
}
```

### **Authentication**
```go
// ✅ Good
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    userID := middleware.GetUserID(r.Context())
    if userID == "" {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    
    // Process order...
}
```

---

## 📊 **Observability Standards**

### **Structured Logging**
```go
// ✅ Good
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    requestID := middleware.GetRequestID(ctx)
    userID := middleware.GetUserID(ctx)
    
    logger := log.With().
        Str("request_id", requestID).
        Str("user_id", userID).
        Str("endpoint", "create_order").
        Logger()
    
    logger.Info().Msg("Creating new order")
    
    // ... implementation
    
    logger.Info().
        Str("order_id", order.ID).
        Int("total_items", len(order.Items)).
        Msg("Order created successfully")
}
```

### **Metrics**
```go
// ✅ Good
var (
    orderCreationTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "orders_created_total",
            Help: "Total number of orders created",
        },
        []string{"status", "payment_method"},
    )
    
    orderCreationDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "order_creation_duration_seconds",
            Help:    "Time taken to create an order",
            Buckets: prometheus.DefBuckets,
        },
        []string{"status"},
    )
)

// Use in code
func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    defer func() {
        duration := time.Since(start).Seconds()
        orderCreationDuration.WithLabelValues("success").Observe(duration)
    }()
    
    // ... implementation
    
    orderCreationTotal.WithLabelValues("success", "credit_card").Inc()
}
```

---

## 🧪 **Testing Standards**

### **Test Coverage Target**
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **Performance Tests**: For high-traffic endpoints

### **Test Organization**
```go
// ✅ Good
func TestOrderService_CreateOrder(t *testing.T) {
    // Arrange
    mockRepo := &MockOrderRepository{}
    mockPayment := &MockPaymentProcessor{}
    service := NewOrderService(mockRepo, mockPayment)
    
    // Act
    order, err := service.CreateOrder(ctx, CreateOrderRequest{...})
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, order)
    assert.Equal(t, "user_123", order.UserID)
}
```

---

## 📚 **Documentation Standards**

### **Go Documentation**
```go
// Package orderservice provides order management functionality
// for the e-commerce platform.
package orderservice

// OrderProcessor handles order processing operations.
type OrderProcessor interface {
    // CreateOrder creates a new order for the specified user.
    // The order is validated against business rules and inventory
    // availability before creation.
    CreateOrder(ctx context.Context, req CreateOrderRequest) (*Order, error)
}
```

---

## 🚨 **Common Anti-Patterns**

### **❌ Don't Do This**
- Hardcode configuration values
- Ignore error returns
- Use global variables
- Create circular dependencies
- Mix business logic with infrastructure code
- Log sensitive information
- Use generic error messages
- Skip input validation
- Create overly complex functions (>15 cyclomatic complexity)
- Use TODO/FIXME in production code

### **✅ Do This Instead**
- Use environment variables or configuration files
- Always handle errors appropriately
- Use dependency injection
- Design clear service boundaries
- Separate concerns properly
- Log only non-sensitive information
- Provide specific, actionable error messages
- Validate all inputs
- Break complex functions into smaller ones
- Address technical debt before production

---

## 🛠️ **Quick Commands**

### **Go Development**
```bash
# Format code
go fmt ./...

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run linter
golangci-lint run

# Build
go build ./...

# Run race detector
go test -race ./...
```

### **Terraform Development**
```bash
# Format code
terraform fmt -recursive

# Validate
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply
```

### **Kubernetes Development**
```bash
# Validate YAML
kubeval *.yaml

# Check security
kube-score *.yaml

# Apply resources
kubectl apply -f *.yaml

# Check status
kubectl get pods -n namespace
```

---

## 📞 **Need Help?**

- **Go Standards**: See `development/guidelines/coding-standards-golang.md`
- **Implementation Guide**: See `development/guidelines/coding-standards-implementation-guide.md`
- **Security Practices**: See `development/guidelines/security-best-practices.md`
- **Testing Strategy**: See `development/guidelines/mocking-strategy.md`

---

**Remember**: These standards exist to help you write better, more maintainable code. When in doubt, ask your team or refer to the comprehensive documentation. Standards evolve - if you find a better way, suggest it!
