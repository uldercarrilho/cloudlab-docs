# 📄 ADR-004: Data Storage & Consistency Patterns

## 1. Document Info
- **Document Name:** ADR-004: Data Storage & Consistency Patterns
- **Version:** 1.0
- **Date:** 2025-08-12
- **Author:** AI Agent
- **Status:** Approved

---

## 2. Summary
> Establish data storage technologies and consistency patterns for the distributed e-commerce platform, defining how data is stored, replicated, and maintained across the system while balancing consistency, availability, and partition tolerance (CAP theorem).

**Example:** Implement multi-database architecture with PostgreSQL for transactional data, Redis for caching, ClickHouse for analytics, and event sourcing for audit trails, ensuring optimal performance and consistency for each data domain.

---

## 3. Problem & Context
> What problem are we solving? What's the current situation?

**Example:** The distributed e-commerce platform needs a robust data architecture that can handle high-volume transactions, provide fast product searches, maintain data consistency across services, and support real-time analytics while ensuring data durability and recovery capabilities.

**Current Situation:**
- No established data storage strategy for the distributed platform
- Need to handle different consistency requirements for different data types
- Must balance performance, scalability, and operational complexity
- Requires understanding of CAP theorem trade-offs for distributed systems

---

## 4. Requirements

### 4.1 Functional Requirements
- [x] FR1: Support ACID transactions for order and payment data
- [x] FR2: Provide sub-200ms response times for product searches
- [x] FR3: Maintain data consistency across distributed services
- [x] FR4: Support event sourcing for audit trails and data lineage
- [x] FR5: Enable real-time analytics and reporting
- [x] FR6: Provide efficient caching for frequently accessed data
- [x] FR7: Support data partitioning and sharding for scalability

### 4.2 Non-Functional Requirements
- [x] NFR1: Data durability with 99.99% availability
- [x] NFR2: Sub-200ms response times for product searches
- [x] NFR3: Support for horizontal scaling across multiple regions
- [x] NFR4: Automated backup and disaster recovery procedures
- [x] NFR5: Data encryption at rest and in transit
- [x] NFR6: Compliance with data retention and privacy regulations

---

## 5. Business Rules & Constraints
> Rules that must always be true, plus any limitations.

**Examples:**
- Order data must maintain ACID consistency (CP from CAP)
- Product catalog can sacrifice consistency for availability (AP from CAP)
- User sessions can sacrifice consistency for partition tolerance (P from CAP)
- All financial transactions must be auditable and traceable
- Data retention policies must comply with regulatory requirements
- Backup procedures must ensure RPO < 1 hour and RTO < 4 hours

---

## 6. Acceptance Criteria
> Specific, testable outcomes that define "done".

**Examples:**
- [x] ADR document completed with all technology decisions documented
- [x] Decision matrix created comparing all database alternatives
- [x] Consistency patterns defined for each data domain (orders, products, users, analytics)
- [x] Data partitioning and sharding strategies documented
- [x] Backup, recovery, and disaster recovery procedures defined
- [x] Performance requirements and benchmarks established
- [x] Implementation roadmap with proof-of-concept plan

---

## 7. Architecture Decision Record

### Decision
> What did we choose and why?

**Primary Database (Transactional Data):** PostgreSQL
- **Why:** ACID compliance, mature ecosystem, excellent JSON support, and proven reliability for financial transactions
- **Use Case:** Orders, payments, user accounts, inventory management

**Caching Layer:** Redis
- **Why:** In-memory performance, rich data structures, persistence options, and wide ecosystem support
- **Use Case:** Session management, product catalog cache, API response caching

**Analytics Database:** ClickHouse
- **Why:** Columnar storage optimized for analytical queries, excellent compression, and fast aggregations
- **Use Case:** Business intelligence, user behavior analytics, performance metrics

