# 📄 PRD + ADR Hybrid Template

## 1. Document Info
- **Document Name:**  
- **Version:**  
- **Date:**  
- **Author:**  
- **Status:** [Draft | In Review | Approved | Implemented]

---

## 2. Summary
> One sentence description of what this feature/module is and why it exists.

**Example:** Implement user authentication with email and password, ensuring security compliance for GDPR.

---

## 3. Problem & Context
> What problem are we solving? What's the current situation?

**Example:** Users currently can't securely access their accounts, and we need to comply with privacy regulations.

---

## 4. Requirements

### 4.1 Functional Requirements
- [ ] FR1: Users can register with email + password
- [ ] FR2: Passwords must meet complexity rules
- [ ] FR3: Email verification is required before login

### 4.2 Non-Functional Requirements
- [ ] NFR1: Response time < 500ms for login requests
- [ ] NFR2: All data must be encrypted at rest and in transit

---

## 5. Business Rules & Constraints
> Rules that must always be true, plus any limitations.

**Examples:**
- Passwords expire after 180 days
- Maximum 5 failed login attempts before account lock
- Must work with existing user database schema

---

## 6. Acceptance Criteria
> Specific, testable outcomes that define "done".

**Examples:**
- [ ] User with invalid password receives clear error message
- [ ] Verified email is required before first login
- [ ] Password reset flow works end-to-end

---

## 7. Architecture Decision Record

### Decision
> What did we choose and why?

**Example:** Use JWT tokens for authentication because they're stateless, widely supported, and fit our scaling requirements.

### Alternatives Considered
- Sessions with cookies (would require sticky sessions)
- OAuth (too complex for MVP)

### Consequences
- ✅ Easier horizontal scaling
- ❌ JWT revocation requires additional tracking logic

---

## 8. Implementation Notes
> Technical details, libraries, and approaches to use.

**Examples:**
- Use `bcrypt` for password hashing
- Store refresh tokens in Redis for performance
- Follow OWASP security guidelines

---

## 9. AI Collaboration Notes
> Specific guidance for AI assistant collaboration.

**Examples:**
- Focus on security best practices when implementing
- Consider edge cases like concurrent login attempts
- Ensure error messages are user-friendly but not security-revealing

---

## 10. References
> Links to standards, APIs, diagrams, or related docs.

---

**File naming convention:**
- For features: `prd-feature-name.md`
- For modules: `prd-module-name.md`
- For decisions: `prd-decision-short-title.md`
