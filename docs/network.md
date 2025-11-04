# Network Configuration

## Network Topology

![[portfolio-website-diagram.svg]]

## VPC Configuration

### VPC Details

- **Name:** portfolio-docker VPC
- **CIDR Block:** 172.31.0.0/16
- **Tenancy:** Default
- **State:** Available

### VPC Features

|Feature|Status|Purpose|
|---|---|---|
|DNS Resolution|Enabled|Allows instances to resolve domain names|
|DNS Hostnames|Enabled|Assigns public DNS names to instances with public IPs|
|DHCP Options|Default|Automatic IP assignment within subnets|

### Why 172.31.0.0/16?

This is AWS's default VPC CIDR range, providing:

- **65,536 total IP addresses** (more than enough for a portfolio site)
- **Private IP range** (RFC 1918 compliant)
- **Room for growth** - can subnet into 256 /24 networks

## Subnet Architecture

### Public Subnet

- **Name:** portfolio-public-subnet
- **CIDR:** 172.31.1.0/24 (254 usable IPs: 172.31.1.1 - 172.31.1.254)
- **Availability Zone:** us-east-1d
- **Auto-assign Public IPv4:** Yes

**CIDR Breakdown:**

```
Network Address:    172.31.1.0      (Reserved by AWS)
Usable Range:       172.31.1.1  -   172.31.1.254
Broadcast Address:  172.31.1.255    (Reserved by AWS)
AWS Reserved:       172.31.1.1-3    (Gateway, DNS, future use)
```

**Current Usage:**

- ECS Task: 172.31.1.57
- Available IPs: 250+

### Private Subnet

- **Name:** portfolio-private-subnet
- **CIDR:** 172.31.2.0/24
- **Status:** Created but unused

**Future Use Cases:**

- Backend databases (RDS)
- Internal APIs
- Cache layers (ElastiCache)

## Routing Configuration

### Main Route Table

- **Name:** portfolio-rt
- **VPC:** portfolio-vpc

|Destination|Target|Status|Purpose|
|---|---|---|---|
|172.31.0.0/16|local|Active|VPC-internal traffic|
|0.0.0.0/0|igw-0f5f8c1dc39b659cf|Active|Internet-bound traffic|

**Routing Logic:**

```
If destination IP in 172.31.0.0/16:
    Route locally within VPC
Else:
    Route to Internet Gateway
```

### Internet Gateway

- **Attached to:** portfolio-vpc

**Function:**

- Enables bidirectional internet connectivity
- Performs NAT for public IPs (one-to-one mapping)
- No data processing fees

## Security Group Configuration

### Portfolio Security Group

- **Name:** portfolio-sg
- **VPC:** portfolio-vpc

### Inbound Rules

|Type|Protocol|Port Range|Source|Description|
|---|---|---|---|---|
|HTTP|TCP|80|0.0.0.0/0|Allow web traffic from anywhere|
|HTTPS|TCP|443|0.0.0.0/0|Allow secure web traffic|

```
Rule Translation:
- Accept TCP connections on port 80 from any IPv4 address
- Accept TCP connections on port 443 from any IPv4 address
```

### Outbound Rules

|Type|Protocol|Port Range|Destination|Description|
|---|---|---|---|---|
|All|All|All|0.0.0.0/0|Allow all outbound traffic|

### Security Considerations

**Current State:**

- Wide open HTTP/HTTPS from internet (expected for web server)
- Cloudflare proxy hides actual AWS IP from port scanners
- No SSH/RDP access needed (Fargate is serverless)

**Production Hardening:**

- **Option 1:** Restrict to Cloudflare IPs only
	- Source: `173.245.48.0/20, 103.21.244.0/22, etc.`

- **Option 2:** Add WAF rules in Cloudflare
	- Block suspicious requests before reaching AWS

## Network Address Translation (NAT)

### Current Setup: No NAT Gateway

**Why?**

- Public subnet has direct internet access via IGW
- No private subnet resources needing outbound internet
- **Cost savings:** NAT Gateway costs $0.045/hour (~$32/month)

**How it works without NAT:**

```
Outbound from ECS Task:
Private IP (172.31.1.57) → IGW → Internet Gateway performs NAT → Public IP (54.225.3.16)

Inbound to ECS Task:
Request to 54.225.3.16 → IGW translates to 172.31.1.57 → ECS Task
```

## IP Addressing

### Task Network Interface (ENI)

- **Private IPv4:** 172.31.1.57
- **Public IPv4:** 54.225.3.16
- **MAC Address:** 0e:61:b3:33:9f:db
- **Subnet:** portfolio-public-subnet

**Elastic Network Interface Features:**

- Automatically assigned by Fargate
- Auto-assigned public IP enabled
- No Elastic IP needed (public IP persists during task lifetime)
- New IP assigned on task replacement

### DNS Resolution

```
abdiel-vega.dev → Cloudflare DNS → Cloudflare Proxy IP
                                    ↓
                              (Internal routing)
                                    ↓
                              54.225.3.16 (AWS Public IP)
                                    ↓
                              172.31.1.57 (Private IP)
```

**DNS Records at Cloudflare:**

```
A    abdiel-vega.dev    54.225.3.16    (Proxied)
```

- **Proxied (Current):** Traffic routes through Cloudflare, origin IP hidden

## Network Performance

### Latency Sources

1. **User → Cloudflare Edge:** 10-50ms (varies by location)
2. **Cloudflare → AWS us-east-1:** 20-80ms (depends on edge location)
3. **Internet Gateway → ECS Task:** <1ms (internal VPC)
4. **Container Processing:** 5-20ms (static content)

**Total Round Trip:** Typically 50-150ms

---

> *This configuration demonstrates fundamental cloud networking while maintaining cost efficiency and security.*