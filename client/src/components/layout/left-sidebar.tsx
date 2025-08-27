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
      
      const userData = await res.json();
      console.log("[DEBUG SIDEBAR] Fetched user data:", userData);
      return userData;
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
        {/* User Profile Card - Only show when wallet connected */}
        {currentUser ? (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">

                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage 
                    src={currentUser.avatar ? `${window.location.origin}${currentUser.avatar}?t=${Date.now()}` : ""} 
                    alt={currentUser.displayName} 
                    className="object-cover"
                    onError={(e) => {
                      console.error("❌ Avatar image failed to load:", currentUser.avatar);
                      console.error("❌ Full URL:", `${window.location.origin}${currentUser.avatar}`);
                      console.error("❌ Current user data:", currentUser);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log("✅ Avatar image loaded successfully:", currentUser.avatar);
                      console.log("✅ Full URL:", `${window.location.origin}${currentUser.avatar}`);
                    }}
                  />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-semibold">
                    {currentUser.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Debug Info - temporary */}
                <div className="text-xs text-gray-500 mb-2">
                  Debug: {currentUser.avatar || "No avatar"} {currentUser.avatar && `(${Date.now()})`}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">{currentUser.displayName}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  @{currentUser.username}
                </p>
                
                {/* Verification Badge */}
                <div className="flex items-center justify-center space-x-2 mb-5">
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                    <Shield className="w-3 h-3" />
                    <span>VERIFIED</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-5">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{currentUser.postsCount || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Posts</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{currentUser.followingCount || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Following</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{currentUser.followersCount || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
                  </div>
                </div>
                
                {/* Edit Profile Button */}
                <EditProfileDialog user={currentUser} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="text-gray-600 dark:text-gray-400 w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Connect Wallet</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Connect your wallet to access your profile
                </p>
                
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Your profile will appear here after wallet connection
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Menu */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start p-3 rounded-lg transition-all duration-200 ${
                          location === item.href 
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </CardContent>
        </Card>

        {/* 0G Chain Status */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4 flex items-center space-x-2 text-gray-900 dark:text-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Network Status</span>
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Network:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono">{chainStatus?.network || "0G Galileo"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Block:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono">{chainStatus?.blockHeight?.toLocaleString() || "5,610,000"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Gas:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono">{chainStatus?.gasPrice || "0.1 Gwei"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
