# 📄 ADR-005: Message Queue & Event Streaming Architecture

## 1. Document Info
- **Document Name:** Message Queue & Event Streaming Architecture Decision Record
- **Version:** 1.0
- **Date:** 2025-08-12
- **Author:** AI Agent (Solo Development)
- **Status:** Approved

---

## 2. Summary
> Implement Apache Kafka as the primary message queue and event streaming platform for the distributed e-commerce platform, enabling asynchronous communication, real-time event processing, and event-driven architecture patterns.

---

## 3. Problem & Context
> The distributed e-commerce platform requires a robust, scalable messaging infrastructure to handle asynchronous communication between microservices, real-time inventory updates, order processing events, and analytics data streaming. Current synchronous API calls create tight coupling and performance bottlenecks during high-traffic periods.

**Current Challenges:**
- Services are tightly coupled through synchronous HTTP calls
- No real-time event processing for inventory and order updates
- Performance degradation during traffic spikes
- Difficult to implement event sourcing and CQRS patterns
- Limited scalability for high-throughput scenarios

---

## 4. Requirements

### 4.1 Functional Requirements
- [x] FR1: Asynchronous communication between microservices
- [x] FR2: Real-time event streaming for inventory updates
- [x] FR3: Order processing event pipeline
- [x] FR4: Analytics data streaming capabilities
- [x] FR5: Event sourcing and audit trail support
- [x] FR6: Saga pattern implementation for distributed transactions

### 4.2 Non-Functional Requirements
- [x] NFR1: Handle 10x traffic spikes during sales events
- [x] NFR2: Message delivery latency < 100ms for critical events
- [x] NFR3: 99.9% message delivery guarantee
- [x] NFR4: Support for message ordering where required
- [x] NFR5: Horizontal scalability across multiple nodes
- [x] NFR6: Comprehensive monitoring and observability

---

## 5. Business Rules & Constraints
> Rules that must always be true, plus any limitations.

**Business Rules:**
- Order events must maintain strict ordering within a customer session
- Inventory updates must be processed in real-time to prevent overselling
- All business events must be persisted for audit and compliance
- Failed message processing must trigger dead letter queue handling
- Event schema versioning must support backward compatibility

**Constraints:**
- Must work with existing microservice architecture
- Must support both on-premises and cloud deployment
- Must integrate with existing monitoring and logging systems
- Must comply with data retention and privacy requirements

---

## 6. Acceptance Criteria
> Specific, testable outcomes that define "done".

**Acceptance Criteria:**
- [ ] Apache Kafka cluster successfully deployed and configured
- [ ] Event schema defined for all business events (orders, inventory, users)
- [ ] Message producers and consumers implemented for core services
- [ ] Dead letter queue and error handling implemented
- [ ] Performance testing shows < 100ms latency under normal load
- [ ] Load testing demonstrates 10x traffic spike handling
- [ ] Monitoring and alerting configured for all critical metrics
- [ ] Documentation and runbooks created for operations team

---

## 7. Architecture Decision Record

### Decision
> **Apache Kafka** has been selected as the primary message queue and event streaming platform for the following reasons:

1. **Event Streaming Capabilities**: Kafka's log-based architecture provides excellent support for event sourcing, CQRS, and real-time analytics
2. **Scalability**: Proven ability to handle massive throughput (millions of messages per second) with horizontal scaling
3. **Durability**: Messages are persisted to disk and replicated across multiple brokers for high availability
4. **Ordering**: Strong ordering guarantees within partitions for business-critical events
5. **Ecosystem**: Rich ecosystem of connectors, tools, and community support
6. **Performance**: Sub-millisecond latency for high-throughput scenarios

### Alternatives Considered

#### RabbitMQ
- **Pros**: Mature, easy to set up, good for simple message queuing
- **Cons**: Limited event streaming capabilities, weaker ordering guarantees, less scalable for high throughput
- **Decision**: Not suitable for event streaming and high-scale requirements

#### Apache Pulsar
- **Pros**: Multi-tenancy, geo-replication, unified messaging model
- **Cons**: Newer technology with smaller community, operational complexity, higher resource requirements
- **Decision**: Promising but too immature for production use

#### AWS SQS/SNS
- **Pros**: Fully managed, serverless, easy integration with AWS services
- **Cons**: Limited event streaming, vendor lock-in, higher costs at scale, weaker ordering guarantees
- **Decision**: Not suitable for on-premises deployment and event streaming requirements

### Consequences
- ✅ **High Performance**: Sub-millisecond latency and millions of messages per second
- ✅ **Event Streaming**: Native support for event sourcing and CQRS patterns
- ✅ **Scalability**: Horizontal scaling across multiple nodes and clusters
- ✅ **Durability**: Persistent storage with replication for high availability
- ✅ **Ordering**: Strong ordering guarantees within partitions
- ❌ **Operational Complexity**: Requires dedicated operations team and monitoring
- ❌ **Resource Requirements**: Higher memory and storage requirements
- ❌ **Learning Curve**: Team needs training on Kafka concepts and operations

