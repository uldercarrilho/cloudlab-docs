# 📄 ADR-003: Container Orchestration & Service Mesh Architecture

## 1. Document Info
- **Document Name:** ADR-003: Container Orchestration & Service Mesh Architecture
- **Version:** 1.0
- **Date:** 2025-08-12
- **Author:** AI Agent (TASK-003)
- **Status:** Approved

---

## 2. Summary
> Implement Kubernetes as the container orchestration platform with Istio service mesh to establish a robust, scalable foundation for the distributed e-commerce platform's microservice architecture.

**Example:** Deploy and manage containerized microservices using Kubernetes orchestration with Istio service mesh for advanced traffic management, security, and observability.

---

## 3. Problem & Context
> What problem are we solving? What's the current situation?

**Current Situation:** The distributed e-commerce platform requires a container orchestration solution to manage hundreds of microservices across multiple environments (development, staging, production). We need to handle service discovery, load balancing, scaling, and advanced networking patterns like circuit breakers and retry logic.

**Problems to Solve:**
- Manual container deployment and scaling is not sustainable
- Service-to-service communication needs advanced traffic management
- Security policies must be enforced consistently across services
- Observability and monitoring require centralized control
- Multi-cluster deployment strategy for high availability

---

## 4. Requirements

### 4.1 Functional Requirements
- [x] FR1: Automatically deploy and scale microservices based on demand
- [x] FR2: Provide service discovery and load balancing
- [x] FR3: Implement advanced traffic management (canary deployments, A/B testing)
- [x] FR4: Enforce security policies and mTLS between services
- [x] FR5: Support multi-cluster deployment across regions
- [x] FR6: Provide centralized observability and monitoring

### 4.2 Non-Functional Requirements
- [x] NFR1: Handle 10x traffic spikes during sales events
- [x] NFR2: Achieve 99.9% uptime requirement
- [x] NFR3: Support horizontal scaling from 10 to 1000+ pods
- [x] NFR4: Response time < 100ms for service-to-service calls
- [x] NFR5: Multi-tenant isolation and security

---

## 5. Business Rules & Constraints
> Rules that must always be true, plus any limitations.

**Business Rules:**
- Must support both stateless and stateful services
- Must integrate with existing CI/CD pipelines
- Must support blue-green and canary deployment strategies
- Must provide cost optimization through auto-scaling

**Constraints:**
- Team has limited Kubernetes experience (learning curve consideration)
- Budget constraints favor managed services over self-hosted
- Must work with existing cloud infrastructure (AWS/GCP)
- Compliance requirements for data residency and security

---

## 6. Acceptance Criteria
> Specific, testable outcomes that define "done".

**Acceptance Criteria:**
- [x] Kubernetes cluster successfully deployed and tested
- [x] Istio service mesh installed and configured
- [x] Sample microservice deployed and accessible
- [x] Traffic management policies (retry, circuit breaker) working
- [x] Security policies (mTLS, authorization) enforced
- [x] Monitoring and observability dashboards functional
- [x] Multi-cluster strategy documented and tested
- [x] Team training plan and documentation completed

---

## 7. Architecture Decision Record

### Decision
> What did we choose and why?

**Container Orchestration Platform: Kubernetes**
- **Why Kubernetes:** Industry standard with largest ecosystem, extensive documentation, and community support
- **Managed Service:** Use EKS (AWS) or GKE (GCP) to reduce operational overhead
- **Learning Investment:** Acceptable learning curve given long-term benefits and market demand

**Service Mesh: Istio**
- **Why Istio:** Most feature-rich service mesh with excellent integration with Kubernetes
- **Traffic Management:** Advanced patterns like canary deployments, circuit breakers, and retry logic
- **Security:** Built-in mTLS, authorization policies, and security best practices
- **Observability:** Comprehensive metrics, logs, and tracing out of the box

### Service Complexity Assessment

#### **Real Services (Essential for Distributed Systems Learning)**
- **Kubernetes**: Real container orchestration for learning deployment patterns, scaling, and service discovery
- **Istio Service Mesh**: Real service mesh for learning traffic management, security policies, and observability
- **Learning Benefits**: Practice real-world container orchestration, service mesh patterns, and operational procedures

#### **Mocked Services (To Avoid Overengineering)**
- **External Monitoring Tools**: Mock external monitoring services to focus on Istio observability patterns
- **External Security Services**: Mock external security services to focus on Istio security patterns
- **Learning Benefits**: Focus on core distributed systems concepts without external service integration complexity

