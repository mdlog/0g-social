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
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center shadow-lg ring-1 ring-primary/20">
              <img 
                src={logoUrl} 
                alt="DeSocialAI Logo" 
                className="w-7 h-7 object-contain"
              />
            </div>
            <h1 className="text-xl font-bold gradient-text">
              DeSocialAI
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search posts, users, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="modern-input w-full pl-12 pr-4 py-3 h-12 text-sm placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-3">
            {/* RainbowKit Wallet Connection */}
            <RainbowKitWallet />

            {/* Real-time Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-full modern-badge">
              {wsConnected ? (
                <Wifi className="h-3 w-3 text-emerald-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs font-medium">
                {wsConnected ? "Live" : "Offline"}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl hover:bg-accent transition-all duration-200"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications - disabled temporarily */}
            {currentUser && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-accent transition-all duration-200 relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background"></span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
