import { Home, Bot, Compass, Users, Bookmark, Settings, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LeftSidebar() {
  const { data: currentUser } = useQuery<{displayName: string; username: string; postsCount: number; followingCount: number; followersCount: number}>({
    queryKey: ["/api/users/me"],
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
        {/* User Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 avatar-gradient-1 rounded-full mx-auto mb-3"></div>
              <h3 className="font-semibold text-lg">{currentUser?.displayName || "Alex Chen"}</h3>
              <p className="text-og-slate-600 dark:text-og-slate-400 text-sm mb-3">
                @{currentUser?.username || "alexc"}.0g
              </p>
              
              {/* Decentralized Identity Badge */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="verified-badge">
                  <Shield className="text-og-primary w-3 h-3" />
                  <span className="text-xs text-og-primary font-medium">Verified DID</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold">{currentUser?.postsCount || 342}</p>
                  <p className="text-xs text-og-slate-600 dark:text-og-slate-400">Posts</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{currentUser?.followingCount || 150}</p>
                  <p className="text-xs text-og-slate-600 dark:text-og-slate-400">Following</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{currentUser?.followersCount || 2400}</p>
                  <p className="text-xs text-og-slate-600 dark:text-og-slate-400">Followers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