#### **Complexity Balance**
- **Real Services**: Used where they directly contribute to distributed systems learning objectives
- **Mocked Services**: Used for external dependencies that don't contribute to core learning goals
- **Result**: Optimal balance between learning value and operational complexity

### Alternatives Considered

#### Container Orchestration Alternatives:
1. **Docker Swarm**
   - ✅ Simpler to learn and operate
   - ❌ Limited ecosystem and community support
   - ❌ Less mature scaling and advanced features
   - ❌ Limited enterprise adoption

2. **HashiCorp Nomad**
   - ✅ Simple and lightweight
   - ✅ Good for mixed workloads (containers, VMs, applications)
   - ❌ Smaller ecosystem compared to Kubernetes
   - ❌ Less mature for complex microservice patterns

3. **Apache Mesos + Marathon**
   - ✅ Proven at scale (Twitter, Uber)
   - ❌ Complex architecture and operation
   - ❌ Declining community and adoption
   - ❌ Steep learning curve

#### Service Mesh Alternatives:
1. **Linkerd**
   - ✅ Lightweight and fast
   - ✅ Simpler to operate than Istio
   - ❌ Fewer advanced features
   - ❌ Smaller ecosystem and community

2. **Consul Connect**
   - ✅ Good integration with HashiCorp stack
   - ✅ Service discovery and configuration management
   - ❌ Less mature service mesh features
   - ❌ Limited traffic management capabilities

3. **AWS App Mesh**
   - ✅ Native AWS integration
   - ✅ Managed service (no operational overhead)
   - ❌ Vendor lock-in to AWS
   - ❌ Less feature-rich than Istio

### Decision Matrix

| Criteria | Weight | Kubernetes | Docker Swarm | Nomad | Mesos |
|----------|--------|------------|--------------|-------|-------|
| Ecosystem & Community | 25% | 10 | 6 | 7 | 5 |
| Learning Curve | 20% | 7 | 9 | 8 | 4 |
| Enterprise Adoption | 20% | 10 | 6 | 7 | 8 |
| Advanced Features | 15% | 10 | 6 | 7 | 8 |
| Operational Complexity | 20% | 6 | 9 | 8 | 3 |
| **Total Score** | **100%** | **8.6** | **7.2** | **7.4** | **5.6** |

| Criteria | Weight | Istio | Linkerd | Consul Connect | App Mesh |
|----------|--------|-------|---------|----------------|----------|
| Feature Richness | 30% | 10 | 7 | 6 | 7 |
| Kubernetes Integration | 25% | 10 | 9 | 7 | 8 |
| Learning Curve | 20% | 6 | 9 | 7 | 8 |
| Community Support | 15% | 10 | 7 | 8 | 6 |
| Operational Overhead | 10% | 5 | 8 | 7 | 9 |
| **Total Score** | **100%** | **8.7** | **8.0** | **7.0** | **7.6** |

### Detailed Service Mesh Analysis

**Istio (Selected):**
- **Strengths**: Most feature-rich, excellent Kubernetes integration, comprehensive security, advanced traffic management
- **Weaknesses**: Complex learning curve, high resource overhead, operational complexity
- **Best For**: Enterprise environments requiring advanced service mesh capabilities

**Linkerd:**
- **Strengths**: Lightweight, fast, simple operation, good performance
- **Weaknesses**: Fewer advanced features, smaller ecosystem
- **Best For**: Teams prioritizing simplicity and performance over advanced features

**Consul Connect:**
- **Strengths**: Good HashiCorp integration, service discovery, configuration management
- **Weaknesses**: Less mature service mesh features, limited traffic management
- **Best For**: Organizations already using HashiCorp stack

**AWS App Mesh:**
- **Strengths**: Native AWS integration, managed service, low operational overhead
- **Weaknesses**: Vendor lock-in, limited features compared to Istio
- **Best For**: AWS-only environments with simple service mesh requirements

### Consequences
- ✅ **Positive:**
  - Industry-standard platform with extensive ecosystem
  - Advanced service mesh capabilities for complex traffic patterns
  - Excellent community support and documentation
  - Future-proof technology choice for career development
  - Scalable architecture that can grow with business needs

- ❌ **Negative:**
  - Steep learning curve for team members
  - Operational complexity requires dedicated DevOps expertise
  - Resource overhead for small deployments
  - Potential vendor lock-in with managed services

