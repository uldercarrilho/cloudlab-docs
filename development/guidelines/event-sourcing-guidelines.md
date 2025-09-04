# Event Sourcing Guidelines

## 📋 Document Information

- **Document Name**: Event Sourcing Guidelines
- **Version**: 1.0
- **Date**: 2025-09-04
- **Author**: AI Agent (TASK-025)
- **Status**: Approved
- **Related Documents**: 
  - [Database Design Standards](database-design-standards.md)
  - [ADR-004: Data Storage & Consistency Patterns](../../architecture/decisions/ADR-004-data-storage-consistency-patterns.md)
  - [ADR-005: Message Queue & Event Streaming](../../architecture/decisions/ADR-005-message-queue-event-streaming.md)
  - [Business Rules](../../product/PRD-001-business-rules.md)

---

## 🎯 Purpose & Scope

### Purpose
Establish comprehensive event sourcing guidelines for the CloudLab distributed e-commerce platform, ensuring consistent event design, storage, and replay patterns across all services.

### Scope
This document covers:
- Event design patterns and naming conventions
- Event store implementation and schema design
- Event versioning and migration strategies
- Event replay and projection patterns
- CQRS (Command Query Responsibility Segregation) implementation
- Event-driven architecture patterns
- Performance optimization for event processing
- Monitoring and observability for event streams

---

## 🏗️ Event Sourcing Architecture Overview

### Technology Stack
Based on [ADR-004: Data Storage & Consistency Patterns](../../architecture/decisions/ADR-004-data-storage-consistency-patterns.md) and [ADR-005: Message Queue & Event Streaming](../../architecture/decisions/ADR-005-message-queue-event-streaming.md):

- **Event Store**: PostgreSQL with JSONB for event data
- **Message Queue**: Apache Kafka for event streaming
- **Event Processing**: Go services with event handlers
- **Projections**: Materialized views and read models
- **Monitoring**: Prometheus metrics and distributed tracing

### Event Flow Architecture
```
Command → Aggregate → Event → Event Store → Event Stream → Projections → Read Models
```

---

## 📊 Event Design Principles

### 1. Event Naming Conventions

#### Event Type Naming
```go
// Use past tense verbs for event names
// Format: [Aggregate][Action]ed

// Good examples:
type OrderCreated struct {
    OrderID    uuid.UUID `json:"order_id"`
    UserID     uuid.UUID `json:"user_id"`
    TotalAmount decimal.Decimal `json:"total_amount"`
    CreatedAt  time.Time `json:"created_at"`
}

type PaymentProcessed struct {
    OrderID       uuid.UUID `json:"order_id"`
    PaymentID     uuid.UUID `json:"payment_id"`
    Amount        decimal.Decimal `json:"amount"`
    PaymentMethod string    `json:"payment_method"`
    ProcessedAt   time.Time `json:"processed_at"`
}

type InventoryReserved struct {
    ProductID uuid.UUID `json:"product_id"`
    Quantity  int       `json:"quantity"`
    OrderID   uuid.UUID `json:"order_id"`
    ReservedAt time.Time `json:"reserved_at"`
}

// Avoid present tense or future tense
// Bad: OrderCreate, OrderWillBeCreated
```

#### Event Versioning
```go
// Use semantic versioning for event schemas
type OrderCreatedV1 struct {
    OrderID    uuid.UUID `json:"order_id"`
    UserID     uuid.UUID `json:"user_id"`
    TotalAmount decimal.Decimal `json:"total_amount"`
    CreatedAt  time.Time `json:"created_at"`
}

type OrderCreatedV2 struct {
    OrderID     uuid.UUID `json:"order_id"`
    UserID      uuid.UUID `json:"user_id"`
    TotalAmount decimal.Decimal `json:"total_amount"`
    Currency    string    `json:"currency"` // New field
    CreatedAt   time.Time `json:"created_at"`
}
```

### 2. Event Structure Standards

