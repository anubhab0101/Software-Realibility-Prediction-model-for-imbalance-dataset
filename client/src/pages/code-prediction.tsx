import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Upload, History, BarChart3 } from "lucide-react";
import CodeUpload from "@/components/code-upload";
import PredictionResults from "@/components/prediction-results";
import PredictionHistory from "@/components/prediction-history";

export default function CodePrediction() {
  const [activeTab, setActiveTab] = useState("upload");
  const [predictionResults, setPredictionResults] = useState<any>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);

  const handlePredictionComplete = (results: any) => {
    setPredictionResults(results);
    setPredictionHistory(prev => [results, ...prev]);
    setActiveTab("results");
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Code Performance Prediction</h1>
        <p className="text-muted-foreground">
          Upload your code to get performance predictions and optimization suggestions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Code
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Code Upload
              </CardTitle>
              <CardDescription>
                Upload your code files, GitHub repositories, or code snippets for performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeUpload onPredictionComplete={handlePredictionComplete} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Prediction Results
              </CardTitle>
              <CardDescription>
                Performance predictions and optimization suggestions for your code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictionResults ? (
                <PredictionResults results={predictionResults} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No predictions yet</p>
                  <p className="text-sm">Upload code to get performance predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Prediction History
              </CardTitle>
              <CardDescription>
                View your previous code analysis results and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionHistory 
                history={predictionHistory} 
                onSelectPrediction={setPredictionResults}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Documentation
              </CardTitle>
              <CardDescription>
                Learn how to use the code prediction system effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Supported Code Formats</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Single files (.py, .js, .java, .cpp, .cs, .go, .rs)</li>
                    <li>GitHub repository URLs</li>
                    <li>Code snippets (copy-paste directly)</li>
                    <li>Compressed archives (.zip, .tar.gz)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Execution time prediction</li>
                    <li>Memory usage estimation</li>
                    <li>CPU utilization forecast</li>
                    <li>Code complexity analysis</li>
                    <li>Optimization suggestions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Upload complete, runnable code segments for best results</li>
                    <li>Include relevant dependencies and imports</li>
                    <li>Provide context about expected input/output</li>
                    <li>Review suggestions and implement improvements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}