### Risk Assessment & Mitigation Strategies

**High Risk - Learning Curve:**
- **Risk**: Team lacks Kubernetes/Istio experience, leading to deployment delays
- **Mitigation**: 
  - 3-month training program with hands-on labs
  - Start with simple deployments, gradually increase complexity
  - Pair experienced team members with beginners
  - Use managed services to reduce operational complexity

**Medium Risk - Operational Complexity:**
- **Risk**: Complex infrastructure becomes difficult to maintain and troubleshoot
- **Mitigation**:
  - Implement comprehensive monitoring and alerting from day one
  - Use infrastructure as code for reproducibility
  - Create detailed runbooks and troubleshooting guides
  - Establish on-call rotation with escalation procedures

**Medium Risk - Resource Overhead:**
- **Risk**: Kubernetes and Istio consume significant resources, increasing costs
- **Mitigation**:
  - Start with minimal resource allocation and scale up as needed
  - Use resource quotas and limits to prevent resource hogging
  - Implement auto-scaling policies for cost optimization
  - Regular cost analysis and optimization reviews

**Low Risk - Vendor Lock-in:**
- **Risk**: Managed services create dependency on cloud providers
- **Mitigation**:
  - Use standard Kubernetes APIs and avoid provider-specific features
  - Maintain ability to migrate between cloud providers
  - Document all provider-specific configurations
  - Regular evaluation of alternative providers

---

## 8. Implementation Notes
> Technical details, libraries, and approaches to use.

**Kubernetes Implementation:**
- Use managed Kubernetes service (EKS/GKE) to reduce operational overhead
- Implement RBAC for security and access control
- Use Helm charts for application deployment and management
- Implement resource quotas and limits for cost control
- Use node groups and auto-scaling for cost optimization

**Specific Kubernetes Commands & Configuration:**
```bash
# Cluster creation (EKS example)
eksctl create cluster --name cloud-lab-platform --region us-west-2 --nodes 3 --node-type t3.medium

# RBAC setup
kubectl create namespace cloud-lab
kubectl create serviceaccount cloud-lab-sa --namespace cloud-lab
kubectl create role cloud-lab-role --namespace cloud-lab --verb=get,list,watch,create,update,delete --resource=pods,services,deployments
kubectl create rolebinding cloud-lab-rolebinding --namespace cloud-lab --role=cloud-lab-role --serviceaccount=cloud-lab:cloud-lab-sa

# Resource quotas
kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: cloud-lab-quota
  namespace: cloud-lab
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
EOF
```

**Istio Implementation:**
- Start with basic installation and gradually enable advanced features
- Implement mTLS for service-to-service security
- Configure traffic management policies (retry, circuit breaker, timeout)
- Set up observability stack (Prometheus, Grafana, Jaeger)
- Use Gateway API for ingress traffic management

**Specific Istio Commands & Configuration:**
```bash
# Istio installation
istioctl install --set profile=demo -y

# Enable mTLS
kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
EOF

# Traffic management policy
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: cloud-lab-service
spec:
  hosts:
  - cloud-lab-service
  http:
  - route:
    - destination:
        host: cloud-lab-service
        subset: v1
      weight: 90
    - destination:
        host: cloud-lab-service
        subset: v2
      weight: 10
    retries:
      attempts: 3
      perTryTimeout: 2s
    timeout: 10s
EOF
```

**Multi-Cluster Strategy:**
- Primary cluster for production workloads
- Secondary cluster for disaster recovery and regional distribution
- Use Istio multi-cluster for service mesh across clusters
- Implement cluster federation for centralized management

**Success Metrics & Validation Criteria:**

**Performance Metrics:**
- **Response Time**: Service-to-service calls < 100ms (95th percentile)
- **Throughput**: Handle 10x traffic spikes during sales events
- **Availability**: 99.9% uptime requirement met
- **Resource Utilization**: CPU and memory usage < 80% under normal load

**Operational Metrics:**
- **Deployment Time**: New service deployment < 5 minutes
- **Rollback Time**: Service rollback < 2 minutes
- **Incident Response**: P1 issues resolved < 1 hour, P2 issues < 4 hours
- **MTTR**: Mean Time To Recovery < 30 minutes

**Security Metrics:**
- **mTLS Coverage**: 100% of service-to-service communication encrypted
- **Policy Enforcement**: 100% of security policies enforced
- **Access Control**: Zero unauthorized access attempts
- **Compliance**: All regulatory requirements met