**Event Store:** PostgreSQL with event sourcing pattern
- **Why:** Leverage existing PostgreSQL infrastructure, ACID compliance for event ordering, and familiar tooling
- **Use Case:** Audit trails, data lineage, CQRS read models

**Technology Role Clarification:**
- **PostgreSQL (Primary)**: Product catalog, user accounts, orders, payments - ACID transactions
- **Redis (Caching)**: Session data, product cache, API responses - High-performance caching
- **ClickHouse (Analytics)**: Business intelligence, user behavior, performance metrics - Analytical queries
- **Event Sourcing**: Order history, audit trails, data lineage - Immutable event logs

**Business Rule Integration Pattern:**
- **Service-Level Validation**: Each microservice validates business rules within its domain
- **Event-Driven Consistency**: Business rule changes propagated via Kafka events
- **Distributed Validation**: No centralized validation engine - rules enforced at service boundaries
- **Audit Trail**: All business rule validations logged for compliance and debugging

**Event Sourcing Alternatives Considered:**
- **Traditional Audit Logging:** Simpler but limited querying and replay capabilities
- **Change Data Capture (CDC):** Real-time but complex setup and potential data loss
- **Event Sourcing:** Complete audit trail, temporal queries, CQRS support, event replay

### Alternatives Considered

#### Relational Databases
- **MySQL:** Good performance but weaker JSON support and less mature ecosystem for distributed systems
- **CockroachDB:** Excellent distributed capabilities but higher operational complexity and newer technology
- **PostgreSQL:** Best balance of features, maturity, and ecosystem support

#### Caching Solutions
- **Memcached:** Simple but lacks persistence and rich data structures
- **Hazelcast:** Enterprise-grade but higher complexity and licensing costs
- **Redis:** Optimal balance of performance, features, and operational simplicity

#### Analytics Databases
- **InfluxDB:** Time-series optimized but limited for general analytics
- **TimescaleDB:** PostgreSQL extension but less specialized for analytical workloads
- **ClickHouse:** Purpose-built for analytics with excellent performance characteristics

### Consequences
- ✅ **PostgreSQL:** Proven reliability, rich ecosystem, ACID compliance
- ✅ **Redis:** High performance, rich data structures, persistence options
- ✅ **ClickHouse:** Excellent analytical performance, efficient storage
- ✅ **Event Sourcing:** Complete audit trail, temporal queries, CQRS support
- ❌ **Operational Complexity:** Managing multiple database technologies
- ❌ **Data Synchronization:** Keeping data consistent across different stores
- ❌ **Learning Curve:** Team needs to understand multiple technologies

---

## 8. Implementation Notes
> Technical details, libraries, and approaches to use.

**Database Technologies:**
- PostgreSQL 15+ with logical replication for read replicas
- Redis 7+ with Redis Cluster for high availability
- ClickHouse 23+ with Zookeeper for coordination
- Connection pooling with PgBouncer for PostgreSQL

**Technology Compatibility Matrix:**
| Technology | Version | Min Compatible | Max Compatible | Notes |
|------------|---------|----------------|----------------|-------|
| PostgreSQL | 15+ | 15.0 | 16.x | Logical replication requires 15+ (aligned with development plan Go backend requirements) |
| Redis | 7+ | 7.0 | 7.4 | Redis Cluster features in 7+ (aligned with development plan caching strategy) |
| ClickHouse | 23+ | 23.1 | 24.x | Zookeeper 3.8+ required (aligned with development plan analytics requirements) |
| PgBouncer | 1.18+ | 1.18 | 1.20 | Connection pooling compatibility (aligned with development plan performance targets) |

**Consistency Patterns:**
- **Strong Consistency (CP):** Orders, payments, inventory
- **Eventual Consistency (AP):** Product catalog, user preferences, analytics
  - **Note:** Product catalog eventual consistency is optimized to meet business rule requirement of 1-minute inventory updates through:
    - Redis caching with sub-second propagation
    - Event-driven updates with priority queuing
    - Read replicas with minimal replication lag (<30 seconds)
