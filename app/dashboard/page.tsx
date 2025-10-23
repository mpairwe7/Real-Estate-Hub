import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Wrench, DollarSign, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"

export default async function DashboardPage() {
  const t = await getTranslations("dashboard")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch statistics
  const { count: propertiesCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id)

  const { count: maintenanceCount } = await supabase
    .from("maintenance_requests")
    .select("*", { count: "exact", head: true })
    .eq("requester_id", user.id)

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("status", "completed")

  const totalRevenue =
    transactions?.reduce((sum, t) => sum + Number.parseFloat(t.amount.toString()), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">
            {t("welcome", { name: profile?.full_name || t("user") })}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("stats.totalProperties")}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{propertiesCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("stats.activeListings")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.maintenanceRequests")}
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{maintenanceCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("stats.totalRequests")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("stats.totalRevenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("stats.completedTransactions")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("stats.growth")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground mt-1">{t("stats.fromLastMonth")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">{t("quickActions.title")}</CardTitle>
              <CardDescription>{t("quickActions.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/properties/add" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Building2 className="h-4 w-4" />
                  {t("quickActions.addProperty")}
                </Button>
              </Link>
              <Link href="/maintenance" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Wrench className="h-4 w-4" />
                  {t("quickActions.requestMaintenance")}
                </Button>
              </Link>
              <Link href="/properties" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Building2 className="h-4 w-4" />
                  {t("quickActions.viewProperties")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">{t("accountType.title")}</CardTitle>
              <CardDescription>{t("accountType.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold capitalize text-lg">
                    {profile?.user_type || t("user")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("accountType.memberSince", {
                      date: new Date(profile?.created_at || "").toLocaleDateString(),
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Monitoring
              </CardTitle>
              <CardDescription>View app performance and error tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">System Status</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Operational</span>
              </div>
              
              <a
                href="https://sentry.io/organizations/makerere-university-h0/projects/javascript-nextjs/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Activity className="h-4 w-4" />
                  View Monitoring Dashboard
                </Button>
              </a>

              <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Errors (24h):</span>
                  <span className="font-medium">Monitor Live</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance:</span>
                  <span className="font-medium">Track Real-time</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
