import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Compass, TrendingUp, Globe, Users, Hash, Flame } from "lucide-react";
import { PostCard } from "@/components/posts/post-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  const { data: trendingPosts } = useQuery({
    queryKey: ['/api/posts/trending'],
  });

  const { data: globalPosts } = useQuery({
    queryKey: ['/api/posts/global'],
  });

  const { data: hashtags } = useQuery({
    queryKey: ['/api/hashtags/trending'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users/suggested'],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Compass className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Discover
              </h1>
              <p className="text-gray-400">Explore the decentralized social universe</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search posts, users, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="global" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Global
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Tags
                </TabsTrigger>
                <TabsTrigger value="people" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-4 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      Trending Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendingPosts?.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    )) || (
                      <div className="text-center py-8 text-gray-400">
                        <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Discovering trending content...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="global" className="space-y-4 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      Global Feed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {globalPosts?.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    )) || (
                      <div className="text-center py-8 text-gray-400">
                        <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Loading global content...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-4 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-purple-400" />
                      Trending Hashtags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(hashtags || [
                        { tag: '#0GChain', posts: 1420, trend: '+25%' },
                        { tag: '#DecentralizedAI', posts: 892, trend: '+18%' },
                        { tag: '#Web3Social', posts: 674, trend: '+12%' },
                        { tag: '#DeFi', posts: 456, trend: '+8%' },
                        { tag: '#Blockchain', posts: 334, trend: '+5%' },
                        { tag: '#CryptoNews', posts: 289, trend: '+15%' }
                      ]).map((hashtag: any, index: number) => (
                        <div key={index} className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-purple-400">{hashtag.tag}</span>
                            <Badge variant="outline" className="text-green-400 border-green-400/30">
                              {hashtag.trend}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            {hashtag.posts} posts
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="people" className="space-y-4 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-400" />
                      Suggested People
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(users || [
                        { username: 'zg_developer', displayName: '0G Dev Team', followers: 5420, verified: true },
                        { username: 'crypto_analyst', displayName: 'Crypto Analyst', followers: 3210, verified: false },
                        { username: 'defi_explorer', displayName: 'DeFi Explorer', followers: 2890, verified: true },
                        { username: 'web3_builder', displayName: 'Web3 Builder', followers: 1567, verified: false }
                      ]).map((user: any, index: number) => (
                        <div key={index} className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-400" />
                            <div>
                              <div className="font-medium text-green-400">@{user.username}</div>
                              <div className="text-sm text-gray-400">{user.displayName}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{user.followers} followers</span>
                            <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                              Follow
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Network Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Active Users</span>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                    12.4K
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Posts Today</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30">
                    2.1K
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Communities</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                    847
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Featured Communities */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Featured Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                    <div className="font-medium text-cyan-400">0G Chain Official</div>
                    <div className="text-xs text-gray-400">3.2k members • Official</div>
                  </div>
                  <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
                    <div className="font-medium text-purple-400">DeFi Discussions</div>
                    <div className="text-xs text-gray-400">1.8k members • Active</div>
                  </div>
                  <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                    <div className="font-medium text-green-400">Tech Innovations</div>
                    <div className="text-xs text-gray-400">1.1k members • Growing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}