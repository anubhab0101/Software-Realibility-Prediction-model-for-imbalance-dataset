import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Network, Shield, Users, Play, Activity } from "lucide-react";
import BlockchainViz from "@/components/visualizations/blockchain-viz";
import { apiRequest } from "@/lib/queryClient";

export default function FederatedLearning() {
  const [jobName, setJobName] = useState("");
  const [minNodes, setMinNodes] = useState("3");
  const [maxRounds, setMaxRounds] = useState("10");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nodes } = useQuery({
    queryKey: ["/api/federated/nodes"],
  });

  const { data: jobs } = useQuery({
    queryKey: ["/api/federated/jobs"],
  });

  const jobMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest("POST", "/api/federated/jobs", config);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Federated learning job started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/federated/jobs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start federated learning job",
        variant: "destructive",
      });
    },
  });

  const handleStartJob = () => {
    if (!jobName) {
      toast({
        title: "Error",
        description: "Please enter a job name",
        variant: "destructive",
      });
      return;
    }

    jobMutation.mutate({
      name: jobName,
      modelType: "neural_network",
      minNodes: parseInt(minNodes),
      maxRounds: parseInt(maxRounds),
      minStake: 100, // Minimum stake required
    });
  };

  const onlineNodes = nodes?.filter((node: any) => node.status === "online") || [];
  const activeJobs = jobs?.filter((job: any) => job.status === "active") || [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Federated Learning</h1>
        <p className="text-muted-foreground">
          Blockchain-secured distributed machine learning platform
        </p>
      </div>

      {/* Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Nodes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineNodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {nodes?.length || 0} total registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {jobs?.length || 0} total jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secured</div>
            <p className="text-xs text-muted-foreground">
              Blockchain verified
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Create Federated Job
              </CardTitle>
              <CardDescription>
                Start a new blockchain-secured federated learning job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Job Name</Label>
                <Input
                  placeholder="Enter job name"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Nodes</Label>
                  <Input
                    type="number"
                    value={minNodes}
                    onChange={(e) => setMinNodes(e.target.value)}
                    min="2"
                    max="20"
                  />
                </div>

                <div>
                  <Label>Max Rounds</Label>
                  <Input
                    type="number"
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(e.target.value)}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <Button 
                onClick={handleStartJob}
                disabled={jobMutation.isPending || onlineNodes.length < parseInt(minNodes)}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {jobMutation.isPending ? "Starting..." : "Start Federated Job"}
              </Button>

              {onlineNodes.length < parseInt(minNodes) && (
                <p className="text-sm text-muted-foreground">
                  Need at least {minNodes} online nodes to start job
                </p>
              )}
            </CardContent>
          </Card>

          {/* Network Nodes */}
          <Card>
            <CardHeader>
              <CardTitle>Network Nodes</CardTitle>
              <CardDescription>
                Registered federated learning nodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nodes?.map((node: any) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        node.status === "online" ? "bg-green-500" : "bg-gray-400"
                      }`} />
                      <div>
                        <p className="font-medium text-sm">
                          Node {node.nodeId.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stake: {node.stakeAmount} • Rep: {node.reputation}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      node.status === "online" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {node.status}
                    </span>
                  </div>
                ))}
                
                {!nodes?.length && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No nodes registered yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs and Blockchain */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Federated Jobs</CardTitle>
              <CardDescription>
                Active and completed federated learning jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs?.map((job: any) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{job.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {job.modelType.replace('_', ' ').toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            job.status === 'active' 
                              ? 'bg-blue-100 text-blue-800' 
                              : job.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rounds:</span>
                          <span className="ml-2 font-medium">{job.rounds || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nodes:</span>
                          <span className="ml-2 font-medium">
                            {job.participatingNodes?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!jobs?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No federated jobs yet</p>
                    <p className="text-sm">Create your first federated learning job</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Blockchain Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BlockchainViz />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
