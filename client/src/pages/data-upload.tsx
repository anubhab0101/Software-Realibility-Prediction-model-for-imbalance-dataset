import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Upload, Database, FileText, BarChart3 } from "lucide-react";
import FileUpload from "@/components/ui/file-upload";
import { apiRequest } from "@/lib/queryClient";

export default function DataUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: datasets } = useQuery({
    queryKey: ["/api/datasets"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; name: string; description: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("name", data.name);
      formData.append("description", data.description);

      const response = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dataset uploaded and analyzed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
      setSelectedFile(null);
      setName("");
      setDescription("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload dataset",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      name: name || selectedFile.name,
      description,
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Upload & Management</h1>
        <p className="text-muted-foreground">
          Upload and manage datasets for software reliability prediction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Dataset
              </CardTitle>
              <CardDescription>
                Upload CSV, JSON, or Excel files with software metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload onFileSelect={setSelectedFile} />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Dataset Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter dataset name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your dataset"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload & Analyze"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Required Columns</h4>
                  <p className="text-sm text-muted-foreground">
                    Include software metrics like LOC, complexity, and defect indicators
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Data Format</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure numerical metrics are properly formatted and clean
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Target Variable</h4>
                  <p className="text-sm text-muted-foreground">
                    Include a binary or categorical target for defect prediction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Datasets */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Available Datasets</CardTitle>
              <CardDescription>
                Manage your uploaded datasets and view analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {datasets?.map((dataset: any) => (
                  <div
                    key={dataset.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{dataset.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {dataset.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{dataset.rowCount} rows</span>
                          <span>{dataset.columnCount} columns</span>
                          {dataset.dataQuality && (
                            <span>
                              Quality: {(dataset.dataQuality.imbalanceRatio * 100).toFixed(1)}% imbalanced
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {dataset.features && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {Object.keys(dataset.features).slice(0, 6).map((feature) => (
                            <span key={feature} className="text-muted-foreground">
                              {feature}
                            </span>
                          ))}
                          {Object.keys(dataset.features).length > 6 && (
                            <span className="text-muted-foreground">
                              +{Object.keys(dataset.features).length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {!datasets?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No datasets uploaded yet</p>
                    <p className="text-sm">Upload your first dataset to get started</p>
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
