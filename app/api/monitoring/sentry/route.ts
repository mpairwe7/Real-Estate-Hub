import { NextRequest, NextResponse } from "next/server"

const SENTRY_ORG = process.env.SENTRY_ORG || "makerere-university-h0"
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || "javascript-nextjs"
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN

interface SentryIssue {
  id: string
  title: string
  culprit: string
  level: string
  count: string
  userCount: number
  lastSeen: string
  firstSeen: string
  status: string
  permalink: string
}

interface SentryStats {
  interval: string
  data: [number, number][]
}

export async function GET(request: NextRequest) {
  try {
    if (!SENTRY_AUTH_TOKEN) {
      return NextResponse.json(
        { error: "Sentry auth token not configured" },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get("range") || "24h"

    // Fetch recent issues
    const issuesResponse = await fetch(
      `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?statsPeriod=${timeRange}&query=is:unresolved`,
      {
        headers: {
          Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    if (!issuesResponse.ok) {
      throw new Error(`Sentry API error: ${issuesResponse.status}`)
    }

    const issues: SentryIssue[] = await issuesResponse.json()

    // Fetch project stats
    const statsResponse = await fetch(
      `https://sentry.io/api/0/organizations/${SENTRY_ORG}/stats_v2/?statsPeriod=${timeRange}&interval=1h&field=sum(quantity)&groupBy=category&category=error`,
      {
        headers: {
          Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        },
        next: { revalidate: 60 },
      }
    )

    let stats: SentryStats | null = null
    if (statsResponse.ok) {
      const statsData = await statsResponse.json()
      stats = statsData
    }

    // Calculate aggregated metrics
    const totalErrors = issues.reduce((sum, issue) => sum + parseInt(issue.count || "0"), 0)
    const uniqueUsers = issues.reduce((sum, issue) => sum + (issue.userCount || 0), 0)
    const criticalIssues = issues.filter((issue) => issue.level === "error" || issue.level === "fatal").length
    const warningIssues = issues.filter((issue) => issue.level === "warning").length

    // Get recent issues (limit to 10)
    const recentIssues = issues.slice(0, 10).map((issue) => ({
      id: issue.id,
      title: issue.title,
      level: issue.level,
      count: issue.count,
      lastSeen: issue.lastSeen,
      permalink: issue.permalink,
      status: issue.status,
    }))

    // Prepare error trend data
    const errorTrend = stats?.data?.map(([timestamp, count]) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      count,
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalErrors,
          uniqueUsers,
          criticalIssues,
          warningIssues,
          totalIssues: issues.length,
          timeRange,
        },
        recentIssues,
        errorTrend,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error fetching Sentry data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch Sentry data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
