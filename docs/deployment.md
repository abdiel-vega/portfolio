# Deployment Guide

## Prerequisites

### AWS Requirements

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- IAM user with these permissions:
    - `AmazonECS_FullAccess`
    - `AmazonEC2ContainerRegistryFullAccess`
    - `EC2` (for VPC/networking)

### Local Tools

```bash
aws --version          # AWS CLI v2.x
docker --version       # Docker 20.x+
```

### Configured AWS CLI

```bash
aws configure
# AWS Access Key ID: [My Access Key]
# AWS Secret Access Key: [My Secret Key]
# Default region name: us-east-1
# Default output format: json
```

## Initial Infrastructure Setup

### 1. Created VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 172.31.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=portfolio-vpc}]'

# Create Public Subnet
aws ec2 create-subnet \
  --vpc-id VPC-ID \
  --cidr-block 172.31.1.0/24 \
  --availability-zone us-east-1d \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=portfolio-public-subnet}]'

# Enable auto-assign public IP
aws ec2 modify-subnet-attribute \
  --subnet-id SUBNET-ID \
  --map-public-ip-on-launch

# Create Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=portfolio-igw}]'

# Attach to VPC
aws ec2 attach-internet-gateway \
  --internet-gateway-id IGW-ID \
  --vpc-id VPC-ID

# Update route table
aws ec2 create-route \
  --route-table-id <RT-ID> \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id IGW-ID
```

### 2. Created Security Group

```bash
# Create security group
aws ec2 create-security-group \
  --group-name portfolio-sg \
  --description "Security group for portfolio website" \
  --vpc-id VPC-ID

# Add HTTP rule
aws ec2 authorize-security-group-ingress \
  --group-id SG-ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Add HTTPS rule
aws ec2 authorize-security-group-ingress \
  --group-id SG-ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### 3. Created ECR Repository

```bash
# Create private repository
aws ecr create-repository \
  --repository-name portfolio-website \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true

# Output: ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/portfolio-website
```

### 4. Created ECS Cluster

```bash
# Create Fargate cluster
aws ecs create-cluster \
  --cluster-name portfolio-cluster \
  --region us-east-1
```

## Docker Image Preparation

### 1. Create Dockerfile

```dockerfile
# Use the official Nginx image as the base
FROM nginx:alpine

# Copy custom nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy your website files to the Nginx default directory
COPY website/ /usr/share/nginx/html/

# Expose port 80 to allow traffic

EXPOSE 80
```

### 2. Build and Test Locally

```bash
# Build image
docker build -t portfolio-website .

# Test locally
docker run -p 8080:80 portfolio-website

# Visit http://localhost:8080 to verify

# Or use Live Server VS Code Extension if using VS Code (which i am).
```

### 3. Push to ECR

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag portfolio-website:latest \
  ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/portfolio-website:latest

