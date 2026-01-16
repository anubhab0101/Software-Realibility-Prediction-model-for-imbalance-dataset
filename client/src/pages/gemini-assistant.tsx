import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function GeminiAssistant() {
  const [question, setQuestion] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskGemini = async () => {
    setLoading(true);
    setAdvice("");
    try {
      const res = await fetch("/api/ml/gemini-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats: {}, question }),
      });
      const data = await res.json();
      setAdvice(data.advice || data.error || "No response");
    } catch (e) {
      setAdvice("Error contacting Gemini API");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Gemini AI Assistant</CardTitle>
          <CardDescription>
            Ask Gemini for ML, data, or modeling advice. Enter your question below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask a question about ML, data, or modeling..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={4}
          />
          <Button onClick={handleAskGemini} disabled={loading || !question}>
            {loading ? "Asking..." : "Ask Gemini"}
          </Button>
          {advice && (
            <div className="mt-4 p-3 bg-muted rounded">
              <strong>Gemini says:</strong>
              <div className="whitespace-pre-line mt-2">{advice}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
