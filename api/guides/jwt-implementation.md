---
title: "JWT Implementation Guide"
description: "Comprehensive guide for implementing JWT with security best practices"
category: "api"
subcategory: "security"
tags: ["authentication", "jwt", "security"]
ai_consumption_optimized: true
---

# JWT Implementation Guide

## Overview
This document provides comprehensive guidance for implementing JSON Web Tokens (JWT) in the distributed e-commerce platform, following the security architecture decisions outlined in ADR-009.

## Implementation Details

### 1. JWT Structure
```go
type Claims struct {
    UserID    string                 `json:"user_id"`
    Email     string                 `json:"email"`
    Role      string                 `json:"role"`
    TenantID  string                 `json:"tenant_id,omitempty"`
    IssuedAt  int64                  `json:"iat"`
    ExpiresAt int64                  `json:"exp"`
    NotBefore int64                  `json:"nbf"`
    Issuer    string                 `json:"iss"`
    Audience  string                 `json:"aud"`
    jti       string                 `json:"jti"`
    StandardClaims jwt.StandardClaims
}
```

### 2. Token Generation
```go
func GenerateJWT(user *User, secretKey []byte) (string, error) {
    claims := &Claims{
        UserID:    user.ID,
        Email:     user.Email,
        Role:      user.Role,
        TenantID:  user.TenantID,
        IssuedAt:  time.Now().Unix(),
        ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
        NotBefore: time.Now().Unix(),
        Issuer:    "ecommerce-platform",
        Audience:  "ecommerce-users",
        jti:       uuid.New().String(),
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}
```

### 3. Token Validation
```go
func ValidateJWT(tokenString string, secretKey []byte) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return secretKey, nil
    })
    
    if err != nil {
        return nil, err
    }
    
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    
    return nil, fmt.Errorf("invalid token")
}
```

### 4. Refresh Token Implementation
```go
func GenerateRefreshToken(user *User, secretKey []byte) (string, error) {
    claims := &Claims{
        UserID:    user.ID,
        Email:     user.Email,
        Role:      user.Role,
        TenantID:  user.TenantID,
        IssuedAt:  time.Now().Unix(),
        ExpiresAt: time.Now().Add(30 * 24 * time.Hour).Unix(), // 30 days
        NotBefore: time.Now().Unix(),
        Issuer:    "cloudlab-platform",
        Audience:  "cloudlab-refresh",
        jti:       uuid.New().String(),
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}
```

### 5. Security Best Practices
- Use strong secret keys (minimum 256 bits)
- Implement token rotation
- Store refresh tokens securely
- Validate token expiration
- Implement token blacklisting for logout
- Use HTTPS for all token transmission

### 6. Integration with ADR-009
This implementation follows the security architecture decisions:
- OAuth 2.0 + OpenID Connect compliance
- Multi-tenant security isolation
- Role-based access control (RBAC)
- PCI DSS and GDPR compliance
- Secure session management

## Testing
```go
func TestJWTGeneration(t *testing.T) {
    user := &User{
        ID:       "user123",
        Email:    "test@example.com",
        Role:     "customer",
        TenantID: "tenant1",
    }
    
    secretKey := []byte("your-secret-key")
    token, err := GenerateJWT(user, secretKey)
    
    assert.NoError(t, err)
    assert.NotEmpty(t, token)
    
    claims, err := ValidateJWT(token, secretKey)
    assert.NoError(t, err)
    assert.Equal(t, user.ID, claims.UserID)
    assert.Equal(t, user.Email, claims.Email)
}
```

## References
- [ADR-009: Security & Authentication Architecture](../../architecture/decisions/ADR-009-security-authentication.md)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [OAuth 2.0 Specification](https://oauth.net/2/)
