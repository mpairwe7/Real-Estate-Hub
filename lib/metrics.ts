/**
 * Prometheus Metrics Exporter for Next.js
 * Collects and exposes application metrics in Prometheus format
 */

import { NextRequest, NextResponse } from 'next/server';

// Metrics storage
interface Metric {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface MetricsStore {
  [key: string]: Metric[];
}

class PrometheusMetrics {
  private metrics: MetricsStore = {};
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  /**
   * Set a gauge metric
   */
  setGauge(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * Record a histogram value
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
  }

  /**
   * Generate Prometheus format output
   */
  exportMetrics(): string {
    let output = '';

    // Export counters
    output += '# HELP http_requests_total Total number of HTTP requests\n';
    output += '# TYPE http_requests_total counter\n';
    this.counters.forEach((value, key) => {
      output += `http_requests_total{${this.formatLabels(key)}} ${value}\n`;
    });

    // Export gauges
    output += '\n# HELP active_connections Current number of active connections\n';
    output += '# TYPE active_connections gauge\n';
    this.gauges.forEach((value, key) => {
      output += `active_connections{${this.formatLabels(key)}} ${value}\n`;
    });

    // Export histograms
    output += '\n# HELP http_request_duration_ms HTTP request duration in milliseconds\n';
    output += '# TYPE http_request_duration_ms histogram\n';
    this.histograms.forEach((values, key) => {
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      const avg = count > 0 ? sum / count : 0;
      
      output += `http_request_duration_ms_sum{${this.formatLabels(key)}} ${sum}\n`;
      output += `http_request_duration_ms_count{${this.formatLabels(key)}} ${count}\n`;
      output += `http_request_duration_ms_avg{${this.formatLabels(key)}} ${avg}\n`;
    });

    // Add Node.js process metrics
    output += '\n# HELP nodejs_memory_usage_bytes Node.js memory usage\n';
    output += '# TYPE nodejs_memory_usage_bytes gauge\n';
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      output += `nodejs_memory_usage_bytes{type="rss"} ${mem.rss}\n`;
      output += `nodejs_memory_usage_bytes{type="heapTotal"} ${mem.heapTotal}\n`;
      output += `nodejs_memory_usage_bytes{type="heapUsed"} ${mem.heapUsed}\n`;
      output += `nodejs_memory_usage_bytes{type="external"} ${mem.external}\n`;
    }

    // Add uptime
    output += '\n# HELP process_uptime_seconds Process uptime in seconds\n';
    output += '# TYPE process_uptime_seconds gauge\n';
    if (typeof process !== 'undefined' && process.uptime) {
      output += `process_uptime_seconds ${process.uptime()}\n`;
    }

    return output;
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  private formatLabels(key: string): string {
    const match = key.match(/\{(.+)\}/);
    return match ? match[1] : '';
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

// Singleton instance
export const metrics = new PrometheusMetrics();

// Middleware to track HTTP requests
export function trackRequest(req: NextRequest, startTime: number, statusCode: number) {
  const duration = Date.now() - startTime;
  const method = req.method;
  const path = req.nextUrl.pathname;

  // Increment request counter
  metrics.incrementCounter('http_requests', 1, {
    method,
    path,
    status: statusCode.toString(),
  });

  // Record duration
  metrics.recordHistogram('http_request_duration', duration, {
    method,
    path,
  });
}

// Helper to track custom metrics
export function trackMetric(
  type: 'counter' | 'gauge' | 'histogram',
  name: string,
  value: number,
  labels?: Record<string, string>
) {
  switch (type) {
    case 'counter':
      metrics.incrementCounter(name, value, labels);
      break;
    case 'gauge':
      metrics.setGauge(name, value, labels);
      break;
    case 'histogram':
      metrics.recordHistogram(name, value, labels);
      break;
  }
}
