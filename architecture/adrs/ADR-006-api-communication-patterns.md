# ADR-006: API Communication Patterns

## Status
**Status**: Approved  
**Date**: 2025-08-12
**Author**: AI Development Team  
**Supersedes**: None  

## Context

The distributed e-commerce platform requires a comprehensive API communication strategy that supports multiple interaction patterns, scales efficiently, and provides excellent developer experience. This decision establishes the foundational patterns for how services expose APIs, communicate with each other, and handle different types of interactions across the system.

### Problem Statement

- **Service Integration**: Need to establish consistent patterns for service-to-service communication
- **API Diversity**: Different use cases require different API styles (REST, GraphQL, gRPC)
- **Real-time Requirements**: Some features require real-time communication capabilities
- **Performance**: Must support high-throughput scenarios with sub-200ms response times
- **Developer Experience**: APIs must be intuitive and well-documented for frontend integration

### Business Drivers

- **Learning Value**: Understanding modern API design patterns and communication protocols
- **Foundation**: Establishes interface contracts and communication standards
- **Scalability**: Support for 10,000 requests/second peak capacity
- **Security**: Multi-tenant isolation and rate limiting requirements
- **Operational Excellence**: Comprehensive monitoring and debugging capabilities

## Decision

We will implement a **hybrid API communication strategy** that uses the right tool for each use case:

### External APIs (Customer-Facing)
- **Primary**: GraphQL for complex data queries and frontend integration
- **Secondary**: REST for simple CRUD operations and third-party integrations
- **Real-time**: WebSocket for live updates and notifications

### Internal APIs (Service-to-Service)
- **Primary**: gRPC for high-performance internal communication
- **Secondary**: HTTP/2 for simple service interactions
- **Event-driven**: Message queues for asynchronous processing

### API Design Principles
- **Consistency**: Standardized error handling and response formats
- **Versioning**: Semantic versioning with backward compatibility
- **Documentation**: OpenAPI/Swagger for REST, GraphQL schema introspection
- **Security**: JWT-based authentication, rate limiting, and input validation

## Alternatives Considered

### External API Options

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **REST Only** | Simple, widely understood, great tooling | Over-fetching, under-fetching, multiple round trips | ❌ Too limiting for complex frontend needs |
| **GraphQL Only** | Flexible queries, single endpoint, strong typing | Learning curve, N+1 query risks, caching complexity | ❌ Not ideal for simple operations |
| **gRPC Only** | High performance, bidirectional streaming, strong typing | Limited browser support, complex tooling | ❌ Poor frontend developer experience |
| **Hybrid (REST + GraphQL)** | Best of both worlds, gradual adoption | Increased complexity, dual maintenance | ✅ **Selected** - Optimal balance |

### Internal Communication Options

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **HTTP/1.1 REST** | Simple, familiar, easy debugging | Lower performance, no streaming, limited multiplexing | ❌ Performance not sufficient |
| **Message Queues Only** | Decoupled, scalable, fault-tolerant | Complex debugging, eventual consistency, latency | ❌ Too limiting for synchronous operations |
| **gRPC Only** | High performance, streaming, strong contracts | Learning curve, complex error handling | ❌ Overkill for simple operations |
| **Hybrid (gRPC + HTTP/2)** | Performance where needed, simplicity where appropriate | Dual protocols, increased complexity | ✅ **Selected** - Optimal performance/ simplicity balance |

### Real-time Communication Options

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Server-Sent Events** | Simple, HTTP-based, automatic reconnection | One-way only, limited browser support | ❌ Too limiting for bidirectional needs |
| **Long Polling** | Simple, works everywhere | High latency, resource intensive | ❌ Poor user experience |
| **WebSocket** | Bidirectional, low latency, efficient | Complex state management, connection handling | ✅ **Selected** - Best balance of features |

## Consequences

### Positive Consequences

#### Performance & Scalability
- **GraphQL**: Reduces over-fetching and under-fetching, improving frontend performance
- **gRPC**: High-performance internal communication with HTTP/2 and Protocol Buffers
- **WebSocket**: Efficient real-time communication with minimal overhead
- **Rate Limiting**: Prevents API abuse and ensures fair resource distribution

#### Developer Experience
- **GraphQL Schema**: Self-documenting APIs with introspection capabilities
- **OpenAPI**: Comprehensive REST API documentation and testing tools
- **Strong Typing**: gRPC and GraphQL provide compile-time safety
- **Consistent Patterns**: Standardized error handling and response formats

#### Operational Excellence
- **Monitoring**: Comprehensive API metrics and performance tracking
- **Debugging**: Clear request/response logging and error tracing
- **Versioning**: Backward-compatible API evolution strategy
- **Security**: Multi-layered security with authentication and authorization

### Negative Consequences

