# OAuth 2.0 Setup Guide

## Overview
This document provides comprehensive guidance for implementing OAuth 2.0 and OpenID Connect in the distributed e-commerce platform, following the security architecture decisions outlined in ADR-009.

## OAuth 2.0 Implementation

### 1. OAuth 2.0 Server Setup
```go
// OAuth 2.0 server configuration
type OAuth2Server struct {
    config     *oauth2.Config
    store      TokenStore
    userStore  UserStore
    validator  TokenValidator
}

type OAuth2Config struct {
    ClientID     string
    ClientSecret string
    RedirectURL  string
    Scopes       []string
    AuthURL      string
    TokenURL     string
    UserInfoURL  string
}
```

### 2. Authorization Code Flow
```go
// Authorization endpoint
func (s *OAuth2Server) HandleAuthorization(w http.ResponseWriter, r *http.Request) {
    // Validate client_id and redirect_uri
    clientID := r.URL.Query().Get("client_id")
    redirectURI := r.URL.Query().Get("redirect_uri")
    scope := r.URL.Query().Get("scope")
    state := r.URL.Query().Get("state")
    
    // Validate client
    client, err := s.validateClient(clientID, redirectURI)
    if err != nil {
        http.Error(w, "Invalid client", http.StatusBadRequest)
        return
    }
    
    // Generate authorization code
    authCode := generateAuthorizationCode(clientID, scope)
    
    // Store authorization code temporarily
    s.store.StoreAuthCode(authCode, clientID, scope)
    
    // Redirect to client with authorization code
    redirectURL := fmt.Sprintf("%s?code=%s&state=%s", redirectURI, authCode, state)
    http.Redirect(w, r, redirectURL, http.StatusFound)
}
```

### 3. Token Endpoint
```go
// Token endpoint for exchanging authorization code
func (s *OAuth2Server) HandleToken(w http.ResponseWriter, r *http.Request) {
    grantType := r.FormValue("grant_type")
    
    switch grantType {
    case "authorization_code":
        s.handleAuthorizationCodeGrant(w, r)
    case "refresh_token":
        s.handleRefreshTokenGrant(w, r)
    case "client_credentials":
        s.handleClientCredentialsGrant(w, r)
    default:
        http.Error(w, "Unsupported grant type", http.StatusBadRequest)
    }
}
```

### 4. Authorization Code Grant
```go
func (s *OAuth2Server) handleAuthorizationCodeGrant(w http.ResponseWriter, r *http.Request) {
    code := r.FormValue("code")
    redirectURI := r.FormValue("redirect_uri")
    clientID := r.FormValue("client_id")
    clientSecret := r.FormValue("client_secret")
    
    // Validate authorization code
    authCode, err := s.store.GetAuthCode(code)
    if err != nil || authCode == nil {
        http.Error(w, "Invalid authorization code", http.StatusBadRequest)
        return
    }
    
    // Validate client credentials
    if !s.validateClientCredentials(clientID, clientSecret) {
        http.Error(w, "Invalid client credentials", http.StatusUnauthorized)
        return
    }
    
    // Generate access token and refresh token
    accessToken := generateAccessToken(authCode.UserID, authCode.Scope)
    refreshToken := generateRefreshToken(authCode.UserID)
    
    // Store tokens
    s.store.StoreAccessToken(accessToken, authCode.UserID, authCode.Scope)
    s.store.StoreRefreshToken(refreshToken, authCode.UserID)
    
    // Return tokens
    response := map[string]interface{}{
        "access_token":  accessToken.Token,
        "token_type":    "Bearer",
        "expires_in":    accessToken.ExpiresIn,
        "refresh_token": refreshToken.Token,
        "scope":         authCode.Scope,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
```

## OpenID Connect Implementation

### 1. OpenID Connect Configuration
```go
// OpenID Connect discovery endpoint
func (s *OAuth2Server) HandleDiscovery(w http.ResponseWriter, r *http.Request) {
    discovery := map[string]interface{}{
        "issuer":                 s.config.Issuer,
        "authorization_endpoint": s.config.AuthURL,
        "token_endpoint":         s.config.TokenURL,
        "userinfo_endpoint":      s.config.UserInfoURL,
        "jwks_uri":               s.config.JWKSURI,
        "response_types_supported": []string{"code", "token", "id_token"},
        "subject_types_supported":  []string{"public"},
        "id_token_signing_alg_values_supported": []string{"RS256"},
        "scopes_supported": []string{"openid", "profile", "email", "address"},
        "claims_supported": []string{"sub", "iss", "name", "given_name", "family_name", "email"},
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(discovery)
}
```

### 2. User Info Endpoint
```go
// User info endpoint for OpenID Connect
func (s *OAuth2Server) HandleUserInfo(w http.ResponseWriter, r *http.Request) {
    // Extract access token from Authorization header
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "Authorization header required", http.StatusUnauthorized)
        return
    }
    
    token := strings.TrimPrefix(authHeader, "Bearer ")
    if token == authHeader {
        http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
        return
    }
    
    // Validate access token
    accessToken, err := s.store.GetAccessToken(token)
    if err != nil || accessToken == nil {
        http.Error(w, "Invalid access token", http.StatusUnauthorized)
        return
    }
    
    // Get user information
    user, err := s.userStore.GetUser(accessToken.UserID)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }
    
    // Return user claims
    claims := map[string]interface{}{
        "sub":         user.ID,
        "name":        user.FullName,
        "given_name":  user.FirstName,
        "family_name": user.LastName,
        "email":       user.Email,
        "email_verified": user.EmailVerified,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(claims)
}
```

