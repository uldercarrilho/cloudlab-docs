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

### Decision Matrix with Weighted Criteria

| Criteria | Weight | Apache Kafka | RabbitMQ | Apache Pulsar | AWS SQS/SNS |
|----------|--------|--------------|----------|---------------|-------------|
| **Performance & Scalability** | 25% | 9/10 | 6/10 | 8/10 | 7/10 |
| **Event Streaming Capabilities** | 20% | 10/10 | 4/10 | 9/10 | 3/10 |
| **Operational Complexity** | 15% | 6/10 | 9/10 | 5/10 | 10/10 |
| **Reliability & Durability** | 15% | 9/10 | 8/10 | 9/10 | 8/10 |
| **Ecosystem & Community** | 10% | 10/10 | 9/10 | 6/10 | 8/10 |
| **Cost at Scale** | 10% | 8/10 | 9/10 | 7/10 | 5/10 |
| **Vendor Lock-in** | 5% | 10/10 | 10/10 | 10/10 | 2/10 |
| **Total Weighted Score** | 100% | **8.7/10** | **7.4/10** | **7.4/10** | **6.8/10** |

**Scoring Legend:**
- 10/10: Excellent - Best in class
- 8-9/10: Very Good - Meets most requirements
- 6-7/10: Good - Meets basic requirements
- 4-5/10: Fair - Limited capabilities
- 2-3/10: Poor - Significant limitations

### Alternatives Considered

#### RabbitMQ
- **Pros**: Mature, easy to set up, good for simple message queuing, excellent operational simplicity
- **Cons**: Limited event streaming capabilities, weaker ordering guarantees, less scalable for high throughput, limited event sourcing support
- **Decision**: Not suitable for event streaming and high-scale requirements

#### Apache Pulsar
- **Pros**: Multi-tenancy, geo-replication, unified messaging model, strong event streaming capabilities
- **Cons**: Newer technology with smaller community, operational complexity, higher resource requirements, limited production experience
- **Decision**: Promising but too immature for production use

#### AWS SQS/SNS
- **Pros**: Fully managed, serverless, easy integration with AWS services, excellent operational simplicity
- **Cons**: Limited event streaming, vendor lock-in, higher costs at scale, weaker ordering guarantees, limited event sourcing support
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

### Event Schema Versioning Strategy

#### Versioning Approach
- **Semantic Versioning**: Follow MAJOR.MINOR.PATCH format
- **Backward Compatibility**: MINOR and PATCH versions must be backward compatible
- **Breaking Changes**: MAJOR version increments for breaking changes
- **Schema Registry**: Use Apache Avro with Confluent Schema Registry for schema management

#### Schema Evolution Strategies
1. **Additive Changes**: New optional fields (MINOR version)
2. **Non-Breaking Modifications**: Field renames, type widening (MINOR version)
3. **Breaking Changes**: Field removal, type narrowing (MAJOR version)
4. **Deprecation**: Mark fields as deprecated before removal

#### Versioning Implementation
```json
{
  "eventId": "uuid-v4",
  "eventType": "order.created",
  "eventVersion": "2.1.0",
  "timestamp": "ISO-8601",
  "source": "order-service",
  "data": {
    "orderId": "uuid-v4",
    "customerId": "uuid-v4",
    "items": [...],
    "total": 99.99,
    "currency": "USD",           // New field in v2.0
    "shippingAddress": {...},    // New field in v2.1
    "legacyField": null          // Deprecated field, will be removed in v3.0
  },
  "metadata": {
    "correlationId": "uuid-v4",
    "causationId": "uuid-v4",
    "schemaVersion": "2.1.0"
  }
}
```

### CQRS Integration Strategy

#### Command and Query Separation
- **Command Side**: Handle write operations through event sourcing
- **Query Side**: Optimized read models for different use cases
- **Event Store**: Kafka as the primary event store
- **Read Models**: Separate databases optimized for specific queries

#### CQRS Implementation Pattern
```
┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐
│   Command API   │───▶│  Command Handler│───▶│   Event Store   │
│                 │    │                 │     │    (Kafka)      │
└─────────────────┘    └─────────────────┘     └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐
│   Query API     │◀───│   Read Models   │◀───│  Event Handlers │
│                 │    │                 │     │                 │
└─────────────────┘    └─────────────────┘     └─────────────────┘
```

#### Read Model Synchronization
- **Event Handlers**: Process events and update read models
- **Eventual Consistency**: Read models updated asynchronously
- **Projection Patterns**: Materialized views for complex queries
- **Cache Strategy**: Redis for frequently accessed data

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

