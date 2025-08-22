# Microservices Architecture

## Overview

Microservices is an architectural style that structures an application as a collection of loosely coupled, independently deployable services. Each service is responsible for a specific business capability and communicates with other services through well-defined APIs.

## Core Concepts

### 1. Service Decomposition

**Definition**: Breaking down a monolithic application into smaller, focused services based on business domains.

**Key Principles**:
- **Single Responsibility**: Each service handles one specific business capability
- **Domain-Driven Design**: Services align with business domain boundaries
- **Bounded Context**: Clear boundaries between different business areas

**Example Service Decomposition**:
```
E-commerce Platform:
├── User Management Service
├── Product Catalog Service
├── Order Processing Service
├── Payment Service
├── Inventory Service
├── Shipping Service
└── Notification Service
```

### 2. Service Independence

**Characteristics**:
- **Independent Deployment**: Services can be deployed separately without affecting others
- **Technology Diversity**: Different services can use different programming languages, databases, or frameworks
- **Team Autonomy**: Different teams can work on different services independently

**Benefits**:
- Faster development cycles
- Easier technology adoption
- Reduced coordination overhead

### 3. Communication Patterns

#### Synchronous Communication
- **HTTP/REST**: Simple request-response pattern
- **gRPC**: High-performance RPC framework
- **GraphQL**: Flexible data querying

#### Asynchronous Communication
- **Message Queues**: Reliable message delivery (RabbitMQ, Apache Kafka)
- **Event Streaming**: Real-time event processing
- **Publish-Subscribe**: Decoupled communication

## Implementation Patterns

### 1. API Gateway Pattern

**Purpose**: Single entry point for all client requests to microservices.

**Responsibilities**:
- **Routing**: Direct requests to appropriate services
- **Authentication**: Centralized security
- **Rate Limiting**: Protect services from overload
- **Load Balancing**: Distribute traffic across service instances
- **Monitoring**: Centralized logging and metrics

**Implementation Example**:
```go
// API Gateway routing configuration
type Route struct {
    Path        string
    Service     string
    Methods     []string
    AuthRequired bool
}

var routes = []Route{
    {Path: "/api/users", Service: "user-service", Methods: []string{"GET", "POST"}, AuthRequired: true},
    {Path: "/api/products", Service: "product-service", Methods: []string{"GET"}, AuthRequired: false},
    {Path: "/api/orders", Service: "order-service", Methods: []string{"GET", "POST", "PUT"}, AuthRequired: true},
}
```

### 2. Service Discovery

**Purpose**: Enable services to find and communicate with each other dynamically.

**Patterns**:
- **Client-Side Discovery**: Client queries service registry directly
- **Server-Side Discovery**: Load balancer queries service registry

**Implementation with Consul**:
```go
type ServiceRegistry struct {
    consulClient *consul.Client
}

func (sr *ServiceRegistry) RegisterService(service *Service) error {
    registration := &consul.AgentServiceRegistration{
        ID:      service.ID,
        Name:    service.Name,
        Port:    service.Port,
        Address: service.Address,
        Check: &consul.AgentServiceCheck{
            HTTP:                           fmt.Sprintf("http://%s:%d/health", service.Address, service.Port),
            Interval:                       "10s",
            Timeout:                        "5s",
            DeregisterCriticalServiceAfter: "1m",
        },
    }
    return sr.consulClient.Agent().ServiceRegister(registration)
}
```

### 3. Circuit Breaker Pattern

**Purpose**: Prevent cascading failures by monitoring service health and failing fast when services are unavailable.

**States**:
- **Closed**: Normal operation, requests pass through
- **Open**: Service is failing, requests fail fast
- **Half-Open**: Testing if service has recovered