# Push image
docker push ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/portfolio-website:latest
```

## ECS Service Deployment

### 1. Create Task Definition

Created `task-definition.json`:

```json
{
  "family": "portfolio-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT-ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "portfolio-container",
      "image": "ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/portfolio-website:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/portfolio-task",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

### 2. Create ECS Service

```bash
aws ecs create-service \
  --cluster portfolio-cluster \
  --service-name portfolio-service \
  --task-definition portfolio-task:latest \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[SUBNET-ID],securityGroups=[SG-ID],assignPublicIp=ENABLED}" \
  --region us-east-1
```

### 3. Get Task Public IP

```bash
# List tasks
aws ecs list-tasks \
  --cluster portfolio-cluster \
  --service-name portfolio-service

# Describe task to get ENI
aws ecs describe-tasks \
  --cluster portfolio-cluster \
  --tasks <task-arn>

# Get ENI details (including public IP)
aws ec2 describe-network-interfaces \
  --network-interface-ids ENI-ID
```

## DNS Configuration

### 1. Porkbun Domain Setup

- Bought `abdiel-vega.dev` domain for $12/year
- Updated nameservers to Cloudflare:
    - `cris.ns.cloudflare.com`
    - `jean.ns.cloudflare.com`

### 2. Cloudflare DNS Setup

**Added domain to Cloudflare:**

1. Add site: `abdiel-vega.dev`
2. Selected Free plan
3. Cloudflare scans existing records

**Configured DNS records:**

```
Type: A
Name: abdiel-vega.dev
Content: 100.24.62.202
Proxy: Enabled (orange cloud)
TTL: Auto
```

### 3. Cloudflare SSL/TLS

**SSL/TLS settings:**

- Encryption mode: **Flexible**
- Always Use HTTPS: **On**
- Automatic HTTPS Rewrites: **On**

## Updating the Website

### Quick Update Process

```bash
# 1. Make changes to code

# 2. Rebuild Docker image
docker build -t portfolio-website .

# 3. Authenticate to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com

# 4. Tag and push
docker tag portfolio-website:latest \
  ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/portfolio-website:latest

docker push ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/portfolio-website:latest

# 5. Force new deployment (pulls latest image)
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --force-new-deployment
```

### Monitor Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service

# Watch task status
watch -n 5 'aws ecs list-tasks --cluster portfolio-cluster --service-name portfolio-service'

# View task logs (if CloudWatch configured)
aws logs tail /ecs/portfolio-task --follow
```

## Deployment Automation Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="ACCOUNT-ID"
ECR_REPO="portfolio-website"
ECS_CLUSTER="portfolio-cluster"
ECS_SERVICE="portfolio-service"

echo "Building Docker image..."
docker build -t ${ECR_REPO} .

echo "Authenticating to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo "Tagging image..."
docker tag ${ECR_REPO}:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest

echo "Pushing to ECR..."
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest

echo "Deploying to ECS..."
aws ecs update-service \
  --cluster ${ECS_CLUSTER} \
  --service ${ECS_SERVICE} \
  --force-new-deployment \
  --region ${AWS_REGION}

echo "Deployment initiated! Monitor progress in AWS Console."
```

Make executable and run:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Rollback Procedure

If deployment fails:

```bash
# 1. List previous task definitions
aws ecs list-task-definitions --family-prefix portfolio-task

# 2. Update service to previous working version
aws ecs update-service \
  --cluster portfolio-cluster \
  --service portfolio-service \
  --task-definition portfolio-task:latest

# 3. Verify rollback
aws ecs describe-services \
  --cluster portfolio-cluster \
  --services portfolio-service
```

## Troubleshooting

### Container Won't Start

```bash
# Check task status
aws ecs describe-tasks \
  --cluster portfolio-cluster \
  --tasks <task-id>

# Common issues:
# - Image pull error: Check ECR permissions
# - Port conflict: Verify port 80 in Dockerfile and task definition
# - Resource limits: Increase CPU/memory in task definition
```

### Can't Access Website

```bash
# Verify task is running
aws ecs list-tasks --cluster portfolio-cluster

# Check security group rules
aws ec2 describe-security-groups --group-ids SG-ID

# Test direct IP access
curl http://100.24.62.202

# Check Cloudflare DNS
dig abdiel-vega.dev
```

### ECR Authentication Fails

```bash
# Regenerate credentials
aws ecr get-login-password --region us-east-1

# Verify IAM permissions for ECR
aws iam get-user

# Check repository exists
aws ecr describe-repositories --repository-names portfolio-website
```

## Cost Optimization Tips

1. **Delete old ECR images:**
```bash
# List images
aws ecr list-images --repository-name portfolio-website
# Delete by tag
aws ecr batch-delete-image \
	--repository-name portfolio-website \
	--image-ids imageTag=old-tag
```
    
2. **Use Fargate Spot (for non-critical workloads):**
    
    - Add `capacityProviderStrategy` in service definition
    - Can save up to 70% on compute costs

---

> *Deployment guide and little troubleshooting playbook.*