#### Base Event Interface
```go
// Define common event interface
type Event interface {
    GetEventID() uuid.UUID
    GetAggregateID() uuid.UUID
    GetEventType() string
    GetEventVersion() int
    GetOccurredAt() time.Time
    GetEventData() interface{}
}

// Base event implementation
type BaseEvent struct {
    EventID     uuid.UUID `json:"event_id"`
    AggregateID uuid.UUID `json:"aggregate_id"`
    EventType   string    `json:"event_type"`
    EventVersion int      `json:"event_version"`
    OccurredAt  time.Time `json:"occurred_at"`
    EventData   json.RawMessage `json:"event_data"`
}

func (e BaseEvent) GetEventID() uuid.UUID { return e.EventID }
func (e BaseEvent) GetAggregateID() uuid.UUID { return e.AggregateID }
func (e BaseEvent) GetEventType() string { return e.EventType }
func (e BaseEvent) GetEventVersion() int { return e.EventVersion }
func (e BaseEvent) GetOccurredAt() time.Time { return e.OccurredAt }
func (e BaseEvent) GetEventData() interface{} { return e.EventData }
```

#### Event Metadata
```go
// Include comprehensive metadata
type EventMetadata struct {
    EventID       uuid.UUID              `json:"event_id"`
    AggregateID   uuid.UUID              `json:"aggregate_id"`
    AggregateType string                 `json:"aggregate_type"`
    EventType     string                 `json:"event_type"`
    EventVersion  int                    `json:"event_version"`
    OccurredAt    time.Time              `json:"occurred_at"`
    CausationID   uuid.UUID              `json:"causation_id,omitempty"`
    CorrelationID uuid.UUID              `json:"correlation_id,omitempty"`
    UserID        uuid.UUID              `json:"user_id,omitempty"`
    TenantID      uuid.UUID              `json:"tenant_id,omitempty"`
    Source        string                 `json:"source"`
    Tags          map[string]interface{} `json:"tags,omitempty"`
}
```

---

## 🗄️ Event Store Implementation

### 1. Event Store Schema

#### Core Event Store Tables
```sql
-- Event store table (from database-design-standards.md)
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_version INTEGER NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_event_version_positive CHECK (event_version > 0)
);

-- Event stream table for Kafka integration
CREATE TABLE event_streams (
    stream_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    stream_version INTEGER NOT NULL DEFAULT 0,
    last_event_id UUID REFERENCES events(event_id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_stream_version_positive CHECK (stream_version >= 0)
);

-- Event snapshots for performance optimization
CREATE TABLE event_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_version INTEGER NOT NULL,
    aggregate_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_aggregate_version_positive CHECK (aggregate_version > 0)
);

-- Indexes for performance
CREATE INDEX idx_events_aggregate_id ON events(aggregate_id);
CREATE INDEX idx_events_aggregate_type ON events(aggregate_type);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_event_streams_aggregate_id ON event_streams(aggregate_id);
CREATE INDEX idx_event_snapshots_aggregate_id ON event_snapshots(aggregate_id);
```

### 2. Event Store Operations

