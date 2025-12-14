import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Activity,
  Upload,
  History,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  FileHeart
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

const quickActions = [
  { title: "Upload Patient Data", href: "/dashboard/upload", icon: Upload, color: "bg-primary/10 text-primary" },
  { title: "View Reports", href: "/dashboard/history", icon: History, color: "bg-risk-moderate/10 text-risk-moderate" }
];

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardStats();
  
  const stats = data?.stats || {
    totalReports: 0,
    highRisk: 0,
    moderateRisk: 0,
    lowRisk: 0,
    totalPatients: 0,
  };
  
  const latest = data?.latestReport || null;
  const email = localStorage.getItem("email");

  if (isLoading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-destructive">{error.message}</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {email}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Analyses */}
        <StatCard
          title="Total Analyses"
          value={stats.totalReports}
          change="+100%"
          icon={BarChart3}
          trend="up"
          index={0}
        />

        {/* High Risk Cases */}
        <StatCard
          title="High Risk Cases"
          value={stats.highRisk}
          change="+5%"
          icon={AlertTriangle}
          trend="up"
          variant="danger"
          index={1}
        />

        {/* Pending Review */}
        <StatCard
          title="Moderate Risk Cases"
          value={stats.moderateRisk}
          change="-2%"
          icon={Clock}
          trend="down"
          index={2}
        />

        {/* Patients Count */}
        <StatCard
          title="Patients"
          value={stats.totalPatients}
          change="+10"
          icon={Users}
          trend="up"
          index={3}
        />
      </div>

      {/* Latest Analysis Summary */}
      {latest && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6">

          <Card variant="glass" className="lg:col-span-2 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                Latest Analysis Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 gap-6">

                {/* Risk Gauge */}
                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" strokeWidth="8" className="text-muted" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${latest.riskScore * 2.51} 251`}
                        className={`text-risk-${latest.riskLevel}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{latest.riskScore}</span>
                      <span className="text-sm text-muted-foreground">Risk Score</span>
                    </div>
                  </div>
                  <Badge variant={`risk-${latest.riskLevel}`} className="mt-4">
                    {latest.riskLevel.toUpperCase()}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <InfoBox label="Patient ID" value={`#${latest.patientId}`} />
                  <InfoBox label="Patient Name" value={latest.name || 'N/A'} />
                  <InfoBox label="Confidence" value={`${latest.confidence}%`} />
                  <InfoBox label="Predicted Class" value={latest.predictedClass} />

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/history">
                      View Full Report <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <QuickActions />

        </motion.div>
      )}

      {/* Recent Analyses Preview */}
      <RecentReports />

    </div>
  );
}

/* ------------------------- COMPONENTS ------------------------- */

const StatCard = ({ title, value, change, icon: Icon, trend, variant, index }: any) => (
  <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}>
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-sm mt-1 ${trend === "up" ? "text-risk-low" : "text-muted-foreground"}`}>
            {change} this month
          </p>
        </div>

        <div className={`p-3 rounded-xl ${variant === "danger" ? "bg-risk-high/10" : "bg-primary/10"}`}>
          <Icon className={`w-5 h-5 ${variant === "danger" ? "text-risk-high" : "text-primary"}`} />
        </div>
      </div>
    </Card>
  </motion.div>
);

const InfoBox = ({ label, value }: any) => (
  <div className="p-4 bg-muted/30 rounded-xl">
    <p className="text-sm text-muted-foreground mb-1">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

const QuickActions = () => (
  <Card variant="glass">
    <CardHeader className="bg-muted/30 border-b border-border/50">
      <CardTitle className="text-lg">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent className="p-4 space-y-3">
      {quickActions.map((action) => (
        <Link
          key={action.title}
          to={action.href}
          className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group"
        >
          <div className={`p-3 rounded-xl ${action.color}`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="font-medium flex-1">{action.title}</span>
          <ArrowRight className="w-4 h-4 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </Link>
      ))}
    </CardContent>
  </Card>
);

const RecentReports = () => (
  <Card variant="glass">
    <CardHeader className="border-b border-border/50 bg-muted/30 flex justify-between">
      <CardTitle className="text-lg">Recent Analyses</CardTitle>
      <Button variant="ghost" size="sm" asChild>
        <Link to="/dashboard/history">View All <ArrowRight className="w-4 h-4" /></Link>
      </Button>
    </CardHeader>
    <CardContent className="p-4 text-muted-foreground">
      Latest reports appear here automatically.
    </CardContent>
  </Card>
);
