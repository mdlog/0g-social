import { useState } from "react";
import { Bell, Moon, Sun, Search, Wifi, WifiOff } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { RainbowKitWallet } from "@/components/wallet/rainbowkit-wallet";
import logoUrl from "@/assets/desocialai-logo.png";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { connected: wsConnected } = useWebSocket();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
  });



  return (
    <header className="sticky top-0 z-50 futuristic-card dark:futuristic-card-dark border-b border-transparent backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 slide-in-cyber">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow">
              <img 
                src={logoUrl} 
                alt="DeSocialAI Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-xl font-bold gradient-neon-text">
              DeSocialAI
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search the metaverse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 cyber-glass dark:cyber-glass-dark rounded-2xl border-0 focus:outline-none focus:neon-border-cyan placeholder-cyan-300/60 dark:placeholder-cyan-300/40 text-foreground"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {/* RainbowKit Wallet Connection */}
            <RainbowKitWallet />

            {/* Real-time Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl cyber-glass dark:cyber-glass-dark border border-cyan-400/20">
              {wsConnected ? (
                <Wifi className="h-4 w-4 text-cyan-400 pulse-glow" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className="text-xs font-medium text-cyan-200">
                {wsConnected ? "ONLINE" : "OFFLINE"}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-3 rounded-xl cyber-glass dark:cyber-glass-dark hover:neon-border-cyan transition-all duration-300"
            >
              {theme === "light" ? 
                <Moon className="h-4 w-4 text-cyan-300" /> : 
                <Sun className="h-4 w-4 text-yellow-300" />
              }
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative p-3 rounded-xl cyber-glass dark:cyber-glass-dark hover:neon-border-magenta transition-all duration-300"
            >
              <Bell className="h-4 w-4 text-magenta-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-magenta-400 rounded-full pulse-glow shadow-lg shadow-magenta-400/50"></div>
            </Button>

            {/* Profile */}
            <div className="flex items-center space-x-2">
              {currentUser ? (
                <Button
                  variant="ghost"
                  className="w-10 h-10 p-0 rounded-full"
                  onClick={() => window.location.href = `/profile`}
                >
                  <div className="w-10 h-10 avatar-gradient-1 rounded-full ring-2 ring-cyan-400/30 hover:ring-cyan-400/60 transition-all duration-300 float-animation"></div>
                </Button>
              ) : (
                <div className="w-10 h-10 avatar-gradient-1 rounded-full ring-2 ring-cyan-400/30 hover:ring-cyan-400/60 transition-all duration-300 float-animation"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
