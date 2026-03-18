import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { File, Link, Terminal, Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validExtensions = [".py", ".js", ".java", ".cpp", ".cs", ".go", ".rs", ".ts", ".tsx", ".jsx"];
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

        if (validExtensions.includes(fileExtension)) {
          setSelectedFile(file);
          toast({
            title: "File selected",
            description: `${file.name} is ready for analysis`,
          });
        } else {
          toast({
            title: "Invalid file type",
            description:
              "Please upload a supported code file (.py, .js, .java, .cpp, .cs, .go, .rs, .ts, .tsx, .jsx)",
            variant: "destructive",
          });
        }
      }
    },
    [toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".py", ".js", ".java", ".cpp", ".cs", ".go", ".rs", ".ts", ".tsx", ".jsx"],
      "application/zip": [".zip"],
      "application/gzip": [".tar.gz", ".tgz"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
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
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "file");

      const response = await fetch("/api/code-predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze code");
      }

      const results = await response.json();
      onPredictionComplete(results);
      toast({
        title: "Analysis complete",
        description: "Code performance prediction generated successfully",
      });
    } catch {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the code file",
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    if (!validateGithubUrl(githubUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/code-predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "github",
          url: githubUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze GitHub repository");
      }

      const results = await response.json();
      onPredictionComplete(results);
      toast({
        title: "Analysis complete",
        description: "GitHub repository analysis completed successfully",
      });
    } catch {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the GitHub repository",
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/code-predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "snippet",
          code: codeSnippet,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze code snippet");
      }

      const results = await response.json();
      onPredictionComplete(results);
      toast({
        title: "Analysis complete",
        description: "Code snippet analysis completed successfully",
      });
    } catch {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the code snippet",
        variant: "destructive",
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
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: "Modes", value: "3", description: "File upload, repository link, or inline snippet." },
          { label: "Supported", value: "10+", description: "Common engineering languages and archives." },
          { label: "Pipeline", value: "Live", description: "Predictions feed directly into result tabs." },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</div>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-1.5">
          <TabsTrigger
            value="file"
            className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
          >
            <File className="h-4 w-4" />
            File Upload
          </TabsTrigger>
          <TabsTrigger
            value="github"
            className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
          >
            <Link className="h-4 w-4" />
            GitHub URL
          </TabsTrigger>
          <TabsTrigger
            value="snippet"
            className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
          >
            <Terminal className="h-4 w-4" />
            Code Snippet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-6">
          <Card className="rounded-[28px] border-slate-200/80 bg-slate-50/60 shadow-none">
            <CardHeader>
              <CardTitle>Upload Code File</CardTitle>
              <CardDescription>
                Drag and drop or click to select a code file for performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={`rounded-[26px] border border-dashed p-8 text-center transition-all ${
                  isDragActive
                    ? "border-blue-400 bg-blue-50/80 shadow-[0_18px_45px_-35px_rgba(37,99,235,0.55)]"
                    : "border-slate-300 bg-white/90 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                <input {...getInputProps()} />
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-950 text-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.55)]">
                  <Upload className="h-7 w-7" />
                </div>
                {isDragActive ? (
                  <p className="mt-5 text-lg font-semibold text-slate-950">Drop the file here</p>
                ) : (
                  <div>
                    <p className="mt-5 text-lg font-semibold text-slate-950">Drag and drop a code file</p>
                    <p className="mt-2 text-sm text-slate-500">or click to select a file</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Supports: .py, .js, .java, .cpp, .cs, .go, .rs, .ts, .tsx, .jsx, .zip
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <File className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600">
                      Ready
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      className="rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleFileAnalysis}
                disabled={!selectedFile || isAnalyzing}
                className="h-12 w-full rounded-2xl bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)] hover:bg-slate-800"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Code Performance"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <Card className="rounded-[28px] border-slate-200/80 bg-slate-50/60 shadow-none">
            <CardHeader>
              <CardTitle>GitHub Repository</CardTitle>
              <CardDescription>Enter a GitHub repository URL for code analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 rounded-[24px] border border-slate-100 bg-white/90 p-4">
                <label htmlFor="github-url" className="text-sm font-medium text-slate-700">
                  Repository URL
                </label>
                <Input
                  id="github-url"
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="h-12 rounded-2xl border-slate-200 bg-white text-slate-950 shadow-sm"
                />
                <p className="text-xs text-slate-500">Example: https://github.com/facebook/react</p>
              </div>

              <Button
                onClick={handleGithubAnalysis}
                disabled={!githubUrl || isAnalyzing}
                className="h-12 w-full rounded-2xl bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)] hover:bg-slate-800"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Repository"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snippet" className="mt-6">
          <Card className="rounded-[28px] border-slate-200/80 bg-slate-50/60 shadow-none">
            <CardHeader>
              <CardTitle>Code Snippet</CardTitle>
              <CardDescription>Paste your code directly for quick analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 rounded-[24px] border border-slate-100 bg-white/90 p-4">
                <label htmlFor="code-snippet" className="text-sm font-medium text-slate-700">
                  Code
                </label>
                <Textarea
                  id="code-snippet"
                  placeholder="Paste your code here..."
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="min-h-[220px] rounded-[24px] border-slate-200 bg-white font-mono text-sm text-slate-950 shadow-sm"
                />
              </div>

              <Button
                onClick={handleSnippetAnalysis}
                disabled={!codeSnippet.trim() || isAnalyzing}
                className="h-12 w-full rounded-2xl bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)] hover:bg-slate-800"
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