#### Complexity Management
- **Dual Protocols**: Maintaining both REST and GraphQL increases complexity
- **Tooling**: Different tools needed for different API types
- **Testing**: Multiple testing strategies required for different protocols
- **Documentation**: Need to maintain documentation for multiple API styles

#### Learning Curve
- **GraphQL**: Team needs to learn GraphQL concepts and best practices
- **gRPC**: Internal team needs gRPC knowledge for service development
- **WebSocket**: Real-time state management complexity
- **Protocol Buffers**: New serialization format for internal communication

#### Operational Overhead
- **Monitoring**: Multiple monitoring systems for different protocols
- **Debugging**: Different debugging approaches for each protocol
- **Performance Tuning**: Optimization strategies vary by protocol
- **Security**: Security considerations differ across protocols

## Implementation Strategy

### Phase 1: Foundation (Week 1)
1. **API Gateway Setup**
   - Implement Kong or similar API gateway
   - Configure routing for REST and GraphQL endpoints
   - Set up authentication and rate limiting middleware

2. **GraphQL Foundation**
   - Design GraphQL schema for core entities
   - Implement GraphQL server with Apollo Server
   - Create data loaders to prevent N+1 queries

3. **REST API Setup**
   - Design REST endpoints for simple operations
   - Implement OpenAPI specification
   - Set up automated testing with Postman/Newman

### Phase 2: Internal Communication (Week 2)
1. **gRPC Implementation**
   - Define Protocol Buffer schemas for internal services
   - Implement gRPC server and client libraries
   - Set up service discovery and load balancing

2. **HTTP/2 Integration**
   - Configure HTTP/2 for simple service interactions
   - Implement health checks and readiness probes
   - Set up circuit breakers and retry logic

### Phase 3: Real-time Features (Week 3)
1. **WebSocket Implementation**
   - Design WebSocket message protocol
   - Implement connection management and authentication
   - Create real-time notification system

2. **Integration & Testing**
   - End-to-end testing across all protocols
   - Performance benchmarking and optimization
   - Security testing and vulnerability assessment

## Technical Specifications

### API Gateway Configuration

```yaml
# Kong API Gateway Configuration
services:
  - name: graphql-service
    url: http://graphql-service:4000
    routes:
      - name: graphql-route
        paths: ["/graphql"]
        methods: ["POST", "GET"]
        plugins:
          - name: rate-limiting
            config:
              minute: 1000
              hour: 10000
          - name: jwt
            config:
              secret: ${JWT_SECRET}
  
  - name: rest-api
    url: http://rest-api:3000
    routes:
      - name: rest-route
        paths: ["/api/v1"]
        methods: ["GET", "POST", "PUT", "DELETE"]
        plugins:
          - name: rate-limiting
            config:
              minute: 500
              hour: 5000
          - name: cors
            config:
              origins: ["*"]
              methods: ["GET", "POST", "PUT", "DELETE"]
```

### GraphQL Schema Design

```graphql
# Core E-commerce GraphQL Schema
type Query {
  products(
    category: String
    priceRange: PriceRangeInput
    search: String
    first: Int
    after: String
  ): ProductConnection!
  
  product(id: ID!): Product
  categories: [Category!]!
  user: User
  orders: [Order!]!
}

type Mutation {
  createOrder(input: CreateOrderInput!): Order!
  updateUser(input: UpdateUserInput!): User!
  addToCart(input: AddToCartInput!): Cart!
}

type Product {
  id: ID!
  name: String!
  description: String
  price: Money!
  category: Category!
  inventory: Inventory!
  images: [Image!]!
  reviews: [Review!]!
}

type Subscription {
  orderStatusChanged(orderId: ID!): OrderStatus!
  inventoryUpdated(productId: ID!): Inventory!
}
```

### gRPC Service Definition

```protobuf
// Internal Service Communication Protocol
syntax = "proto3";

package ecommerce.internal;

service ProductService {
  rpc GetProduct(GetProductRequest) returns (Product);
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse);
  rpc UpdateInventory(UpdateInventoryRequest) returns (Inventory);
  rpc StreamInventoryUpdates(InventoryFilter) returns (stream InventoryUpdate);
}

message Product {
  string id = 1;
  string name = 2;
  string description = 3;
  Money price = 4;
  Category category = 5;
  Inventory inventory = 6;
}

message GetProductRequest {
  string product_id = 1;
  bool include_inventory = 2;
  bool include_reviews = 3;
}

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc UpdateOrderStatus(UpdateOrderStatusRequest) returns (Order);
}
```

### WebSocket Message Protocol