**Validation Procedures:**
1. **Load Testing**: Simulate 10x traffic spikes and verify auto-scaling
2. **Chaos Engineering**: Test failure scenarios and recovery procedures
3. **Security Testing**: Penetration testing and vulnerability assessment
4. **Performance Testing**: Benchmark service response times and throughput
5. **Disaster Recovery**: Test multi-cluster failover procedures

**Performance Benchmarking Examples:**

**Load Testing Script:**
```bash
#!/bin/bash
# Load testing script for Kubernetes services

SERVICE_URL="http://cloud-lab-service.cloud-lab.svc.cluster.local"
CONCURRENT_USERS=100
DURATION=300

echo "Starting load test for $SERVICE_URL"
echo "Concurrent users: $CONCURRENT_USERS"
echo "Duration: $DURATION seconds"

# Install hey tool if not present
if ! command -v hey &> /dev/null; then
    echo "Installing hey load testing tool..."
    wget https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
    chmod +x hey_linux_amd64
    sudo mv hey_linux_amd64 /usr/local/bin/hey
fi

# Run load test
hey -z ${DURATION}s -c $CONCURRENT_USERS $SERVICE_URL

echo "Load test completed"
```

**Performance Validation Criteria:**
```yaml
# Performance test configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: performance-test-config
  namespace: testing
data:
  test-config.yaml: |
    performance_tests:
      - name: "Service Response Time"
        target: "< 100ms (95th percentile)"
        method: "Load testing with hey tool"
        duration: "5 minutes"
        concurrent_users: 100
        
      - name: "Throughput Test"
        target: "1000 requests/second"
        method: "Sustained load testing"
        duration: "10 minutes"
        concurrent_users: 500
        
      - name: "Scalability Test"
        target: "10x traffic spike handling"
        method: "Sudden traffic increase simulation"
        duration: "2 minutes"
        concurrent_users: 1000
```

---

## 9. AI Collaboration Notes
> Specific guidance for AI assistant collaboration.

**Implementation Focus:**
- Start with basic Kubernetes concepts and gradually add complexity
- Use infrastructure as code (Terraform/CloudFormation) for reproducibility
- Implement comprehensive monitoring and alerting from day one
- Document all configuration decisions and their rationale
- Create automated testing for infrastructure changes

**Learning Path:**
- Begin with simple pod deployments and basic services
- Progress to deployments, replica sets, and horizontal pod autoscaling
- Add Istio gradually, starting with basic traffic routing
- Implement advanced patterns like canary deployments and circuit breakers
- Test failure scenarios and recovery procedures

**Best Practices:**
- Follow the principle of least privilege for RBAC
- Use namespaces for logical separation of workloads
- Implement resource requests and limits for all containers
- Use health checks and readiness probes for reliability
- Regular backup and disaster recovery testing

**Monitoring & Observability Implementation:**

**Metrics Collection:**
```yaml
# Prometheus configuration for Kubernetes metrics
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

**Advanced Monitoring Dashboards:**

**Kubernetes Cluster Dashboard:**
```yaml
# Grafana dashboard configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubernetes-cluster-dashboard
  namespace: monitoring
data:
  dashboard.json: |
    {
      "dashboard": {
        "title": "Kubernetes Cluster Overview",
        "panels": [
          {
            "title": "Cluster CPU Usage",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(container_cpu_usage_seconds_total{container!=\"\"}[5m]))",
                "legendFormat": "CPU Usage"
              }
            ]
          },
          {
            "title": "Pod Status Distribution",
            "type": "stat",
            "targets": [
              {
                "expr": "count(kube_pod_status_phase)",
                "legendFormat": "Total Pods"
              }
            ]
          }
        ]
      }
    }
```

**Istio Service Mesh Dashboard:**
```yaml
# Istio-specific monitoring
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-service-mesh-dashboard
  namespace: monitoring
data:
  dashboard.json: |
    {
      "dashboard": {
        "title": "Istio Service Mesh Metrics",
        "panels": [
          {
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(istio_requests_total[5m]))",
                "legendFormat": "Requests/sec"
              }
            ]
          },
          {
            "title": "Response Time (95th percentile)",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, sum(rate(istio_request_duration_milliseconds_bucket[5m])) by (le))",
                "legendFormat": "Response Time (ms)"
              }
            ]
          }
        ]
      }
    }
