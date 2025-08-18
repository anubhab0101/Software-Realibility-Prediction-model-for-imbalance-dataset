import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Activity, Cpu, Database, Network, AlertTriangle, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useWebSocket } from "@/lib/websocket";

export default function Monitoring() {
  const [realTimeMetrics, setRealTimeMetrics] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  // WebSocket connection for real-time updates
  const { lastMessage, connectionStatus } = useWebSocket({
    url: `ws://${window.location.host}`,
    onMessage: (message) => {
      const data = JSON.parse(message);
      if (data.type === 'monitoring_metric') {
        setRealTimeMetrics(prev => [data.metric, ...prev.slice(0, 49)]); // Keep last 50 metrics
      } else if (data.type === 'system_alert') {
        setSystemAlerts(prev => [data.alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      }
    }
  });

  const { data: healthData } = useQuery({
    queryKey: ["/api/health"],
    refetchInterval: 10000,
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/monitoring/metrics"],
    refetchInterval: 30000,
  });

  const { data: models } = useQuery({
    queryKey: ["/api/models"],
    refetchInterval: 60000,
  });

  const { data: quantumExperiments } = useQuery({
    queryKey: ["/api/quantum/experiments"],
    refetchInterval: 30000,
  });

  const { data: federatedJobs } = useQuery({
    queryKey: ["/api/federated/jobs"],
    refetchInterval: 30000,
  });

  // Process metrics for visualization
  const processedMetrics = metrics?.slice(0, 20).reverse() || [];
  const cpuMetrics = processedMetrics.filter((m: any) => m.metricType === 'cpu_usage');
  const memoryMetrics = processedMetrics.filter((m: any) => m.metricType === 'memory_usage');
  const networkMetrics = processedMetrics.filter((m: any) => m.metricType === 'network_throughput');

  // System overview stats
  const activeModels = models?.filter((m: any) => m.trainingStatus === 'training')?.length || 0;
  const activeQuantumExperiments = quantumExperiments?.filter((e: any) => e.status === 'running')?.length || 0;
  const activeFederatedJobs = federatedJobs?.filter((j: any) => j.status === 'active')?.length || 0;

  const systemStats = [
    {
      name: "Active Models",
      value: activeModels,
      icon: Database,
      status: activeModels > 0 ? "active" : "idle",
    },
    {
      name: "Quantum Experiments",
      value: activeQuantumExperiments,
      icon: Cpu,
      status: activeQuantumExperiments > 0 ? "active" : "idle",
    },
    {
      name: "Federated Jobs",
      value: activeFederatedJobs,
      icon: Network,
      status: activeFederatedJobs > 0 ? "active" : "idle",
    },
    {
      name: "System Health",
      value: healthData?.services ? Object.values(healthData.services).filter(Boolean).length : 0,
      icon: Activity,
      status: healthData?.status === "healthy" ? "healthy" : "warning",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of distributed ML systems and infrastructure
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Connection
            <span className={`ml-2 w-2 h-2 rounded-full ${
              connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            WebSocket Status: <span className="font-medium">{connectionStatus}</span>
          </p>
          {lastMessage && (
            <p className="text-xs text-muted-foreground mt-2">
              Last Update: {new Date().toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                {stat.status === "healthy" || stat.status === "active" ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                )}
                <p className="text-xs text-muted-foreground capitalize">{stat.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage</CardTitle>
            <CardDescription>System CPU utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cpuMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: any) => [`${value}%`, 'CPU Usage']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>System memory utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memoryMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: any) => [`${value}%`, 'Memory Usage']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Health and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Health</CardTitle>
            <CardDescription>Status of all system services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthData?.services && Object.entries(healthData.services).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span className="font-medium capitalize">{service}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    status 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {status ? "Healthy" : "Error"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Recent system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.length > 0 ? (
                systemAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No alerts</p>
                  <p className="text-xs">System running smoothly</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics Stream */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Metrics Stream</CardTitle>
          <CardDescription>Live metrics from distributed systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {realTimeMetrics.length > 0 ? (
              realTimeMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                  <span className="font-medium">{metric.source}</span>
                  <span className="text-muted-foreground">{metric.metricType}</span>
                  <span className="font-mono">{metric.value}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for real-time metrics...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