**Implementation Example**:
```go
type CircuitBreaker struct {
    failureThreshold int
    timeout          time.Duration
    state            CircuitState
    lastFailureTime  time.Time
    failureCount     int
    mutex            sync.RWMutex
}

func (cb *CircuitBreaker) Execute(command func() error) error {
    if !cb.canExecute() {
        return ErrCircuitBreakerOpen
    }
    
    err := command()
    cb.recordResult(err)
    return err
}

func (cb *CircuitBreaker) canExecute() bool {
    cb.mutex.RLock()
    defer cb.mutex.RUnlock()
    
    switch cb.state {
    case StateClosed:
        return true
    case StateOpen:
        if time.Since(cb.lastFailureTime) > cb.timeout {
            cb.state = StateHalfOpen
            return true
        }
        return false
    case StateHalfOpen:
        return true
    default:
        return false
    }
}
```

### 4. Saga Pattern

**Purpose**: Manage distributed transactions across multiple microservices using a sequence of local transactions.

**Types**:
- **Choreography**: Services communicate through events
- **Orchestration**: Central coordinator manages the workflow

**Example E-commerce Saga**:
```go
type OrderSaga struct {
    orderID     string
    coordinator *SagaCoordinator
}

func (s *OrderSaga) Execute() error {
    // Step 1: Reserve inventory
    if err := s.reserveInventory(); err != nil {
        return s.compensateInventory(err)
    }
    
    // Step 2: Process payment
    if err := s.processPayment(); err != nil {
        s.compensateInventory(nil)
        return s.compensatePayment(err)
    }
    
    // Step 3: Create shipping label
    if err := s.createShippingLabel(); err != nil {
        s.compensateInventory(nil)
        s.compensatePayment(nil)
        return s.compensateShipping(err)
    }
    
    return nil
}

func (s *OrderSaga) compensateInventory(err error) error {
    // Compensation logic for inventory reservation
    return s.coordinator.CompensateInventory(s.orderID)
}
```

## Data Management Patterns

### 1. Database per Service

**Principle**: Each service owns and manages its own database.

**Benefits**:
- Service independence
- Technology flexibility
- Data isolation

**Challenges**:
- Data consistency across services
- Complex querying across boundaries
- Data duplication

### 2. Event Sourcing

**Principle**: Store all changes to application state as a sequence of events.

**Benefits**:
- Complete audit trail
- Temporal queries
- Easy debugging and testing

**Implementation Example**:
```go
type EventStore struct {
    events map[string][]Event
    mutex  sync.RWMutex
}

type Event struct {
    ID        string
    Type      string
    Data      interface{}
    Timestamp time.Time
    Version   int
}

func (es *EventStore) Append(streamID string, events []Event) error {
    es.mutex.Lock()
    defer es.mutex.Unlock()
    
    if es.events[streamID] == nil {
        es.events[streamID] = []Event{}
    }
    
    for _, event := range events {
        event.Version = len(es.events[streamID]) + 1
        es.events[streamID] = append(es.events[streamID], event)
    }
    
    return nil
}
```

### 3. CQRS (Command Query Responsibility Segregation)

**Principle**: Separate read and write operations into different models.

**Benefits**:
- Optimized read and write operations
- Scalability improvements
- Better performance for specific use cases

**Implementation**:
```go
// Command side - Write operations
type OrderCommandHandler struct {
    eventStore EventStore
}

func (h *OrderCommandHandler) CreateOrder(cmd CreateOrderCommand) error {
    order := NewOrder(cmd.CustomerID, cmd.Items)
    events := order.GetUncommittedEvents()
    
    return h.eventStore.Append(order.ID, events)
}

// Query side - Read operations
type OrderQueryHandler struct {
    readModel OrderReadModel
}

func (h *OrderQueryHandler) GetOrder(orderID string) (*OrderView, error) {
    return h.readModel.GetByID(orderID)
}
```

## Deployment and Operations

### 1. Containerization

**Technology**: Docker containers for consistent deployment environments.

**Benefits**:
- Environment consistency
- Easy scaling
- Resource isolation

**Dockerfile Example**:
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

### 2. Orchestration

**Technology**: Kubernetes for managing containerized services.

