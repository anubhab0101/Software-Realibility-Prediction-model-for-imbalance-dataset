import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Link, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface CodeUploadProps {
  onPredictionComplete: (results: any) => void;
}

export default function CodeUpload({ onPredictionComplete }: CodeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Validate file type
      const validExtensions = ['.py', '.js', '.java', '.cpp', '.cs', '.go', '.rs', '.ts', '.tsx', '.jsx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validExtensions.includes(fileExtension)) {
        setSelectedFile(file);
        toast({
          title: "File selected",
          description: `${file.name} is ready for analysis`
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a supported code file (.py, .js, .java, .cpp, .cs, .go, .rs, .ts, .tsx, .jsx)",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.py', '.js', '.java', '.cpp', '.cs', '.go', '.rs', '.ts', '.tsx', '.jsx'],
      'application/zip': ['.zip'],
      'application/gzip': ['.tar.gz', '.tgz']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  const validateGithubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+(?:\/.*)?$/;
    return githubRegex.test(url);
  };

  const handleFileAnalysis = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a code file to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'file');

      const response = await fetch('/api/code-predict', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      const results = await response.json();
      onPredictionComplete(results);
      toast({
        title: "Analysis complete",
        description: "Code performance prediction generated successfully"
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the code file",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGithubAnalysis = async () => {
    if (!githubUrl) {
      toast({
        title: "No URL provided",
        description: "Please enter a GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    if (!validateGithubUrl(githubUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/code-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'github',
          url: githubUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze GitHub repository');
      }

      const results = await response.json();
      onPredictionComplete(results);
      toast({
        title: "Analysis complete",
        description: "GitHub repository analysis completed successfully"
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the GitHub repository",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSnippetAnalysis = async () => {
    if (!codeSnippet.trim()) {
      toast({
        title: "No code provided",
        description: "Please enter some code to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/code-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'snippet',
          code: codeSnippet
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code snippet');
      }

      const results = await response.json();
      onPredictionComplete(results);
      toast({
        title: "Analysis complete",
        description: "Code snippet analysis completed successfully"
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the code snippet",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            GitHub URL
          </TabsTrigger>
          <TabsTrigger value="snippet" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Code Snippet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Upload Code File</CardTitle>
              <CardDescription>
                Drag and drop or click to select a code file for performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-lg font-medium">Drop the file here</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium">Drag & drop a code file here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      or click to select a file
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports: .py, .js, .java, .cpp, .cs, .go, .rs, .ts, .tsx, .jsx, .zip
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button 
                onClick={handleFileAnalysis} 
                disabled={!selectedFile || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Code Performance"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Repository</CardTitle>
              <CardDescription>
                Enter a GitHub repository URL for code analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="github-url" className="text-sm font-medium">
                  Repository URL
                </label>
                <Input
                  id="github-url"
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Example: https://github.com/facebook/react
                </p>
              </div>

              <Button 
                onClick={handleGithubAnalysis} 
                disabled={!githubUrl || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Repository"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snippet">
          <Card>
            <CardHeader>
              <CardTitle>Code Snippet</CardTitle>
              <CardDescription>
                Paste your code directly for quick analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code-snippet" className="text-sm font-medium">
                  Code
                </label>
                <Textarea
                  id="code-snippet"
                  placeholder="Paste your code here..."
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleSnippetAnalysis} 
                disabled={!codeSnippet.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Code Snippet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}