import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Download from "@/pages/download";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/d/:shareId" component={Download} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Main App Router */}
      <Router />
      
      {/* Notifications */}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
