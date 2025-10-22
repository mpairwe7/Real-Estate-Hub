/**
 * Grafana Simple JSON Datasource Endpoint
 * Implements the Simple JSON datasource protocol for Grafana
 * https://grafana.com/grafana/plugins/grafana-simple-json-datasource/
 */

import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Root endpoint - Health check for datasource
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Simple JSON datasource is running' });
}

/**
 * POST / - Test datasource connectivity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Return success for connectivity test
    return NextResponse.json({ 
      status: 'success',
      message: 'Data source is working'
    });
  } catch (error) {
    console.error('Grafana datasource error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Data source connection failed' },
      { status: 500 }
    );
  }
}
