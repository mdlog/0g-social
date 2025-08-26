import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ThreadComments } from '@/components/interactions/thread-comments';
import { ContentSharing } from '@/components/interactions/content-sharing';
import { BookmarksCollections } from '@/components/interactions/bookmarks-collections';
import { MessageCircle, Share2, Bookmark, Sparkles, Users, TrendingUp } from 'lucide-react';

export default function InteractionsPage() {
  const [selectedPostId, setSelectedPostId] = useState<string>('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['demo-posts'],
    queryFn: () => fetch('/api/posts/feed?limit=5').then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Advanced Interaction Features
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore Wave 2 features: threaded comments, content sharing, and bookmark collections. 
          These features enhance community engagement and content organization on DeSocialAI.
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Wave 2</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>Community Features</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Enhanced Engagement</span>
          </Badge>
        </div>
      </div>

      {/* Demo Post Selection */}
      {posts.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="text-lg">Select a Post for Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {posts.slice(0, 3).map((post: any) => (
                <div
                  key={post.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPostId === post.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPostId(post.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{post.author?.displayName || 'User'}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.likesCount} likes
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {post.commentsCount} comments
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                    {selectedPostId === post.id && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!selectedPostId && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                👆 Click on a post above to test interaction features
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feature Tabs */}
      <Tabs defaultValue="comments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comments" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Thread Comments</span>
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Content Sharing</span>
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center space-x-2">
            <Bookmark className="h-4 w-4" />
            <span>Bookmarks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Threaded Comments System</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nested conversations with up to 3 levels of replies. Like comments, track engagement, and maintain context.
              </p>
            </CardHeader>
            <CardContent>
              {selectedPostId ? (
                <ThreadComments postId={selectedPostId} />
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Select a post above to test threaded comments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Content Sharing System</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share posts internally, across communities, or to external platforms. Track shares and engagement.
              </p>
            </CardHeader>
            <CardContent>
              {selectedPostId ? (
                <div className="space-y-4">
                  <ContentSharing 
                    postId={selectedPostId}
                    postTitle={posts.find((p: any) => p.id === selectedPostId)?.content?.slice(0, 50)}
                    postAuthor={posts.find((p: any) => p.id === selectedPostId)?.author?.displayName}
                  />
                  
                  {/* Feature Overview */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Sharing Types Available:</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• <strong>Internal:</strong> Share within DeSocialAI platform</li>
                        <li>• <strong>Cross-Community:</strong> Share to specific communities</li>
                        <li>• <strong>External:</strong> Generate links for Twitter, Facebook, etc.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Share2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Select a post above to test content sharing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5" />
                <span>Bookmarks & Collections</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save posts to bookmarks, organize with collections, and add personal notes. Create public or private collections.
              </p>
            </CardHeader>
            <CardContent>
              <BookmarksCollections 
                postId={selectedPostId || undefined}
                showBookmarkButton={!!selectedPostId}
              />
              
              {/* Feature Overview */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 mt-6">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Bookmark Features:</h4>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• <strong>Quick Bookmarking:</strong> Save posts with one click</li>
                    <li>• <strong>Collections:</strong> Organize bookmarks into themed collections</li>
                    <li>• <strong>Notes:</strong> Add personal notes to bookmarked content</li>
                    <li>• <strong>Privacy:</strong> Create public or private collections</li>
                    <li>• <strong>Search:</strong> Find bookmarked content easily</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Development Status */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Wave 2 Development Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Thread Comments</span>
                <Badge variant="default">Complete</Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Nested replies, comment likes, threaded conversations
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Content Sharing</span>
                <Badge variant="default">Complete</Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Internal, cross-community, and external sharing
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Bookmarks</span>
                <Badge variant="default">Complete</Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Collections, notes, privacy controls
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Next Phase:</strong> Community Features, Governance Voting, Creator Economy with 0G Token integration
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}