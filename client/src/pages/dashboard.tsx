import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Brain, Database, Atom, Network, TrendingUp, Activity } from "lucide-react";
import PerformanceCharts from "@/components/visualizations/performance-charts";

export default function Dashboard() {
  const { data: healthData } = useQuery({
    queryKey: ["/api/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: datasets } = useQuery({
    queryKey: ["/api/datasets"],
  });

  const { data: models } = useQuery({
    queryKey: ["/api/models"],
  });

  const { data: quantumExperiments } = useQuery({
    queryKey: ["/api/quantum/experiments"],
  });

  const { data: federatedJobs } = useQuery({
    queryKey: ["/api/federated/jobs"],
  });

  const stats = [
    {
      name: "Datasets",
      value: datasets?.length || 0,
      icon: Database,
      description: "Uploaded datasets",
    },
    {
      name: "ML Models",
      value: models?.length || 0,
      icon: Brain,
      description: "Trained models",
    },
    {
      name: "Quantum Experiments",
      value: quantumExperiments?.length || 0,
      icon: Atom,
      description: "Quantum ML experiments",
    },
    {
      name: "Federated Jobs",
      value: federatedJobs?.length || 0,
      icon: Network,
      description: "Distributed learning jobs",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Research Dashboard</h1>
        <p className="text-muted-foreground">
          Advanced software reliability prediction research platform
        </p>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {healthData?.services && Object.entries(healthData.services).map(([service, status]) => (
              <div key={service} className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  status ? "bg-green-500" : "bg-red-500"
                }`} />
                <p className="text-sm font-medium capitalize">{service}</p>
                <p className="text-xs text-muted-foreground">
                  {status ? "Healthy" : "Error"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Real-time system performance and model metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceCharts />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Models</CardTitle>
          </CardHeader>
          <CardContent>
            {models?.slice(0, 5).map((model: any) => (
              <div key={model.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{model.name}</p>
                  <p className="text-sm text-muted-foreground">{model.algorithm}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {model.f1Score ? `F1: ${model.f1Score.toFixed(3)}` : model.trainingStatus}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum Experiments</CardTitle>
          </CardHeader>
          <CardContent>
            {quantumExperiments?.slice(0, 5).map((experiment: any) => (
              <div key={experiment.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{experiment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {experiment.qubits} qubits • {experiment.algorithm}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">{experiment.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
