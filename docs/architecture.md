# Architecture Overview

## System Architecture

![[portfolio-website-diagram.svg]]

## AWS Services Breakdown

### 1. Amazon ECS (Elastic Container Service)

**Purpose:** Container orchestration platform

**Configuration:**

- **Cluster:** portfolio-cluster
- **Service:** portfolio-service (1 running task)
- **Launch Type:** Fargate (serverless)
- **Task Definition:** portfolio-task-#
- **Resources:** 0.25 vCPU, 0.5GB RAM
- **Platform:** Linux/x86_64

**Why ECS Fargate?**

- No server management required
- Pay only for running tasks
- Automatic scaling capability (currently 1 task)
- Seamless integration with ECR

### 2. Amazon ECR (Elastic Container Registry)

**Purpose:** Private Docker image repository

**Configuration:**

- **Repository:** portfolio-website
- **Encryption:** AES-256
- **Tag Immutability:** Mutable
- **Created:** October 27, 2025

**Workflow:**

```bash
# Build → Tag → Push → Deploy
docker build -t portfolio-website .

docker tag portfolio-website:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/portfolio-website:latest

docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/portfolio-website:latest
# ECS pulls and deploys automatically
```

### 3. Amazon VPC (Virtual Private Cloud)

**Purpose:** Network isolation and security

**Configuration:**

- **VPC Name:** portfolio-vpc
- **CIDR Block:** 172.31.0.0/16
- **DNS Resolution:** Enabled
- **DNS Hostnames:** Enabled

**Design Choice:** Using default VPC for simplicity. Production environments and future projects could use custom VPC with multiple availability zones.

### 4. IAM (Identity and Access Management)

**Purpose:** Secure access control

**Key Roles:**

- **ecsTaskExecutionRole:** Allows ECS to pull images from ECR and write logs
- **AWSServiceRoleForECS:** Service-linked role for ECS cluster management

## Network Architecture

### Subnet Configuration

**Public Subnet: portfolio-public-subnet**

- **CIDR:** 172.31.1.0/24
- **Availability Zone:** us-east-1d
- **Auto-assign Public IP:** Yes
- **Internet Gateway:** igw-0f5f8c1dc39b659cf

**Why Public Subnet?**

- Direct internet access without NAT Gateway costs
- Simple routing for single-task deployment
- Cloudflare proxy provides additional security layer

### Security Group: portfolio-sg

**Inbound Rules:**

```
Type    Protocol    Port    Source
HTTP    TCP         80      0.0.0.0/0
HTTPS   TCP         443     0.0.0.0/0
```

**Outbound Rules:**

```
All traffic allowed (for ECR pulls and health checks)
```

**Security Note:** Origin IP is hidden by Cloudflare proxy. All traffic routes through Cloudflare's network before reaching AWS.

### Route Table:

```
Destination         Target
172.31.0.0/16      local
0.0.0.0/0          igw-0f5f8c1dc39b659cf
```

**Translation:**

- Local traffic stays within VPC
- All other traffic routes to Internet Gateway

## DNS & CDN Architecture

### Porkbun (Domain Registrar)

- **Domain:** abdiel-vega.dev
- **Nameservers:** Cloudflare NS (cris.ns.cloudflare.com, jean.ns.cloudflare.com)
- **WHOIS Privacy:** Enabled

### Cloudflare Configuration

**DNS Records:**

```
Type    Name                Content            Proxy
A       abdiel-vega.dev     3.84.209.91        Proxied
CNAME   *                   pixie.porkbun.com  Proxied
CNAME   www                 pixie.porkbun.com  Proxied
```

**SSL/TLS Mode:** Flexible

- Browser → Cloudflare: HTTPS (encrypted)
- Cloudflare → AWS: HTTP (unencrypted)

**Why Flexible SSL?**

- No need for AWS certificate management
- Cloudflare handles all SSL/TLS termination
- Sufficient security for public portfolio site
- Reduces AWS costs (no Application Load Balancer needed)

## Traffic Flow Diagram

```
1. User requests https://abdiel-vega.dev
                ↓
2. DNS query to Cloudflare nameservers
                ↓
3. Cloudflare resolves to proxied IP (not AWS IP)
                ↓
4. User connects to Cloudflare edge server (HTTPS)
                ↓
5. Cloudflare forwards to AWS Public IP: 3.84.209.91 (HTTP)
                ↓
6. Internet Gateway routes to VPC
                ↓
7. Security Group validates HTTP/HTTPS ports
                ↓
8. Traffic reaches ECS Task at 172.31.1.57:80
                ↓
9. Nginx container serves static content
                ↓
10. Response returns through same path
```

## Deployment Architecture

### Container Lifecycle

```
[Developer Machine]
       ↓ docker build
[Local Docker Image]
       ↓ docker tag
[Tagged Image]
       ↓ docker push
[ECR Repository]
       ↓ ECS Service Update
[ECS Task Definition v5]
       ↓ ECS pulls image
[Running Container in Fargate]
```

### Zero-Downtime Deployment

When updating the service:

1. New task starts with updated image
2. Health checks verify new task is healthy
3. Old task drains connections
4. Old task terminates
5. Service reports as "Stable"

## Scalability Considerations

**Current Setup (Single Task):**

- Handles low-to-medium traffic
- No load balancer overhead
- Cloudflare caching reduces origin requests

**Future Scaling Path:**

1. Increase task count in ECS service (horizontal scaling)
2. Add Application Load Balancer for traffic distribution
3. Enable ECS Service Auto Scaling based on CPU/memory
4. Implement multi-AZ deployment for high availability
5. Add CloudFront for additional caching (if needed beyond Cloudflare)

## Cost Breakdown

**Monthly Estimates:**

- **ECS Fargate:** ~$10-12 (0.25 vCPU, 0.5GB RAM, 730 hours/month)
- **ECR Storage:** ~$1 (1-2 images stored)
- **Data Transfer:** ~$2-5 (depends on traffic)
- **VPC:** $0 (using default VPC with public subnet)

**Total:** ~$15-20/month

**Cost Savings:**

- No NAT Gateway ($32+/month saved)
- No Application Load Balancer ($16+/month saved)
- Cloudflare free tier for DNS and SSL
- Single availability zone deployment

---

> *This architecture balances cost, simplicity, and functionality for my portfolio website.*