```

**Logging Strategy:**
- **Centralized Logging**: Fluentd/Fluent Bit for log collection
- **Log Storage**: Elasticsearch for log indexing and search
- **Log Visualization**: Kibana for log analysis and dashboards
- **Log Retention**: 90 days for production, 30 days for development

**Tracing Implementation:**
- **Distributed Tracing**: Jaeger for request tracing across services
- **Trace Sampling**: 100% for critical paths, 10% for general traffic
- **Trace Retention**: 7 days for production traces
- **Integration**: Istio automatic tracing with custom business logic

**Alerting & Notification:**
- **Critical Alerts**: PagerDuty integration for immediate response
- **Warning Alerts**: Slack/Teams for team awareness
- **Escalation**: Automated escalation after 15 minutes for critical issues
- **Alert Fatigue Prevention**: Intelligent grouping and correlation

**Advanced Troubleshooting Scenarios:**

**Scenario 1: Service Mesh Communication Failure**
```bash
# Diagnostic commands for Istio issues
# Check proxy status
kubectl get pods -n istio-system
kubectl logs -n istio-system -l app=istiod

# Verify mTLS configuration
kubectl get peerauthentication -A
kubectl get destinationrule -A

# Check proxy configuration
kubectl exec -it <pod-name> -c istio-proxy -- pilot-agent request GET config_dump

# Verify service endpoints
kubectl get endpoints -n <namespace>
kubectl get virtualservice -A
```

**Scenario 2: Resource Exhaustion**
```bash
# Check resource usage across cluster
kubectl top nodes
kubectl top pods --all-namespaces

# Check for resource quotas
kubectl get resourcequota -A
kubectl describe resourcequota <quota-name>

# Check for pending pods
kubectl get pods --all-namespaces --field-selector=status.phase=Pending

# Analyze resource requests vs limits
kubectl get pods -o custom-columns="NAME:.metadata.name,CPU_REQUEST:.spec.containers[*].resources.requests.cpu,CPU_LIMIT:.spec.containers[*].resources.limits.cpu,MEMORY_REQUEST:.spec.containers[*].resources.requests.memory,MEMORY_LIMIT:.spec.containers[*].resources.limits.memory"
```

---

## 10. References
> Links to standards, APIs, diagrams, or related docs.

**Documentation & Standards:**
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Istio Service Mesh](https://istio.io/docs/)
- [CNCF Service Mesh Interface](https://smi-spec.io/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/)

**Implementation Guides:**
- [EKS Best Practices](https://aws.amazon.com/eks/resources/best-practices/)
- [GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [Istio Security Best Practices](https://istio.io/latest/docs/ops/best-practices/security/)

**Community Resources:**
- [Kubernetes Slack](https://slack.k8s.io/)
- [Istio Discuss](https://discuss.istio.io/)
- [CNCF Slack](https://slack.cncf.io/)

**Related ADRs:**
- TASK-004: Data Storage & Consistency Patterns
- TASK-005: Message Queue & Event Streaming
- TASK-007: Cloud Infrastructure Decisions

---

## 11. Operational Procedures

### Deployment Procedures
1. **Blue-Green Deployment**:
   ```bash
   # Deploy new version to green environment
   kubectl apply -f green-deployment.yaml
   
   # Verify green deployment health
   kubectl rollout status deployment/green-deployment
   
   # Switch traffic to green
   kubectl apply -f green-vs.yaml
   
   # Monitor for 5 minutes, then remove blue
   kubectl delete -f blue-deployment.yaml
   ```

2. **Canary Deployment**:
   ```bash
   # Deploy canary with 10% traffic
   kubectl apply -f canary-deployment.yaml
   
   # Gradually increase traffic
   kubectl patch virtualservice cloud-lab-service -p '{"spec":{"http":[{"route":[{"destination":{"host":"cloud-lab-service","subset":"v1"},"weight":90},{"destination":{"host":"cloud-lab-service","subset":"v2"},"weight":10}]}]}}'
   ```

### Incident Response Procedures
1. **Service Outage**:
   - Check pod status: `kubectl get pods -n cloud-lab`
   - Check service endpoints: `kubectl get endpoints -n cloud-lab`
   - Check Istio proxy status: `kubectl get pods -n istio-system`
   - Restart failed pods: `kubectl delete pod <pod-name> -n cloud-lab`

2. **Performance Degradation**:
   - Check resource usage: `kubectl top pods -n cloud-lab`
   - Check Istio metrics: `kubectl exec -it <pod-name> -c istio-proxy -- curl localhost:15000/stats`
   - Scale up if needed: `kubectl scale deployment <deployment> --replicas=5`

### Backup & Recovery Procedures
1. **Configuration Backup**:
   ```bash
   # Backup all Kubernetes resources
   kubectl get all -n cloud-lab -o yaml > backup-$(date +%Y%m%d).yaml
   
   # Backup Istio configurations
   kubectl get virtualservice,gateway,destinationrule -n cloud-lab -o yaml > istio-backup-$(date +%Y%m%d).yaml
   ```

2. **Disaster Recovery**:
   - Restore from backup: `kubectl apply -f backup-$(date +%Y%m%d).yaml`
   - Verify service health: `kubectl get pods,svc -n cloud-lab`
   - Test connectivity: `kubectl exec -it <pod-name> -- curl <service-name>`

### Maintenance Procedures
1. **Kubernetes Version Upgrade**:
   - Check compatibility matrix
   - Create backup of all resources
   - Upgrade control plane first
   - Upgrade worker nodes in batches
   - Verify cluster health after each step

2. **Istio Version Upgrade**:
   - Check upgrade path compatibility
   - Backup Istio configurations
   - Upgrade Istio control plane
   - Upgrade Istio data plane
   - Verify service mesh functionality



## 12. Comprehensive Troubleshooting Guide

### Common Issues & Solutions

**Kubernetes Cluster Issues:**

**Issue 1: Pods Stuck in Pending State**
```bash
# Check node resources
kubectl describe nodes | grep -A 10 "Allocated resources"

