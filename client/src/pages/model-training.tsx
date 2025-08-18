import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Brain, Settings, Play, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const ALGORITHMS = [
  { value: "random_forest", label: "Random Forest" },
  { value: "svm", label: "Support Vector Machine" },
  { value: "neural_network", label: "Neural Network" },
  { value: "xgboost", label: "XGBoost" },
  { value: "ensemble", label: "Ensemble Methods" },
];

const SAMPLING_TECHNIQUES = [
  { value: "none", label: "No Sampling" },
  { value: "smote", label: "SMOTE" },
  { value: "adasyn", label: "ADASYN" },
  { value: "borderline_smote", label: "Borderline SMOTE" },
  { value: "random_undersample", label: "Random Undersampling" },
];

export default function ModelTraining() {
  const [selectedDataset, setSelectedDataset] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
  const [selectedSampling, setSelectedSampling] = useState("smote");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: datasets } = useQuery({
    queryKey: ["/api/datasets"],
  });

  const { data: models } = useQuery({
    queryKey: ["/api/models"],
  });

  const trainMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest("POST", "/api/models/train", config);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Model training started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start model training",
        variant: "destructive",
      });
    },
  });

  const handleTrain = () => {
    if (!selectedDataset || !selectedAlgorithm) {
      toast({
        title: "Error",
        description: "Please select dataset and algorithm",
        variant: "destructive",
      });
      return;
    }

    trainMutation.mutate({
      name: `${selectedAlgorithm}_${Date.now()}`,
      algorithm: selectedAlgorithm,
      datasetId: selectedDataset,
      hyperparameters: {
        sampling_technique: selectedSampling,
        cross_validation: true,
        feature_selection: "auto",
      },
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Training</h1>
        <p className="text-muted-foreground">
          Train advanced ML models for software reliability prediction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Training Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Training Configuration
              </CardTitle>
              <CardDescription>
                Configure your model training parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Dataset</Label>
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets?.map((dataset: any) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Algorithm</Label>
                <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALGORITHMS.map((algo) => (
                      <SelectItem key={algo.value} value={algo.value}>
                        {algo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Imbalance Handling</Label>
                <Select value={selectedSampling} onValueChange={setSelectedSampling}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sampling technique" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLING_TECHNIQUES.map((technique) => (
                      <SelectItem key={technique.value} value={technique.value}>
                        {technique.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleTrain}
                disabled={trainMutation.isPending}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {trainMutation.isPending ? "Starting Training..." : "Start Training"}
              </Button>
            </CardContent>
          </Card>

          {/* Training Features */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">AutoML Pipeline</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated hyperparameter tuning and model selection
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Feature Engineering</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated feature selection and transformation
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Ensemble Methods</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced stacking and voting classifiers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Results */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Trained Models</CardTitle>
              <CardDescription>
                View and compare your trained models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models?.map((model: any) => (
                  <div
                    key={model.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{model.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {model.algorithm.replace('_', ' ').toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            model.trainingStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : model.trainingStatus === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {model.trainingStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {model.trainingStatus === 'completed' && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">F1-Score:</span>
                            <span className="ml-2 font-medium">
                              {model.f1Score?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Accuracy:</span>
                            <span className="ml-2 font-medium">
                              {model.accuracy?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Precision:</span>
                            <span className="ml-2 font-medium">
                              {model.precision?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Recall:</span>
                            <span className="ml-2 font-medium">
                              {model.recall?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {!models?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No models trained yet</p>
                    <p className="text-sm">Start training your first model</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
