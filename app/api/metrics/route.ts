/**
 * Prometheus Metrics Endpoint
 * Exposes application metrics in Prometheus format
 * Endpoint: /api/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Generate Prometheus format metrics
    const metricsOutput = metrics.exportMetrics();

    // Return metrics in Prometheus text format
    return new NextResponse(metricsOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('Error generating metrics', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
