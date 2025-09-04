# Service Mesh Configuration Standards

## Overview

This document establishes comprehensive standards for service mesh configuration in the CloudLab distributed systems platform. It covers Istio setup, traffic management, security policies, observability integration, and operational best practices for microservices communication.

## Table of Contents

1. [Service Mesh Architecture](#service-mesh-architecture)
2. [Istio Installation & Configuration](#istio-installation--configuration)
3. [Traffic Management](#traffic-management)
4. [Security Policies](#security-policies)
5. [Observability Integration](#observability-integration)
6. [Performance Optimization](#performance-optimization)
7. [Multi-Cluster Patterns](#multi-cluster-patterns)
8. [Troubleshooting & Operations](#troubleshooting--operations)
9. [Testing & Validation](#testing--validation)
10. [Best Practices Summary](#best-practices-summary)

---

## Service Mesh Architecture

### Core Components

#### Istio Control Plane
- **Pilot**: Traffic management and service discovery
- **Citadel**: Certificate management and security
- **Galley**: Configuration validation and distribution
- **Telemetry**: Metrics collection and processing

#### Data Plane
- **Envoy Proxy**: Sidecar proxy for service communication
- **Service-to-Service Communication**: mTLS, load balancing, circuit breaking
- **Ingress/Egress**: External traffic management

### Architecture Principles

#### Service Mesh Benefits
```yaml
# Service mesh provides:
- Automatic mTLS between services
- Traffic management and load balancing
- Observability and monitoring
- Security policies and access control
- Circuit breaking and fault tolerance
- A/B testing and canary deployments
```

#### Design Patterns
- **Sidecar Pattern**: Envoy proxy deployed alongside each service
- **Service Discovery**: Automatic service registration and discovery
- **Traffic Splitting**: Blue-green and canary deployment support
- **Security by Default**: mTLS enabled by default

---

## Istio Installation & Configuration

### Prerequisites

#### Kubernetes Requirements
```bash
# Minimum Kubernetes version
kubectl version --client --short
# Client Version: v1.21+

# Check cluster resources
kubectl top nodes
# Ensure sufficient CPU and memory for Istio components
```

#### Resource Requirements
```yaml
# Minimum cluster resources for Istio
resources:
  control_plane:
    cpu: "2 cores"
    memory: "4Gi"
  data_plane:
    cpu: "0.1 cores per pod"
    memory: "128Mi per pod"
```

### Installation Process

#### 1. Download Istio
```bash
# Download latest Istio release
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.19.0
export PATH=$PWD/bin:$PATH

# Verify installation
istioctl version
```

#### 2. Install Istio Control Plane
```bash
# Install with default profile
istioctl install --set values.defaultRevision=default

# Verify installation
kubectl get pods -n istio-system
```

#### 3. Enable Sidecar Injection
```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled

# Verify injection
kubectl get pods -n default
# Should show 2/2 containers (app + istio-proxy)
```

### Configuration Management

#### Istio Configuration Files
```yaml
# istio-config.yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
spec:
  values:
    global:
      proxy:
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
    pilot:
      resources:
        requests:
          cpu: 500m
          memory: 1Gi
```

#### Environment-Specific Configurations
```yaml
# Development environment
dev-config:
  values:
    global:
      logging:
        level: debug
    pilot:
      env:
        PILOT_ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION: true

# Production environment
prod-config:
  values:
    global:
      logging:
        level: info
    pilot:
      env:
        PILOT_ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION: false
```

---

## Traffic Management

### Virtual Services

#### Basic Virtual Service
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service
  namespace: default
spec:
  hosts:
  - user-service
  http:
  - match:
    - uri:
        prefix: /api/v1/users
    route:
    - destination:
        host: user-service
        port:
          number: 8080
      weight: 100
```

#### Advanced Routing Rules
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service-advanced
spec:
  hosts:
  - user-service
  http:
  - match:
    - headers:
        user-type:
          exact: premium
    route:
    - destination:
        host: user-service
        subset: premium
      weight: 100
  - match:
    - headers:
        user-type:
          exact: standard
    route:
    - destination:
        host: user-service
        subset: standard
      weight: 100
  - route:
    - destination:
        host: user-service
        subset: default
      weight: 100
```

### Destination Rules

#### Load Balancing Configuration
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service
spec:
  host: user-service
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
        maxRequestsPerConnection: 2
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

#### Subset Configuration
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service-subsets
spec:
  host: user-service
  subsets:
  - name: premium
    labels:
      tier: premium
    trafficPolicy:
      loadBalancer:
        simple: ROUND_ROBIN
  - name: standard
    labels:
      tier: standard
    trafficPolicy:
      loadBalancer:
        simple: LEAST_CONN
```

### Gateway Configuration

#### Ingress Gateway
```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: cloudlab-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - api.cloudlab.com
    tls:
      httpsRedirect: true
  - port:
      number: 443
      name: https
      protocol: HTTPS
    hosts:
    - api.cloudlab.com
    tls:
      mode: SIMPLE
      credentialName: cloudlab-tls
```

#### Egress Gateway
```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: egress-gateway
spec:
  selector:
    istio: egressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    hosts:
    - "*.external-api.com"
    tls:
      mode: SIMPLE
```

---

## Security Policies

### mTLS Configuration

#### Global mTLS
```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
```

#### Namespace-Specific mTLS
```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: user-service-mtls
  namespace: user-service
spec:
  mtls:
    mode: STRICT
  selector:
    matchLabels:
      app: user-service
```

#### Service-Specific mTLS
```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: payment-service-mtls
spec:
  mtls:
    mode: STRICT
  selector:
    matchLabels:
      app: payment-service
```

### Authorization Policies

#### Service-to-Service Authorization
```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: user-service-auth
  namespace: user-service
spec:
  selector:
    matchLabels:
      app: user-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/order-service/sa/order-service"]
    - source:
        principals: ["cluster.local/ns/payment-service/sa/payment-service"]
    to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/api/v1/users/*"]
```

#### Role-Based Access Control
```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: admin-access
spec:
  selector:
    matchLabels:
      app: admin-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/admin/sa/admin-service"]
    to:
    - operation:
        methods: ["*"]
        paths: ["/admin/*"]
```

#### JWT-Based Authorization
```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: jwt-auth
spec:
  selector:
    matchLabels:
      app: protected-service
  rules:
  - from:
    - source:
        requestPrincipals: ["*"]
    when:
    - key: request.auth.claims[iss]
      values: ["https://auth.cloudlab.com"]
    - key: request.auth.claims[aud]
      values: ["cloudlab-api"]
```

### Network Policies

#### Ingress Network Policy
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: user-service-ingress
  namespace: user-service
spec:
  podSelector:
    matchLabels:
      app: user-service
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: order-service
    - namespaceSelector:
        matchLabels:
          name: payment-service
    ports:
    - protocol: TCP
      port: 8080
```

#### Egress Network Policy
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: user-service-egress
  namespace: user-service
spec:
  podSelector:
    matchLabels:
      app: user-service
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

---

## Observability Integration

### Metrics Configuration

#### Prometheus Integration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: istio-system
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'istio-mesh'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - istio-system
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: istio-telemetry
```

#### Custom Metrics
```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: custom-metrics
  namespace: user-service
spec:
  metrics:
  - providers:
    - name: prometheus
    overrides:
    - match:
        metric: requests_total
      tagOverrides:
        custom_tag:
          value: "user-service"
```

### Distributed Tracing

#### Jaeger Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: jaeger-config
  namespace: istio-system
data:
  jaeger.yaml: |
    sampling:
      type: const
      param: 1
    reporter:
      logSpans: true
      localAgentHostPort: jaeger-agent:6831
```

#### Tracing Configuration
```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: tracing-config
  namespace: user-service
spec:
  tracing:
  - providers:
    - name: jaeger
    customTags:
      user_id:
        header:
          name: x-user-id
      request_id:
        header:
          name: x-request-id
```

### Logging Standards

#### Structured Logging
```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: logging-config
  namespace: user-service
spec:
  accessLogging:
  - providers:
    - name: otel
    customFormat: |
      {
        "timestamp": "%START_TIME%",
        "method": "%REQ(:METHOD)%",
        "path": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
        "status": "%RESPONSE_CODE%",
        "duration": "%DURATION%",
        "user_agent": "%REQ(USER-AGENT)%",
        "trace_id": "%REQ(X-TRACE-ID)%"
      }
```

---

## Performance Optimization

### Connection Pooling

#### TCP Connection Pool
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: connection-pool-config
spec:
  host: user-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
        connectTimeout: 30ms
        tcpKeepalive:
          time: 7200s
          interval: 75s
          probes: 9
      http:
        http1MaxPendingRequests: 10
        http2MaxRequests: 100
        maxRequestsPerConnection: 2
        maxRetries: 3
        consecutiveGatewayErrors: 5
        h2UpgradePolicy: UPGRADE
```

#### Circuit Breaker Configuration
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: circuit-breaker-config
spec:
  host: user-service
  trafficPolicy:
    connectionPool:
      http:
        http1MaxPendingRequests: 10
        maxRequestsPerConnection: 2
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
      minHealthPercent: 30
```

### Load Balancing Strategies

#### Load Balancing Configuration
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: load-balancing-config
spec:
  host: user-service
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
      consistentHash:
        httpHeaderName: x-user-id
        minimumRingSize: 1024
```

#### Locality-Based Load Balancing
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: locality-lb-config
spec:
  host: user-service
  trafficPolicy:
    loadBalancer:
      localityLbSetting:
        enabled: true
        distribute:
        - from: "region1/zone1/*"
          to:
            "region1/zone1/*": 80
            "region1/zone2/*": 20
```

### Resource Optimization

#### Proxy Resource Limits
```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
spec:
  values:
    global:
      proxy:
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
        config:
          defaultConfig:
            concurrency: 2
            proxyStatsMatcher:
              inclusionRegexps:
              - ".*circuit_breakers.*"
              - ".*upstream_rq_retry.*"
              - ".*upstream_cx_.*"
```

---

## Multi-Cluster Patterns

### Cluster Configuration

#### Multi-Cluster Setup
```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
spec:
  values:
    global:
      meshID: cloudlab-mesh
      multiCluster:
        clusterName: cluster-1
      network: network-1
    pilot:
      env:
        PILOT_ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION: true
        PILOT_ENABLE_CROSS_CLUSTER_WORKLOAD_ENTRY: true
```

#### Cross-Cluster Service Discovery
```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: external-user-service
  namespace: user-service
spec:
  hosts:
  - user-service.cluster-2.svc.cluster.local
  ports:
  - number: 8080
    name: http
    protocol: HTTP
  location: MESH_INTERNAL
  resolution: DNS
```

### Traffic Management Across Clusters

#### Cross-Cluster Load Balancing
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: cross-cluster-lb
spec:
  host: user-service.cluster-2.svc.cluster.local
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
    outlierDetection:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

#### Failover Configuration
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: failover-config
spec:
  host: user-service
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
    outlierDetection:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
        maxRequestsPerConnection: 2
```

---

## Troubleshooting & Operations

### Common Issues

#### Sidecar Injection Problems
```bash
# Check sidecar injection status
kubectl get pods -n default -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].name}{"\n"}{end}'

# Manual sidecar injection
kubectl patch deployment user-service -p '{"spec":{"template":{"metadata":{"annotations":{"sidecar.istio.io/inject":"true"}}}}}'

# Check injection webhook
kubectl get validatingwebhookconfiguration istio-sidecar-injector
```

#### Traffic Routing Issues
```bash
# Check virtual service configuration
kubectl get virtualservice user-service -o yaml

# Check destination rule
kubectl get destinationrule user-service -o yaml

# Check gateway configuration
kubectl get gateway cloudlab-gateway -o yaml

# Test traffic routing
istioctl proxy-config route user-service-xxx --name 8080
```

#### Security Policy Issues
```bash
# Check peer authentication
kubectl get peerauthentication -A

# Check authorization policy
kubectl get authorizationpolicy -A

# Check mTLS status
istioctl authn tls-check user-service.default.svc.cluster.local
```

### Monitoring & Debugging

#### Envoy Proxy Configuration
```bash
# Get proxy configuration
istioctl proxy-config cluster user-service-xxx

# Get listener configuration
istioctl proxy-config listener user-service-xxx

# Get route configuration
istioctl proxy-config route user-service-xxx

# Get endpoint configuration
istioctl proxy-config endpoint user-service-xxx
```

#### Proxy Logs
```bash
# Get proxy logs
kubectl logs user-service-xxx -c istio-proxy

# Get access logs
kubectl logs user-service-xxx -c istio-proxy | grep "access_log"

# Get error logs
kubectl logs user-service-xxx -c istio-proxy | grep "error"
```

#### Metrics Analysis
```bash
# Check proxy metrics
kubectl exec user-service-xxx -c istio-proxy -- curl localhost:15000/stats

# Check pilot metrics
kubectl exec -n istio-system pilot-xxx -- curl localhost:15014/metrics

# Check citadel metrics
kubectl exec -n istio-system citadel-xxx -- curl localhost:15014/metrics
```

### Operational Procedures

#### Rolling Updates
```bash
# Update Istio control plane
istioctl upgrade

# Update data plane
kubectl rollout restart deployment user-service

# Verify update
istioctl version
```

#### Backup & Recovery
```bash
# Backup Istio configuration
kubectl get crd | grep istio.io | awk '{print $1}' | xargs -I {} kubectl get {} -A -o yaml > istio-backup.yaml

# Restore configuration
kubectl apply -f istio-backup.yaml
```

---

## Testing & Validation

### Configuration Validation

#### Istio Configuration Check
```bash
# Validate Istio configuration
istioctl analyze

# Validate specific namespace
istioctl analyze user-service

# Validate with verbose output
istioctl analyze --verbose
```

#### Proxy Configuration Validation
```bash
# Validate proxy configuration
istioctl proxy-config validate user-service-xxx

# Check proxy status
istioctl proxy-status

# Check proxy version
istioctl proxy-status user-service-xxx
```

### Integration Testing

#### Traffic Testing
```bash
# Test internal service communication
kubectl exec user-service-xxx -c user-service -- curl order-service:8080/api/v1/orders

# Test external access
curl -H "Host: api.cloudlab.com" http://ingress-gateway/api/v1/users

# Test mTLS
istioctl authn tls-check user-service.default.svc.cluster.local
```

#### Performance Testing
```bash
# Load test with fortio
kubectl exec user-service-xxx -c user-service -- fortio load -c 10 -qps 100 -t 60s order-service:8080/api/v1/orders

# Check metrics during load test
kubectl exec user-service-xxx -c istio-proxy -- curl localhost:15000/stats | grep "upstream_rq_total"
```

### Security Testing

#### mTLS Verification
```bash
# Check mTLS status
istioctl authn tls-check user-service.default.svc.cluster.local

# Test without mTLS (should fail)
kubectl exec user-service-xxx -c user-service -- curl -k https://order-service:8080/api/v1/orders
```

#### Authorization Testing
```bash
# Test authorized access
kubectl exec user-service-xxx -c user-service -- curl order-service:8080/api/v1/orders

# Test unauthorized access (should fail)
kubectl exec unauthorized-service-xxx -c unauthorized-service -- curl user-service:8080/api/v1/users
```

---

## Best Practices Summary

### Configuration Management

#### Naming Conventions
- Use descriptive names for all Istio resources
- Include namespace in resource names when needed
- Use consistent labeling across all resources
- Follow Kubernetes naming conventions

#### Resource Organization
- Group related resources in the same namespace
- Use consistent annotations for all resources
- Maintain clear separation between environments
- Document all custom configurations

### Security Best Practices

#### mTLS Configuration
- Enable mTLS in STRICT mode for production
- Use permissive mode only for migration
- Regularly rotate certificates
- Monitor certificate expiration

#### Authorization Policies
- Implement least privilege access
- Use service accounts for authentication
- Regular audit of authorization policies
- Test authorization changes in staging

### Performance Optimization

#### Resource Management
- Set appropriate resource limits for proxies
- Monitor proxy resource usage
- Optimize connection pool settings
- Use locality-based load balancing

#### Traffic Management
- Implement circuit breakers for resilience
- Use appropriate load balancing algorithms
- Monitor traffic patterns and adjust
- Implement retry policies carefully

### Operational Excellence

#### Monitoring & Observability
- Enable comprehensive metrics collection
- Implement distributed tracing
- Set up proper alerting
- Regular review of observability data

#### Troubleshooting
- Maintain runbooks for common issues
- Regular testing of disaster recovery procedures
- Document troubleshooting procedures
- Train team on Istio operations

### Documentation & Maintenance

#### Documentation Standards
- Document all custom configurations
- Maintain up-to-date runbooks
- Regular review of documentation
- Version control all configurations

#### Maintenance Procedures
- Regular updates of Istio components
- Backup of all configurations
- Testing of updates in staging
- Rollback procedures for failed updates

---

## Implementation Checklist

### Pre-Installation
- [ ] Verify Kubernetes cluster requirements
- [ ] Plan resource allocation for Istio components
- [ ] Design network architecture and policies
- [ ] Prepare security policies and certificates

### Installation
- [ ] Install Istio control plane
- [ ] Configure sidecar injection
- [ ] Set up ingress and egress gateways
- [ ] Configure basic traffic management

### Configuration
- [ ] Implement mTLS policies
- [ ] Set up authorization policies
- [ ] Configure traffic routing rules
- [ ] Set up observability integration

### Testing
- [ ] Validate configuration with istioctl analyze
- [ ] Test service-to-service communication
- [ ] Verify security policies
- [ ] Test traffic management features

### Production Readiness
- [ ] Set up monitoring and alerting
- [ ] Implement backup and recovery procedures
- [ ] Document operational procedures
- [ ] Train operations team

---

**Document Version**: 1.0  
**Last Updated**: 2025-09-04
**Status**: Ready for Implementation
