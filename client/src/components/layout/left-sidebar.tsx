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
    <aside className="lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        {/* Enhanced Profile Card */}
        {currentUser ? (
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center relative">
                {/* Large Profile Avatar with Gradient Border */}
                <div className="relative mx-auto mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-1">
                    <Avatar className="w-full h-full">
                      <AvatarImage 
                        src={currentUser.avatar ? `${window.location.origin}${currentUser.avatar}` : ""} 
                        alt={currentUser.displayName} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                        {currentUser.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{currentUser.followersCount || 1984}</p>
                    <p className="text-xs text-gray-300">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{currentUser.followingCount || 1002}</p>
                    <p className="text-xs text-gray-300">Following</p>
                  </div>
                </div>
                
                <h3 className="font-bold text-xl text-white mb-1">{currentUser.displayName}</h3>
                <p className="text-gray-300 text-sm mb-3">@{currentUser.username}</p>
                
                {/* Bio with star icon */}
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <span className="text-yellow-400">⭐</span>
                  <p className="text-sm text-gray-300">Hello, I'm AI/UX designer Open to the new Project</p>
                  <span className="text-yellow-400">⭐</span>
                </div>
                
                <Button className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-700">
                  My Profile
                </Button>
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

        {/* Skills Section */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Skills</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-center">
                UX Designer
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded text-center">
                Front-end and Back-end developing
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded text-center">
                JS coder
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-center">
                UX Designer
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communities Section */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Communities</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">UX</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">UX Designer community</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">32 your friends are in</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">FE</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Front end developers</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">12 your friends are in</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">BE</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Back end developers</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">41 your friends are in</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
