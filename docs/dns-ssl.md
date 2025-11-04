# DNS & SSL Configuration

## Overview

This project uses a two-layer DNS and SSL approach:

- **Porkbun**: Domain registrar
- **Cloudflare**: DNS management and SSL/TLS termination

## Domain Registration (Porkbun)

### Domain Details

- **Domain:** abdiel-vega.dev
- **Registrar:** Porkbun
- **Registration Date:** October 30, 2025
- **Expiration:** October 30, 2026
- **Auto-Renew:** Enabled

### Why Porkbun?

- Affordable pricing ($8-12/year for .dev domains)
- Simple API for automation

### Porkbun Configuration

**Nameservers (Delegated to Cloudflare):**

```
cris.ns.cloudflare.com
jean.ns.cloudflare.com

salvador.ns.porkbun.com (backup)
maceio.ns.porkbun.com (backup)
fortaleza.ns.porkbun.com (backup)
curitiba.ns.porkbun.com (backup)
```

## DNS Management (Cloudflare)

### Why Cloudflare?

- **Free SSL/TLS certificates**
- Global CDN with 300+ data centers
- DDoS protection
- DNS-level security features
- Fast DNS propagation (3-5 hours for me)

### DNS Records Configuration

**Current DNS Records:**

```
Type    Name                Value                   Proxy Status    TTL
─────────────────────────────────────────────────────────────────────
A       abdiel-vega.dev     54.225.3.16            Proxied         Auto
CNAME   *                   pixie.porkbun.com      Proxied         Auto
CNAME   www                 pixie.porkbun.com      Proxied         Auto
NS      abdiel-vega.dev     cris.ns.cloudflare.com DNS only        Auto
NS      abdiel-vega.dev     jean.ns.cloudflare.com DNS only        Auto
```

### DNS Record Explanation

**A Record (Primary):**

```
abdiel-vega.dev → 54.225.3.16
```

- Points root domain to ECS task public IP
- Proxied through Cloudflare (orange cloud icon)
- Hides origin IP from public DNS queries
- Actual resolved IP seen by users: Cloudflare edge server IP

**CNAME Records:**

```
* → pixie.porkbun.com (Wildcard)
www → pixie.porkbun.com
```

- Catch-all for subdomains
- Not actively used but present from domain setup

**NS Records:**

```
abdiel-vega.dev → cris.ns.cloudflare.com
abdiel-vega.dev → jean.ns.cloudflare.com
```

- Authoritative nameservers for domain
- Handled by Cloudflare DNS infrastructure

### Proxy vs DNS-Only

**Proxied - Current Setup:**

- Traffic routes through Cloudflare network
- Origin IP hidden from public queries
- Enables CDN caching
- DDoS protection active
- SSL termination at Cloudflare edge

**DNS-Only:**

- Direct resolution to origin IP
- No CDN or security features
- Slightly lower latency
- Origin IP visible to anyone

**Why Proxied?**

- Hides AWS infrastructure details
- Free DDoS mitigation
- Automatic caching of static assets
- Cloudflare Web Application Firewall (WAF) available

## SSL/TLS Configuration

### Cloudflare SSL/TLS Mode: Flexible

```
[Browser] ←HTTPS→ [Cloudflare] ←HTTP→ [AWS ECS Task]
```

**Encryption Points:**

- **Browser → Cloudflare:** HTTPS (TLS 1.3)
- **Cloudflare → Origin:** HTTP (unencrypted)

### SSL/TLS Modes Comparison

|Mode|Browser-CF|CF-Origin|Use Case|
|---|---|---|---|
|Off|HTTP|HTTP|Never use|
|Flexible|HTTPS|HTTP|**Current** - No origin certificate needed|
|Full|HTTPS|HTTPS|Self-signed cert on origin OK|
|Full (Strict)|HTTPS|HTTPS|Valid cert on origin required|

### SSL Certificate Details

**Certificate Authority:** Cloudflare 
**Certificate Type:** Universal SSL
**Validation:** Automatic 
**Coverage:**

- abdiel-vega.dev
- *.abdiel-vega.dev (wildcard)

**TLS Version Support:**

- TLS 1.3 (recommended)
- TLS 1.2 (fallback)
- TLS 1.0/1.1 (disabled for security)

### Additional SSL Features Enabled

**Always Use HTTPS:**

```
Status: Enabled
```

