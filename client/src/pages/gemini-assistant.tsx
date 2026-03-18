import { useState } from "react";
import { Bot, BrainCircuit, Lightbulb, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function GeminiAssistant() {
  const [question, setQuestion] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const promptSuggestions = [
    "Suggest improvements for an imbalanced defect dataset before training.",
    "Explain why my ensemble model might outperform a single classifier.",
    "Give me steps to improve recall without losing too much precision.",
  ];

  const handleAskGemini = async () => {
    if (!question.trim()) {
      return;
    }

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
    } catch {
      setAdvice("Error contacting Gemini API");
    }
    setLoading(false);
  };

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <Card className="overflow-hidden rounded-[32px] border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_46%,#eef5ff_100%)] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)]">
            <CardContent className="p-8 lg:p-10">
              <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">
                Gemini Assistance
              </Badge>
              <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.82fr)]">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                      AI Research Copilot
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-600">
                      Ask for ML guidance, dataset tuning strategies, or model interpretation help in the
                      same professional interface as the dashboard.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Use Cases
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">3</div>
                      <p className="mt-1 text-sm text-slate-500">Dataset, model, and evaluation guidance.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Response Style
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">Direct</div>
                      <p className="mt-1 text-sm text-slate-500">Focused answers for research decisions.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Session
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">Live</div>
                      <p className="mt-1 text-sm text-slate-500">Works alongside training and analytics tabs.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Assistant Scope
                      </div>
                      <div className="mt-2 text-2xl font-semibold">ML advisory</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Best for interpreting metrics, proposing next experiments, and turning model output into
                    practical actions.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Strength</div>
                      <div className="mt-1 text-lg font-semibold text-white">Reasoned recommendations</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Best Input</div>
                      <div className="mt-1 text-lg font-semibold text-white">Specific research question</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Typical Output</div>
                      <div className="mt-1 text-lg font-semibold text-white">Steps and tradeoffs</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200/80 bg-white/90 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Prompt Shortcuts</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Click a prompt to seed the assistant with a useful starting point.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuestion(prompt)}
                  className="w-full rounded-[24px] border border-slate-100 bg-slate-50/80 px-4 py-4 text-left text-sm leading-6 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Ask Gemini</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Ask about model quality, dataset preparation, or experiment strategy.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Textarea
                placeholder="Ask a question about ML, data quality, training, or evaluation..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={7}
                className="min-h-[220px] rounded-[24px] border-slate-200 bg-white/90 text-slate-950 shadow-sm placeholder:text-slate-400"
              />
              <Button
                onClick={handleAskGemini}
                disabled={loading || !question.trim()}
                className="h-12 rounded-2xl bg-slate-950 px-6 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)] hover:bg-slate-800"
              >
                {loading ? "Asking..." : "Ask Gemini"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-950">Assistant Response</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Gemini output appears here after each request.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {advice ? (
                  <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Gemini Says
                    </div>
                    <div className="whitespace-pre-line">{advice}</div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-12 text-center text-sm text-slate-500">
                    Ask a question to populate the response panel.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Best Results Come From</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Questions tied to a specific metric, dataset, or model outcome.",
                  "Requests that include the tradeoff you care about, such as accuracy versus recall.",
                  "Follow-up prompts asking for next steps after a result or experiment.",
                ].map((item) => (
                  <div key={item} className="rounded-[22px] border border-slate-100 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-500">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