---

## 8. Implementation Notes
> Technical details, libraries, and approaches to use.

### Kafka Cluster Configuration
- **Brokers**: 3-5 broker nodes for production deployment
- **Replication Factor**: 3 for high availability
- **Partitions**: 6-12 partitions per topic based on throughput requirements
- **Retention**: 7 days for business events, 30 days for audit events
- **Compression**: LZ4 compression for optimal performance

### Event Schema Design
```json
{
  "eventId": "uuid-v4",
  "eventType": "order.created",
  "eventVersion": "1.0",
  "timestamp": "ISO-8601",
  "source": "order-service",
  "data": {
    "orderId": "uuid-v4",
    "customerId": "uuid-v4",
    "items": [...],
    "total": 99.99
  },
  "metadata": {
    "correlationId": "uuid-v4",
    "causationId": "uuid-v4"
  }
}
```

### Topic Naming Convention
- `business.{domain}.{event-type}` (e.g., `business.orders.created`)
- `audit.{domain}.{event-type}` (e.g., `audit.orders.created`)
- `analytics.{domain}.{event-type}` (e.g., `analytics.orders.created`)

### Consumer Group Strategy
- **Order Service**: `order-service-consumer-group`
- **Inventory Service**: `inventory-service-consumer-group`
- **Analytics Service**: `analytics-service-consumer-group`
- **Audit Service**: `audit-service-consumer-group`

### Dead Letter Queue Strategy
- Failed messages sent to `{original-topic}.dlq` topic
- Retry mechanism with exponential backoff
- Alerting on DLQ message count
- Manual review and reprocessing workflow

---

## 9. AI Collaboration Notes
> Specific guidance for AI assistant collaboration.

**Implementation Focus:**
- Start with simple producer/consumer patterns before implementing complex event sourcing
- Implement comprehensive monitoring and alerting from day one
- Use schema registry for event schema management and versioning
- Implement proper error handling and retry mechanisms
- Focus on operational excellence and observability

**Key Considerations:**
- Ensure proper partition key selection for ordering requirements
- Implement idempotent consumers to handle duplicate messages
- Use correlation IDs for tracing requests across services
- Implement proper cleanup and retention policies
- Monitor consumer lag and broker performance metrics

---

## 10. References
> Links to standards, APIs, diagrams, or related docs.

### Documentation
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Kafka Streams Documentation](https://kafka.apache.org/documentation/streams/)
- [Confluent Platform Documentation](https://docs.confluent.io/)

### Architecture Patterns
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)

### Best Practices
- [Kafka Best Practices](https://www.confluent.io/blog/kafka-best-practices/)
- [Event Schema Design](https://www.confluent.io/blog/event-schema-design/)
- [Kafka Performance Tuning](https://www.confluent.io/blog/optimizing-kafka-performance/)

### Related ADRs
- [ADR-003: Container Orchestration & Service Mesh](../adrs/ADR-003-container-orchestration-service-mesh.md)
- [ADR-004: Data Storage & Consistency Patterns](../adrs/ADR-004-data-storage-consistency-patterns.md)
- [ADR-006: API & Communication Patterns](../adrs/ADR-006-api-communication-patterns-adr.md) (Next in sequence)

---

## 11. Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Kafka cluster deployment and configuration
- [ ] Basic producer/consumer implementation
- [ ] Event schema definition
- [ ] Monitoring and alerting setup

### Phase 2: Core Events (Week 2)
- [ ] Order events implementation
- [ ] Inventory events implementation
- [ ] User events implementation
- [ ] Dead letter queue setup

### Phase 3: Advanced Patterns (Week 3)
- [ ] Event sourcing implementation
- [ ] Saga pattern for distributed transactions
- [ ] CQRS integration
- [ ] Performance testing and optimization

### Phase 4: Production Readiness (Week 4)
- [ ] Load testing and capacity planning
- [ ] Disaster recovery procedures
- [ ] Documentation and runbooks
- [ ] Team training and handover

---

## 12. Success Metrics

### Performance Metrics
- **Latency**: < 100ms for 95th percentile
- **Throughput**: > 10,000 messages/second per topic
- **Availability**: 99.9% uptime
- **Consumer Lag**: < 1 second under normal load

### Business Metrics
- **Event Processing**: 100% of business events processed successfully
- **Order Processing**: Real-time inventory updates preventing overselling
- **Analytics**: Real-time dashboard updates for business metrics
- **Audit Trail**: Complete traceability of all business operations

### Operational Metrics
- **Broker Health**: All brokers healthy and balanced
- **Topic Performance**: No topic-level bottlenecks
- **Consumer Health**: All consumer groups processing without lag
- **Error Rate**: < 0.1% message processing errors
