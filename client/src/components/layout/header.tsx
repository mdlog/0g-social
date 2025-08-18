import { useState } from "react";
import { Bell, Moon, Sun, Search } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: walletStatus } = useQuery<{connected: boolean; address: string; balance: string}>({
    queryKey: ["/api/web3/wallet"],
    refetchInterval: 30000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
  });

  return (
    <header className="sticky top-0 z-50 glassmorphism border-b border-og-slate-200 dark:border-og-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">0G</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">
              0G Social
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-og-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search posts, users, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-og-slate-100 dark:bg-og-slate-800 border border-og-slate-200 dark:border-og-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-og-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {/* Wallet Connection Status */}
            {walletStatus?.connected && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-og-secondary bg-opacity-10 dark:bg-og-secondary dark:bg-opacity-20 rounded-lg">
                <div className="w-2 h-2 bg-og-secondary rounded-full animate-pulse"></div>
                <span className="text-sm text-og-secondary font-medium">Connected</span>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-og-slate-100 dark:hover:bg-og-slate-800 transition-colors"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative p-2 rounded-lg hover:bg-og-slate-100 dark:hover:bg-og-slate-800 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </Button>

            {/* Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 avatar-gradient-1 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
