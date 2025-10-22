# Grafana Monitoring Setup Guide

## Overview

This guide explains how to set up Grafana for monitoring and performance tracking of the Real Estate Hub application using **Podman** instead of Docker.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Real Estate Hub                          │
│                   (Next.js on Vercel)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /api/metrics Endpoint (JSON Format)                │   │
│  │  - HTTP request metrics                             │   │
│  │  - Response times                                   │   │
│  │  - Error rates                                      │   │
│  │  - Memory usage                                     │   │
│  │  - System uptime                                    │   │
│  └──────────────────┬──────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      │ HTTPS (JSON)
                      │
                      ▼
        ┌─────────────────────────────┐
        │       Grafana               │
        │   (Port 3001)               │
        │                             │
        │  - Data visualization       │
        │  - Custom dashboards        │
        │  - Real-time monitoring     │
        │  - Alerts & notifications   │
        └─────────────────────────────┘
```

## Prerequisites

### 1. Install Podman

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y podman podman-compose
```

**Fedora/RHEL:**
```bash
sudo dnf install -y podman podman-compose
```

**Verify installation:**
```bash
podman --version
podman-compose --version
```

## Quick Start (5 Minutes)

### Step 1: Start Grafana with Podman

```bash
# Navigate to project directory
cd /home/darkhorse/Documents/real-estate-app

# Start Grafana using podman-compose
podman-compose -f docker-compose.monitoring.yml up -d

# Verify container is running
podman ps
```

**Expected output:**
```
CONTAINER ID  IMAGE                           COMMAND     CREATED         STATUS         PORTS                   NAMES
abc123def456  docker.io/grafana/grafana:latest            10 seconds ago  Up 10 seconds  0.0.0.0:3001->3000/tcp  real-estate-grafana
```

### Step 2: Access Grafana

1. Open browser: **http://localhost:3001**
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. **Important:** Change password on first login!

### Step 3: Verify Data Source

1. Go to **Configuration** → **Data Sources**
2. You should see: **Real Estate Hub API** (already configured)
3. Click **Test** to verify connection

### Step 4: View Dashboard

1. Go to **Dashboards** → **Browse**
2. Open **Real Estate Hub - Performance Dashboard**
3. View real-time metrics!

## Metrics Endpoint

The application exposes metrics at:
- **URL:** `https://real-estate-nwp6a86sm-mpairwe-laubens-projects.vercel.app/api/metrics`
- **Format:** JSON
- **Refresh:** Real-time (updates every 15 seconds)

### Available Metrics

#### 1. HTTP Request Metrics
```json
{
  "counters": {
    "http_requests": [
      {
        "value": 1523,
        "labels": {
          "method": "GET",
          "path": "/browse",
          "status": "200"
        }
      }
    ]
  }
}
```

#### 2. Response Time Metrics
```json
{
  "histograms": {
    "http_request_duration": [
      {
        "sum": 45230,
        "count": 156,
        "avg": 290.06,
        "min": 45,
        "max": 1250,
        "labels": {
          "method": "GET",
          "path": "/api/properties"
        }
      }
    ]
  }
}
```

#### 3. System Metrics
```json
{
  "system": {
    "memory": {
      "rss": 157286400,
      "heapTotal": 67108864,
      "heapUsed": 42356720,
      "external": 1234567,
      "heapUsedPercent": 63.12
    },
    "uptime": 3456.78
  }
}
```

## Creating Custom Dashboards

### Method 1: Import Pre-built Dashboard

1. Click **+** → **Import**
2. Upload `grafana/dashboards/real-estate-hub.json`
3. Select **Real Estate Hub API** as data source
4. Click **Import**

### Method 2: Create Custom Dashboard

1. Click **+** → **Dashboard**
2. Click **Add new panel**
3. Configure query:
   - **Data source:** Real Estate Hub API
   - **Metric:** Choose from dropdown
   - **Visualization:** Line chart, gauge, pie chart, etc.

### Example Panels

#### Panel 1: Total Requests
- **Type:** Stat
- **Query:** `counters.http_requests[0].value`
- **Display:** Total number with trend

#### Panel 2: Average Response Time
- **Type:** Gauge
- **Query:** `histograms.http_request_duration[0].avg`
- **Unit:** Milliseconds (ms)
- **Thresholds:**
  - Green: 0-500ms
  - Yellow: 500-1000ms
  - Red: >1000ms

#### Panel 3: Memory Usage
- **Type:** Time series
- **Query:** `system.memory.heapUsedPercent`
- **Unit:** Percent (%)
- **Thresholds:**
  - Green: 0-70%
  - Yellow: 70-85%
  - Red: >85%

#### Panel 4: Error Rate
- **Type:** Stat
- **Query:** Filter requests where `status >= 500`
- **Display:** Percentage

## Monitoring Best Practices

### 1. Key Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response Time (avg) | <500ms | >1000ms |
| Error Rate | <1% | >5% |
| Memory Usage | <70% | >85% |
| Request Success Rate | >99% | <95% |