#### Event Persistence
```go
// Event store interface
type EventStore interface {
    SaveEvents(ctx context.Context, aggregateID uuid.UUID, events []Event, expectedVersion int) error
    GetEvents(ctx context.Context, aggregateID uuid.UUID, fromVersion int) ([]Event, error)
    GetEventsByType(ctx context.Context, eventType string, fromDate time.Time) ([]Event, error)
    SaveSnapshot(ctx context.Context, aggregateID uuid.UUID, version int, data interface{}) error
    GetSnapshot(ctx context.Context, aggregateID uuid.UUID) (*Snapshot, error)
}

// PostgreSQL event store implementation
type PostgresEventStore struct {
    db *sql.DB
}

func (es *PostgresEventStore) SaveEvents(ctx context.Context, aggregateID uuid.UUID, events []Event, expectedVersion int) error {
    tx, err := es.db.BeginTx(ctx, nil)
    if err != nil {
        return fmt.Errorf("failed to begin transaction: %w", err)
    }
    defer tx.Rollback()

    // Check current version
    var currentVersion int
    err = tx.QueryRowContext(ctx, 
        "SELECT stream_version FROM event_streams WHERE aggregate_id = $1", 
        aggregateID).Scan(&currentVersion)
    
    if err == sql.ErrNoRows {
        currentVersion = 0
    } else if err != nil {
        return fmt.Errorf("failed to get current version: %w", err)
    }

    if currentVersion != expectedVersion {
        return fmt.Errorf("concurrency conflict: expected version %d, got %d", expectedVersion, currentVersion)
    }

    // Save events
    for i, event := range events {
        eventVersion := expectedVersion + i + 1
        _, err = tx.ExecContext(ctx, `
            INSERT INTO events (aggregate_id, aggregate_type, event_type, event_version, event_data, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            aggregateID, event.GetAggregateType(), event.GetEventType(), eventVersion, 
            event.GetEventData(), event.GetMetadata())
        
        if err != nil {
            return fmt.Errorf("failed to save event: %w", err)
        }
    }

    // Update stream version
    _, err = tx.ExecContext(ctx, `
        INSERT INTO event_streams (aggregate_id, aggregate_type, stream_version)
        VALUES ($1, $2, $3)
        ON CONFLICT (aggregate_id) 
        DO UPDATE SET stream_version = $3, updated_at = NOW()`,
        aggregateID, events[0].GetAggregateType(), expectedVersion+len(events))

    if err != nil {
        return fmt.Errorf("failed to update stream version: %w", err)
    }

    return tx.Commit()
}
```

---

## 🔄 Event Replay and Projections

### 1. Event Replay Patterns

#### Replay from Beginning
```go
// Replay all events for an aggregate
func (es *PostgresEventStore) ReplayEvents(ctx context.Context, aggregateID uuid.UUID) ([]Event, error) {
    rows, err := es.db.QueryContext(ctx, `
        SELECT event_id, aggregate_id, aggregate_type, event_type, event_version, 
               event_data, metadata, created_at
        FROM events 
        WHERE aggregate_id = $1 
        ORDER BY event_version ASC`,
        aggregateID)
    
    if err != nil {
        return nil, fmt.Errorf("failed to query events: %w", err)
    }
    defer rows.Close()

    var events []Event
    for rows.Next() {
        var event BaseEvent
        err := rows.Scan(&event.EventID, &event.AggregateID, &event.AggregateType,
                        &event.EventType, &event.EventVersion, &event.EventData,
                        &event.Metadata, &event.OccurredAt)
        if err != nil {
            return nil, fmt.Errorf("failed to scan event: %w", err)
        }
        events = append(events, event)
    }

    return events, nil
}

// Replay from specific version
func (es *PostgresEventStore) ReplayEventsFromVersion(ctx context.Context, aggregateID uuid.UUID, fromVersion int) ([]Event, error) {
    rows, err := es.db.QueryContext(ctx, `
        SELECT event_id, aggregate_id, aggregate_type, event_type, event_version, 
               event_data, metadata, created_at
        FROM events 
        WHERE aggregate_id = $1 AND event_version > $2
        ORDER BY event_version ASC`,
        aggregateID, fromVersion)
    
    if err != nil {
        return nil, fmt.Errorf("failed to query events: %w", err)
    }
    defer rows.Close()

    var events []Event
    for rows.Next() {
        var event BaseEvent
        err := rows.Scan(&event.EventID, &event.AggregateID, &event.AggregateType,
                        &event.EventType, &event.EventVersion, &event.EventData,
                        &event.Metadata, &event.OccurredAt)
        if err != nil {
            return nil, fmt.Errorf("failed to scan event: %w", err)
        }
        events = append(events, event)
    }

    return events, nil
}
```

### 2. Projection Patterns

#### Read Model Projections
```go
// Projection interface
type Projection interface {
    HandleEvent(ctx context.Context, event Event) error
    GetProjectionName() string
    GetLastProcessedEventID() uuid.UUID
    SetLastProcessedEventID(eventID uuid.UUID) error
}

// Order summary projection
type OrderSummaryProjection struct {
    db *sql.DB
}

func (p *OrderSummaryProjection) HandleEvent(ctx context.Context, event Event) error {
    switch event.GetEventType() {
    case "OrderCreated":
        return p.handleOrderCreated(ctx, event)
    case "PaymentProcessed":
        return p.handlePaymentProcessed(ctx, event)
    case "OrderShipped":
        return p.handleOrderShipped(ctx, event)
    default:
        return nil // Ignore unknown events
    }
}

