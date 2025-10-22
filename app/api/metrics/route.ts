/**
 * Grafana Metrics Endpoint
 * Exposes application metrics in JSON format for Grafana
 * Endpoint: /api/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get format from query parameter (default: json)
    const format = request.nextUrl.searchParams.get('format') || 'json';

    if (format === 'prometheus') {
      // Return Prometheus text format
      const metricsOutput = metrics.exportMetrics();
      return new NextResponse(metricsOutput, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Return JSON format for Grafana
    const jsonMetrics = metrics.exportJSON();
    
    return NextResponse.json(jsonMetrics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Error generating metrics' },
      { status: 500 }
    );
  }
}