### 3. ID Token Generation
```go
// Generate ID token for OpenID Connect
func (s *OAuth2Server) generateIDToken(user *User, clientID, scope string) (string, error) {
    now := time.Now().Unix()
    
    claims := jwt.MapClaims{
        "iss": s.config.Issuer,           // Issuer
        "sub": user.ID,                   // Subject (user ID)
        "aud": clientID,                  // Audience (client ID)
        "iat": now,                       // Issued at
        "exp": now + 3600,                // Expiration (1 hour)
        "auth_time": now,                 // Authentication time
        "nonce": generateNonce(),         // Nonce for CSRF protection
    }
    
    // Add optional claims based on scope
    if strings.Contains(scope, "profile") {
        claims["name"] = user.FullName
        claims["given_name"] = user.FirstName
        claims["family_name"] = user.LastName
    }
    
    if strings.Contains(scope, "email") {
        claims["email"] = user.Email
        claims["email_verified"] = user.EmailVerified
    }
    
    // Sign the token
    token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
    return token.SignedString(s.privateKey)
}
```

## Client Application Integration

### 1. OAuth 2.0 Client Configuration
```go
// OAuth 2.0 client configuration
type OAuth2Client struct {
    config     *oauth2.Config
    httpClient *http.Client
}

func NewOAuth2Client(clientID, clientSecret, redirectURL string) *OAuth2Client {
    config := &oauth2.Config{
        ClientID:     clientID,
        ClientSecret: clientSecret,
        RedirectURL:  redirectURL,
        Scopes:       []string{"openid", "profile", "email"},
        Endpoint: oauth2.Endpoint{
            AuthURL:  "https://auth.cloudlab.com/oauth/authorize",
            TokenURL: "https://auth.cloudlab.com/oauth/token",
        },
    }
    
    return &OAuth2Client{
        config:     config,
        httpClient: &http.Client{Timeout: 30 * time.Second},
    }
}
```

### 2. Authorization Flow
```go
// Start OAuth 2.0 authorization flow
func (c *OAuth2Client) StartAuthorization(w http.ResponseWriter, r *http.Request) {
    // Generate state parameter for CSRF protection
    state := generateState()
    
    // Store state in session
    session := getSession(r)
    session.Values["oauth_state"] = state
    session.Save(r, w)
    
    // Generate authorization URL
    authURL := c.config.AuthCodeURL(state, oauth2.AccessTypeOffline)
    
    // Redirect to authorization server
    http.Redirect(w, r, authURL, http.StatusFound)
}
```

### 3. Callback Handling
```go
// Handle OAuth 2.0 callback
func (c *OAuth2Client) HandleCallback(w http.ResponseWriter, r *http.Request) {
    // Get authorization code and state from query parameters
    code := r.URL.Query().Get("code")
    state := r.URL.Query().Get("state")
    
    // Validate state parameter
    session := getSession(r)
    storedState := session.Values["oauth_state"]
    if state != storedState {
        http.Error(w, "Invalid state parameter", http.StatusBadRequest)
        return
    }
    
    // Exchange authorization code for tokens
    token, err := c.config.Exchange(r.Context(), code)
    if err != nil {
        http.Error(w, "Failed to exchange token", http.StatusInternalServerError)
        return
    }
    
    // Store tokens securely
    session.Values["access_token"] = token.AccessToken
    session.Values["refresh_token"] = token.RefreshToken
    session.Values["token_expiry"] = token.Expiry
    session.Save(r, w)
    
    // Redirect to application
    http.Redirect(w, r, "/dashboard", http.StatusFound)
}
```

## Security Considerations

### 1. CSRF Protection
```go
// State parameter validation
func validateState(r *http.Request) bool {
    session := getSession(r)
    storedState := session.Values["oauth_state"]
    receivedState := r.URL.Query().Get("state")
    
    return storedState == receivedState
}
```

### 2. PKCE (Proof Key for Code Exchange)
```go
// PKCE implementation for public clients
type PKCEConfig struct {
    CodeChallenge       string
    CodeChallengeMethod string
    CodeVerifier        string
}

func generatePKCE() *PKCEConfig {
    // Generate random code verifier
    codeVerifier := generateRandomString(128)
    
    // Generate code challenge using SHA256
    hash := sha256.Sum256([]byte(codeVerifier))
    codeChallenge := base64.RawURLEncoding.EncodeToString(hash[:])
    
    return &PKCEConfig{
        CodeChallenge:       codeChallenge,
        CodeChallengeMethod: "S256",
        CodeVerifier:        codeVerifier,
    }
}
```

### 3. Token Security
```go
// Secure token storage
type SecureTokenStore struct {
    encryptionKey []byte
    store         TokenStore
}

func (s *SecureTokenStore) StoreToken(token *Token) error {
    // Encrypt token before storage
    encryptedToken, err := encryptToken(token, s.encryptionKey)
    if err != nil {
        return err
    }
    
    return s.store.StoreToken(encryptedToken)
}
```

## Testing

### 1. OAuth 2.0 Server Tests
```go
func TestOAuth2Server(t *testing.T) {
    // Test authorization endpoint
    // Test token endpoint
    // Test user info endpoint
    // Test token validation
    // Test scope handling
}
```

### 2. Client Integration Tests
```go
func TestOAuth2Client(t *testing.T) {
    // Test authorization flow
    // Test callback handling
    // Test token refresh
    // Test error handling
}
```

## References
- [ADR-009: Security & Authentication Architecture](../ADR-009-security-authentication.md)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [PKCE Specification](https://tools.ietf.org/html/rfc7636)
