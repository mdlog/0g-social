import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/posts/post-card";
import { useAuth } from "@/hooks/use-auth";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Header } from "@/components/layout/header";

import { Footer } from "@/components/layout/footer";
import { ZGInfrastructureStatus } from "@/components/zg-infrastructure/zg-status";
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Users, 
  MessageSquare, 
  Heart, 
  Bookmark,
  Settings,
  UserPlus,
  UserMinus,
  Trophy,
  Verified
} from "lucide-react";
import { useState } from "react";

interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
}

export function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Extract username from params
  const username = params.username;
  const isOwnProfile = !username; // If no username in URL, it's own profile
  
  // Fetch user profile data
  const { data: profileUser, isLoading: profileLoading } = useQuery({
    queryKey: ['users', 'profile', username || 'me'],
    queryFn: async () => {
      if (isOwnProfile) {
        // For own profile, use /api/users/me
        const response = await fetch('/api/users/me');
        if (!response.ok) throw new Error('User not found');
        return response.json();
      } else {
        // For other users, use /api/users/profile/:username
        const response = await fetch(`/api/users/profile/${username}`);
        if (!response.ok) throw new Error('User not found');
        return response.json();
      }
    },
    enabled: isOwnProfile || !!username,
  });

  // Fetch user posts
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'user', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const response = await fetch(`/api/posts/user/${profileUser.id}`);
      return response.json();
    },
    enabled: !!profileUser?.id,
  });

  // Fetch user stats
  const { data: stats } = useQuery<ProfileStats>({
    queryKey: ['users', 'stats', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return { postsCount: 0, followersCount: 0, followingCount: 0, likesReceived: 0 };
      const response = await fetch(`/api/users/${profileUser.id}/stats`);
      return response.json();
    },
    enabled: !!profileUser?.id,
  });

  // Fetch liked posts (for likes tab)
  const { data: likedPosts } = useQuery({
    queryKey: ['posts', 'liked', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const response = await fetch(`/api/users/${profileUser.id}/liked`);
      return response.json();
    },
    enabled: !!profileUser?.id,
  });

  const handleFollow = async () => {
    if (!profileUser || !currentUser) return;
    
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${profileUser.id}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h1 className="text-2xl font-bold mb-4">User not found</h1>
            <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full">
          <main className="space-y-6">
      {/* Simple Elegant Profile Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-0">
        {/* Gradient Cover Background */}
        <div className="h-40 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 relative"></div>
        
        {/* Profile Content */}
        <div className="relative px-8 pb-8 bg-gradient-to-b from-slate-900/95 to-slate-900">
          {/* Avatar Centered */}
          <div className="flex flex-col items-center -mt-16">
            <Avatar className="w-24 h-24 border-4 border-white shadow-2xl">
              <AvatarImage src={profileUser.avatar} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {(profileUser.displayName || profileUser.username)?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            {/* User Name and Username */}
            <div className="text-center mt-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white" data-testid="profile-display-name">
                  {profileUser.displayName || profileUser.username}
                </h1>
                <Verified className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-gray-300 text-base" data-testid="profile-username">@{profileUser.username}</p>
              <p className="text-xs font-mono text-gray-400 mt-1" data-testid="profile-wallet">
                {profileUser.walletAddress ? `${profileUser.walletAddress.slice(0, 6)}...${profileUser.walletAddress.slice(-4)}` : ''}
              </p>
            </div>

            {/* Action Button */}
            <div className="mb-6">
              {isOwnProfile ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(true)}
                  className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                  data-testid="button-edit-profile"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  className={isFollowing 
                    ? "bg-white/10 backdrop-blur border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/30" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                  }
                  data-testid="button-follow"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <div className="text-center max-w-sm mb-4">
                <p className="text-sm text-gray-300 leading-relaxed" data-testid="profile-bio">
                  {profileUser.bio}
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                0G Network
              </div>
              <div className="flex items-center gap-1">
                <span>Wallet: {profileUser.walletAddress ? `${profileUser.walletAddress.slice(0, 8)}...${profileUser.walletAddress.slice(-6)}` : 'Not connected'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Simple Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-4 text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
          <div className="text-xl font-bold text-gray-900 dark:text-white" data-testid="stat-posts">
            {stats?.postsCount || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Posts</div>
        </Card>
        
        <Card className="p-4 text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
          <div className="text-xl font-bold text-gray-900 dark:text-white" data-testid="stat-followers">
            {stats?.followersCount || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Followers</div>
        </Card>
        
        <Card className="p-4 text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
          <div className="text-xl font-bold text-gray-900 dark:text-white" data-testid="stat-following">
            {stats?.followingCount || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Following</div>
        </Card>
        
        <Card className="p-4 text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
          <div className="text-xl font-bold text-gray-900 dark:text-white" data-testid="stat-likes">
            {stats?.likesReceived || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Likes</div>
        </Card>
      </div>

      {/* Modern Profile Tabs */}
      <Card className="p-0 overflow-hidden">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-muted/30 rounded-none border-b">
            <TabsTrigger 
              value="posts" 
              className="flex items-center gap-2 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none font-medium transition-all" 
              data-testid="tab-posts"
            >
              <MessageSquare className="w-5 h-5" />
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="replies" 
              className="flex items-center gap-2 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:shadow-none font-medium transition-all" 
              data-testid="tab-replies"
            >
              <Users className="w-5 h-5" />
              Followers  
            </TabsTrigger>
            <TabsTrigger 
              value="media" 
              className="flex items-center gap-2 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none font-medium transition-all" 
              data-testid="tab-media"
            >
              <UserPlus className="w-5 h-5" />
              Friends
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="flex items-center gap-2 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:shadow-none font-medium transition-all" 
              data-testid="tab-likes"
            >
              <Heart className="w-5 h-5" />
              Gallery
            </TabsTrigger>
          </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="p-6">
          {postsLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">Loading posts...</div>
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="space-y-6">
              {userPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-sm">
                {isOwnProfile ? "Share your first thought with DeSocialAI!" : `${profileUser.displayName || profileUser.username} hasn't posted anything yet.`}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="replies" className="p-6">
          <div className="text-center py-16 text-muted-foreground">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No followers yet</h3>
            <p className="text-sm">
              {isOwnProfile ? "Your followers will appear here." : `${profileUser.displayName || profileUser.username}'s followers will appear here.`}
            </p>
          </div>
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="media" className="p-6">
          <div className="text-center py-16 text-muted-foreground">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <UserPlus className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No friends yet</h3>
            <p className="text-sm">
              {isOwnProfile ? "Connect with other users to build your network." : `${profileUser.displayName || profileUser.username}'s friends will appear here.`}
            </p>
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="likes" className="p-6">
          {likedPosts && likedPosts.length > 0 ? (
            <div className="space-y-6">
              {likedPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No gallery items yet</h3>
              <p className="text-sm">
                {isOwnProfile ? "Media and visual content will appear here." : `${profileUser.displayName || profileUser.username}'s gallery will appear here.`}
              </p>
            </div>
          )}
        </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        user={profileUser}
        trigger={
          showEditDialog ? (
            <Button variant="outline" className="opacity-0 pointer-events-none">
              Hidden Trigger
            </Button>
          ) : null
        }
      />
          </main>
        </div>
      </div>

      {/* 0G Infrastructure Status - Bottom Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-og-slate-50 dark:bg-og-slate-900/50">
        <ZGInfrastructureStatus />
      </div>

      <Footer />
    </div>
  );
}