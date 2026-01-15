# Architecture Overview

## System Architecture

![[portfolio-website-diagram.svg]]

## Google Cloud Services Breakdown

### 1. Cloud Run (Serverless Container Platform)

**Purpose:** Hosting the application container

**Configuration:**

- **Service:** `portfolio`
- **Region:** `us-west1`
- **Memory:** 256 MiB
- **CPU:** 1 vCPU
- **Concurrency:** Default (80)
- **Execution Environment:** First Generation
- **Ingress:** All (Publicly accessible)
- **Port:** 8080

**Why Cloud Run?**

- Fully managed serverless platform
- Scales to zero (pay only when running)
- auto-scaling (Min: 0, Max: 3 instances)
- Integrated HTTPS and simplified networking

### 2. Artifact Registry

**Purpose:** Private Docker image repository

**Configuration:**

- **Location:** `us-west1`
- **Repository:** `cloud-run-source-deploy`
- **Image URL:** `us-west1-docker.pkg.dev/portfolio-website-484321/cloud-run-source-deploy/portfolio/portfolio`

### 3. Cloud Build

**Purpose:** Continuous Integration and Deployment (CI/CD)

**Configuration:**

- **Trigger:** Connects to GitHub repository
- **Source:** `abdiel-vega/portfolio` (branch: `main`)
- **Action:** automatically builds new image and deploys to Cloud Run on valid push

## Network Architecture

**Overview:**
The application is hosted on Google Cloud Run which handles all infrastructure networking, load balancing, and SSL termination automatically.

- **Service URL:** `https://portfolio-466431697349.us-west1.run.app`
- **Custom Domain:** `abdiel-vega.dev`

### Security

- **Ingress Control:** Set to "All" to allow public internet traffic.
- **Authentication:** Publicly accessible (unauthenticated).
- **SSL/TLS:** Managed automatically by Google Cloud for the `.run.app` domain and custom domain mappings.

## DNS & CDN Architecture

### Porkbun (Domain Registrar)

- **Domain:** `abdiel-vega.dev`
- **Nameservers:** Cloudflare NS (cris.ns.cloudflare.com, jean.ns.cloudflare.com)

### Cloudflare Configuration

**DNS Records:**

- CNAME or A records pointing to Google Cloud Run (handled via Cloudflare Proxy).

**SSL/TLS Mode:**

- **Flexible/Full:** Traffic between Cloudflare and Google Cloud Run is encrypted (HTTPS).

## Traffic Flow Diagram

```
1. User requests https://abdiel-vega.dev
                ↓
2. DNS query to Cloudflare nameservers
                ↓
3. Cloudflare resolves to proxied IP
                ↓
4. User connects to Cloudflare edge server (HTTPS)
                ↓
5. Cloudflare forwards request to Google Cloud Run (HTTPS)
   URL: https://portfolio-[...].us-west1.run.app
                ↓
6. Google Cloud Run spins up container (if scale=0)
                ↓
7. Container serves content on port 8080
                ↓
8. Response returns through same path
```

## Deployment Architecture

### Continuous Deployment Pipeline

```
[Developer Machine]
       ↓ git push origin main
[GitHub Repository]
       ↓ Webhook trigger
[Cloud Build]
       ↓ 1. Builds Docker Image
       ↓ 2. Pushes to Artifact Registry
       ↓ 3. Deploys new revision to Cloud Run
[Cloud Run Service]
       ↓
[New Revision Live]
```

## Scalability Considerations

**Current Setup:**

- **Auto-scaling:** Configured to scale between 0 and 3 instances.
- **Cold Starts:** Simple container (Nginx + Static files) starts very quickly.
- **Region:** Single region (`us-west1`).

## Cost Breakdown

**Estimates:**

- **Cloud Run:** Free tier covers 2 million requests/month and 180,000 vCPU-seconds/month. Likely **$0.00/month** for low traffic.
- **Artifact Registry:** Storage costs (likely cents per month for small images).
- **Cloud Build:** 120 free build-minutes/day. Likely **$0.00/month**.
- **Data Transfer:** Standard egress rates apply after free tier.

**Total:** Likely **<$1.00/month** for portfolio scale usage.