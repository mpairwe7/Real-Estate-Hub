# Prometheus & Grafana Setup Guide

## Overview

This guide will help you set up **Prometheus** for metrics collection and **Grafana** for visualization dashboards to monitor your Real Estate Hub application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Next.js App (Vercel)                                      │
│  └── /api/metrics endpoint                                 │
│       │                                                     │
│       │ Exposes metrics in Prometheus format               │
│       │                                                     │
│       ▼                                                     │
│  Prometheus Server (Docker)                                │
│  └── Scrapes metrics every 15s                             │
│  └── Stores time-series data                               │
│       │                                                     │
│       │ Provides data via HTTP API                         │
│       │                                                     │
│       ▼                                                     │
│  Grafana Dashboard (Docker)                                │
│  └── Visualizes metrics                                    │
│  └── Creates custom dashboards                             │
│  └── Sets up alerts                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker and Docker Compose installed
- Your Next.js application deployed to Vercel
- Port 3001 (Grafana) and 9090 (Prometheus) available

## Step 1: Install Docker (if not installed)

### Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install -y docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### macOS:
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Or use Homebrew:
brew install --cask docker
```

### Windows:
Download and install Docker Desktop from https://www.docker.com/products/docker-desktop

## Step 2: Deploy Application Code

The metrics endpoint is already created at `/api/metrics`. Deploy your application:

```bash
# Build and test locally first
yarn build
yarn start

# Test metrics endpoint
curl http://localhost:3000/api/metrics

# Deploy to Vercel
vercel --prod
```

## Step 3: Configure Prometheus

Update `prometheus.yml` with your actual Vercel domain:

```yaml
scrape_configs:
  - job_name: 'real-estate-hub'
    metrics_path: '/api/metrics'
    scheme: 'https'
    static_configs:
      - targets:
          - 'your-actual-domain.vercel.app' # ⚠️ UPDATE THIS
```

## Step 4: Start Monitoring Stack

```bash
# Start Prometheus and Grafana
docker-compose -f docker-compose.monitoring.yml up -d

# Check if containers are running
docker ps

# You should see:
# - real-estate-prometheus (port 9090)
# - real-estate-grafana (port 3001)
# - real-estate-node-exporter (port 9100)

# View logs
docker-compose -f docker-compose.monitoring.yml logs -f
```

## Step 5: Access Prometheus

1. Open your browser and go to: **http://localhost:9090**
2. Click on **Status** → **Targets**
3. Verify that `real-estate-hub` target is **UP** and green
4. Go to **Graph** tab
5. Try some queries:
   - `http_requests_total` - Total HTTP requests
   - `rate(http_requests_total[5m])` - Request rate per second
   - `http_request_duration_ms_avg` - Average response time

### Common Prometheus Queries:

```promql
# Total requests in last 5 minutes
sum(rate(http_requests_total[5m]))

# Request rate by status code
sum by (status) (rate(http_requests_total[5m]))

# Average response time
avg(http_request_duration_ms_avg)

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m]))

# Memory usage
nodejs_memory_usage_bytes{type="heapUsed"}

# Uptime
process_uptime_seconds
```

## Step 6: Access Grafana

1. Open your browser and go to: **http://localhost:3001**
2. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. **⚠️ Change password immediately after first login!**

### Prometheus datasource is already configured automatically!

## Step 7: Create Your First Dashboard

### Option 1: Import Pre-built Dashboard

1. Click **+** icon → **Import**
2. Enter dashboard ID: **3662** (Prometheus 2.0 Overview)
3. Click **Load**
4. Select **Prometheus** datasource
5. Click **Import**

### Option 2: Create Custom Dashboard

1. Click **+** icon → **Dashboard** → **Add new panel**
2. In query editor, enter:
   ```promql
   rate(http_requests_total[5m])
   ```
3. Set panel title: "Request Rate"
4. Choose visualization type (Graph, Stat, Gauge, etc.)
5. Click **Apply**
6. Click **Save dashboard** icon (💾)

### Recommended Panels for Real Estate Hub:

#### Panel 1: HTTP Request Rate
```promql
sum(rate(http_requests_total{job="real-estate-hub"}[5m]))
```
- **Visualization:** Graph
- **Unit:** requests/sec

#### Panel 2: Response Time (Average)
```promql
avg(http_request_duration_ms_avg{job="real-estate-hub"})
```
- **Visualization:** Stat
- **Unit:** milliseconds

#### Panel 3: Error Rate
```promql
sum(rate(http_requests_total{status=~"5..",job="real-estate-hub"}[5m]))
```
- **Visualization:** Graph (Red color)
- **Unit:** requests/sec

#### Panel 4: Requests by Status Code
```promql
sum by (status) (rate(http_requests_total{job="real-estate-hub"}[5m]))
```
- **Visualization:** Bar chart
- **Legend:** {{status}}

#### Panel 5: Memory Usage
```promql
nodejs_memory_usage_bytes{type="heapUsed",job="real-estate-hub"} / 1024 / 1024
```
- **Visualization:** Graph
- **Unit:** MB

#### Panel 6: Application Uptime
```promql
process_uptime_seconds{job="real-estate-hub"} / 3600
```
- **Visualization:** Stat
- **Unit:** hours

## Step 8: Set Up Alerts

1. In Grafana, go to **Alerting** → **Alert rules**
2. Click **New alert rule**
3. Configure alert:
   - **Rule name:** High Error Rate
   - **Query:**
     ```promql
     sum(rate(http_requests_total{status=~"5.."}[5m])) > 10
     ```
   - **Condition:** When above 10 requests/sec
   - **Evaluate:** Every 1m for 5m
4. Configure contact points (email, Slack, etc.)
5. Click **Save**

### Recommended Alerts:

1. **High Error Rate:**
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[5m])) > 10
   ```