**Key Concepts**:
- **Pods**: Smallest deployable units
- **Services**: Stable network endpoints
- **Deployments**: Manage pod replicas
- **ConfigMaps/Secrets**: Configuration management

**Kubernetes Deployment Example**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: user-service-config
              key: db_host
```

### 3. Monitoring and Observability

**Three Pillars**:
- **Metrics**: Quantitative measurements (CPU, memory, response time)
- **Logging**: Structured log records
- **Tracing**: Request flow across services

**Implementation with OpenTelemetry**:
```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/trace"
)

func (s *UserService) CreateUser(ctx context.Context, user *User) error {
    ctx, span := otel.Tracer("user-service").Start(ctx, "CreateUser")
    defer span.End()
    
    // Add custom attributes to span
    span.SetAttributes(
        attribute.String("user.email", user.Email),
        attribute.String("user.role", user.Role),
    )
    
    // Business logic here
    
    return nil
}
```

## Best Practices

### 1. Service Design

- **Small and Focused**: Keep services small enough to understand and maintain
- **Loose Coupling**: Minimize dependencies between services
- **High Cohesion**: Related functionality should be in the same service
- **API-First**: Design APIs before implementing services

### 2. Data Consistency

- **Eventual Consistency**: Accept temporary inconsistencies for better performance
- **Saga Pattern**: Use for complex distributed transactions
- **Event Sourcing**: Consider for audit and temporal requirements
- **CQRS**: Separate read and write models when beneficial

### 3. Security

- **Service-to-Service Authentication**: Use mTLS or JWT tokens
- **API Security**: Implement rate limiting, input validation
- **Secrets Management**: Use dedicated tools (HashiCorp Vault, AWS Secrets Manager)
- **Network Security**: Implement network policies and service mesh

### 4. Testing

- **Unit Tests**: Test individual service logic
- **Integration Tests**: Test service interactions
- **Contract Tests**: Verify API contracts between services
- **End-to-End Tests**: Test complete user workflows

## Common Anti-Patterns

### 1. Distributed Monolith

**Problem**: Services are tightly coupled and must be deployed together.

**Symptoms**:
- Services share the same lifecycle
- Changes require coordination across teams
- Database coupling between services

**Solution**: Ensure true service independence and loose coupling.

### 2. Database Coupling

**Problem**: Services directly access each other's databases.

**Symptoms**:
- Direct database connections between services
- Shared database schemas
- Tight coupling through data access

**Solution**: Use APIs for inter-service communication, not direct database access.

### 3. Over-Engineering

**Problem**: Implementing microservices when not needed.

**Symptoms**:
- Premature service decomposition
- Unnecessary complexity
- Performance overhead

**Solution**: Start with a monolith and extract services when there's a clear need.

## Migration Strategies

### 1. Strangler Fig Pattern

**Approach**: Gradually replace parts of a monolith with microservices.

**Steps**:
1. Identify bounded contexts
2. Extract services incrementally
3. Route traffic gradually
4. Remove old monolith code

### 2. Database Migration

**Approach**: Gradually migrate data and functionality.

**Steps**:
1. Create new service with its own database
2. Implement data synchronization
3. Gradually migrate functionality
4. Switch traffic and remove old code

## Conclusion

Microservices architecture provides a powerful approach to building scalable, maintainable distributed systems. However, it requires careful consideration of:

- **Service boundaries** and decomposition
- **Communication patterns** and failure handling
- **Data consistency** and transaction management
- **Operational complexity** and monitoring
- **Team organization** and development processes

The key to success is starting simple and evolving the architecture based on actual needs, not theoretical benefits. Each service should solve a real business problem and provide clear value to the overall system.

## Related Concepts

- [Distributed Systems Patterns](../../architecture/patterns/distributed-patterns.md)
- [Event-Driven Architecture](./event-driven.md)
- [API Design Principles](../../api/guides/api-design-principles.md)
- [Database Consistency Patterns](../../architecture/decisions/ADR-004-data-storage-consistency-patterns.md)
