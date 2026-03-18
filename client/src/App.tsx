import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import Dashboard from "@/pages/dashboard";
import DataUpload from "@/pages/data-upload";
import ModelTraining from "@/pages/model-training";
import GeminiAssistant from "@/pages/gemini-assistant";
import CodePrediction from "@/pages/code-prediction";
import NotFound from "@/pages/not-found";
import SidebarNav from "@/components/ui/sidebar-nav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/data-upload" component={DataUpload} />
      <Route path="/model-training" component={ModelTraining} />
      <Route path="/code-prediction" component={CodePrediction} />
      <Route path="/gemini-assistant" component={GeminiAssistant} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background">
            <SidebarNav />
            <main className="flex-1 overflow-auto">
              <Toaster />
              <Router />
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
