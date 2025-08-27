import { Home, Bot, Compass, Users, Bookmark, Settings, Shield, Search, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";

export function LeftSidebar() {
  const [location] = useLocation();
  
  const { data: currentUser, isError, refetch } = useQuery<{
    id: string; 
    displayName: string; 
    username: string; 
    email: string | null; 
    bio: string | null; 
    avatar: string | null; 
    nftProfilePicture: string | null;
    nftProfileContract: string | null;
    nftProfileTokenId: string | null;
    reputationScore: number;
    skillBadges: any[];
    verifiedLinks: any[];
    isPremium: boolean;
    premiumExpiresAt: Date | null;
    walletAddress: string | null; 
    isVerified: boolean; 
    followingCount: number; 
    followersCount: number; 
    postsCount: number; 
    createdAt: Date | null;
  }>({
    queryKey: ["/api/users/me"],
    retry: false, // Don't retry on 401 errors
    refetchInterval: 5000, // Check every 5 seconds for wallet changes
    queryFn: async () => {
      const res = await fetch("/api/users/me", {
        credentials: "include",
      });
      
      if (res.status === 401) {
        // Return null when wallet not connected instead of throwing error
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
  });

  const { data: chainStatus } = useQuery<{network: string; blockHeight: number; gasPrice: string}>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 10000,
  });

  const navItems = [
    { icon: Home, label: "Home Feed", href: "/" },
    { icon: Bot, label: "AI Recommendations", href: "/ai-recommendations" },
    { icon: Compass, label: "Discover", href: "/discover" },
    { icon: Search, label: "Discovery Engine", href: "/discovery" },
    { icon: MessageCircle, label: "Interactions", href: "/interactions" },
    { icon: Users, label: "Communities", href: "/communities" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Horizontal User Profile */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={currentUser.avatar ? `${window.location.origin}${currentUser.avatar}` : ""} 
                  alt={currentUser.displayName} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-500 text-white font-semibold">
                  {currentUser.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{currentUser.displayName}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">@{currentUser.username}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{currentUser.postsCount || 0} Posts</span>
                <span className="text-gray-600 dark:text-gray-400">{currentUser.followingCount || 0} Following</span>
                <span className="text-gray-600 dark:text-gray-400">{currentUser.followersCount || 0} Followers</span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Shield className="text-gray-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Connect Wallet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Connect to access features</p>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Navigation Menu */}
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                location === item.href 
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium text-sm hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Compact Chain Status */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">0G Chain:</span>
            <span className="text-gray-900 dark:text-white font-mono">{chainStatus?.network || "Galileo"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-400">Block:</span>
            <span className="text-gray-900 dark:text-white font-mono">{chainStatus?.blockHeight?.toLocaleString() || "5.6M"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
