import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Crown, TrendingUp, Globe, Lock, Settings } from "lucide-react";

export function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: myCommunities } = useQuery({
    queryKey: ['/api/communities/joined'],
  });

  const { data: popularCommunities } = useQuery({
    queryKey: ['/api/communities/popular'],
  });

  const { data: recommendedCommunities } = useQuery({
    queryKey: ['/api/communities/recommended'],
  });

  const mockCommunities = [
    {
      id: '1',
      name: '0G Chain Official',
      description: 'Official community for 0G Chain developers and enthusiasts',
      members: 12420,
      posts: 2340,
      isOfficial: true,
      isPrivate: false,
      category: 'Official',
      avatar: '/api/placeholder/community1.jpg'
    },
    {
      id: '2',
      name: 'DeFi Innovations',
      description: 'Discussing the latest in decentralized finance protocols',
      members: 8960,
      posts: 1890,
      isOfficial: false,
      isPrivate: false,
      category: 'Finance',
      avatar: '/api/placeholder/community2.jpg'
    },
    {
      id: '3',
      name: 'AI & Blockchain',
      description: 'Where artificial intelligence meets blockchain technology',
      members: 6750,
      posts: 1560,
      isOfficial: false,
      isPrivate: false,
      category: 'Technology',
      avatar: '/api/placeholder/community3.jpg'
    },
    {
      id: '4',
      name: 'Web3 Builders',
      description: 'Community for developers building the decentralized web',
      members: 4320,
      posts: 980,
      isOfficial: false,
      isPrivate: true,
      category: 'Development',
      avatar: '/api/placeholder/community4.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Communities
                </h1>
                <p className="text-gray-400">Connect with like-minded builders and innovators</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="discover" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="discover">
                  <Globe className="w-4 h-4 mr-2" />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="joined">
                  <Users className="w-4 h-4 mr-2" />
                  Joined
                </TabsTrigger>
                <TabsTrigger value="popular">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Popular
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discover" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockCommunities.map((community) => (
                    <Card key={community.id} className="futuristic-card dark:futuristic-card-dark hover:scale-105 transition-transform">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{community.name}</CardTitle>
                              {community.isOfficial && (
                                <Crown className="w-4 h-4 text-yellow-400" />
                              )}
                              {community.isPrivate && (
                                <Lock className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                              {community.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-4">{community.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="font-medium text-green-400">{community.members.toLocaleString()}</span>
                              <span className="text-gray-400 ml-1">members</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-blue-400">{community.posts.toLocaleString()}</span>
                              <span className="text-gray-400 ml-1">posts</span>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 hover:bg-gradient-to-r hover:from-green-600/30 hover:to-blue-600/30">
                          {community.isPrivate ? 'Request to Join' : 'Join Community'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="joined" className="mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle>Your Communities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>You haven't joined any communities yet</p>
                      <p className="text-sm">Discover communities to start connecting</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <div className="space-y-6">
                  {mockCommunities.sort((a, b) => b.members - a.members).map((community) => (
                    <Card key={community.id} className="futuristic-card dark:futuristic-card-dark">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold">{community.name}</h3>
                              {community.isOfficial && (
                                <Crown className="w-5 h-5 text-yellow-400" />
                              )}
                              {community.isPrivate && (
                                <Lock className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                            <p className="text-gray-400 mb-2">{community.description}</p>
                            <div className="flex items-center gap-4 mb-3">
                              <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                                {community.category}
                              </Badge>
                              <span className="text-sm text-gray-400">
                                {community.members.toLocaleString()} members • {community.posts.toLocaleString()} posts
                              </span>
                            </div>
                          </div>
                          <Button className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 hover:bg-gradient-to-r hover:from-green-600/30 hover:to-blue-600/30">
                            {community.isPrivate ? 'Request' : 'Join'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Communities</span>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                    2,847
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Active Members</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30">
                    125K
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">New Today</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                    +23
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Official', count: 12, color: 'text-yellow-400 border-yellow-400/30' },
                    { name: 'Technology', count: 456, color: 'text-blue-400 border-blue-400/30' },
                    { name: 'Finance', count: 289, color: 'text-green-400 border-green-400/30' },
                    { name: 'Development', count: 378, color: 'text-purple-400 border-purple-400/30' },
                    { name: 'Gaming', count: 234, color: 'text-orange-400 border-orange-400/30' },
                    { name: 'Art & Design', count: 167, color: 'text-pink-400 border-pink-400/30' }
                  ].map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-2 rounded hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="outline" className={category.color}>
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-green-500/30 text-green-400 hover:bg-green-500/10">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
                <Button variant="outline" className="w-full justify-start border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Communities
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}