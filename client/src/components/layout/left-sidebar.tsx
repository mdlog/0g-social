import { Home, Bot, Compass, Users, Bookmark, Settings, Shield, Search, MessageCircle, MessageSquare } from "lucide-react";
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
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache at all
    refetchInterval: 2000, // Check every 2 seconds for avatar changes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    queryFn: async () => {
      const res = await fetch("/api/users/me", {
        credentials: "include",
        cache: "no-cache", // Prevent browser caching
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
      
      if (res.status === 401) {
        // Return null when wallet not connected instead of throwing error
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      const userData = await res.json();
      console.log("[SIDEBAR] Fetched user data:", userData);
      console.log("[SIDEBAR] Avatar value:", userData?.avatar);
      return userData;
    },
  });

  const { data: chainStatus } = useQuery<{network: string; blockHeight: number; gasPrice: string}>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 10000,
  });

  const navItems = [
    { icon: Home, label: "Home Feed", href: "/" },
    { icon: Bot, label: "AI Feed", href: "/ai-recommendations" },
    { icon: MessageSquare, label: "0G Chat", href: "/chat" },
    { icon: Users, label: "Communities", href: "/communities" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        {/* User Profile Card - Only show when wallet connected */}
        {currentUser ? (
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="text-center">

                <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary ring-opacity-20">
                  {currentUser.avatar ? (
                    <img 
                      src={`${currentUser.avatar}?cache=${currentUser.id}`}
                      alt={currentUser.displayName}
                      className="w-full h-full object-cover rounded-full"
                      loading="eager"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <AvatarFallback 
                    className="gradient-brand text-white font-semibold text-lg"
                    style={{ 
                      display: currentUser.avatar ? 'none' : 'flex',
                      opacity: currentUser.avatar ? '0' : '1',
                      transition: 'opacity 0.2s ease-in-out'
                    }}
                  >
                    {currentUser.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg text-foreground mb-1">{currentUser.displayName}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  @{currentUser.username}
                </p>
                
                {/* Verification Badge */}
                {currentUser.isVerified && (
                  <div className="flex items-center justify-center space-x-2 mb-5">
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">
                      <Shield className="w-3 h-3" />
                      <span>VERIFIED</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 text-center mb-5">
                  <div className="p-3 modern-card rounded-2xl">
                    <p className="text-lg font-bold text-foreground">{currentUser.postsCount || 0}</p>
                    <p className="text-xs text-muted-foreground font-medium">Posts</p>
                  </div>
                  <div className="p-3 modern-card rounded-2xl">
                    <p className="text-lg font-bold text-foreground">{currentUser.followingCount || 0}</p>
                    <p className="text-xs text-muted-foreground font-medium">Following</p>
                  </div>
                  <div className="p-3 modern-card rounded-2xl">
                    <p className="text-lg font-bold text-foreground">{currentUser.followersCount || 0}</p>
                    <p className="text-xs text-muted-foreground font-medium">Followers</p>
                  </div>
                </div>
                
                {/* Edit Profile Button */}
                <EditProfileDialog user={currentUser} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 gradient-brand rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="text-white w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Connect your wallet to access your profile
                </p>
                
                <p className="text-xs text-muted-foreground/60">
                  Your profile will appear here after wallet connection
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Menu */}
        <Card className="modern-card">
          <CardContent className="p-4">
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start p-3 rounded-xl transition-all duration-200 ${
                          location === item.href 
                            ? "bg-primary bg-opacity-10 text-primary shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                        data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
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
        <Card className="modern-card">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4 flex items-center space-x-2 text-foreground">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Network Status</span>
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Network:</span>
                <span className="text-foreground font-mono">{chainStatus?.network || "0G Galileo"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Block:</span>
                <span className="text-foreground font-mono">{chainStatus?.blockHeight?.toLocaleString() || "5,610,000"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Gas:</span>
                <span className="text-foreground font-mono">{chainStatus?.gasPrice || "0.1 Gwei"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
