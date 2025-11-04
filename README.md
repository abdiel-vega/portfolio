# Portfolio Website - AWS Deployment

A containerized portfolio website deployed on AWS using ECS Fargate, demonstrating cloud infrastructure, container orchestration, and secure web deployment.

**Live Site:** [abdiel-vega.dev](https://abdiel-vega.dev/)

![[portfolio-website-image.png]]

## Project Overview

This project showcases a complete cloud deployment pipeline using Docker containerization and AWS services. The website runs on ECS Fargate with automated deployments from ECR, behind Cloudflare's CDN for SSL/TLS termination and DDoS protection.

## Documentation

- **[Architecture Overview](https://claude.ai/chat/ARCHITECTURE.md)** - AWS infrastructure design and service interactions
- **[Network Configuration](https://claude.ai/chat/NETWORK.md)** - VPC, subnets, security groups, and routing details
- **[Deployment Guide](https://claude.ai/chat/DEPLOYMENT.md)** - Step-by-step deployment and update procedures
- **[DNS & SSL Setup](https://claude.ai/chat/DNS-SSL.md)** - Domain configuration with Porkbun and Cloudflare

## Tech Stack

**Frontend:**

- HTML5, CSS3, JavaScript
- Particles.js for background effects

**Infrastructure:**

- **AWS ECS (Fargate)** - Container orchestration
- **AWS ECR** - Private Docker image registry
- **AWS VPC** - Network isolation (172.31.0.0/16)
- **Porkbun** - Domain registrar
- **Cloudflare** - DNS management and SSL/TLS

**Tools:**

- Docker for containerization
- AWS CLI for deployment
- VS Code for frontend

## Quick Stats

- **Container:** Custom nginx-based image (~15MB)
- **Compute:** 0.25 vCPU, 0.5GB RAM (Fargate)
- **Network:** Public subnet with auto-assigned IP
- **SSL:** Cloudflare Flexible encryption
- **Availability:** Single task, single AZ (cost-optimized)

## Key Features

- Fully containerized deployment
- Zero-downtime updates via ECS
- HTTPS encryption via Cloudflare
- Proxied DNS for security
- Minimal infrastructure footprint

## Repository Structure

```
portfolio website/           # root
├── docs/                    # documentaiton
│   ├── architecture.md      
│   ├── deployment.md        
│   ├── dns-ssl.md           
│   └── network.md         
├── website/                 # website directory
│   ├── index.html           # main html file
│   ├── styles.css           # styling
│   ├── script.js            # javascript
│   └── assets/              # svg icons
├── Dockerfile               # container definition
├── default.conf             # ngnix configuration
└── task-definition.json     # aws service task definition
```

## Local Development

```bash
# Run locally
docker build -t portfolio-website .
docker run -p 8080:80 portfolio-website
```

`http://localhost:8080`

## Architecture Highlights

- **Compute Layer:** ECS Fargate eliminates server management
- **Network Layer:** Public subnet for direct internet access
- **Security Layer:** Security group restricts traffic to HTTP/HTTPS
- **DNS Layer:** Cloudflare proxy hides origin IP
- **Storage Layer:** ECR stores Docker images with AES-256 encryption

## Cost Optimization

This setup is designed for minimal AWS costs:

- Fargate spot pricing not available, but using smallest task size
- Single task (no load balancer needed with Cloudflare)
- No NAT Gateway (public subnet design)
- ECR lifecycle policies for image management

**Estimated Monthly Cost:** ~$15-20 USD

## Lessons Learned

- Understanding VPC networking fundamentals (subnets, routing, internet gateways)
- Container orchestration with ECS and task definitions
- Integrating external DNS with AWS infrastructure
- SSL/TLS termination strategies (Cloudflare vs AWS Certificate Manager)
- Security group configuration for web traffic
- Application Load Balancer useful for scaling
- Implement Terraform for infrastructure as code in future projects

## Future Improvements

- [ ] Implement CI/CD with GitHub Actions
- [ ] Add CloudWatch monitoring and alarms
- [ ] Set up multi-AZ deployment for high availability


## Contact

**Abdiel Y Vega Velez**  
[abdiel.vega@outlook.com](mailto:abdiel.vega@outlook.com) | [LinkedIn](https://linkedin.com/in/abdiel-vega2004)

---

> *Built with AWS, Docker, nginx, HTML, CSS, and JavaScript*