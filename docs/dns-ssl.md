# DNS & SSL Configuration

## Overview

This project uses a two-layer DNS and SSL approach:

- **Porkbun**: Domain registrar
- **Cloudflare**: DNS management (Nameservers)
- **Google Cloud Run**: Hosting & SSL Termination

## Domain Registration (Porkbun)

- **Domain:** `abdiel-vega.dev`
- **Registrar:** Porkbun
- **Nameservers:** Delegated to Cloudflare (`cris.ns.cloudflare.com`, `jean.ns.cloudflare.com`)

## DNS Management (Cloudflare)

### Configuration

The domain `abdiel-vega.dev` is configured in Cloudflare to point to Google Cloud Run.

**Records:**

- **Type:** `CNAME` or `A` / `AAAA`
- **Value:** Mapped to Google Cloud Run via Custom Domain settings.
- **Proxy Status:**
  - **Proxied (Orange Cloud):** If using Cloudflare CDN features. Requires "Full" SSL mode in Cloudflare.
  - **DNS Only (Grey Cloud):** If relying solely on Google Cloud's mapping and caching.

### Why Cloudflare?

- **DNS Management:** Fast and reliable DNS propagation.
- **Security:** DDoS protection and Web Application Firewall (if Proxied).

## SSL/TLS Configuration

### Google Cloud Managed Certificates

When mapping a custom domain in Cloud Run:
- Google automatically provisions and renews a managed SSL certificate for `abdiel-vega.dev`.
- **Status:** Managed automatically.
- **Redirect:** HTTP requests are automatically redirected to HTTPS.

### Cloudflare SSL (If Proxied)

If Cloudflare proxy is enabled:
- **Mode:** **Full** (Strict recommended).
  - Browser → Cloudflare: Encrypted (Cloudflare Cert).
  - Cloudflare → Google Cloud Run: Encrypted (Google Cert).
- **Always Use HTTPS:** Enabled.

**Comparison:**

| Component | Standard (DNS Only) | Proxied (Cloudflare CDN) |
|---|---|---|
| **SSL Cert (Browser)** | Google Managed | Cloudflare Universal SSL |
| **SSL Cert (Origin)** | N/A | Google Managed |
| **Caching** | Google Cloud Run (Basic) | Cloudflare Edge |

## Troubleshooting

### Domain Verification

If the domain is not resolving:
1. Check Cloud Run "Custom Domains" tab for status.
2. Verify DNS records in Cloudflare match what Cloud Run requests (A/AAAA or CNAME).
3. Wait for DNS propagation changes (can take minutes to hours).

### SSL Issues

- **Certificate Provisioning:** Google managed certs can take up to 24 hours to issue initially.
- **Redirect Loops:** Ensure Cloudflare SSL mode is **Full**, not "Flexible", if proxying to Cloud Run.