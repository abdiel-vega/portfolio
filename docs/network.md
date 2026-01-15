# Network Configuration

## Network Topology

The network topology is managed entirely by Google Cloud Platform's serverless infrastructure.

**Components:**
- **Google Global Load Balancer:** Automatically handles traffic routing to the `us-west1` region.
- **Cloud Run Service:** Running the containerized application.
- **Ingress:** Configured to "All" (Public access).

## Connectivity

### Inbound Traffic (Ingress)

- **Protocol:** HTTP/HTTPS (HTTP/2 enabled)
- **Port:** 8080 (Container listening port)
- **Public Access:** Enabled via "Allow unauthenticated invocations".
- **URL:** `https://portfolio-466431697349.us-west1.run.app`

### Outbound Traffic (Egress)

- **Access:** Direct internet access via serverless VPC.
- **Static IP:** Not configured (dynamic outbound IPs).

## Security

### Access Control

- **Service Level:** Publicly accessible.
- **IAM:** `Cloud Run Invoker` role granted to `admin`.

### Data Protection

- **In-transit:** Encrypted via TLS 1.3.
- **At-rest:** Google Cloud encrypts data by default.

## Performance

### Latency

- **Region:** `us-west1` (Oregon).
- **Cold Starts:** Minimized by container efficiency, but may occur if traffic drops to zero (unless min-instances > 0).

### Throughput

- **Concurrency:** Default of 80 requests per container instance.
- **Autoscaling:** Rapidly scales out to handle traffic spikes (up to 3 instances max).