func (p *OrderSummaryProjection) handleOrderCreated(ctx context.Context, event Event) error {
    var orderData struct {
        OrderID     uuid.UUID       `json:"order_id"`
        UserID      uuid.UUID       `json:"user_id"`
        TotalAmount decimal.Decimal `json:"total_amount"`
        CreatedAt   time.Time       `json:"created_at"`
    }

    if err := json.Unmarshal(event.GetEventData().(json.RawMessage), &orderData); err != nil {
        return fmt.Errorf("failed to unmarshal order data: %w", err)
    }

    _, err := p.db.ExecContext(ctx, `
        INSERT INTO order_summaries (order_id, user_id, total_amount, status, created_at)
        VALUES ($1, $2, $3, 'created', $4)
        ON CONFLICT (order_id) DO NOTHING`,
        orderData.OrderID, orderData.UserID, orderData.TotalAmount, orderData.CreatedAt)

    return err
}
```

---

## 🏗️ CQRS Implementation

### 1. Command Side (Write Model)

#### Command Handler Pattern
```go
// Command interface
type Command interface {
    GetCommandID() uuid.UUID
    GetAggregateID() uuid.UUID
    GetCommandType() string
}

// Create order command
type CreateOrderCommand struct {
    CommandID   uuid.UUID       `json:"command_id"`
    UserID      uuid.UUID       `json:"user_id"`
    Items       []OrderItem     `json:"items"`
    TotalAmount decimal.Decimal `json:"total_amount"`
}

func (c CreateOrderCommand) GetCommandID() uuid.UUID { return c.CommandID }
func (c CreateOrderCommand) GetAggregateID() uuid.UUID { return c.CommandID } // New aggregate
func (c CreateOrderCommand) GetCommandType() string { return "CreateOrder" }

// Command handler
type OrderCommandHandler struct {
    eventStore EventStore
}

func (h *OrderCommandHandler) HandleCreateOrder(ctx context.Context, cmd CreateOrderCommand) error {
    // Create new order aggregate
    order := NewOrder(cmd.CommandID, cmd.UserID)
    
    // Apply command to aggregate
    if err := order.Create(cmd.Items, cmd.TotalAmount); err != nil {
        return fmt.Errorf("failed to create order: %w", err)
    }

    // Save events
    events := order.GetUncommittedEvents()
    if err := h.eventStore.SaveEvents(ctx, order.GetID(), events, 0); err != nil {
        return fmt.Errorf("failed to save events: %w", err)
    }

    order.MarkEventsAsCommitted()
    return nil
}
```

### 2. Query Side (Read Model)

#### Read Model Queries
```go
// Query interface
type Query interface {
    GetQueryID() uuid.UUID
    GetQueryType() string
}

// Get order summary query
type GetOrderSummaryQuery struct {
    QueryID uuid.UUID `json:"query_id"`
    OrderID uuid.UUID `json:"order_id"`
}

func (q GetOrderSummaryQuery) GetQueryID() uuid.UUID { return q.QueryID }
func (q GetOrderSummaryQuery) GetQueryType() string { return "GetOrderSummary" }

// Query handler
type OrderQueryHandler struct {
    db *sql.DB
}

func (h *OrderQueryHandler) HandleGetOrderSummary(ctx context.Context, query GetOrderSummaryQuery) (*OrderSummary, error) {
    var summary OrderSummary
    err := h.db.QueryRowContext(ctx, `
        SELECT order_id, user_id, total_amount, status, created_at, updated_at
        FROM order_summaries 
        WHERE order_id = $1`,
        query.OrderID).Scan(
        &summary.OrderID, &summary.UserID, &summary.TotalAmount,
        &summary.Status, &summary.CreatedAt, &summary.UpdatedAt)

    if err == sql.ErrNoRows {
        return nil, fmt.Errorf("order not found")
    }
    if err != nil {
        return nil, fmt.Errorf("failed to query order summary: %w", err)
    }

    return &summary, nil
}
```

---

## 📡 Event-Driven Architecture

### 1. Event Publishing

#### Event Publisher Interface
```go
// Event publisher interface
type EventPublisher interface {
    PublishEvent(ctx context.Context, event Event) error
    PublishEvents(ctx context.Context, events []Event) error
}

