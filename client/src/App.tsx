import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Download from "@/pages/download";
import ThemeToggle from "@/components/theme-toggle";
import { ThemeProvider } from "@/components/theme-provider"; // ✅ Import ThemeProvider

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
    <ThemeProvider> {/* ✅ Wrap the entire app with ThemeProvider */}
      <QueryClientProvider client={queryClient}>
        {/* Theme Toggle Button - Fixed position */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Main App Router */}
        <Router />
        
        {/* Notifications */}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
