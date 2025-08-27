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
    <aside className="lg:col-span-1">
      <div className="sticky top-24 space-y-4">
        {/* Simplified User Profile Card */}
        {currentUser ? (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-3">
                  <AvatarImage 
                    src={currentUser.avatar ? `${window.location.origin}${currentUser.avatar}` : ""} 
                    alt={currentUser.displayName} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-blue-500 text-white font-semibold">
                    {currentUser.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{currentUser.displayName}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  @{currentUser.username}
                </p>
                
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="p-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{currentUser.postsCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
                  </div>
                  <div className="p-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{currentUser.followingCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Following</p>
                  </div>
                  <div className="p-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{currentUser.followersCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                  </div>
                </div>
                
                {/* Edit Profile Button */}
                <EditProfileDialog user={currentUser} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Shield className="text-gray-400 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Connect Wallet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Connect your wallet to access your profile
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simplified Navigation Menu */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-3">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    location === item.href 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Simplified Chain Status */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center space-x-2 text-gray-900 dark:text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>0G Chain Status</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Network:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">{chainStatus?.network || "Galileo"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Block:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">{chainStatus?.blockHeight?.toLocaleString() || "5.6M"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