```json
// Real-time Communication Message Format
{
  "type": "order_status_update",
  "timestamp": "2025-01-27T10:30:00Z",
  "data": {
    "orderId": "ord_12345",
    "status": "shipped",
    "trackingNumber": "1Z999AA1234567890"
  },
  "metadata": {
    "userId": "user_67890",
    "sessionId": "sess_abc123"
  }
}

// Connection Authentication
{
  "type": "auth",
  "token": "jwt_token_here",
  "userId": "user_67890"
}
```

## Performance Requirements

### Response Time SLAs
- **GraphQL Queries**: < 200ms for simple queries, < 500ms for complex queries
- **REST API Calls**: < 150ms for CRUD operations
- **gRPC Calls**: < 100ms for internal service communication
- **WebSocket Messages**: < 50ms for real-time updates

### Throughput Targets
- **Peak Capacity**: 10,000 requests/second across all APIs
- **Concurrent Users**: Support 5,000 simultaneous WebSocket connections
- **Data Transfer**: Efficient serialization with Protocol Buffers and GraphQL

### Caching Strategy
- **GraphQL**: Redis-based query result caching with TTL
- **REST**: HTTP caching headers with CDN integration
- **gRPC**: Application-level caching for frequently accessed data
- **WebSocket**: Connection pooling and message batching

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication for API access
- **OAuth 2.0**: Third-party integration support
- **Role-Based Access Control**: Granular permissions per endpoint
- **API Keys**: Rate limiting and usage tracking

### Data Protection
- **HTTPS/TLS**: All external API communication encrypted
- **Input Validation**: Comprehensive request validation and sanitization
- **Rate Limiting**: Per-user and per-endpoint rate limiting
- **CORS Configuration**: Controlled cross-origin resource sharing

### Monitoring & Auditing
- **Request Logging**: All API calls logged with user context
- **Security Events**: Authentication failures and suspicious activity
- **Performance Metrics**: Response times and error rates
- **Usage Analytics**: API consumption patterns and trends

## Testing Strategy

### Unit Testing
- **GraphQL**: Schema validation and resolver testing
- **REST**: Endpoint testing with mock data
- **gRPC**: Service method testing with Protocol Buffer validation
- **WebSocket**: Connection and message handling tests

### Integration Testing
- **API Gateway**: Routing and middleware testing
- **Service Communication**: End-to-end service interaction tests
- **Authentication**: Token validation and permission testing
- **Rate Limiting**: Throttling and quota enforcement tests

### Performance Testing
- **Load Testing**: Simulate peak traffic scenarios
- **Stress Testing**: Identify breaking points and bottlenecks
- **Latency Testing**: Measure response time under various conditions
- **Scalability Testing**: Verify horizontal scaling capabilities

### Security Testing
- **Penetration Testing**: Identify vulnerabilities and attack vectors
- **Authentication Testing**: Test token validation and session management
- **Authorization Testing**: Verify permission enforcement
- **Input Validation**: Test for injection attacks and malformed data

## Monitoring & Observability

### Metrics Collection
- **Request Volume**: Total requests per endpoint and protocol
- **Response Times**: P50, P95, P99 latency measurements
- **Error Rates**: HTTP status codes and error types
- **Throughput**: Requests per second and concurrent connections

### Logging Strategy
- **Structured Logging**: JSON format with consistent fields
- **Request Tracing**: Correlation IDs across service boundaries
- **Error Logging**: Detailed error context and stack traces
- **Performance Logging**: Slow query identification and optimization

### Alerting & Dashboards
- **Performance Alerts**: Response time and error rate thresholds
- **Security Alerts**: Authentication failures and suspicious activity
- **Capacity Alerts**: Resource usage and scaling triggers
- **Business Metrics**: API usage patterns and user behavior

### Monitoring Configuration Examples

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['kong:8001']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'graphql-service'
    static_configs:
      - targets: ['graphql-service:4000']
    metrics_path: /metrics

  - job_name: 'rest-api'
    static_configs:
      - targets: ['rest-api:3000']
    metrics_path: /metrics

  - job_name: 'grpc-services'
    static_configs:
      - targets: ['product-service:50051', 'order-service:50052']
    metrics_path: /metrics
```

#### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "API Performance Dashboard",
    "panels": [
      {
        "title": "Response Time by Endpoint",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{endpoint}} - P95"
          }
        ]
      },
      {
        "title": "Error Rate by Service",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"4..|5..\"}[5m])",
            "legendFormat": "{{service}} - Error Rate"
          }
        ]
      },
      {
        "title": "GraphQL Query Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, rate(graphql_query_duration_seconds_bucket[5m]))",
            "legendFormat": "P99 Query Time"
          }
        ]
      }
    ]
  }
}
```