2. **Slow Response Time:**
   ```promql
   avg(http_request_duration_ms_avg) > 1000
   ```

3. **High Memory Usage:**
   ```promql
   nodejs_memory_usage_bytes{type="heapUsed"} > 500000000
   ```

4. **Application Down:**
   ```promql
   up{job="real-estate-hub"} == 0
   ```

## Step 9: Verify Everything Works

### Test Checklist:
- [ ] Prometheus is scraping metrics (check /targets page)
- [ ] Grafana can query Prometheus
- [ ] Dashboard shows real data
- [ ] Metrics are updating every 15 seconds
- [ ] Alerts are configured

### Generate Test Traffic:
```bash
# Generate some requests to see metrics
for i in {1..100}; do
  curl https://your-domain.vercel.app/ > /dev/null 2>&1
  sleep 0.1
done

# Check metrics updated
curl https://your-domain.vercel.app/api/metrics
```

## Step 10: Production Deployment

### For Production Use:

1. **Change Grafana Password:**
   ```bash
   docker exec -it real-estate-grafana grafana-cli admin reset-admin-password newpassword
   ```

2. **Enable HTTPS** (use Nginx reverse proxy):
   ```nginx
   server {
       listen 443 ssl;
       server_name monitoring.yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3001;
       }
   }
   ```

3. **Secure Prometheus** (add authentication):
   ```yaml
   # Add to prometheus.yml
   basic_auth_users:
     admin: $2y$10$...hashed_password...
   ```

4. **Set up persistent storage:**
   ```yaml
   # Already configured in docker-compose.monitoring.yml
   volumes:
     - prometheus-data:/prometheus
     - grafana-data:/var/lib/grafana
   ```

5. **Configure backup:**
   ```bash
   # Backup Prometheus data
   docker run --rm -v prometheus-data:/data -v $(pwd):/backup \
     alpine tar czf /backup/prometheus-backup.tar.gz /data

   # Backup Grafana data
   docker run --rm -v grafana-data:/data -v $(pwd):/backup \
     alpine tar czf /backup/grafana-backup.tar.gz /data
   ```

## Troubleshooting

### Prometheus can't reach target:
```bash
# Check if metrics endpoint is accessible
curl https://your-domain.vercel.app/api/metrics

# Check Prometheus logs
docker logs real-estate-prometheus

# Verify DNS resolution
docker exec real-estate-prometheus nslookup your-domain.vercel.app
```

### Grafana shows "No data":
```bash
# Test Prometheus from Grafana container
docker exec real-estate-grafana curl http://prometheus:9090/api/v1/query?query=up

# Check datasource configuration
# Grafana → Configuration → Data sources → Prometheus → Test
```

### Containers not starting:
```bash
# Check container logs
docker-compose -f docker-compose.monitoring.yml logs

# Restart containers
docker-compose -f docker-compose.monitoring.yml restart

# Rebuild containers
docker-compose -f docker-compose.monitoring.yml down
docker-compose -f docker-compose.monitoring.yml up -d --build
```

## Maintenance

### Update containers:
```bash
docker-compose -f docker-compose.monitoring.yml pull
docker-compose -f docker-compose.monitoring.yml up -d
```

### Stop monitoring:
```bash
docker-compose -f docker-compose.monitoring.yml down
```

### Remove all data:
```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

## Access URLs

- **Grafana Dashboard:** http://localhost:3001
- **Prometheus UI:** http://localhost:9090
- **Node Exporter Metrics:** http://localhost:9100/metrics
- **Application Metrics:** https://your-domain.vercel.app/api/metrics

## Next Steps

1. ✅ Create custom dashboards for specific metrics
2. ✅ Set up email/Slack alerts
3. ✅ Configure long-term data retention
4. ✅ Add more application-specific metrics
5. ✅ Create team dashboards
6. ✅ Set up Grafana users and permissions

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboard Gallery](https://grafana.com/grafana/dashboards/)

## Support

For issues or questions:
1. Check logs: `docker-compose -f docker-compose.monitoring.yml logs`
2. Review Prometheus targets: http://localhost:9090/targets
3. Test datasource in Grafana: Configuration → Data sources → Test
4. Verify metrics endpoint: https://your-domain.vercel.app/api/metrics
