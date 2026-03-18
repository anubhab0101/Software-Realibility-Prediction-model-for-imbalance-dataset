import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  FileText, 
  TrendingUp,
  Calendar,
  Eye
} from "lucide-react";

interface PredictionHistoryProps {
  history: any[];
  onSelectPrediction: (prediction: any) => void;
}

export default function PredictionHistory({ history, onSelectPrediction }: PredictionHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return { text: 'Excellent', variant: 'default' as const };
    if (score >= 60) return { text: 'Good', variant: 'secondary' as const };
    return { text: 'Needs Improvement', variant: 'destructive' as const };
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No prediction history</p>
        <p className="text-sm">Upload code to start building your analysis history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {history.map((prediction, index) => {
          const performanceScore = prediction.performanceMetrics?.overallScore || 50;
          const status = getPerformanceStatus(performanceScore);
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">
                        {prediction.fileName || `Analysis #${index + 1}`}
                      </h3>
                      <Badge variant={status.variant}>
                        {status.text}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(prediction.timestamp || new Date().toISOString())}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Score: {performanceScore}%</span>
                      </div>
                      
                      {prediction.analysisTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Duration: {prediction.analysisTime}ms</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {prediction.type && (
                        <Badge variant="outline" className="text-xs">
                          {prediction.type}
                        </Badge>
                      )}
                      {prediction.language && (
                        <Badge variant="outline" className="text-xs">
                          {prediction.language}
                        </Badge>
                      )}
                      {prediction.linesOfCode && (
                        <Badge variant="outline" className="text-xs">
                          {prediction.linesOfCode} lines
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectPrediction(prediction)}
                    className="ml-4"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        Showing {history.length} analysis{history.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}