# Deployment Guide

## Overview

The portfolio website uses **Continuous Deployment** managed by **Google Cloud Build**.
Every push to the `main` branch on GitHub automatically triggers a build and deployment to **Google Cloud Run**.

## Prerequisites

- **Google Cloud Platform Account**
- **GitHub Repository**: Linked to Cloud Build trigger.
- **Tools (Optional for manual tasks):**
  - `gcloud` CLI installed and authenticated.
  - Docker (for local testing).

## Updating the Website

### Standard Workflow

1. **Make Changes**: Edit your code locally.
2. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Update portfolio content"
   ```
3. **Push to GitHub**:
   ```bash
   git push origin main
   ```
4. **Automatic Deployment**:
   - Cloud Build detects the push.
   - Builds the Docker image.
   - Pushes image to Artifact Registry (`us-west1-docker.pkg.dev/...`).
   - Deploys new revision to Cloud Run service `portfolio`.

### Verifying Deployment

1. Go to the [Cloud Build History](https://console.cloud.google.com/cloud-build/builds) page.
2. Check for the green checkmark next to the latest build.
3. Visit `https://abdiel-vega.dev` to see changes.

## Manual Deployment

If the automated pipeline fails or you need to deploy manually from your local machine:

### 1. Build and Submit to Cloud Build

```bash
# Submit build to Cloud Build (builds and pushes to Artifact Registry)
gcloud builds submit --tag us-west1-docker.pkg.dev/portfolio-website-484321/cloud-run-source-deploy/portfolio/portfolio:manual-v1
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy portfolio \
  --image us-west1-docker.pkg.dev/portfolio-website-484321/cloud-run-source-deploy/portfolio/portfolio:manual-v1 \
  --region us-west1 \
  --platform managed
```

## Rollback Procedure

If a bad deployment goes live:

1. Open **Google Cloud Console** > **Cloud Run** > **portfolio**.
2. Go to the **Revisions** tab.
3. Find the previous stable revision (green checkmark).
4. Click **Manage Traffic**.
5. Set traffic to 100% for the stable revision.
6. Click **Save**.

Alternatively, revert the changes in git and push again to trigger a fresh deployment of the old code.

## Troubleshooting

### Build Failures

- Check **Cloud Build logs** for compilation or Docker build errors.
- Ensure `Dockerfile` is valid.

### Deployment Failures

- Check **Cloud Run logs** for startup errors.
- Verify container listens on `PORT` environment variable (default 8080).
- Check IAM permissions if the build service account cannot deploy.

### Local Testing

```bash
# Build locally
docker build -t portfolio-local .

# Run locally on port 8080
docker run -p 8080:80 portfolio-local
```