# Check for resource quotas
kubectl get resourcequota -A
kubectl describe resourcequota <quota-name>

# Check for taints and tolerations
kubectl get nodes -o custom-columns="NAME:.metadata.name,TAINTS:.spec.taints"

# Solution: Scale up cluster or adjust resource requests
kubectl scale deployment <deployment> --replicas=3
```

**Issue 2: Services Not Accessible**
```bash
# Check service endpoints
kubectl get endpoints -n <namespace>
kubectl describe service <service-name>

# Check pod labels and selectors
kubectl get pods -n <namespace> --show-labels
kubectl get service <service-name> -o yaml

# Verify network policies
kubectl get networkpolicy -A
kubectl describe networkpolicy <policy-name>

# Solution: Fix label selectors or network policies
kubectl label pod <pod-name> app=<app-label>
```

**Issue 3: High Resource Usage**
```bash
# Check resource consumption
kubectl top pods --all-namespaces
kubectl top nodes

# Analyze resource requests vs limits
kubectl get pods -o custom-columns="NAME:.metadata.name,CPU_REQ:.spec.containers[*].resources.requests.cpu,CPU_LIM:.spec.containers[*].resources.limits.cpu,MEM_REQ:.spec.containers[*].resources.requests.memory,MEM_LIM:.spec.containers[*].resources.limits.memory"

# Check for resource hogs
kubectl get pods --all-namespaces --field-selector=status.phase=Running -o custom-columns="NAMESPACE:.metadata.namespace,NAME:.metadata.name,CPU:.spec.containers[*].resources.requests.cpu,MEMORY:.spec.containers[*].resources.requests.memory"

# Solution: Implement resource quotas and HPA
kubectl autoscale deployment <deployment> --cpu-percent=70 --min=2 --max=10
```

**Istio Service Mesh Issues:**

**Issue 1: mTLS Configuration Problems**
```bash
# Check mTLS status
kubectl get peerauthentication -A
kubectl get destinationrule -A

# Verify proxy configuration
kubectl exec -it <pod-name> -c istio-proxy -- pilot-agent request GET config_dump

# Check for mTLS conflicts
kubectl get peerauthentication -A -o yaml | grep -A 5 -B 5 "mode:"

# Solution: Apply consistent mTLS policy
kubectl apply -f - <<EOF
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
EOF
```

**Issue 2: Traffic Routing Failures**
```bash
# Check virtual service configuration
kubectl get virtualservice -A
kubectl describe virtualservice <vs-name>

# Verify destination rules
kubectl get destinationrule -A
kubectl describe destinationrule <dr-name>

# Check gateway configuration
kubectl get gateway -A
kubectl describe gateway <gateway-name>

