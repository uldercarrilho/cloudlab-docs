# Go Coding Standards Discussion Prompt

## Overview
I'm working on a distributed systems project in Go and need to establish comprehensive coding standards. I want to understand the current landscape of Go coding practices, community consensus, and industry best practices to guide AI agents in developing high-quality, maintainable code.

## What I Need to Know

### 1. Community Standards & Official Guidelines
- **Go Official Style Guide**: What are the official Go formatting and style recommendations?
- **gofmt/gofmt**: How strictly should we follow automatic formatting?
- **Effective Go**: What are the key principles from the official Effective Go document?
- **Community Conventions**: What patterns have emerged as de facto standards in the Go community?

### 2. Big Company Standards & Enterprise Practices
- **Google**: What coding standards does Google use for their Go projects?
- **Uber**: How does Uber structure their Go codebases?
- **Kubernetes**: What patterns does the Kubernetes project follow?
- **Other Tech Giants**: What can we learn from companies like Netflix, Amazon, or Microsoft?
- **Enterprise Considerations**: How do large organizations handle Go code organization and standards?

### 3. Author Recommendations & Expert Opinions
- **Books & Publications**: What do authors like Rob Pike, Dave Cheney, or Bill Kennedy recommend?
- **Go Time Podcast**: What insights have emerged from the Go community discussions?
- **Conference Talks**: What patterns are being promoted at GopherCon and other Go events?
- **Blog Posts**: What are the most influential Go coding standard articles?

### 4. Code Organization & Architecture
- **Package Design**: How should we structure packages? What are the best practices for package naming and organization?
- **Clean Architecture**: How can we apply clean architecture principles in Go?
- **Hexagonal Architecture**: Is this pattern suitable for Go microservices?
- **Domain-Driven Design**: How can DDD be implemented effectively in Go?
- **Layered Architecture**: What's the recommended approach for organizing code layers?

### 5. Specific Go Patterns & Practices
- **Error Handling**: What are the best practices for error handling and propagation?
- **Interface Design**: How should we design interfaces? When to use them vs concrete types?
- **Dependency Injection**: What are the recommended approaches for DI in Go?
- **Testing**: What testing patterns and tools should we adopt?
- **Concurrency**: How should we handle goroutines, channels, and concurrency patterns?
- **Configuration Management**: What are the best practices for configuration handling?

### 6. Project-Specific Considerations
- **Microservices**: How should Go code be organized for microservice architectures?
- **Distributed Systems**: What patterns are essential for distributed Go applications?
- **API Design**: How should we structure REST/gRPC APIs in Go?
- **Database Access**: What patterns should we follow for database interactions?
- **Logging & Monitoring**: How should we implement observability in Go?

### 7. Tooling & Automation
- **Linters**: Which linters should we use (golangci-lint, staticcheck, etc.)?
- **Code Generation**: When and how should we use code generation tools?
- **CI/CD Integration**: How should coding standards be enforced in CI/CD pipelines?
- **IDE Configuration**: What editor/IDE settings should we standardize?

### 8. Quality & Maintainability
- **Code Review Guidelines**: What should reviewers focus on in Go code?
- **Documentation Standards**: How should we document Go code and APIs?
- **Performance Considerations**: What performance patterns should we follow?
- **Security Best Practices**: What security considerations are specific to Go?

### 9. Trade-offs & Decision Making
- **Simplicity vs. Flexibility**: How do we balance Go's philosophy of simplicity with enterprise needs?
- **Performance vs. Readability**: When should we prioritize performance over code clarity?
- **Standard Library vs. Third-party**: What's the guidance on using external dependencies?
- **Versioning Strategy**: How should we handle Go module versioning and dependency management?

### 10. Implementation Strategy
- **Gradual Adoption**: How should we implement these standards in an existing project?
- **Team Training**: What resources should we provide to the team?
- **Enforcement**: How strict should we be about following these standards?
- **Evolution**: How should these standards evolve as the project grows?

## Expected Output
Please provide:
1. **Specific recommendations** with examples where possible
2. **Prioritized list** of most important standards to implement first
3. **Controversial areas** where there's disagreement in the community
4. **Resources and references** for further learning
5. **Implementation roadmap** for adopting these standards

## Context
This is for a distributed e-commerce platform where code quality, maintainability, and team collaboration are critical. We want to establish standards that will scale with the project and team size while maintaining Go's core principles of simplicity and clarity.

---

*This prompt template can be used to guide AI agents in understanding and implementing proper Go coding standards for your distributed systems project.*