- **Event Sourcing:** All business events with CQRS read models
- **Saga Pattern:** Distributed transactions across services

**Data Partitioning:**
- **Horizontal Sharding:** User data by user ID hash
- **Vertical Partitioning:** Separate databases for different domains
- **Time-based Partitioning:** Analytics data by date ranges

**Backup and Recovery:**
- **PostgreSQL:** WAL archiving with point-in-time recovery
- **Redis:** RDB snapshots + AOF persistence
- **ClickHouse:** Automated backups with S3 storage
- **Cross-region replication** for disaster recovery

**Performance Configuration:**
- **PostgreSQL:** shared_buffers = 25% RAM, effective_cache_size = 75% RAM, work_mem = 4MB
- **Redis:** maxmemory-policy = allkeys-lru, save 900 1, save 300 10
- **ClickHouse:** max_memory_usage = 80% RAM, max_concurrent_queries = 100

**Migration Strategy:**
- **Phase 1:** Parallel deployment with read-only mode
- **Phase 2:** Gradual traffic migration with health checks
- **Phase 3:** Full cutover with rollback capability
- **Phase 4:** Legacy system decommissioning

---

## 9. AI Collaboration Notes
> Specific guidance for AI assistant collaboration.

**Examples:**
- Focus on practical implementation patterns rather than theoretical concepts
- Consider operational complexity and team skill levels
- Ensure all decisions are backed by performance data and benchmarks
- Document trade-offs clearly for future decision-making
- Include code examples and configuration snippets where helpful
- Consider migration strategies from existing systems

---

