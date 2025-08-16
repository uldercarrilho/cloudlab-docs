---
title: "Technology Stack"
description: "Selected technologies, versions, and rationale for the Cloud Lab distributed e-commerce platform"
category: "architecture"
subcategory: "overview"
tags: ["kubernetes", "istio", "aws", "terraform", "postgresql", "redis", "clickhouse", "kafka", "github-actions", "argocd", "launchdarkly", "cloudflare", "openapi", "prometheus", "grafana", "jaeger"]
related_documents: [
  "../adrs/ADR-003-container-orchestration-service-mesh.md",
  "../adrs/ADR-004-data-storage-consistency-patterns.md",
  "../adrs/ADR-005-message-queue-event-streaming.md",
  "../adrs/ADR-007-cloud-infrastructure.md",
  "../adrs/ADR-010-cicd-deployment.md",
  "../adrs/ADR-011-performance-caching.md",
  "../adrs/ADR-016-documentation-knowledge-management.md"
]
last_updated: "2025-08-16"
author: "AI Agent"
review_status: "reviewed"
ai_consumption_optimized: true
---

# Technology Stack

## Summary
This document lists the selected technologies, their roles, and version targets for the Cloud Lab distributed e-commerce platform. Choices are governed by ADRs and the ADR-first approach.

## Core Technology Choices
- **Cloud Provider**: AWS (multi-region) — see `ADR-007`
- **Infrastructure as Code**: Terraform — see `ADR-007`, `ADR-010`
- **Container Orchestration**: Kubernetes (managed: EKS/GKE viable) — see `ADR-003`
- **Service Mesh**: Istio — see `ADR-003`
- **CI/CD Orchestration**: GitHub Actions — see `ADR-010`
- **GitOps**: ArgoCD — see `ADR-010`
- **Feature Flags**: LaunchDarkly — see `ADR-010`
- **API Documentation**: OpenAPI/Swagger + Swagger UI — see `ADR-016`
- **Primary Database (OLTP)**: PostgreSQL — see `ADR-004`
- **Caching**: Redis (Redis Cluster) — see `ADR-011`
- **Analytics (OLAP)**: ClickHouse — see `ADR-004`
- **Message Queue & Event Streaming**: Apache Kafka (MSK in AWS) — see `ADR-005`
- **CDN & Edge**: Cloudflare — see `ADR-011`
- **Observability**: Prometheus, Grafana, Jaeger — see `ADR-003`, `ADR-008`

## Version Targets & Compatibility
These reflect ADR guidance and may evolve. Use managed offerings where appropriate.

- **Kubernetes**: current stable in managed cluster (align with Istio compatibility)
- **Istio**: current LTS compatible with cluster version
- **Terraform**: latest stable
- **PostgreSQL**: 15+ (logical replication) — `ADR-004`
- **PgBouncer**: 1.18+ — `ADR-004`
- **Redis**: 7+ (Redis Cluster) — `ADR-011`
- **ClickHouse**: 23+ (with ZooKeeper 3.8+) — `ADR-004`
- **Kafka**: Managed MSK latest compatible (RF=3, partitions per throughput) — `ADR-005`
- **Prometheus/Grafana/Jaeger**: latest stable compatible with Istio — `ADR-003`
- **OpenAPI**: 3.x — `ADR-016`

## Rationale (high level)
- Prioritize industry-standard, well-documented, and AI-friendly technologies.
- Favor managed services to reduce operational overhead where it does not reduce learning value.
- Align consistency and performance goals via a polyglot persistence strategy (OLTP + Cache + OLAP).

## Cross-ADR Links
- Container & Mesh: `../adrs/ADR-003-container-orchestration-service-mesh.md`
- Data & Consistency: `../adrs/ADR-004-data-storage-consistency-patterns.md`
- Messaging & Streaming: `../adrs/ADR-005-message-queue-event-streaming.md`
- Cloud Infrastructure: `../adrs/ADR-007-cloud-infrastructure.md`
- CI/CD & GitOps: `../adrs/ADR-010-cicd-deployment.md`
- Performance & Caching: `../adrs/ADR-011-performance-caching.md`
- Documentation Strategy: `../adrs/ADR-016-documentation-knowledge-management.md`

## Notes for AI Agents
- Keep this file synchronized with ADR updates; propose ADR edits before changing stack.
- When selecting versions, verify mesh–cluster compatibility first, then observability stack.
- Use OpenAPI descriptions rich enough for AI consumption per `ADR-016`.

## Change Process
1. Propose changes via new or updated ADRs.
2. Update this document after ADR approval.
3. Validate compatibility in a staging environment and record outcomes in runbooks.


