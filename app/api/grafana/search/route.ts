/**
 * Grafana Simple JSON Search Endpoint
 * Returns available metrics that can be queried
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Return list of available metrics
    const metrics = [
      { text: 'HTTP Requests', value: 'http_requests' },
      { text: 'Response Time (ms)', value: 'response_time' },
      { text: 'Memory Usage (%)', value: 'memory_usage' },
      { text: 'Error Rate (%)', value: 'error_rate' },
      { text: 'System Uptime (s)', value: 'uptime' },
      { text: 'Active Connections', value: 'active_connections' },
      { text: 'CPU Usage (%)', value: 'cpu_usage' },
      { text: 'Request Latency (ms)', value: 'latency' }
    ];

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Grafana search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