# Solution: Fix routing configuration
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: <service-name>
spec:
  hosts:
  - <service-name>
  http:
  - route:
    - destination:
        host: <service-name>
        subset: v1
      weight: 100
EOF
```

**Issue 3: Performance Degradation**
```bash
# Check Istio proxy metrics
kubectl exec -it <pod-name> -c istio-proxy -- curl localhost:15000/stats

# Analyze request latency
kubectl exec -it <pod-name> -c istio-proxy -- curl localhost:15000/stats | grep request_duration

# Check for circuit breaker trips
kubectl exec -it <pod-name> -c istio-proxy -- curl localhost:15000/stats | grep circuit_breaker

# Solution: Optimize traffic policies and resource allocation
kubectl patch destinationrule <dr-name> -p '{"spec":{"trafficPolicy":{"connectionPool":{"tcp":{"maxConnections":100},"http":{"http1MaxPendingRequests":1000,"maxRequestsPerConnection":10}}}}}'
```

### Diagnostic Tools & Commands

**Cluster Health Check:**
```bash
#!/bin/bash
# Comprehensive cluster health check script

echo "=== Kubernetes Cluster Health Check ==="
echo "Date: $(date)"
echo ""

echo "1. Node Status:"
kubectl get nodes -o wide
echo ""

echo "2. Pod Status Summary:"
kubectl get pods --all-namespaces --field-selector=status.phase!=Running
echo ""

echo "3. Service Status:"
kubectl get services --all-namespaces
echo ""

echo "4. Resource Usage:"
kubectl top nodes
echo ""

echo "5. Istio Service Mesh Status:"
kubectl get pods -n istio-system
echo ""

echo "6. Recent Events:"
kubectl get events --all-namespaces --sort-by='.lastTimestamp' | tail -20
echo ""

echo "Health check completed at $(date)"
```

**Performance Monitoring:**
```bash
#!/bin/bash
# Performance monitoring script

NAMESPACE="cloud-lab"
SERVICE="cloud-lab-service"

echo "=== Performance Monitoring for $SERVICE ==="
echo ""

echo "1. Pod Resource Usage:"
kubectl top pods -n $NAMESPACE | grep $SERVICE
echo ""

echo "2. Service Response Time (if metrics available):"
kubectl exec -it $(kubectl get pods -n $NAMESPACE -l app=$SERVICE -o jsonpath='{.items[0].metadata.name}') -c istio-proxy -- curl -s localhost:15000/stats | grep request_duration
echo ""

echo "3. Active Connections:"
kubectl exec -it $(kubectl get pods -n $NAMESPACE -l app=$SERVICE -o jsonpath='{.items[0].metadata.name}') -c istio-proxy -- curl -s localhost:15000/stats | grep active
echo ""

echo "4. Error Rates:"
kubectl exec -it $(kubectl get pods -n $NAMESPACE -l app=$SERVICE -o jsonpath='{.items[0].metadata.name}') -c istio-proxy -- curl -s localhost:15000/stats | grep error
echo ""
```

### Emergency Procedures

**Critical Service Outage:**
1. **Immediate Response (0-5 minutes):**
   - Check cluster status: `kubectl get nodes`
   - Verify service endpoints: `kubectl get endpoints -n <namespace>`
   - Check Istio proxy status: `kubectl get pods -n istio-system`

2. **Quick Recovery (5-15 minutes):**
   - Restart failed pods: `kubectl delete pod <pod-name> -n <namespace>`
   - Scale up deployment: `kubectl scale deployment <deployment> --replicas=5`
   - Check service mesh: `kubectl get virtualservice,destinationrule -A`

3. **Full Recovery (15-60 minutes):**
   - Analyze logs: `kubectl logs -n <namespace> <pod-name>`
   - Check events: `kubectl get events -n <namespace> --sort-by='.lastTimestamp'`
   - Implement fixes and verify recovery

**Performance Crisis:**
1. **Immediate Actions:**
   - Scale up resources: `kubectl scale deployment <deployment> --replicas=10`
   - Check resource limits: `kubectl describe pod <pod-name>`
   - Verify auto-scaling: `kubectl get hpa -A`

2. **Traffic Management:**
   - Implement circuit breakers: Update destination rules
   - Add retry policies: Modify virtual service configuration
   - Enable rate limiting: Apply rate limiting policies

3. **Long-term Fixes:**
   - Optimize resource allocation
   - Implement caching strategies
   - Review application architecture
