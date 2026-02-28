# Security Audit Report: Travel Sri Lanka Now

**Date:** 2026-02-26
**Application:** Travel Sri Lanka Now (Full Stack)
**Stack:** Angular 9 + Spring Boot 4 + PostgreSQL 15
**Auditor:** Claude Code Security Review

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Risk Rating Scale](#risk-rating-scale)
- [Critical Vulnerabilities](#critical-vulnerabilities)
- [High Severity Issues](#high-severity-issues)
- [Medium Severity Issues](#medium-severity-issues)
- [Low Severity Issues](#low-severity-issues)
- [What's Done Well](#whats-done-well)
- [Recommended Fix Priority](#recommended-fix-priority)
- [Detailed Remediation Guide](#detailed-remediation-guide)

---

## Executive Summary

| Severity | Count | Resolved |
|----------|-------|----------|
| Critical | 4 | 4 RESOLVED |
| High | 6 | 0 |
| Medium | 7 | 0 |
| Low | 4 | 0 |
| **Total Issues** | **21** | **4 RESOLVED** |

**Overall Risk Level: ~~HIGH~~ MEDIUM** (after critical fixes applied on 2026-02-26)

The application has a solid architectural foundation (Spring Security, JWT, BCrypt, stateless sessions). The original audit found critical configuration mistakes that would allow even an unskilled attacker to compromise the admin panel. **All 4 critical vulnerabilities have been resolved** - hardcoded credentials removed, secrets moved to environment variables, JWT secret replaced with a cryptographically random key, and rate limiting added to authentication endpoints.

---

## Risk Rating Scale

| Rating | Description |
|--------|-------------|
| **CRITICAL** | Immediate exploitation possible. Attacker can gain full admin access with minimal effort. Fix before any deployment. |
| **HIGH** | Significant security weakness. Exploitable with basic tools. Fix before production. |
| **MEDIUM** | Security concern that increases attack surface. Should be fixed in near-term. |
| **LOW** | Minor issue or best practice violation. Fix when convenient. |

---

## Critical Vulnerabilities

> **ALL 4 CRITICAL VULNERABILITIES HAVE BEEN RESOLVED (2026-02-26)**

### CRIT-01: Hardcoded Admin Credentials in Source Code - RESOLVED

**Status:** RESOLVED
**File:** `traveSriLankaNowBE/src/main/java/com/travesrilankanow/travesrilankanowbe/config/DataInitializer.java` (Lines 43-49)

**Description:**
The admin username and password are hardcoded directly in the Java source code:

```java
.username("Sachintha")
.password(passwordEncoder.encode("Sanju@123"))
```

**Impact:**
- Anyone with access to the repository (GitHub, team members, leaked code) instantly knows the admin credentials
- The password `Sanju@123` follows a common pattern (Name + special + numbers) and would appear in targeted wordlists
- This runs on **every application startup**, meaning the password cannot be changed permanently through the UI - it would be reset on next restart

**Attack Scenario:**
```bash
curl -X POST http://your-domain/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Sachintha","password":"Sanju@123"}'
```

**Remediation:**
```java
// Read from environment variables instead
@Value("${admin.default.username}")
private String adminUsername;

@Value("${admin.default.password}")
private String adminPassword;

private void initializeAdminUser() {
    if (!userRepository.existsByUsername(adminUsername)) {
        User adminUser = User.builder()
                .username(adminUsername)
                .password(passwordEncoder.encode(adminPassword))
                .email("admin@travelsrilankanow.com")
                .fullName("Admin")
                .role(User.Role.ADMIN)
                .build();
        userRepository.save(adminUser);
    }
}
```

```properties
# application.properties - use environment variable overrides
admin.default.username=${ADMIN_USERNAME:admin}
admin.default.password=${ADMIN_PASSWORD:changeme}
```

---

### CRIT-02: Weak and Guessable JWT Secret - RESOLVED

**Status:** RESOLVED
**File:** `traveSriLankaNowBE/src/main/resources/application.properties` (Line 34)

**Description:**
The JWT signing secret is a Base64-encoded human-readable string:

```properties
jwt.secret=dGhpc2lzYXZlcnlzZWN1cmVzZWNyZXRrZXlmb3J0cmF2ZWxzcmlsYW5rYW5vd2FwcGxpY2F0aW9uMjAyNA==
```

This decodes to: `thisisaverysecuresecretkeyfortravelsrilankanowapplication2024`

**Impact:**
- If an attacker discovers or guesses this secret, they can **forge valid JWT tokens** for any user, including admin
- The secret follows a predictable pattern that can be guessed through social engineering or common secret patterns
- With a forged token, the attacker has **full admin access** to all 73 admin endpoints

**Attack Scenario:**
```javascript
// Attacker forges an admin JWT token
const jwt = require('jsonwebtoken');
const secret = Buffer.from(
  'dGhpc2lzYXZlcnlzZWN1cmVzZWNyZXRrZXlmb3J0cmF2ZWxzcmlsYW5rYW5vd2FwcGxpY2F0aW9uMjAyNA==',
  'base64'
);
const token = jwt.sign({ sub: 'Sachintha' }, secret, {
  algorithm: 'HS256',
  expiresIn: '24h'
});
// Token is now valid for all admin endpoints
```

**Remediation:**
Generate a cryptographically random 256-bit secret:

```bash
# Generate a secure random secret
openssl rand -base64 32
```

```properties
# application.properties - reference environment variable
jwt.secret=${JWT_SECRET}
```

```bash
# .env file (never commit this)
JWT_SECRET=<output-from-openssl-command>
```

---

### CRIT-03: Secrets Hardcoded in application.properties - RESOLVED

**Status:** RESOLVED
**File:** `traveSriLankaNowBE/src/main/resources/application.properties` (Lines 34, 41-42)

**Description:**
Multiple secrets are hardcoded in the properties file which is committed to version control:

```properties
jwt.secret=dGhpc2lzYXZlcnlzZWN1cmVzZWNyZXRrZXlmb3J0cmF2ZWxzcmlsYW5rYW5vd2FwcGxpY2F0aW9uMjAyNA==
cloudinary.cloud-name=dqsmid3tg
cloudinary.api-key=384683498784571
cloudinary.api-secret=wGfR4-xbGHnLoY4ybUaVYs4RFII
```

Also exposed in `.env` file (though `.env` is in `.gitignore`):
```
CLOUDINARY_API_KEY=384683498784571
CLOUDINARY_API_SECRET=wGfR4-xbGHnLoY4ybUaVYs4RFII
```

And again in `docker-compose.yml` as default fallback values (Lines 37-41).

**Impact:**
- Cloudinary credentials exposed: attacker can **upload, modify, or delete all images** on your Cloudinary account
- Cloudinary account could be used for hosting malicious content at your expense
- JWT secret exposure covered in CRIT-02

**Remediation:**
Replace all hardcoded values with environment variable references:

```properties
# application.properties
jwt.secret=${JWT_SECRET}
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}
```

```yaml
# docker-compose.yml - remove default values
JWT_SECRET: ${JWT_SECRET}
CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
```

> After fixing, rotate ALL exposed credentials (generate new Cloudinary API keys, new JWT secret).

---

### CRIT-04: No Rate Limiting on Authentication Endpoints - RESOLVED

**Status:** RESOLVED
**File:** `traveSriLankaNowBE/src/main/java/com/travesrilankanow/travesrilankanowbe/controller/admin/AdminAuthController.java`

**Description:**
The login endpoint `/api/admin/auth/login` has no rate limiting, account lockout, or brute-force protection. An attacker can make unlimited login attempts.

**Impact:**
- Automated brute-force attacks can try thousands of passwords per minute
- Combined with the weak password (`Sanju@123`), the account would be compromised quickly
- No logging of failed attempts means attacks go undetected

**Attack Scenario:**
```bash
# Simple brute-force script - tries passwords from a wordlist
while read password; do
  response=$(curl -s -X POST http://target/api/admin/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"Sachintha\",\"password\":\"$password\"}")
  if echo "$response" | grep -q '"success":true'; then
    echo "FOUND: $password"
    break
  fi
done < wordlist.txt
```

**Remediation:**
Add rate limiting using Bucket4j or a custom filter:

```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        if (request.getRequestURI().contains("/admin/auth/login")) {
            String ip = request.getRemoteAddr();
            Bucket bucket = buckets.computeIfAbsent(ip, k -> createBucket());

            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(429);
                response.getWriter().write("{\"message\":\"Too many attempts. Try again later.\"}");
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }
}
```

Also add account lockout after N failed attempts in `AuthenticationService`.

---

## High Severity Issues

### HIGH-01: /api/admin/auth/verify Always Returns True

**File:** `traveSriLankaNowBE/src/main/java/com/travesrilankanow/travesrilankanowbe/controller/admin/AdminAuthController.java` (Lines 63-68)

**Description:**
The verify endpoint is under `/api/admin/auth/**` which is `permitAll` in the security config. The code assumes "if this endpoint is reached, the token is valid" but since the endpoint is public, it always returns `{"valid": true}` regardless of authentication status.

```java
@GetMapping("/verify")
public ResponseEntity<Map<String, Object>> verifyToken() {
    // If this endpoint is reached, the token is valid (JWT filter validated it)
    return ResponseEntity.ok(Map.of("valid", true));
}
```

**Impact:**
- Any client calling this endpoint receives `{"valid": true}` even without any token
- Frontend auth guard or any verification logic relying on this endpoint is completely bypassed
- Could lead to false sense of security in the application

**Remediation:**
Check the SecurityContext explicitly:

```java
@GetMapping("/verify")
public ResponseEntity<Map<String, Object>> verifyToken() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.isAuthenticated()
            && !(auth instanceof AnonymousAuthenticationToken)) {
        return ResponseEntity.ok(Map.of("valid", true, "username", auth.getName()));
    }
    return ResponseEntity.status(401).body(Map.of("valid", false));
}
```

Or move the endpoint outside the `permitAll` path.

---

### HIGH-02: No JWT Token Revocation / Blacklisting

**File:** `traveSriLankaNowBE/src/main/java/com/travesrilankanow/travesrilankanowbe/controller/admin/AdminAuthController.java` (Lines 53-61)

**Description:**
Logout is purely client-side. The server does nothing:

```java
@PostMapping("/logout")
public ResponseEntity<Map<String, Object>> logout() {
    // For stateless JWT, logout is handled client-side by removing the token
    return ResponseEntity.ok(Map.of("success", true, "message", "Logout successful"));
}
```

**Impact:**
- If a JWT token is stolen (via XSS, network interception, or session hijacking), it remains valid for the full 24-hour expiration period
- "Logging out" does not invalidate the token server-side
- An attacker with a captured token has a 24-hour window of unrestricted admin access

**Remediation:**
Implement a token blacklist using an in-memory store or Redis:

```java
@Service
public class TokenBlacklistService {
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public void blacklist(String token) {
        blacklistedTokens.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
}
```

Check the blacklist in `JwtAuthenticationFilter` before authenticating.

---

### HIGH-03: Mass Assignment via JPA Entities in Admin Controllers

**Files:**
- `traveSriLankaNowBE/.../controller/admin/AdminLocationController.java` (Line 25)
- `traveSriLankaNowBE/.../controller/admin/AdminEventController.java`
- `traveSriLankaNowBE/.../controller/admin/AdminPlaceController.java`
- `traveSriLankaNowBE/.../controller/admin/AdminGalleryController.java`

**Description:**
Admin controllers accept JPA entity objects directly as request bodies without DTOs or `@Valid` annotation:

```java
@PostMapping
public ResponseEntity<Location> createLocation(@RequestBody Location location) {
    Location created = locationService.createLocation(location);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}
```

**Impact:**
- Attacker can set internal fields: `id`, `createdAt`, `updatedAt`, or any other entity field
- No input validation is enforced (missing `@Valid`)
- Could potentially manipulate entity relationships or override auto-generated values

**Attack Scenario:**
```json
POST /api/admin/locations
{
  "id": 1,
  "name": "Hacked Location",
  "createdAt": "2020-01-01T00:00:00",
  "featured": true
}
```
This could overwrite existing location with ID 1.

**Remediation:**
Create DTOs with validation for all admin endpoints:

```java
public class CreateLocationDTO {
    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    @Size(max = 5000)
    private String description;

    @NotBlank
    private String category;
    // Only include fields that should be user-settable
}

@PostMapping
public ResponseEntity<Location> createLocation(@Valid @RequestBody CreateLocationDTO dto) {
    Location created = locationService.createLocation(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}
```

---

### HIGH-04: Booking Route Mismatch (Broken Access Control)

**Files:**
- `traveSriLankaNowBE/.../security/SecurityConfig.java` (Line 52)
- `traveSriLankaNowBE/.../controller/BookingController.java` (Line 22)

**Description:**
SecurityConfig permits public booking:
```java
.requestMatchers(HttpMethod.POST, "/api/bookings/**").permitAll()
```

But the actual booking endpoint is:
```java
@PostMapping("/events/book")  // Full path: /api/events/book
```

**Impact:**
- The `permitAll` rule on `POST /api/bookings/**` matches nothing (dead rule)
- The actual booking endpoint `POST /api/events/book` requires authentication (falls to `.anyRequest().authenticated()`)
- Public users **cannot submit bookings** - this is a functional bug that also reveals a security misconfiguration
- The GET `/api/events/**` permitAll only covers GET, not POST

**Remediation:**
Either fix the SecurityConfig or the controller path:

```java
// Option A: Fix SecurityConfig to match actual path
.requestMatchers(HttpMethod.POST, "/api/events/book").permitAll()

// Option B: Fix controller to match SecurityConfig
@PostMapping("/bookings")  // instead of "/events/book"
```

---

### HIGH-05: Error Messages Leak Internal Details

**File:** `traveSriLankaNowBE/src/main/java/com/travesrilankanow/travesrilankanowbe/exception/GlobalExceptionHandler.java` (Lines 65-73)

**Description:**
The global exception handler exposes raw exception messages:

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
    ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred: " + ex.getMessage(),  // LEAKS DETAILS
            LocalDateTime.now()
    );
    return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
}
```

**Impact:**
- SQL errors could reveal table names, column names, and query structure
- Stack traces could reveal internal class paths and library versions
- File system paths could be exposed
- This information helps attackers craft more targeted attacks

**Remediation:**
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
    log.error("Unexpected error", ex);  // Log full details server-side
    ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred. Please try again later.",  // Generic message
            LocalDateTime.now()
    );
    return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
}
```

---

### HIGH-06: No HTTPS / TLS Configuration

**File:** `travelSrilankaNow/nginx.conf` (Line 2)

**Description:**
Nginx only listens on HTTP port 80. No SSL/TLS is configured:

```nginx
server {
    listen 80;
    ...
}
```

**Impact:**
- JWT tokens are transmitted in plain text over the network
- Admin credentials during login are sent unencrypted
- Any attacker on the same network can intercept tokens using Wireshark or similar tools
- Man-in-the-middle attacks are trivial

**Remediation:**
Add SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ...
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

For production, use Let's Encrypt with certbot or a reverse proxy like Traefik/Caddy that handles SSL automatically.

---

## Medium Severity Issues

### MED-01: No Account Lockout After Failed Attempts

**File:** `traveSriLankaNowBE/.../service/AuthenticationService.java`

**Description:**
Failed login attempts are not tracked. There is no account lockout mechanism.

**Impact:**
Combined with CRIT-04 (no rate limiting), this allows unlimited brute-force attempts without any account protection.

**Remediation:**
Track failed attempts in the User entity and lock after 5 failures:

```java
// In User entity
private int failedLoginAttempts;
private LocalDateTime lockoutUntil;

// In AuthenticationService
if (user.getFailedLoginAttempts() >= 5) {
    if (user.getLockoutUntil().isAfter(LocalDateTime.now())) {
        throw new AccountLockedException("Account locked. Try again later.");
    }
    user.setFailedLoginAttempts(0); // Reset after lockout period
}
```

---

### MED-02: CSRF Protection Disabled Globally

**File:** `traveSriLankaNowBE/.../security/SecurityConfig.java` (Line 36)

```java
.csrf(AbstractHttpConfigurer::disable)
```

**Description:**
CSRF protection is completely disabled. For a stateless JWT-based API this is generally acceptable since JWT tokens in the Authorization header are not automatically sent by browsers (unlike cookies).

**Impact:**
Low risk for this specific architecture, but if tokens were ever stored in cookies, this would become critical.

**Note:** Acceptable for current architecture. Document the decision.

---

### MED-03: CORS Hardcoded to localhost

**File:** `traveSriLankaNowBE/.../security/SecurityConfig.java` (Line 71)

```java
configuration.setAllowedOrigins(List.of("http://localhost:4200"));
```

**Description:**
CORS is only configured for localhost. In production, this needs to be updated.

**Impact:**
- If changed to `*` (wildcard) for production, it opens the API to cross-origin requests from any website
- If not updated at all, the frontend won't work when deployed to a real domain

**Remediation:**
Use environment variable for allowed origins:

```java
@Value("${cors.allowed-origins}")
private String allowedOrigins;

configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
```

```properties
cors.allowed-origins=${CORS_ORIGINS:http://localhost:4200}
```

---

### MED-04: Hibernate ddl-auto Set to Update in Production

**File:** `traveSriLankaNowBE/src/main/resources/application.properties` (Line 22)

```properties
spring.jpa.hibernate.ddl-auto=update
```

**Description:**
Hibernate will automatically modify the database schema on startup. In production, this can lead to:
- Unintended schema changes
- Data loss if columns are renamed
- Performance issues during startup

**Remediation:**
Use `validate` or `none` in production and manage schema with Flyway or Liquibase:

```properties
spring.jpa.hibernate.ddl-auto=${DDL_AUTO:validate}
```

---

### MED-05: Content-Type Only File Validation

**File:** `traveSriLankaNowBE/.../service/CloudinaryService.java` (Lines 62-78)

**Description:**
File upload validation only checks the `Content-Type` header:

```java
String contentType = file.getContentType();
if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
    throw new IllegalArgumentException("Invalid file type...");
}
```

**Impact:**
- Content-Type headers can be spoofed by the client
- A malicious file with a fake Content-Type could pass validation
- Mitigated partially by Cloudinary's server-side validation (`resource_type: "image"`)

**Remediation:**
Also validate file magic bytes:

```java
private boolean isValidImageMagicBytes(byte[] bytes) {
    if (bytes.length < 4) return false;
    // JPEG: FF D8 FF
    if (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) return true;
    // PNG: 89 50 4E 47
    if (bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) return true;
    // GIF: 47 49 46 38
    if (bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x38) return true;
    // WebP: 52 49 46 46 ... 57 45 42 50
    if (bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46) return true;
    return false;
}
```

---

### MED-06: Frontend Auth Guard is Client-Side Only

**File:** `travelSrilankaNow/src/app/admin/guards/admin-auth.guard.ts` (Line 18)

```typescript
if (this.authService.isLoggedIn()) {
    return true;
}
```

**Description:**
The guard only checks if a token string exists in localStorage. It does not validate the token.

**Impact:**
- Anyone can set `localStorage.setItem('adminAccessToken', 'fake')` in the browser console
- This allows access to view the admin UI layout and routes
- API calls would still fail (server validates JWT), so no actual data compromise
- But admin UI structure, component names, and endpoint patterns are exposed

**Remediation:**
Validate token against the server before allowing access:

```typescript
canActivate(): Observable<boolean | UrlTree> {
    if (!this.authService.hasToken()) {
        return of(this.router.createUrlTree(['/admin/login']));
    }
    return this.authService.verifyToken().pipe(
        map(response => response.valid ? true : this.router.createUrlTree(['/admin/login'])),
        catchError(() => of(this.router.createUrlTree(['/admin/login'])))
    );
}
```

> Note: This requires fixing HIGH-01 first (verify endpoint always returns true).

---

### MED-07: No Password Strength Policy

**File:** `traveSriLankaNowBE/.../service/AuthenticationService.java` (Lines 84-98)

**Description:**
The `createAdminUser` method accepts any password without strength validation:

```java
public User createAdminUser(String username, String password, String email, String fullName) {
    // No password strength check
    User user = User.builder()
            .password(passwordEncoder.encode(password))
            ...
}
```

**Remediation:**
Add password validation:

```java
private void validatePassword(String password) {
    if (password.length() < 12) throw new IllegalArgumentException("Password must be at least 12 characters");
    if (!password.matches(".*[A-Z].*")) throw new IllegalArgumentException("Password must contain uppercase");
    if (!password.matches(".*[a-z].*")) throw new IllegalArgumentException("Password must contain lowercase");
    if (!password.matches(".*\\d.*")) throw new IllegalArgumentException("Password must contain a digit");
    if (!password.matches(".*[!@#$%^&*].*")) throw new IllegalArgumentException("Password must contain a special character");
}
```

---

## Low Severity Issues

### LOW-01: DataInitializer Deletes Existing Admin on Every Startup

**File:** `traveSriLankaNowBE/.../config/DataInitializer.java` (Line 41)

```java
userRepository.findByUsername("admin").ifPresent(userRepository::delete);
```

**Description:**
Every startup deletes any user with username "admin". If someone creates an admin user named "admin", it will be silently removed.

---

### LOW-02: Database Password Defaults to "postgres"

**File:** `docker-compose.yml` (Line 11)

```yaml
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
```

**Description:**
If `POSTGRES_PASSWORD` is not set, it defaults to `postgres`. While the database is not exposed externally in the Docker network, this is still a weak default.

---

### LOW-03: Missing Security Headers

**File:** `travelSrilankaNow/nginx.conf`

**Description:**
Some recommended security headers are missing:

```nginx
# Present
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block

# Missing
Content-Security-Policy
Strict-Transport-Security (HSTS)
Referrer-Policy
Permissions-Policy
```

**Remediation:**
```nginx
add_header Content-Security-Policy "default-src 'self'; img-src 'self' https://res.cloudinary.com; script-src 'self'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

---

### LOW-04: No Request Size Limit in Nginx

**File:** `travelSrilankaNow/nginx.conf`

**Description:**
No `client_max_body_size` is configured. Nginx defaults to 1MB, which may conflict with the Spring Boot 10MB file upload limit.

**Remediation:**
```nginx
client_max_body_size 10M;
```

---

## What's Done Well

| Area | Details |
|------|---------|
| **Password Hashing** | BCrypt via `BCryptPasswordEncoder` - industry standard |
| **Stateless Sessions** | `SessionCreationPolicy.STATELESS` - no session fixation risk |
| **JWT Implementation** | Proper HS256 signing with JJWT library, expiry checks, signature verification |
| **Filter Chain** | `OncePerRequestFilter` with proper Bearer token extraction |
| **Authorization Layers** | Role-based access (`hasRole("ADMIN")`) with method-level security enabled |
| **Input Validation** | DTOs use Jakarta validation annotations (`@NotBlank`, `@Email`, `@Min`) |
| **File Upload Validation** | Content-type whitelist + file size limit (10MB) |
| **Error Handling** | `GlobalExceptionHandler` with structured error responses |
| **CORS Configuration** | Specific origin (not wildcard), explicit methods and headers |
| **Docker Health Checks** | All services have health checks configured |
| **Token Refresh** | Proper access + refresh token flow with interceptor retry |
| **Nginx Security Headers** | X-Frame-Options, X-Content-Type-Options, X-XSS-Protection present |
| **Nginx Proxy** | Backend not directly exposed; proxied through Nginx |
| **Environment Variables** | `.env` is in `.gitignore` |

---

## Recommended Fix Priority

### Phase 1: Before Any Deployment (Critical)

| # | Issue | Effort | Status |
|---|-------|--------|--------|
| 1 | CRIT-03: Move all secrets to environment variables | 30 min | DONE |
| 2 | CRIT-02: Generate random JWT secret | 10 min | DONE |
| 3 | CRIT-01: Remove hardcoded credentials from DataInitializer | 30 min | DONE |
| 4 | CRIT-04: Add rate limiting on login endpoint | 1-2 hrs | DONE |
| 5 | HIGH-05: Remove error message leakage | 15 min | - |
| 6 | HIGH-04: Fix booking route mismatch | 15 min | - |

### Phase 2: Before Production (High)

| # | Issue | Effort |
|---|-------|--------|
| 7 | HIGH-06: Configure HTTPS/TLS | 1-2 hrs |
| 8 | HIGH-01: Fix verify endpoint logic | 30 min |
| 9 | HIGH-03: Replace entity parameters with DTOs | 2-3 hrs |
| 10 | HIGH-02: Add token blacklist for logout | 1-2 hrs |
| 11 | MED-01: Add account lockout | 1-2 hrs |
| 12 | MED-03: Make CORS origins configurable | 30 min |

### Phase 3: Hardening (Medium/Low)

| # | Issue | Effort |
|---|-------|--------|
| 13 | MED-04: Switch ddl-auto to validate | 30 min |
| 14 | MED-05: Add magic bytes validation | 1 hr |
| 15 | MED-06: Fix frontend auth guard | 30 min |
| 16 | MED-07: Add password policy | 30 min |
| 17 | LOW-01: Fix DataInitializer delete logic | 15 min |
| 18 | LOW-02: Use strong DB password | 10 min |
| 19 | LOW-03: Add missing security headers | 30 min |
| 20 | LOW-04: Add nginx request size limit | 5 min |

---

## Detailed Remediation Guide

### Credential Rotation Checklist

After fixing secrets exposure, rotate the following:

- [ ] Generate new JWT secret (256-bit random)
- [ ] Generate new Cloudinary API key and secret (Cloudinary Dashboard > Settings > Security)
- [ ] Change admin password to a strong one (16+ characters)
- [ ] Change PostgreSQL password
- [ ] Revoke old Cloudinary credentials
- [ ] Check git history for exposed secrets (consider `git filter-branch` or BFG Repo-Cleaner)

### Environment Variables Template

```env
# .env (NEVER commit this file)

# Database
POSTGRES_PASSWORD=<strong-random-password>

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=<random-256-bit-base64-string>

# Admin User
ADMIN_USERNAME=<admin-username>
ADMIN_PASSWORD=<strong-admin-password>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# CORS
CORS_ORIGINS=https://your-domain.com

# Hibernate
DDL_AUTO=validate
```

---

*This report covers the application state as of 2026-02-26. Re-audit recommended after implementing fixes and before each production release.*
