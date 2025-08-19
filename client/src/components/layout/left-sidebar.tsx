import { Home, Bot, Compass, Users, Bookmark, Settings, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LeftSidebar() {
  const { data: currentUser, isError, refetch } = useQuery<{id: string; displayName: string; username: string; email: string | null; bio: string | null; avatar: string | null; walletAddress: string | null; isVerified: boolean; followingCount: number; followersCount: number; postsCount: number; createdAt: Date | null}>({
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
    { icon: Home, label: "Home Feed", href: "/", active: true },
    { icon: Bot, label: "AI Recommendations", href: "/ai" },
    { icon: Compass, label: "Discover", href: "/discover" },
    { icon: Users, label: "Communities", href: "/communities" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        {/* User Profile Card - Only show when wallet connected */}
        {currentUser ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-3">
                  <AvatarImage 
                    src={currentUser.avatar ? `${window.location.origin}${currentUser.avatar}` : ""} 
                    alt={currentUser.displayName} 
                    className="object-cover"
                  />
                  <AvatarFallback className="avatar-gradient-1 text-white font-semibold">
                    {currentUser.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{currentUser.displayName}</h3>
                <p className="text-og-slate-600 dark:text-og-slate-400 text-sm mb-3">
                  @{currentUser.username}.0g
                </p>
                
                {/* Decentralized Identity Badge */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="verified-badge">
                    <Shield className="text-white w-3 h-3" />
                    <span className="text-xs">Verified DID</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <p className="text-lg font-semibold">{currentUser.postsCount || 0}</p>
                    <p className="text-xs text-og-slate-600 dark:text-og-slate-400">Posts</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{currentUser.followingCount || 0}</p>
                    <p className="text-xs text-og-slate-600 dark:text-og-slate-400">Following</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{currentUser.followersCount || 0}</p>
                    <p className="text-xs text-og-slate-600 dark:text-og-slate-400">Followers</p>
                  </div>
                </div>
                
                {/* Edit Profile Button */}
                <EditProfileDialog user={currentUser} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-og-slate-200 dark:bg-og-slate-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Shield className="text-og-slate-400 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-og-slate-600 dark:text-og-slate-400">Connect Wallet</h3>
                <p className="text-og-slate-500 dark:text-og-slate-500 text-sm mb-4">
                  Connect your wallet to access your profile
                </p>
                
                <p className="text-xs text-og-slate-400 dark:text-og-slate-600">
                  Your profile will appear here after wallet connection
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Menu */}
        <Card>
          <CardContent className="p-4">
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Button
                      variant={item.active ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        item.active 
                          ? "bg-og-primary bg-opacity-10 dark:bg-og-primary dark:bg-opacity-20 text-og-primary hover:bg-og-primary hover:bg-opacity-20" 
                          : "hover:bg-og-slate-100 dark:hover:bg-og-slate-700"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </CardContent>
        </Card>

        {/* 0G Chain Status */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center space-x-2">
              <div className="w-4 h-4 gradient-brand rounded"></div>
              <span>0G Chain Status</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-og-slate-600 dark:text-og-slate-400">Network</span>
                <span className="text-og-secondary">{chainStatus?.network || "Newton v2"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-og-slate-600 dark:text-og-slate-400">Block Height</span>
                <span>{chainStatus?.blockHeight?.toLocaleString() || "2,847,392"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-og-slate-600 dark:text-og-slate-400">Gas Price</span>
                <span>{chainStatus?.gasPrice || "0.1 gwei"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