### 2. Alert Configuration

Create alerts for critical thresholds:

1. Go to **Alerting** → **Alert Rules**
2. Click **New alert rule**
3. Configure:
   - **Name:** High Response Time
   - **Condition:** `avg(response_time) > 1000`
   - **Duration:** 5 minutes
   - **Action:** Email, Slack, or webhook

### 3. Dashboard Organization

Organize dashboards by:
- **Overview Dashboard:** High-level metrics
- **Performance Dashboard:** Response times, throughput
- **Error Dashboard:** Error rates, failed requests
- **System Dashboard:** Memory, CPU, uptime

## Podman Commands

### Container Management

```bash
# Start Grafana
podman-compose -f docker-compose.monitoring.yml up -d

# Stop Grafana
podman-compose -f docker-compose.monitoring.yml down

# View logs
podman logs real-estate-grafana

# Follow logs (real-time)
podman logs -f real-estate-grafana

# Restart Grafana
podman restart real-estate-grafana

# Check status
podman ps
```

### Data Management

```bash
# View volumes
podman volume ls

# Backup Grafana data
podman volume export grafana-data > grafana-backup.tar

# Restore Grafana data
podman volume import grafana-data < grafana-backup.tar

# Remove all data (WARNING: Deletes dashboards!)
podman-compose -f docker-compose.monitoring.yml down -v
```

### Troubleshooting

```bash
# Check container logs
podman logs real-estate-grafana

# Inspect container
podman inspect real-estate-grafana

# Check network
podman network ls
podman network inspect monitoring

# Restart with fresh data
podman-compose -f docker-compose.monitoring.yml down -v
podman-compose -f docker-compose.monitoring.yml up -d
```

## Performance Optimization

### 1. Grafana Settings

Edit `docker-compose.monitoring.yml`:

```yaml
environment:
  # Increase query timeout
  - GF_DATAPROXY_TIMEOUT=300
  
  # Enable caching
  - GF_RENDERING_SERVER_URL=http://renderer:8081/render
  
  # Optimize performance
  - GF_ANALYTICS_REPORTING_ENABLED=false
  - GF_ANALYTICS_CHECK_FOR_UPDATES=false
```

### 2. Dashboard Refresh Rates

- **Overview:** 30 seconds
- **Performance:** 15 seconds  
- **Real-time:** 5 seconds (use sparingly)

### 3. Data Retention

Configure in `docker-compose.monitoring.yml`:
```yaml
volumes:
  grafana-data:
    driver: local
    driver_opts:
      type: tmpfs  # For temporary data
      device: tmpfs
```

## Security Best Practices

### 1. Change Default Password

```bash
# Login to Grafana UI
# Go to Profile → Change Password
# Use strong password (16+ characters)
```

### 2. Enable HTTPS (Production)

Add reverse proxy (Nginx/Caddy):
```nginx
server {
    listen 443 ssl;
    server_name grafana.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
    }
}
```

### 3. Restrict Access

```yaml
environment:
  # Disable anonymous access
  - GF_AUTH_ANONYMOUS_ENABLED=false
  
  # Require login
  - GF_AUTH_DISABLE_LOGIN_FORM=false
```

## Integration with Week 4 Tasks

### ✅ Monitoring Tool Integration
- **Requirement:** Integrate Grafana for performance tracking
- **Status:** ✅ Complete
- **Features:**
  - Real-time metrics visualization
  - Custom dashboards
  - Performance tracking
  - Alert capabilities

### ✅ Performance Metrics
- **HTTP Requests:** Count, rate, status codes
- **Response Times:** Min, max, avg, percentiles
- **System Health:** Memory, CPU, uptime
- **Error Tracking:** Error rates, failed requests

### ✅ Production Ready
- **Container:** Podman-based (rootless, secure)
- **Persistence:** Volume-backed data
- **Auto-restart:** Container restarts on failure
- **Health checks:** Built-in monitoring

## Verification Checklist

- [ ] Podman installed and running
- [ ] Grafana container started (`podman ps`)
- [ ] Access Grafana UI (http://localhost:3001)
- [ ] Password changed from default
- [ ] Data source connected and tested
- [ ] Dashboard displaying metrics
- [ ] Alerts configured (optional)

## Access URLs

- **Grafana UI:** http://localhost:3001
- **Metrics Endpoint:** https://real-estate-nwp6a86sm-mpairwe-laubens-projects.vercel.app/api/metrics
- **Documentation:** `/docs/GRAFANA-MONITORING-SETUP.md`

## Support

For issues or questions:
1. Check container logs: `podman logs real-estate-grafana`
2. Verify metrics endpoint: `curl https://your-domain.vercel.app/api/metrics`
3. Review Grafana documentation: https://grafana.com/docs

---

**Last Updated:** October 23, 2025  
**Week 4 Status:** ✅ Complete - Grafana monitoring active
