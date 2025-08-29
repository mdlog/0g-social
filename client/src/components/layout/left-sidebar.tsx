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
        {/* User Profile Card - Only show when wallet connected */}
        {currentUser ? (
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="text-center">

                <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary/20">
                  <AvatarImage 
                    key={currentUser.avatar}
                    src={currentUser.avatar ? `${currentUser.avatar}?cache=${Math.random()}` : ""} 
                    alt={currentUser.displayName} 
                    className="object-cover"
                    onError={(e) => {
                      console.log("Avatar load error:", e.currentTarget.src);
                      console.log("Current user avatar path:", currentUser.avatar);
                    }}
                    onLoad={() => {
                      console.log("Avatar loaded successfully:", currentUser.avatar);
                    }}
                  />
                  <AvatarFallback className="gradient-brand text-white font-semibold text-lg">
                    {currentUser.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg text-foreground mb-1">{currentUser.displayName}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  @{currentUser.username}
                </p>
                
                {/* Verification Badge */}
                <div className="flex items-center justify-center space-x-2 mb-5">
                  <div className="modern-badge text-emerald-600">
                    <Shield className="w-3 h-3" />
                    <span>VERIFIED</span>
                  </div>
                </div>

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
                            ? "bg-primary/10 text-primary shadow-sm" 
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
