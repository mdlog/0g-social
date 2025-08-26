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
          <Card className="futuristic-card dark:futuristic-card-dark neon-border-cyan">
            <CardContent className="p-6">
              <div className="text-center">

                <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-cyan-400/40 hover:ring-cyan-400/70 avatar-smooth">
                  <AvatarImage 
                    src={currentUser.avatar ? `${window.location.origin}${currentUser.avatar}` : ""} 
                    alt={currentUser.displayName} 
                    className="object-cover"
                    onError={(e) => {
                      console.error("Avatar image failed to load:", currentUser.avatar);
                      console.error("Full URL:", `${window.location.origin}${currentUser.avatar}`);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log("Avatar image loaded successfully:", currentUser.avatar);
                    }}
                  />
                  <AvatarFallback className="avatar-gradient-1 text-white font-semibold shadow-lg">
                    {currentUser.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg text-cyan-100 mb-1">{currentUser.displayName}</h3>
                <p className="gradient-neon-text text-sm mb-4">
                  @{currentUser.username}.0g
                </p>
                
                {/* Decentralized Identity Badge */}
                <div className="flex items-center justify-center space-x-2 mb-5">
                  <div className="verified-badge pulse-glow">
                    <Shield className="text-white w-3 h-3" />
                    <span className="text-xs">VERIFIED DID</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-5">
                  <div className="p-2 rounded-xl cyber-glass dark:cyber-glass-dark min-h-[60px] flex flex-col justify-center overflow-hidden">
                    <p className="text-lg font-bold text-cyan-300">{currentUser.postsCount || 0}</p>
                    <p className="text-[0.55rem] font-medium leading-none text-cyan-400/80 truncate">POSTS</p>
                  </div>
                  <div className="p-2 rounded-xl cyber-glass dark:cyber-glass-dark min-h-[60px] flex flex-col justify-center overflow-hidden">
                    <p className="text-lg font-bold text-magenta-300">{currentUser.followingCount || 0}</p>
                    <p className="text-[0.55rem] font-medium leading-none text-magenta-400/80 truncate">FOLLOWING</p>
                  </div>
                  <div className="p-2 rounded-xl cyber-glass dark:cyber-glass-dark min-h-[60px] flex flex-col justify-center overflow-hidden">
                    <p className="text-lg font-bold text-yellow-300">{currentUser.followersCount || 0}</p>
                    <p className="text-[0.55rem] font-medium leading-none text-yellow-400/80 truncate">FOLLOWERS</p>
                  </div>
                </div>
                
                {/* Edit Profile Button */}
                <EditProfileDialog user={currentUser} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="futuristic-card dark:futuristic-card-dark neon-border-yellow">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 cyber-glass dark:cyber-glass-dark rounded-full mx-auto mb-4 flex items-center justify-center ring-2 ring-yellow-400/30">
                  <Shield className="text-yellow-400 w-8 h-8 pulse-glow" />
                </div>
                <h3 className="font-bold text-lg text-yellow-300 mb-2">CONNECT WALLET</h3>
                <p className="text-yellow-200/80 text-sm mb-4">
                  Connect your wallet to access your profile
                </p>
                
                <p className="text-xs text-yellow-400/60">
                  Your profile will appear here after wallet connection
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Menu */}
        <Card className="futuristic-card dark:futuristic-card-dark neon-border-magenta">
          <CardContent className="p-4">
            <nav>
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start p-3 rounded-xl transition-all duration-300 ${
                          location === item.href 
                            ? "bg-cyan-500/20 text-cyan-300 neon-border-cyan shadow-lg shadow-cyan-500/20" 
                            : "text-cyan-300/80 hover:text-cyan-300 hover:bg-cyan-500/10 hover:neon-border-cyan"
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
        <Card className="futuristic-card dark:futuristic-card-dark neon-border-green">
          <CardContent className="p-5">
            <h4 className="font-bold mb-4 flex items-center space-x-3 text-green-300">
              <div className="w-4 h-4 gradient-cyber-primary rounded-full pulse-glow"></div>
              <span>0G CHAIN STATUS</span>
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2 rounded-lg cyber-glass dark:cyber-glass-dark">
                <span className="text-green-200/80">NETWORK:</span>
                <span className="text-green-300 font-mono">{chainStatus?.network || "NEWTON V2"}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg cyber-glass dark:cyber-glass-dark">
                <span className="text-green-200/80">BLOCK HEIGHT:</span>
                <span className="text-green-300 font-mono">{chainStatus?.blockHeight?.toLocaleString() || "2,847,392"}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg cyber-glass dark:cyber-glass-dark">
                <span className="text-green-200/80">GAS PRICE:</span>
                <span className="text-green-300 font-mono">{chainStatus?.gasPrice || "0.1 GWEI"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