// Kafka event publisher
type KafkaEventPublisher struct {
    producer kafka.Producer
    topic    string
}

func (p *KafkaEventPublisher) PublishEvent(ctx context.Context, event Event) error {
    eventBytes, err := json.Marshal(event)
    if err != nil {
        return fmt.Errorf("failed to marshal event: %w", err)
    }

    message := &kafka.Message{
        TopicPartition: kafka.TopicPartition{Topic: &p.topic, Partition: kafka.PartitionAny},
        Value:          eventBytes,
        Headers: []kafka.Header{
            {Key: "event-type", Value: []byte(event.GetEventType())},
            {Key: "aggregate-id", Value: []byte(event.GetAggregateID().String())},
            {Key: "event-version", Value: []byte(strconv.Itoa(event.GetEventVersion()))},
        },
    }

    return p.producer.Produce(message, nil)
}
```

### 2. Event Subscribing

#### Event Subscriber Pattern
```go
// Event subscriber interface
type EventSubscriber interface {
    Subscribe(ctx context.Context, eventTypes []string, handler EventHandler) error
    Unsubscribe() error
}

// Event handler interface
type EventHandler interface {
    HandleEvent(ctx context.Context, event Event) error
    GetHandlerName() string
    GetSubscribedEventTypes() []string
}

// Kafka event subscriber
type KafkaEventSubscriber struct {
    consumer kafka.Consumer
    topic    string
    groupID  string
}

func (s *KafkaEventSubscriber) Subscribe(ctx context.Context, eventTypes []string, handler EventHandler) error {
    err := s.consumer.Subscribe(s.topic, nil)
    if err != nil {
        return fmt.Errorf("failed to subscribe to topic: %w", err)
    }

    go func() {
        for {
            select {
            case <-ctx.Done():
                return
            default:
                msg, err := s.consumer.ReadMessage(-1)
                if err != nil {
                    log.Printf("Error reading message: %v", err)
                    continue
                }

                // Parse event
                var event BaseEvent
                if err := json.Unmarshal(msg.Value, &event); err != nil {
                    log.Printf("Error unmarshaling event: %v", err)
                    continue
                }

                // Check if we should handle this event type
                shouldHandle := false
                for _, eventType := range eventTypes {
                    if event.GetEventType() == eventType {
                        shouldHandle = true
                        break
                    }
                }

                if shouldHandle {
                    if err := handler.HandleEvent(ctx, event); err != nil {
                        log.Printf("Error handling event: %v", err)
                    }
                }

                // Commit message
                s.consumer.CommitMessage(msg)
            }
        }
    }()

    return nil
}
```

---

## ⚡ Performance Optimization

### 1. Event Store Optimization

#### Snapshot Strategy
```go
// Snapshot manager
type SnapshotManager struct {
    eventStore EventStore
    snapshotInterval int // Create snapshot every N events
}

func (sm *SnapshotManager) ShouldCreateSnapshot(aggregateID uuid.UUID, currentVersion int) bool {
    return currentVersion%sm.snapshotInterval == 0
}

func (sm *SnapshotManager) CreateSnapshot(ctx context.Context, aggregateID uuid.UUID, aggregate interface{}) error {
    // Get current version
    events, err := sm.eventStore.GetEvents(ctx, aggregateID, 0)
    if err != nil {
        return fmt.Errorf("failed to get events: %w", err)
    }

    currentVersion := len(events)
    if !sm.ShouldCreateSnapshot(aggregateID, currentVersion) {
        return nil
    }

    // Create snapshot
    aggregateData, err := json.Marshal(aggregate)
    if err != nil {
        return fmt.Errorf("failed to marshal aggregate: %w", err)
    }

    return sm.eventStore.SaveSnapshot(ctx, aggregateID, currentVersion, aggregateData)
}
```

### 2. Event Processing Optimization

#### Batch Processing
```go
// Batch event processor
type BatchEventProcessor struct {
    batchSize    int
    flushTimeout time.Duration
    events       []Event
    mutex        sync.Mutex
    publisher    EventPublisher
}

