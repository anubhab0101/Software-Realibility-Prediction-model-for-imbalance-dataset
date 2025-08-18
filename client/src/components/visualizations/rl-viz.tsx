import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface RLVizProps {
  agents?: any[];
}

export default function RLViz({ agents = [] }: RLVizProps) {
  // Generate sample training progress data for visualization
  const generateTrainingData = (agent: any) => {
    if (!agent.trainingProgress) return [];
    
    const episodes = agent.trainingProgress.episodes || 100;
    const data = [];
    
    for (let i = 0; i < Math.min(episodes, 50); i++) {
      data.push({
        episode: i,
        reward: Math.sin(i * 0.1) * 50 + Math.random() * 20 + i * 2,
        loss: Math.exp(-i * 0.05) * 100 + Math.random() * 10,
        epsilon: Math.max(0.01, 1 - i * 0.02),
      });
    }
    
    return data;
  };

  const activeAgent = agents.find(agent => agent.status === 'training') || agents[0];
  const trainingData = activeAgent ? generateTrainingData(activeAgent) : [];

  return (
    <div className="space-y-6">
      {/* Training Progress Chart */}
      <div className="h-64">
        <h4 className="text-sm font-medium mb-4">Training Progress</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trainingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="episode" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="reward" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Reward"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32">
          <h4 className="text-sm font-medium mb-2">Loss Function</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="episode" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="loss" 
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.3}
                name="Loss"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-32">
          <h4 className="text-sm font-medium mb-2">Exploration Rate (ε)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="episode" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="epsilon" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Epsilon"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {agents.filter(a => a.status === 'training').length}
          </div>
          <div className="text-muted-foreground">Active Agents</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {agents.filter(a => a.status === 'completed').length}
          </div>
          <div className="text-muted-foreground">Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {activeAgent ? activeAgent.algorithm.toUpperCase() : 'N/A'}
          </div>
          <div className="text-muted-foreground">Algorithm</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {activeAgent?.performance?.avgReward?.toFixed(2) || 'N/A'}
          </div>
          <div className="text-muted-foreground">Avg Reward</div>
        </div>
      </div>

      {/* Algorithm Performance Comparison */}
      {agents.length > 1 && (
        <div>
          <h4 className="text-sm font-medium mb-4">Algorithm Comparison</h4>
          <div className="space-y-2">
            {agents.slice(0, 5).map((agent, index) => {
              const performance = agent.performance?.avgReward || 0;
              const maxPerformance = Math.max(...agents.map(a => a.performance?.avgReward || 0));
              const percentage = maxPerformance > 0 ? (performance / maxPerformance) * 100 : 0;
              
              return (
                <div key={agent.id} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium truncate">
                    {agent.algorithm.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-xs text-right">
                    {performance.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
