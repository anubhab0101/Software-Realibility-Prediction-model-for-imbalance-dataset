import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Atom, Play, Zap, Activity } from "lucide-react";
import QuantumViz from "@/components/visualizations/quantum-viz";
import { apiRequest } from "@/lib/queryClient";

const QUANTUM_ALGORITHMS = [
  { value: "qaoa", label: "Quantum Approximate Optimization Algorithm (QAOA)" },
  { value: "vqe", label: "Variational Quantum Eigensolver (VQE)" },
  { value: "qsvm", label: "Quantum Support Vector Machine" },
  { value: "qnn", label: "Quantum Neural Network" },
];

export default function QuantumLab() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
  const [qubits, setQubits] = useState("4");
  const [experimentName, setExperimentName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: experiments } = useQuery({
    queryKey: ["/api/quantum/experiments"],
  });

  const experimentMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest("POST", "/api/quantum/experiments", config);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quantum experiment started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quantum/experiments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start quantum experiment",
        variant: "destructive",
      });
    },
  });

  const handleRunExperiment = () => {
    if (!selectedAlgorithm || !experimentName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    experimentMutation.mutate({
      name: experimentName,
      algorithm: selectedAlgorithm,
      qubits: parseInt(qubits),
      circuits: {
        depth: 3,
        layers: 2,
      },
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quantum Laboratory</h1>
        <p className="text-muted-foreground">
          Quantum machine learning experiments for enhanced optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Experiment Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Atom className="h-5 w-5" />
                Quantum Experiment Setup
              </CardTitle>
              <CardDescription>
                Configure quantum circuit parameters and algorithms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Experiment Name</Label>
                <Input
                  placeholder="Enter experiment name"
                  value={experimentName}
                  onChange={(e) => setExperimentName(e.target.value)}
                />
              </div>

              <div>
                <Label>Quantum Algorithm</Label>
                <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantum algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUANTUM_ALGORITHMS.map((algo) => (
                      <SelectItem key={algo.value} value={algo.value}>
                        {algo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Qubits</Label>
                <Select value={qubits} onValueChange={setQubits}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select qubit count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Qubits</SelectItem>
                    <SelectItem value="4">4 Qubits</SelectItem>
                    <SelectItem value="8">8 Qubits</SelectItem>
                    <SelectItem value="16">16 Qubits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleRunExperiment}
                disabled={experimentMutation.isPending}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {experimentMutation.isPending ? "Running..." : "Run Experiment"}
              </Button>
            </CardContent>
          </Card>

          {/* Quantum Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Quantum Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Quantum Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Enhanced optimization for complex ML problems
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Circuit Simulation</h4>
                  <p className="text-sm text-muted-foreground">
                    Real quantum circuit simulation and visualization
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Atom className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Hybrid Algorithms</h4>
                  <p className="text-sm text-muted-foreground">
                    Classical-quantum hybrid optimization methods
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experiment Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Experiments</CardTitle>
              <CardDescription>
                View quantum experiment results and visualizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experiments?.map((experiment: any) => (
                  <div
                    key={experiment.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{experiment.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {experiment.algorithm.toUpperCase()} • {experiment.qubits} qubits
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            experiment.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : experiment.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {experiment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {experiment.status === 'completed' && experiment.results && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Execution Time:</span>
                            <span className="ml-2 font-medium">
                              {experiment.executionTime?.toFixed(2)}s
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Optimization:</span>
                            <span className="ml-2 font-medium">
                              {experiment.results.improvement || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {!experiments?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Atom className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No quantum experiments yet</p>
                    <p className="text-sm">Run your first quantum experiment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quantum Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Quantum Circuit Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <QuantumViz experiments={experiments} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
