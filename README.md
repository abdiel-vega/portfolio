# Portfolio Website - Google Cloud Deployment

A containerized portfolio website deployed on Google Cloud Platform using Cloud Run, demonstrating serverless container deployment, CI/CD automation, and modern web hosting.

**Live Site:** [abdiel-vega.dev](https://abdiel-vega.dev/)

![website image](/docs/assets/portfolio-website-image.png)

## Project Overview

This project showcases a complete cloud deployment pipeline using Docker containerization and Google Cloud services. The website runs on Cloud Run (serverless) with automated CI/CD deployments from GitHub via Cloud Build and Artifact Registry. It utilizes Cloudflare for DNS management and edge caching.

## Documentation

- **[Architecture Overview](/docs/architecture.md)** - Google Cloud infrastructure design and service interactions
- **[Network Configuration](/docs/network.md)** - Serverless networking and security details
- **[Deployment Guide](/docs/deployment.md)** - CI/CD pipeline and manual deployment procedures
- **[DNS & SSL Setup](/docs/dns-ssl.md)** - Domain configuration with Porkbun, Cloudflare, and Cloud Run

## Tech Stack

**Frontend:**

- HTML5, CSS3, JavaScript
- Particles.js for background effects

**Infrastructure:**

- **Google Cloud Run** - Serverless container hosting
- **Artifact Registry** - Private Docker image repository
- **Cloud Build** - CI/CD automation
- **Porkbun** - Domain registrar
- **Cloudflare** - DNS management (Proxied)

**Tools:**

- Docker for containerization
- Google Cloud CLI (`gcloud`)
- VS Code for development

## Quick Stats

- **Container:** Custom nginx-based image (~15MB)
- **Compute:** 1 vCPU, 256 MiB RAM (Scale-to-Zero)
- **Region:** `us-west1`
- **SSL:** Managed by Google Cloud & Cloudflare
- **Scaling:** Automatic (Min: 0, Max: 3)

## Key Features

- **Serverless Architecture:** No server management required
- **Automated CI/CD:** Changes to `main` branch auto-deploy via Cloud Build
- **Cost Efficient:** Scales to zero when unused (Free Tier eligible)
- **Global CDNs:** Cloudflare + Google's global network
- **Secure by Default:** HTTPS/TLS 1.3 enforced

## Repository Structure

```
portfolio website/           # root
├── docs/                    # documentation
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
└── default.conf             # nginx configuration
```

## Local Development

```bash
# Run locally
docker build -t portfolio-website .
docker run -p 8080:80 portfolio-website
```

Visit `http://localhost:8080`

## Architecture Highlights

- **Compute Layer:** Cloud Run provides serverless container execution.
- **Build Layer:** Cloud Build automatically builds containers on git push.
- **Storage:** Artifact Registry securely stores container images.
- **Network:** Google front-end load balancers handle incoming traffic.
- **Security:** Immutable container images and managed SSL.

## Cost Optimization

This setup is extremely cost-effective, leveraging Google Cloud's Free Usage limits:

- **Cloud Run:** First 2 million requests/month are free.
- **Cloud Build:** 120 build-minutes/day are free.
- **Artifact Registry:** Minimal storage costs.
- **Scale to Zero:** No costs when no one is visiting looking at the site.

**Estimated Monthly Cost:** < $1.00 USD

## Lessons Learned

- **Migration:** Transitioning from AWS ECS to Google Cloud Run for simplified operations.
- **CI/CD:** Setting up trigger-based deployments limits manual errors.
- **Serverless:** Understanding the "stateless" nature of containers for scaling.
- **DNS/SSL:** Configuring custom usage domains with managed certificates.

## Future Improvements

- [ ] Implement advanced caching rules in Cloudflare.
- [ ] Add uptime checks and alerting via Google Cloud Monitoring.
- [ ] Optimize container image size further.

## Contact

**Abdiel Y Vega Velez**  
[abdiel.vega@outlook.com](mailto:abdiel.vega@outlook.com) | [LinkedIn](https://linkedin.com/in/abdiel-vega2004)

---

> *Built with Google Cloud Platform, Docker, nginx, HTML, CSS, and JavaScript*