func (p *BatchEventProcessor) ProcessEvent(ctx context.Context, event Event) error {
    p.mutex.Lock()
    defer p.mutex.Unlock()

    p.events = append(p.events, event)

    if len(p.events) >= p.batchSize {
        return p.flushEvents(ctx)
    }

    return nil
}

func (p *BatchEventProcessor) flushEvents(ctx context.Context) error {
    if len(p.events) == 0 {
        return nil
    }

    err := p.publisher.PublishEvents(ctx, p.events)
    if err != nil {
        return fmt.Errorf("failed to publish events: %w", err)
    }

    p.events = p.events[:0] // Clear slice
    return nil
}
```

---

## 📊 Monitoring and Observability

### 1. Event Metrics

#### Event Processing Metrics
```go
// Event metrics collector
type EventMetrics struct {
    eventsProcessed    prometheus.Counter
    eventsFailed       prometheus.Counter
    eventProcessingTime prometheus.Histogram
    eventStoreSize     prometheus.Gauge
}

func NewEventMetrics() *EventMetrics {
    return &EventMetrics{
        eventsProcessed: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "events_processed_total",
            Help: "Total number of events processed",
        }),
        eventsFailed: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "events_failed_total",
            Help: "Total number of events that failed processing",
        }),
        eventProcessingTime: prometheus.NewHistogram(prometheus.HistogramOpts{
            Name: "event_processing_duration_seconds",
            Help: "Time spent processing events",
        }),
        eventStoreSize: prometheus.NewGauge(prometheus.GaugeOpts{
            Name: "event_store_size_bytes",
            Help: "Size of the event store in bytes",
        }),
    }
}

// Instrumented event handler
type InstrumentedEventHandler struct {
    handler EventHandler
    metrics *EventMetrics
}

func (h *InstrumentedEventHandler) HandleEvent(ctx context.Context, event Event) error {
    start := time.Now()
    defer func() {
        h.metrics.eventProcessingTime.Observe(time.Since(start).Seconds())
    }()

    err := h.handler.HandleEvent(ctx, event)
    if err != nil {
        h.metrics.eventsFailed.Inc()
        return err
    }

    h.metrics.eventsProcessed.Inc()
    return nil
}
```

### 2. Event Tracing

#### Distributed Tracing
```go
// Traced event handler
type TracedEventHandler struct {
    handler EventHandler
    tracer  trace.Tracer
}

func (h *TracedEventHandler) HandleEvent(ctx context.Context, event Event) error {
    ctx, span := h.tracer.Start(ctx, fmt.Sprintf("handle_event_%s", event.GetEventType()))
    defer span.End()

    span.SetAttributes(
        attribute.String("event.id", event.GetEventID().String()),
        attribute.String("event.type", event.GetEventType()),
        attribute.String("aggregate.id", event.GetAggregateID().String()),
        attribute.Int("event.version", event.GetEventVersion()),
    )

    err := h.handler.HandleEvent(ctx, event)
    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
    }

    return err
}
```

---

## 🧪 Testing and Validation

### 1. Event Store Testing

#### Unit Tests
```go
func TestEventStore_SaveEvents(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)

    eventStore := NewPostgresEventStore(db)
    aggregateID := uuid.New()

    // Create test events
    events := []Event{
        &OrderCreated{
            OrderID:    aggregateID,
            UserID:     uuid.New(),
            TotalAmount: decimal.NewFromFloat(99.99),
            CreatedAt:  time.Now(),
        },
    }

    // Save events
    err := eventStore.SaveEvents(context.Background(), aggregateID, events, 0)
    assert.NoError(t, err)

    // Verify events were saved
    savedEvents, err := eventStore.GetEvents(context.Background(), aggregateID, 0)
    assert.NoError(t, err)
    assert.Len(t, savedEvents, 1)
    assert.Equal(t, "OrderCreated", savedEvents[0].GetEventType())
}

