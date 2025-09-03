import { useState } from "react";
import { Moon, Sun, Search, Wifi, WifiOff } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { RainbowKitWallet } from "@/components/wallet/rainbowkit-wallet";
import { SimpleNotificationDropdown } from "@/components/notifications/simple-notification-dropdown";
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
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center shadow-xl ring-1 ring-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <img 
                  src={logoUrl} 
                  alt="DeSocialAI Logo" 
                  className="w-8 h-8 object-contain drop-shadow-lg"
                />
              </div>
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                DeSocialAI
              </h1>
              <span className="text-xs text-muted-foreground font-medium tracking-wider">
                Decentralized Social Network
              </span>
            </div>
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

            {/* Notifications - positioned at the far right */}
            <SimpleNotificationDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
