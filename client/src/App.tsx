import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useWebSocket } from "@/hooks/use-websocket";
import { RainbowKitProviderWrapper } from "@/providers/rainbowkit-provider";
import Home from "./pages/home";
import { ProfilePage } from "./pages/profile";
import { AIRecommendationsPage } from "./pages/ai-recommendations";
import { CommunitiesPage } from "./pages/communities";
import { BookmarksPage } from "./pages/bookmarks";
import { SettingsPage } from "./pages/settings";
import ChatPage from "./pages/chat";
import NotFound from "./pages/not-found";

function Router() {
  // Initialize WebSocket connection for real-time updates
  useWebSocket();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile/:username" component={ProfilePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/ai-recommendations" component={AIRecommendationsPage} />
      <Route path="/communities" component={CommunitiesPage} />
      <Route path="/bookmarks" component={BookmarksPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/chat" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RainbowKitProviderWrapper>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </RainbowKitProviderWrapper>
    </ThemeProvider>
  );
}

export default App;