func TestEventStore_ConcurrencyConflict(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)

    eventStore := NewPostgresEventStore(db)
    aggregateID := uuid.New()

    // Create test events
    events := []Event{
        &OrderCreated{
            OrderID:    aggregateID,
            UserID:     uuid.New(),
            TotalAmount: decimal.NewFromFloat(99.99),
            CreatedAt:  time.Now(),
        },
    }

    // Save events with version 0
    err := eventStore.SaveEvents(context.Background(), aggregateID, events, 0)
    assert.NoError(t, err)

    // Try to save events with version 0 again (should fail)
    err = eventStore.SaveEvents(context.Background(), aggregateID, events, 0)
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "concurrency conflict")
}
```

### 2. Integration Tests

#### End-to-End Event Flow
```go
func TestEventSourcing_EndToEnd(t *testing.T) {
    // Setup test infrastructure
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)

    kafka := setupTestKafka(t)
    defer cleanupTestKafka(t, kafka)

    // Create event store and publisher
    eventStore := NewPostgresEventStore(db)
    publisher := NewKafkaEventPublisher(kafka.Producer, "test-events")

    // Create command handler
    commandHandler := NewOrderCommandHandler(eventStore, publisher)

    // Create projection
    projection := NewOrderSummaryProjection(db)

    // Create event subscriber
    subscriber := NewKafkaEventSubscriber(kafka.Consumer, "test-events", "test-group")

    // Subscribe to events
    err := subscriber.Subscribe(context.Background(), []string{"OrderCreated"}, projection)
    assert.NoError(t, err)

    // Create order command
    cmd := CreateOrderCommand{
        CommandID:   uuid.New(),
        UserID:      uuid.New(),
        Items:       []OrderItem{{ProductID: uuid.New(), Quantity: 2, Price: decimal.NewFromFloat(49.99)}},
        TotalAmount: decimal.NewFromFloat(99.98),
    }

    // Handle command
    err = commandHandler.HandleCreateOrder(context.Background(), cmd)
    assert.NoError(t, err)

    // Wait for projection to process
    time.Sleep(100 * time.Millisecond)

    // Verify projection was updated
    var count int
    err = db.QueryRow("SELECT COUNT(*) FROM order_summaries WHERE order_id = $1", cmd.CommandID).Scan(&count)
    assert.NoError(t, err)
    assert.Equal(t, 1, count)
}
```

---

## 📚 Best Practices Summary

### 1. Event Design
- **Use past tense** for event names (OrderCreated, PaymentProcessed)
- **Include comprehensive metadata** (causation ID, correlation ID, user ID)
- **Version events** for backward compatibility
- **Keep events immutable** once published
- **Design for replay** - events should contain all necessary data

### 2. Event Store
- **Use optimistic concurrency control** with version checking
- **Implement snapshots** for performance optimization
- **Partition by time** for large event stores
- **Index strategically** for common query patterns
- **Monitor event store size** and implement archiving

### 3. Event Processing
- **Handle failures gracefully** with retry mechanisms
- **Use idempotent handlers** to prevent duplicate processing
- **Implement circuit breakers** for external dependencies
- **Batch events** for better performance
- **Monitor processing metrics** and set up alerts

### 4. CQRS Implementation
- **Separate read and write models** completely
- **Use eventual consistency** for read models
- **Implement proper error handling** on both sides
- **Monitor lag** between command and query sides
- **Test both sides independently**

---

## 🔗 Related Documents

### Architecture Documents
- [Database Design Standards](database-design-standards.md)
- [ADR-004: Data Storage & Consistency Patterns](../../architecture/decisions/ADR-004-data-storage-consistency-patterns.md)
- [ADR-005: Message Queue & Event Streaming](../../architecture/decisions/ADR-005-message-queue-event-streaming.md)

### Development Guidelines
- [Go Coding Standards](coding-standards-golang.md)
- [Testing Guidelines](testing-guidelines.md)
- [Security Best Practices](security-best-practices.md)

### Business Documents
- [Business Rules](../../product/PRD-001-business-rules.md)
- [Development Plan](../../product/PRD-002-development-plan.md)

---

**Document Created**: 2025-09-04  
**Last Updated**: 2025-09-04  
**Status**: Approved
