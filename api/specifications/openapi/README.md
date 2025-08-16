# OpenAPI Specifications

This folder contains OpenAPI (Swagger) specifications for all service APIs.

## Purpose
Provides machine-readable API documentation that can be used for:
- Interactive API documentation
- Code generation (clients, servers)
- API testing and validation
- Contract-first development

## Organization
- Each service has its own OpenAPI specification file
- Follow semantic versioning for API versions
- Include comprehensive examples and descriptions

## Standards
- Use OpenAPI 3.0+ specification format
- Include authentication and error response schemas
- Validate specifications before committing

## Index

- `gateway.yaml` – API Gateway routes and shared components (if applicable)
- `auth.yaml` – Auth service API (authentication, token, users)
- `product.yaml` – Product catalog API (products, categories)
- `order.yaml` – Order service API (orders, items, workflows)
- `payment.yaml` – Payment service API (transactions, refunds)
- `inventory.yaml` – Inventory service API (stock, warehouses)
- `notification.yaml` – Notification service API (email, sms, push)

Note: Add files as they are created; keep names kebab-case and version in `info.version`.

## Validation

- Run a spec validator before commit:
  - `docker run --rm -v "$PWD":/work redocly/cli lint /work/<file>.yaml`
  - or use `spectral`/`openapi-cli` locally in CI.