#### Alert Rules
```yaml
# alerting-rules.yml
groups:
  - name: api-performance
    rules:
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High API response time detected"
          description: "P95 response time is {{ $value }}s"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/second"

      - alert: GraphQLSlowQueries
        expr: histogram_quantile(0.99, rate(graphql_query_duration_seconds_bucket[5m])) > 1.0
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Slow GraphQL queries detected"
          description: "P99 query time is {{ $value }}s"
```

## Deployment & Operations

### Infrastructure Requirements
- **API Gateway**: Kong or similar with high availability
- **Load Balancers**: Application and network load balancers
- **CDN**: Global content delivery for static assets
- **Monitoring Stack**: Prometheus, Grafana, and alerting systems

### Deployment Strategy
- **Blue-Green Deployment**: Zero-downtime API updates
- **Canary Releases**: Gradual rollout of new API versions
- **Feature Flags**: Controlled feature enablement
- **Rollback Procedures**: Quick recovery from failed deployments

### Operational Procedures
- **Incident Response**: Clear escalation and resolution procedures
- **Change Management**: Controlled deployment and rollback processes
- **Capacity Planning**: Proactive scaling based on usage trends
- **Disaster Recovery**: Backup and recovery procedures

### Operational Runbooks

#### API Gateway Incident Response
```markdown
# API Gateway Incident Response Runbook

## Symptoms
- High error rates (5xx responses)
- Increased response times
- Service unavailable errors

## Immediate Actions
1. Check Kong service status: `docker exec kong kong health`
2. Verify database connectivity: `docker exec kong kong db_export`
3. Check resource usage: `docker stats kong`

## Escalation
- If unresolved in 15 minutes: Escalate to DevOps team
- If affecting production: Page on-call engineer

## Recovery Steps
1. Restart Kong service: `docker restart kong`
2. Verify health checks: `curl http://kong:8001/status`
3. Monitor metrics for 10 minutes
4. Update incident status
```

#### GraphQL Performance Troubleshooting
```markdown
# GraphQL Performance Troubleshooting

## Slow Query Investigation
1. Check query complexity: `curl -X POST -H "Content-Type: application/json" -d '{"query":"query { __schema { types { name } } }"}' http://localhost:4000/graphql`
2. Review query logs for N+1 patterns
3. Check data loader implementation
4. Verify Redis cache hit rates

## Common Issues
- Missing data loaders causing N+1 queries
- Complex nested queries without field selection
- Missing query result caching
- Inefficient resolver implementations

## Resolution Steps
1. Implement missing data loaders
2. Add query complexity analysis
3. Optimize resolver functions
4. Enable query result caching
```

#### Rate Limiting Configuration
```markdown
# Rate Limiting Configuration Guide

## Kong Rate Limiting Setup
```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 1000
      hour: 10000
      policy: local
      fault_tolerant: true
      hide_client_headers: false
```

## Per-User Rate Limiting
```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 100
      hour: 1000
      policy: local
      identifier: consumer
      fault_tolerant: true
```

## Monitoring Rate Limiting
- Track rate limit headers in responses
- Monitor rate limit violations
- Set up alerts for unusual rate limiting patterns
```

## Success Metrics

### Technical Metrics
- **API Response Times**: Meet all SLA requirements
- **Error Rates**: < 1% for critical endpoints
- **Availability**: 99.9% uptime for external APIs
- **Throughput**: Support peak capacity requirements

### Developer Experience Metrics
- **API Adoption**: Frontend team productivity improvements
- **Documentation Quality**: Developer satisfaction scores
- **Testing Coverage**: Comprehensive test coverage across all protocols
- **Onboarding Time**: Time for new developers to integrate with APIs

### Business Metrics
- **User Experience**: Improved application responsiveness
- **Development Velocity**: Faster feature delivery
- **Operational Efficiency**: Reduced debugging and maintenance time
- **Scalability**: Support for business growth requirements

## Future Considerations

### Technology Evolution
- **GraphQL Federation**: Multi-service GraphQL schema composition
- **gRPC-Web**: Browser support for gRPC communication
- **HTTP/3**: Next-generation HTTP protocol adoption
- **WebAssembly**: Client-side performance optimization

### Scaling Strategies
- **Microservices**: Further service decomposition as needed
- **Event Sourcing**: CQRS pattern for complex data workflows
- **API Versioning**: Long-term API evolution and migration
- **Global Distribution**: Multi-region deployment and edge computing

### Integration Opportunities
- **Third-Party APIs**: External service integration patterns
- **Mobile Applications**: Native mobile API optimization
- **IoT Devices**: Edge computing and device communication
- **Analytics Integration**: Real-time data streaming and analysis

## References

- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [gRPC Documentation](https://grpc.io/docs/)
- [REST API Design Guidelines](https://restfulapi.net/)
- [WebSocket API Specification](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [API Gateway Patterns](https://microservices.io/patterns/apigateway.html)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers/docs/overview)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
