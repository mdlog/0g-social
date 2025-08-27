import { Heart, MessageCircle, Share, Bookmark, Shield, Database, ExternalLink, RefreshCw, Send } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BlockchainVerification } from "@/components/blockchain-verification";
import type { PostWithAuthor } from "@shared/schema";
import { useState } from "react";

// Helper function for formatting file sizes correctly
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Fetch comments when showComments is true
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/posts", post.id, "comments"],
    queryFn: async () => {
      console.log('[DEBUG] Fetching comments for post:', post.id);
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('[DEBUG] Received comments data:', data);
      return data;
    },
    enabled: showComments,
  });

  // Debug log when comments change
  console.log('[DEBUG Frontend] Comments data:', comments);

  // Manual retry mutation for 0G Storage uploads
  const retryStorageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/retry-storage`);
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Retry successful",
        description: data?.message || "0G Storage upload verified and updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: any) => {
      // Parse error message from API
      let errorMessage = "Could not initiate storage retry";
      
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If JSON parsing fails, use the error message directly
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Retry failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (post.isLiked) {
        await apiRequest("DELETE", `/api/likes/${post.id}`);
      } else {
        await apiRequest("POST", "/api/likes", { postId: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: post.isLiked ? "Like removed" : "Post liked!",
        description: post.isLiked ? "Your like has been removed" : "Like recorded on 0G DA layer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Like failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      if (post.isReposted) {
        await apiRequest("DELETE", `/api/reposts/${post.id}`);
      } else {
        await apiRequest("POST", "/api/reposts", { postId: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: post.isReposted ? "Repost removed" : "Post reposted",
        description: post.isReposted ? "Your repost has been removed" : "Post shared and recorded on 0G DA layer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Repost failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/comments", { 
        postId: post.id, 
        content 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "comments"] });
      setCommentText("");
      toast({
        title: "Comment posted!",
        description: "Your comment has been recorded on 0G DA layer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Comment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "now";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getAvatarClass = (userId: string) => {
    const classes = [
      "avatar-gradient-1",
      "avatar-gradient-2", 
      "avatar-gradient-3",
      "avatar-gradient-4"
    ];
    return classes[userId.charCodeAt(userId.length - 1) % classes.length];
  };

  return (
    <Card className="elegant-card">
      <CardContent className="p-6">
        <article className="flex space-x-4">
          <Avatar className="w-12 h-12 flex-shrink-0 elegant-avatar">
            <AvatarImage 
              src={post.author?.avatar ? `${window.location.origin}${post.author.avatar}` : ""} 
              alt={post.author?.displayName || "User"} 
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-sm">
              {(post.author?.displayName || "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">{post.author?.displayName || "Unknown User"}</h4>
              <span className="text-gray-600 dark:text-gray-400 text-sm truncate">@{post.author?.username || "unknown"}</span>
              {post.author?.isVerified && (
                <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
                  <Shield className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              )}
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{formatTimeAgo(post.createdAt)}</span>
              {post.isAiRecommended && (
                <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs">
                  AI Enhanced
                </span>
              )}
            </div>
            
            <p className="text-foreground mb-4 text-base leading-relaxed">
              {post.content}
            </p>

            {/* Media display for images and videos */}
            {post.imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                {post.mediaType?.startsWith('video/') ? (
                  <video 
                    src={post.imageUrl} 
                    controls 
                    className="w-full max-h-80 object-cover" 
                  />
                ) : (
                  <img 
                    src={post.imageUrl} 
                    alt="Post media" 
                    className="w-full h-48 object-cover" 
                  />
                )}
              </div>
            )}

            {/* Simple 0G Network verification status */}
            {post.storageHash && post.transactionHash && (
              <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300">Stored on 0G Network</span>
                  <a 
                    href={`https://chainscan-galileo.0g.ai/tx/${post.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    title="View on blockchain explorer"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full elegant-button transition-all ${
                    post.isLiked 
                      ? "text-red-500 bg-red-50 hover:bg-red-100" 
                      : "text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50/50"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{post.likesCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 elegant-button transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{post.commentsCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => repostMutation.mutate()}
                  disabled={repostMutation.isPending}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full elegant-button transition-all ${
                    post.isReposted 
                      ? "text-green-500 bg-green-50 hover:bg-green-100" 
                      : "text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-green-50/50"
                  }`}
                >
                  <Share className={`w-4 h-4 ${post.isReposted ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{post.sharesCount}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 elegant-button transition-all"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
                

              </div>
            </div>

            {/* Comment Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Existing Comments */}
                {commentsLoading ? (
                  <div className="mb-4 text-center text-gray-500 dark:text-gray-400">
                    Loading comments...
                  </div>
                ) : (console.log('[DEBUG Frontend] Rendering comments:', comments.length, comments) || comments.length > 0) ? (
                  <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage 
                            src={comment.author?.avatar ? `${window.location.origin}${comment.author.avatar}` : ""} 
                            alt={comment.author?.displayName || "User"} 
                          />
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs">
                            {(comment.author?.displayName || "??").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {comment.author?.displayName || "Anonymous User"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              @{comment.author?.username || "unknown"}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                    No comments yet. Be the first to comment!
                  </div>
                )}

                {/* Add New Comment */}
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && commentText.trim()) {
                        commentMutation.mutate(commentText.trim());
                      }
                    }}
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm"
                    disabled={commentMutation.isPending}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (commentText.trim()) {
                        commentMutation.mutate(commentText.trim());
                      }
                    }}
                    disabled={commentMutation.isPending || !commentText.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-sm"
                  >
                    {commentMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Comments are stored on 0G Network
                </div>
              </div>
            )}
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
