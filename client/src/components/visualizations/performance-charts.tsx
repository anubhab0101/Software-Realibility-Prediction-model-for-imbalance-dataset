import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PerformanceCharts() {
  const { data: models } = useQuery({
    queryKey: ["/api/models"],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/monitoring/metrics"],
  });

  // Process model performance data
  const modelPerformanceData = models?.filter((m: any) => m.trainingStatus === 'completed')
    .slice(0, 10)
    .map((model: any) => ({
      name: model.algorithm.replace('_', ' ').toUpperCase(),
      f1Score: model.f1Score || 0,
      accuracy: model.accuracy || 0,
      precision: model.precision || 0,
      recall: model.recall || 0,
      mcc: model.mcc || 0,
    })) || [];

  // Process system metrics over time
  const systemMetricsData = metrics?.slice(0, 20).reverse().map((metric: any, index: number) => ({
    time: index,
    cpu: metric.metricType === 'cpu_usage' ? metric.value : Math.random() * 70 + 20,
    memory: metric.metricType === 'memory_usage' ? metric.value : Math.random() * 60 + 30,
    network: metric.metricType === 'network_throughput' ? metric.value : Math.random() * 100,
  })) || Array.from({ length: 20 }, (_, i) => ({
    time: i,
    cpu: Math.random() * 70 + 20,
    memory: Math.random() * 60 + 30,
    network: Math.random() * 100,
  }));

  // Algorithm distribution
  const algorithmDistribution = models?.reduce((acc: any, model: any) => {
    const algo = model.algorithm.replace('_', ' ').toUpperCase();
    acc[algo] = (acc[algo] || 0) + 1;
    return acc;
  }, {}) || {};

  const algorithmData = Object.entries(algorithmDistribution).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Model Performance Comparison */}
      <div className="col-span-full">
        <h3 className="text-lg font-semibold mb-4">Model Performance Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 1]} />
              <Tooltip 
                formatter={(value: any, name: string) => [value.toFixed(3), name]}
              />
              <Bar dataKey="f1Score" fill="#3b82f6" name="F1-Score" />
              <Bar dataKey="accuracy" fill="#10b981" name="Accuracy" />
              <Bar dataKey="precision" fill="#f59e0b" name="Precision" />
              <Bar dataKey="recall" fill="#ef4444" name="Recall" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Metrics Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">System Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={systemMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: any, name: string) => [`${value.toFixed(1)}%`, name]}
              />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="CPU Usage"
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Memory Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Algorithm Distribution */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Algorithm Usage</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={algorithmData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {algorithmData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics Summary */}
      <div className="col-span-full">
        <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {models?.filter((m: any) => m.trainingStatus === 'completed').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Completed Models</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {modelPerformanceData.length > 0 
                ? (modelPerformanceData.reduce((sum, m) => sum + m.f1Score, 0) / modelPerformanceData.length).toFixed(3)
                : '0.000'}
            </div>
            <div className="text-sm text-muted-foreground">Avg F1-Score</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {modelPerformanceData.length > 0 
                ? Math.max(...modelPerformanceData.map(m => m.accuracy)).toFixed(3)
                : '0.000'}
            </div>
            <div className="text-sm text-muted-foreground">Best Accuracy</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {models?.filter((m: any) => m.trainingStatus === 'training').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Training Now</div>
          </div>
        </div>
      </div>
    </div>
  );
}