## 10. References
> Links to standards, APIs, diagrams, or related docs.

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [ClickHouse Documentation](https://clickhouse.com/docs/)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [CAP Theorem](https://en.wikipedia.org/wiki/CAP_theorem)
- [ADR-003: Container Orchestration & Service Mesh](../adrs/ADR-003-container-orchestration-service-mesh.md)

---

## 11. Decision Matrix

### Evaluation Criteria and Weighting Methodology

**Performance (25%):** Measured by response time, throughput, and resource utilization
- **10/10:** Sub-100ms response times, >10k TPS, <70% resource usage
- **8/10:** Sub-200ms response times, >5k TPS, <80% resource usage
- **6/10:** Sub-500ms response times, >2k TPS, <90% resource usage

**Scalability (20%):** Ability to handle increased load and data volume
- **10/10:** Linear scaling, automatic sharding, multi-region support
- **8/10:** Good horizontal scaling, manual sharding, single-region
- **6/10:** Limited scaling, vertical scaling only

**Reliability (20%):** Data durability, availability, and recovery capabilities
- **10/10:** 99.99%+ uptime, automated recovery, cross-region replication
- **8/10:** 99.9% uptime, manual recovery, single-region
- **6/10:** 99% uptime, basic recovery procedures

**Ecosystem (15%):** Community support, tooling, and integration options
- **10/10:** Large community, extensive tooling, cloud-native support
- **8/10:** Good community, standard tooling, some cloud support
- **6/10:** Limited community, basic tooling

**Operational (20%):** Ease of deployment, monitoring, and maintenance
- **10/10:** Managed services, comprehensive monitoring, automated operations
- **8/10:** Good tooling, standard monitoring, manual operations
- **6/10:** Basic tooling, limited monitoring, high operational overhead

| Criteria | Weight | PostgreSQL | MySQL | CockroachDB | Redis | Memcached | Hazelcast | ClickHouse | InfluxDB | TimescaleDB |
|----------|--------|------------|-------|--------------|-------|-----------|-----------|------------|----------|-------------|
| **Performance** | 25% | 8/10 | 7/10 | 9/10 | 10/10 | 9/10 | 8/10 | 9/10 | 7/10 | 8/10 |
| **Scalability** | 20% | 7/10 | 6/10 | 10/10 | 8/10 | 6/10 | 9/10 | 9/10 | 8/10 | 7/10 |
| **Reliability** | 20% | 9/10 | 8/10 | 9/10 | 8/10 | 6/10 | 8/10 | 8/10 | 7/10 | 8/10 |
| **Ecosystem** | 15% | 10/10 | 9/10 | 6/10 | 9/10 | 7/10 | 7/10 | 7/10 | 6/10 | 8/10 |
| **Operational** | 20% | 8/10 | 8/10 | 5/10 | 9/10 | 9/10 | 6/10 | 7/10 | 7/10 | 8/10 |
| **Total Score** | 100% | **8.4/10** | 7.6/10 | 7.8/10 | **8.8/10** | 7.4/10 | 7.6/10 | **8.0/10** | 7.0/10 | 7.8/10 |

### Event Sourcing Alternatives Decision Matrix

| Criteria | Weight | Event Sourcing | Traditional Audit Logging | Change Data Capture (CDC) |
|----------|--------|----------------|---------------------------|---------------------------|
| **Audit Trail Completeness** | 25% | 10/10 | 6/10 | 8/10 |
| **Query Flexibility** | 20% | 10/10 | 4/10 | 7/10 |
| **Event Replay Capability** | 20% | 10/10 | 2/10 | 6/10 |
| **Implementation Complexity** | 20% | 6/10 | 10/10 | 4/10 |
| **Performance Impact** | 15% | 7/10 | 9/10 | 6/10 |
| **Total Score** | 100% | **8.6/10** | 6.2/10 | 6.2/10 |

---

## 12. Implementation Roadmap

**Note:** This roadmap is aligned with Development Plan Phase 3 (Weeks 13-20) and may require adjustment based on actual development progress and resource availability.

### Phase 1: Foundation (Week 1-2)
- [ ] Set up PostgreSQL primary and read replicas
- [ ] Configure Redis cluster with persistence
- [ ] Implement basic connection pooling
- [ ] Create database schemas for core domains

### Phase 2: Event Sourcing (Week 3-4)
- [ ] Design event store schema
- [ ] Implement event sourcing infrastructure
- [ ] Create CQRS read models
- [ ] Set up event replay capabilities

### Phase 3: Analytics (Week 5-6)
- [ ] Deploy ClickHouse cluster
- [ ] Implement data ingestion pipelines
- [ ] Create analytical dashboards
- [ ] Performance testing and optimization

### Phase 4: Production Readiness (Week 7-8)
- [ ] Backup and recovery procedures
- [ ] Monitoring and alerting setup
- [ ] Disaster recovery testing
- [ ] Documentation and runbooks

---

## 13. Risk Mitigation

| Risk | Impact | Probability | Mitigation Strategy | Specific Actions |
|------|--------|-------------|-------------------|------------------|
| **Data Loss** | High | Medium | Multi-layered backup strategy with cross-region replication | - Automated daily backups to S3<br>- WAL archiving with 7-day retention<br>- Cross-region replication with 15-minute RPO<br>- Monthly disaster recovery testing |
| **Performance Degradation** | Medium | High | Comprehensive monitoring and proactive optimization | - Real-time performance dashboards<br>- Automated alerting on 95th percentile >200ms<br>- Weekly performance regression testing<br>- Capacity planning with 6-month projections |
| **Operational Complexity** | Medium | High | Managed services and comprehensive automation | - Start with AWS RDS, ElastiCache, and managed ClickHouse<br>- Infrastructure as Code with Terraform<br>- Automated deployment pipelines<br>- Comprehensive runbooks and troubleshooting guides |
| **Data Consistency Issues** | High | Medium | Clear consistency patterns and extensive testing | - Automated consistency checks every 5 minutes<br>- Saga pattern implementation with compensation logic<br>- Event sourcing for complete audit trail<br>- Weekly consistency validation testing |
| **Technology Lock-in** | Low | Low | Open-source technologies and abstraction layers | - Use open-source PostgreSQL, Redis, and ClickHouse<br>- Implement database abstraction layer<br>- Standard SQL interfaces where possible<br>- Regular technology evaluation every 6 months |

---

## 14. Success Metrics

- **Performance:** Sub-200ms response times for 95% of requests
- **Availability:** 99.99% uptime for critical data stores
- **Recovery:** RPO < 1 hour, RTO < 4 hours
- **Scalability:** Support 10x current load without architecture changes
- **Operational:** Mean time to resolution < 2 hours for data issues

---

## 15. Operational Procedures

### Monitoring and Alerting
- **Database Health Checks:** Every 30 seconds via health check endpoints
- **Performance Metrics:** Response time, throughput, connection count, query performance
- **Resource Monitoring:** CPU, memory, disk I/O, network utilization
- **Business Metrics:** Order processing rate, payment success rate, user session count
- **Business Rule Compliance Metrics:**
  - Data retention policy compliance (7 years for orders/payments, 2 years for analytics)
  - Real-time update propagation times (inventory <1min, prices <5min, reviews <2min)
  - Saga pattern execution success rates and compensation action frequency

### Alerting Thresholds
- **Critical:** Database unavailable, response time >500ms, error rate >5%
- **Warning:** Response time >200ms, connection count >80%, disk usage >85%
- **Info:** Performance degradation, capacity approaching limits

### Operational Runbooks
- **Database Restart:** Step-by-step procedure with health check validation
- **Failover Procedures:** Automated failover with manual verification
- **Backup Restoration:** Point-in-time recovery procedures with testing
- **Performance Tuning:** Query optimization and configuration tuning guides

### Common Database Operations
- **Connection Pool Management:** Monitor and adjust pool sizes based on load
- **Index Maintenance:** Automated index rebuilding and statistics updates
- **Vacuum Operations:** Regular cleanup of dead tuples and table maintenance
- **Replication Lag Monitoring:** Alert when replica lag exceeds 30 seconds
- **Disk Space Management:** Automated cleanup of old logs and temporary files

### Event Sourcing Operations
- **Event Replay:** Automated event replay procedures for data recovery
- **Snapshot Management:** Regular snapshot creation and cleanup (every 1000 events)
- **Event Store Maintenance:** Archive old events older than 2 years (analytics data) and 7 years (order/payment data) per business rule requirements
- **CQRS Read Model Updates:** Monitor and repair read model inconsistencies
- **Event Schema Evolution:** Version control and migration procedures for event schemas

### Cache Management Operations
- **Cache Warming:** Pre-populate frequently accessed data during low-traffic periods
- **Cache Invalidation:** Automated invalidation based on data change events
- **Memory Optimization:** Monitor and adjust Redis memory policies
- **Cache Hit Rate Analysis:** Weekly performance analysis and optimization
- **Cross-Region Cache Sync:** Ensure cache consistency across regions

### Saga Pattern Implementation
- **Order Processing Saga:**
  1. Reserve inventory (PostgreSQL) - **Timeout:** 30s, **Retry:** 3x
  2. Process payment (PostgreSQL) - **Timeout:** 60s, **Retry:** 2x
  3. Update inventory (PostgreSQL) - **Timeout:** 30s, **Retry:** 3x
  4. Send confirmation (Event Store) - **Timeout:** 15s, **Retry:** 5x
  - **Compensation:** Release inventory, refund payment, notify user
  - **Rollback Triggers:** Any step timeout, payment failure, inventory unavailable

- **User Registration Saga:**
  1. Create user account (PostgreSQL) - **Timeout:** 45s, **Retry:** 3x
  2. Initialize preferences (Redis) - **Timeout:** 20s, **Retry:** 5x
  3. Send welcome email (Event Store) - **Timeout:** 30s, **Retry:** 3x
  - **Compensation:** Delete account, clear preferences, log failure
  - **Rollback Triggers:** Account creation failure, preference initialization timeout

- **Inventory Update Saga:**
  1. Check current stock (PostgreSQL) - **Timeout:** 15s, **Retry:** 3x
  2. Reserve quantity (PostgreSQL) - **Timeout:** 30s, **Retry:** 3x
  3. Update analytics (ClickHouse) - **Timeout:** 45s, **Retry:** 2x
  4. Notify suppliers if low stock (Event Store) - **Timeout:** 30s, **Retry:** 3x
  - **Compensation:** Release reservation, revert analytics, cancel notifications
  - **Rollback Triggers:** Stock check failure, reservation timeout, analytics update failure

---

## 16. Performance Benchmarks

### PostgreSQL Performance Targets
- **Read Queries:** <50ms for indexed lookups, <200ms for complex joins
- **Write Operations:** <100ms for single inserts, <500ms for batch operations
- **Concurrent Users:** Support 1000+ concurrent connections
- **Throughput:** 5000+ TPS for order processing

### Redis Performance Targets
- **Cache Hit Rate:** >95% for frequently accessed data
- **Response Time:** <5ms for cache hits, <50ms for cache misses
- **Throughput:** 100,000+ operations per second
- **Memory Usage:** <80% of allocated memory

### ClickHouse Performance Targets
- **Analytics Queries:** <2 seconds for complex aggregations
- **Data Ingestion:** 100,000+ rows per second
- **Compression Ratio:** >10:1 for typical data
- **Query Concurrency:** Support 50+ concurrent analytical queries

## 17. Testing and Validation

### Performance Testing
- **Load Testing:** Simulate 2x expected production load
- **Stress Testing:** Identify breaking points at 5x expected load
- **Endurance Testing:** 24-hour sustained load testing
- **Failover Testing:** Automated failover scenarios every week

### Business Rule Compliance Testing
- **Data Retention Validation:** Automated verification of retention policies
  - Order/payment data: 7-year retention compliance
  - Analytics data: 2-year retention compliance
- **Real-time Update Validation:** Performance testing for business rule requirements
  - Inventory updates: <1 minute propagation (business rule requirement)
  - Price changes: <5 minutes propagation (business rule requirement)
  - Review updates: <2 minutes propagation (business rule requirement)

## 18. Data Migration and Schema Evolution

### Schema Migration Strategy
- **Versioned Migrations:** All schema changes versioned and reversible
- **Zero-Downtime Deployments:** Blue-green deployment for schema changes
- **Backward Compatibility:** Maintain API compatibility during transitions
- **Rollback Procedures:** Automated rollback for failed migrations

### Data Migration Procedures
- **Bulk Data Transfer:** Use database-specific tools (pg_dump, redis-cli, clickhouse-client)
- **Data Validation:** Automated checksums and data integrity validation
- **Incremental Migration:** Migrate data in batches to minimize downtime
- **Cross-Region Migration:** Handle timezone and locale differences

### Event Schema Evolution
- **Event Versioning:** Support multiple event versions simultaneously
- **Schema Registry:** Centralized event schema management
- **Upcasting:** Transform old event formats to new schemas
- **Downcasting:** Maintain backward compatibility for event consumers

### Consistency Validation
- **Automated Checks:** Run consistency validation every 5 minutes
- **Data Integrity:** Verify referential integrity across all databases
- **Event Ordering:** Ensure event sourcing maintains correct sequence
- **Cross-Region Sync:** Validate data synchronization across regions
- **Business Rule Compliance:** Monitor data retention policies and real-time update requirements
  - Verify 7-year retention for order/payment data
  - Verify 2-year retention for analytics data
  - Validate 1-minute inventory update propagation

### Disaster Recovery Testing
- **Monthly DR Tests:** Full disaster recovery simulation
- **Backup Validation:** Weekly backup restoration testing
- **RTO/RPO Validation:** Measure actual recovery times vs targets
- **Documentation Updates:** Update runbooks based on test results
