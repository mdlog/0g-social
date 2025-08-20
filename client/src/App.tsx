import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useWebSocket } from "@/hooks/use-websocket";
import Home from "./pages/home";
import { AIRecommendationsPage } from "./pages/ai-recommendations";
import { DiscoverPage } from "./pages/discover";
import { CommunitiesPage } from "./pages/communities";
import { BookmarksPage } from "./pages/bookmarks";
import { SettingsPage } from "./pages/settings";
import NotFound from "./pages/not-found";

function Router() {
  // Initialize WebSocket connection for real-time updates
  useWebSocket();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ai-recommendations" component={AIRecommendationsPage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/communities" component={CommunitiesPage} />
      <Route path="/bookmarks" component={BookmarksPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
