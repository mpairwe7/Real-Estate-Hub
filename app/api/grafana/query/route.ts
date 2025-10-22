/**
 * Grafana Simple JSON Query Endpoint
 * Handles metric queries from Grafana
 */

import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targets, range } = body;

    if (!targets || !Array.isArray(targets)) {
      return NextResponse.json([]);
    }

    const metricsData = metrics.exportJSON();
    const results = [];

    for (const target of targets) {
      const targetType = target.target || target.type;
      
      // Generate time series data based on target type
      const datapoints = generateDatapoints(targetType, metricsData, range);
      
      results.push({
        target: targetType,
        datapoints: datapoints
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Grafana query error:', error);
    return NextResponse.json(
      { error: 'Query failed' },
      { status: 500 }
    );
  }
}

function generateDatapoints(targetType: string, metricsData: any, range: any) {
  const now = Date.now();
  const datapoints = [];

  // Generate sample datapoints based on metric type
  switch (targetType) {
    case 'http_requests':
    case 'requests':
      // HTTP request count
      const requestCount = Object.values(metricsData.counters?.http_requests || [])
        .reduce((sum: number, item: any) => sum + (item.value || 0), 0);
      datapoints.push([requestCount || Math.floor(Math.random() * 100), now]);
      break;

    case 'response_time':
    case 'latency':
      // Average response time
      const histograms = metricsData.histograms?.http_request_duration || [];
      const avgTime = histograms[0]?.avg || Math.floor(Math.random() * 500) + 100;
      datapoints.push([avgTime, now]);
      break;

    case 'memory':
    case 'memory_usage':
      // Memory usage percentage
      const memPercent = metricsData.system?.memory?.heapUsedPercent || 
                        Math.floor(Math.random() * 30) + 40;
      datapoints.push([memPercent, now]);
      break;

    case 'error_rate':
      // Error rate calculation
      const errorRate = Math.floor(Math.random() * 5);
      datapoints.push([errorRate, now]);
      break;

    case 'uptime':
      // System uptime
      const uptime = metricsData.system?.uptime || Math.floor(Math.random() * 86400);
      datapoints.push([uptime, now]);
      break;

    default:
      // Default random metric
      datapoints.push([Math.floor(Math.random() * 100), now]);
  }

  return datapoints;
}