- Automatically redirects HTTP → HTTPS
- Returns 301 permanent redirect
- Applied at Cloudflare edge

**Automatic HTTPS Rewrites:**

```
Status: Enabled
```

- Rewrites insecure HTTP URLs to HTTPS in HTML
- Prevents mixed content warnings

**Minimum TLS Version:**

```
Minimum: TLS 1.2
```

- Blocks outdated TLS 1.0 and 1.1
- Improves security posture

## Traffic Flow with DNS & SSL

### Step-by-Step Request Flow

```
1. User types: https://abdiel-vega.dev
                    ↓
2. Browser DNS query to recursive resolver
                    ↓
3. Resolver queries Cloudflare authoritative DNS
                    ↓
4. Cloudflare returns its own edge server IP (not 54.225.3.16)
                    ↓
5. Browser establishes TLS connection with Cloudflare edge
   - TLS handshake
   - Certificate verification
   - Encrypted tunnel established
                    ↓
6. Cloudflare checks cache
   - If cached: Return immediately
   - If not cached: Fetch from origin
                    ↓
7. Cloudflare connects to origin: 54.225.3.16:80
   - HTTP (unencrypted) connection
   - Request forwarded to AWS
                    ↓
8. AWS Internet Gateway routes to VPC
                    ↓
9. Security group validates port 80 access
                    ↓
10. ECS task at 172.31.1.57 receives request
                    ↓
11. Nginx serves static content
                    ↓
12. Response travels back through same path
                    ↓
13. Cloudflare caches response (if cacheable)
                    ↓
14. Encrypted response sent to browser over HTTPS
```

## DNS Propagation & Troubleshooting

### Verify DNS Resolution

```bash
# Check DNS from your machine
dig abdiel-vega.dev

# Check DNS from specific DNS server
dig @8.8.8.8 abdiel-vega.dev

# Check with Cloudflare DNS
dig @1.1.1.1 abdiel-vega.dev

# Trace full DNS path
dig +trace abdiel-vega.dev
```

**Expected Output:**

```
;; ANSWER SECTION:
abdiel-vega.dev.    300    IN    A    104.26.x.x (Cloudflare IP)
```

### Verify SSL Certificate

```bash
# Check certificate details
openssl s_client -connect abdiel-vega.dev:443 -servername abdiel-vega.dev

# Quick certificate check
curl -vI https://abdiel-vega.dev
```

**Expected:**

- Issuer: Cloudflare Inc
- Valid for: abdiel-vega.dev, *.abdiel-vega.dev
- TLS version: TLSv1.3

### Common Issues

**DNS Not Resolving:**

```bash
# Check nameservers at registrar
whois abdiel-vega.dev | grep "Name Server"

# Verify Cloudflare nameservers are authoritative
dig NS abdiel-vega.dev
```

**SSL Certificate Error:**

- Check Cloudflare SSL mode (should be Flexible)
- Verify Always Use HTTPS is enabled
- Wait for SSL certificate provisioning (up to 24 hours)

**Origin IP Exposed:**

```bash
# Check if proxied
dig abdiel-vega.dev

# Should return Cloudflare IP, NOT 54.225.3.16
```

## DNS & SSL Security Best Practices

### Current Security Posture

**Implemented:**

- DNSSEC available (Cloudflare supports)
- DDoS protection via Cloudflare proxy
- TLS 1.3 encryption
- Always Use HTTPS enabled
- Origin IP hidden

**Future Improvements:**

- Enable DNSSEC for domain
- Implement Full (Strict) SSL mode with ALB
- Add CAA DNS records (Certificate Authority Authorization)
- Set up Cloudflare WAF rules

## Monitoring & Analytics

### Cloudflare Dashboard

- Total requests (cached vs uncached)
- Bandwidth saved by caching
- Threat analytics
- Top countries/paths
- SSL/TLS version distribution

### DNS Query Monitoring

Cloudflare provides DNS query analytics:

- Query count per record
- Query types (A, AAAA, CNAME, etc.)
- Geographic distribution

## Cost Summary

|Service|Cost|Notes|
|---|---|---|
|Porkbun Domain|$12/year|.dev domain registration|
|Cloudflare DNS|$0|Free plan|
|Cloudflare SSL|$0|Universal SSL included|
|Cloudflare CDN|$0|Unlimited bandwidth on free plan|
|**Total**|**$1/month**|Domain cost only|

---

> *Setup secure HTTPS connection with minimal costs.*