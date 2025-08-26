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
  const username = params.username || currentUser?.username;
  const isOwnProfile = username === currentUser?.username;
  
  // Fetch user profile data
  const { data: profileUser, isLoading: profileLoading } = useQuery({
    queryKey: ['users', 'profile', username],
    queryFn: async () => {
      if (!username) return null;
      const response = await fetch(`/api/users/profile/${username}`);
      if (!response.ok) throw new Error('User not found');
      return response.json();
    },
    enabled: !!username,
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        {/* Cover Image Background */}
        <div className="h-32 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />
        
        <CardHeader className="relative -mt-16 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={profileUser.avatar} alt={profileUser.displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profileUser.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {profileUser.isVerified && (
                <Verified className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-500 fill-current" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold" data-testid="profile-display-name">
                      {profileUser.displayName}
                    </h1>
                    {profileUser.isPremium && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <Trophy className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground" data-testid="profile-username">@{profileUser.username}</p>
                  {profileUser.walletAddress && (
                    <p className="text-xs text-muted-foreground font-mono" data-testid="profile-wallet">
                      {profileUser.walletAddress.slice(0, 6)}...{profileUser.walletAddress.slice(-4)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowEditDialog(true)}
                        data-testid="button-edit-profile"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant={isFollowing ? "outline" : "default"}
                        onClick={handleFollow}
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
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <p className="text-sm leading-relaxed" data-testid="profile-bio">
                  {profileUser.bio}
                </p>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                {profileUser.reputationScore && profileUser.reputationScore > 0 && (
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {profileUser.reputationScore} Reputation
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-2">
                <div className="text-center" data-testid="stat-posts">
                  <div className="font-bold text-lg">{stats?.postsCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center" data-testid="stat-following">
                  <div className="font-bold text-lg">{stats?.followingCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
                <div className="text-center" data-testid="stat-followers">
                  <div className="font-bold text-lg">{stats?.followersCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center" data-testid="stat-likes">
                  <div className="font-bold text-lg">{stats?.likesReceived || 0}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts" className="flex items-center gap-2" data-testid="tab-posts">
            <MessageSquare className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="replies" className="flex items-center gap-2" data-testid="tab-replies">
            <MessageSquare className="w-4 h-4" />
            Replies  
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2" data-testid="tab-media">
            <LinkIcon className="w-4 h-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2" data-testid="tab-likes">
            <Heart className="w-4 h-4" />
            Likes
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {postsLoading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Share your first thought with DeSocialAI!" : `${profileUser.displayName} hasn't posted anything yet.`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Replies Tab */}
        <TabsContent value="replies" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No replies yet</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "Your replies will appear here." : `${profileUser.displayName}'s replies will appear here.`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <LinkIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No media yet</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "Posts with photos and videos will appear here." : `${profileUser.displayName}'s media posts will appear here.`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Likes Tab */}
        <TabsContent value="likes" className="space-y-4">
          {likedPosts && likedPosts.length > 0 ? (
            <div className="space-y-4">
              {likedPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No liked posts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Posts you like will appear here." : `${profileUser.displayName}'s liked posts will appear here.`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
    </div>
  );
}