## 10. Comprehensive Monitoring and Observability

### Monitoring Requirements

#### Infrastructure Metrics
- **Broker Health**: CPU, memory, disk I/O, network usage
- **Topic Performance**: Throughput, latency, partition distribution
- **Consumer Health**: Consumer lag, processing rate, error rates
- **Cluster Status**: Replication factor, under-replicated partitions

#### Application Metrics
- **Event Processing**: Events per second, processing latency
- **Error Rates**: Failed events, retry attempts, dead letter queue size
- **Business Metrics**: Order events, inventory updates, user activities
- **Performance**: 95th and 99th percentile latencies

#### Alerting Thresholds
- **Critical**: Consumer lag > 5 seconds, broker down, >1% error rate
- **Warning**: Consumer lag > 2 seconds, high memory usage, >0.5% error rate
- **Info**: High throughput, new consumer groups, schema changes

### Observability Tools

#### Monitoring Stack
- **Metrics Collection**: Prometheus for time-series metrics
- **Visualization**: Grafana dashboards for real-time monitoring
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger for distributed tracing
- **Alerting**: AlertManager with Slack/email notifications

#### Dashboard Requirements
- **Kafka Cluster Overview**: Broker status, topic performance, consumer health
- **Business Metrics**: Event processing rates, error rates, business KPIs
- **Operational Metrics**: Infrastructure health, resource utilization
- **Alert History**: Recent alerts, resolution times, escalation patterns

### Operational Runbooks

#### Incident Response
1. **High Consumer Lag**: Check consumer health, scale consumers, investigate bottlenecks
2. **Broker Failure**: Failover to healthy brokers, check replication, restore from backup
3. **Schema Registry Issues**: Validate schemas, check compatibility, rollback if necessary
4. **Performance Degradation**: Analyze metrics, identify bottlenecks, optimize configuration

#### Maintenance Procedures
- **Topic Management**: Create, delete, reconfigure topics
- **Schema Updates**: Deploy new schemas, handle breaking changes
- **Cluster Scaling**: Add/remove brokers, rebalance partitions
- **Backup and Recovery**: Backup configurations, restore procedures

---

## 11. Enhanced Risk Mitigation Strategies

### Risk Assessment and Mitigation

#### Complexity Risk: Event-Driven Architecture Learning Curve
**Mitigation Strategies:**
- **Phased Implementation**: Start with simple producer/consumer patterns
- **Training Program**: Comprehensive Kafka training for development team
- **Proof of Concept**: Build simple event streaming examples before complex patterns
- **Documentation**: Create detailed runbooks and troubleshooting guides
- **Mentoring**: Pair experienced developers with team members learning Kafka

#### Performance Risk: Message Queue Bottlenecks
**Mitigation Strategies:**
- **Capacity Planning**: Thorough performance testing and load testing
- **Monitoring**: Real-time performance metrics and alerting
- **Auto-scaling**: Horizontal scaling of consumers and brokers
- **Optimization**: Tune Kafka configuration for specific workload patterns
- **Fallback Plans**: Circuit breakers and graceful degradation strategies

#### Operational Risk: Complex Debugging and Monitoring
**Mitigation Strategies:**
- **Comprehensive Observability**: Full-stack monitoring from infrastructure to business metrics
- **Structured Logging**: Consistent log format across all services
- **Distributed Tracing**: End-to-end request tracing with correlation IDs
- **Runbooks**: Detailed procedures for common operational tasks
- **Team Training**: Operations team training on Kafka troubleshooting

#### Data Loss Risk: Message Processing Failures
**Mitigation Strategies:**
- **Dead Letter Queues**: Failed message handling and retry mechanisms
- **Replication**: Multiple broker replication for high availability
- **Backup Strategies**: Regular backup of topic data and configurations
- **Idempotent Processing**: Ensure consumers can handle duplicate messages
- **Monitoring**: Alert on failed message processing and DLQ growth

#### Schema Evolution Risk: Breaking Changes
**Mitigation Strategies:**
- **Schema Registry**: Centralized schema management and validation
- **Versioning Strategy**: Clear versioning approach with backward compatibility
- **Testing**: Comprehensive testing of schema changes before deployment
- **Rollback Plan**: Ability to rollback to previous schema versions
- **Gradual Migration**: Support multiple schema versions during transition

---

## 12. References
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

## 13. Implementation Timeline

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

## 14. Success Metrics

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
