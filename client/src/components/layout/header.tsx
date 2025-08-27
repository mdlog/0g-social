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
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <img 
                src={logoUrl} 
                alt="DeSocialAI Logo" 
                className="w-7 h-7 object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              DeSocialAI
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search posts, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="elegant-input w-full pl-12 pr-4 py-3"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-3">
            {/* RainbowKit Wallet Connection */}
            <RainbowKitWallet />

            {/* Real-time Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              {wsConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {wsConnected ? "Online" : "Offline"}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === "light" ? 
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              }
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
