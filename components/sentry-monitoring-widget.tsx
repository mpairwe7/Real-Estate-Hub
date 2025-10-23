"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, AlertTriangle, TrendingUp, Users, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SentryData {
  summary: {
    totalErrors: number
    uniqueUsers: number
    criticalIssues: number
    warningIssues: number
    totalIssues: number
    timeRange: string
  }
  recentIssues: Array<{
    id: string
    title: string
    level: string
    count: string
    lastSeen: string
    permalink: string
    status: string
  }>
  errorTrend: Array<{
    timestamp: string
    count: number
  }>
  lastUpdated: string
}

export function SentryMonitoringWidget() {
  const [data, setData] = useState<SentryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isMockData, setIsMockData] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/monitoring/sentry?range=24h")
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setIsMockData(result.mock || false)
        setError(result.warning || null)
      } else {
        throw new Error(result.message || "Failed to fetch data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching Sentry data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-refresh every 60 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
      case "fatal":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "secondary"
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
      case "fatal":
        return <AlertCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            System Health Dashboard
          </CardTitle>
          <CardDescription>Loading monitoring data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Monitoring Unavailable
          </CardTitle>
          <CardDescription>Unable to fetch monitoring data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <Button onClick={fetchData} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <a
              href="https://sentry.io/organizations/makerere-university-h0/projects/javascript-nextjs/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Open Sentry Dashboard
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const systemStatus =
    data.summary.criticalIssues === 0 && data.summary.totalErrors < 10
      ? { label: "Operational", color: "bg-green-500" }
      : data.summary.criticalIssues > 0
      ? { label: "Critical Issues", color: "bg-red-500" }
      : { label: "Warning", color: "bg-yellow-500" }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle className="font-serif">System Health Dashboard</CardTitle>
            {isMockData && (
              <Badge variant="outline" className="text-xs">
                Demo Mode
              </Badge>
            )}
          </div>
          <Button
            onClick={fetchData}
            variant="ghost"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <CardDescription>
          {isMockData ? (
            <>
              Demo data • Configure Sentry API token for live monitoring
              <br />
              <a 
                href="https://sentry.io/settings/account/api/auth-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs"
              >
                Generate token with project:read and org:read scopes →
              </a>
            </>
          ) : (
            <>Last 24 hours • Updated {formatTimestamp(data.lastUpdated)}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${systemStatus.color} animate-pulse`} />
            <span className="text-sm font-medium">System Status</span>
          </div>
          <span className="text-sm font-semibold">{systemStatus.label}</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">Total Errors</span>
            </div>
            <p className="text-2xl font-bold">{data.summary.totalErrors}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Affected Users</span>
            </div>
            <p className="text-2xl font-bold">{data.summary.uniqueUsers}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs">Critical</span>
            </div>
            <p className="text-2xl font-bold">{data.summary.criticalIssues}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-xs">Warnings</span>
            </div>
            <p className="text-2xl font-bold">{data.summary.warningIssues}</p>
          </div>
        </div>

        {/* Error Trend Chart */}
        {data.errorTrend.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Error Trend (24h)</h4>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.errorTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.getHours() + ":00"
                    }}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${value} errors`, "Count"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Issues */}
        {data.recentIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Issues</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.recentIssues.slice(0, 5).map((issue) => (
                <a
                  key={issue.id}
                  href={issue.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLevelColor(issue.level)} className="text-xs">
                          {getLevelIcon(issue.level)}
                          <span className="ml-1">{issue.level}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {issue.count} events
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{issue.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(issue.lastSeen)}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <a
            href="https://sentry.io/organizations/makerere-university-h0/projects/javascript-nextjs/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
              <Activity className="h-4 w-4" />
              View Full Dashboard
            </Button>
          </a>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Auto-refresh: {autoRefresh ? "On" : "Off"}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-6 text-xs"
            >
              Toggle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
