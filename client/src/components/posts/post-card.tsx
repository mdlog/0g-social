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
    <Card className="mb-6 overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-start space-x-3">
          <Avatar className="w-12 h-12 ring-2 ring-blue-300 dark:ring-blue-600">
            <AvatarImage 
              src={post.author?.avatar ? `${window.location.origin}${post.author.avatar}` : ""} 
              alt={post.author?.displayName || "User"} 
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-500 text-white font-semibold">
              {(post.author?.displayName || "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 dark:text-white">{post.author?.displayName || "Unknown User"}</h3>
              <span className="text-gray-500 dark:text-gray-400 text-sm">@{post.author?.username || "unknown"}</span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <article>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {post.content}
            </p>

            {/* Media display with unique styling */}
            {post.imageUrl && (
              <div className="rounded-xl overflow-hidden shadow-md">
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
                    className="w-full h-64 object-cover hover:scale-102 transition-transform duration-300" 
                  />
                )}
              </div>
            )}

            {/* 0G Network verification with card design */}
            {post.storageHash && post.transactionHash && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">Stored on 0G Network</span>
                  </div>
                  <a 
                    href={`https://chainscan-galileo.0g.ai/tx/${post.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                    title="View on blockchain explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Action buttons with modern styling */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                    post.isLiked 
                      ? "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30" 
                      : "text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{post.likesCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.commentsCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => repostMutation.mutate()}
                  disabled={repostMutation.isPending}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                    post.isReposted 
                      ? "text-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30" 
                      : "text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                  }`}
                >
                  <Share className={`w-5 h-5 ${post.isReposted ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{post.sharesCount}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 py-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  <Bookmark className="w-5 h-5" />
                </Button>
                
                {/* Blockchain Verification Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-3 py-2 rounded-full transition-all duration-200 ${
                        post.storageHash && post.transactionHash
                          ? "text-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                          : "text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                      title="Verify on Blockchain"
                    >
                      <Shield className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-lg">
                    <BlockchainVerification 
                      storageHash={post.storageHash || undefined}
                      transactionHash={post.transactionHash || undefined}
                      postId={post.id}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Comment Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                {/* Existing Comments */}
                {commentsLoading ? (
                  <div className="mb-4 text-center text-gray-500 dark:text-gray-400">
                    Loading comments...
                  </div>
                ) : (console.log('[DEBUG Frontend] Rendering comments:', comments.length, comments) || comments.length > 0) ? (
                  <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="flex space-x-3 p-3 rounded-xl cyber-glass dark:cyber-glass-dark">
                        <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-cyan-400/20">
                          <AvatarImage 
                            src={comment.author?.avatar ? `${window.location.origin}${comment.author.avatar}` : ""} 
                            alt={comment.author?.displayName || "User"} 
                          />
                          <AvatarFallback className={`${getAvatarClass(comment.authorId)} text-white text-xs`}>
                            {(comment.author?.displayName || "??").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-cyan-100 text-sm">
                              {comment.author?.displayName || "Anonymous User"}
                            </span>
                            <span className="text-xs text-cyan-300/60">
                              @{comment.author?.username || "unknown"}.0g
                            </span>
                            <span className="text-xs text-cyan-400/40">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-cyan-50 text-sm leading-relaxed break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 text-center text-cyan-300/40 text-sm py-4">
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
                    className="flex-1 cyber-input text-sm"
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
                    className="cyber-button-small"
                  >
                    {commentMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-cyan-300/60">
                  Comments are recorded permanently on 0G DA layer
                </div>
              </div>
            )}
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
