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
    <Card className="futuristic-card dark:futuristic-card-dark hover:neon-border-cyan transition-all duration-300 slide-in-cyber">
      <CardContent className="p-6">
        <article className="flex space-x-4">
          <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-cyan-400/30 hover:ring-cyan-400/60 avatar-smooth">
            <AvatarImage 
              src={post.author.avatar ? `${window.location.origin}${post.author.avatar}` : ""} 
              alt={post.author.displayName} 
              className="object-cover"
            />
            <AvatarFallback className={`${getAvatarClass(post.authorId)} text-white font-semibold text-sm shadow-lg`}>
              {post.author.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h4 className="font-semibold text-cyan-100">{post.author.displayName}</h4>
              <span className="gradient-neon-text text-sm">@{post.author.username}.0g</span>
              {post.author.isVerified && (
                <div className="verified-badge">
                  <Shield className="w-3 h-3" />
                  <span className="text-xs">VERIFIED</span>
                </div>
              )}
              <span className="text-cyan-400/60 text-sm">•</span>
              <span className="text-cyan-300/80 text-sm">{formatTimeAgo(post.createdAt)}</span>
              {post.isAiRecommended && (
                <div className="ai-recommendation-badge pulse-glow">
                  <div className="w-3 h-3 gradient-cyber-primary rounded-full"></div>
                  <span className="text-xs">AI ENHANCED</span>
                </div>
              )}
            </div>
            
            <p className="text-cyan-50 dark:text-cyan-100 mb-4 leading-relaxed">
              {post.content}
            </p>

            {/* Media display for images and videos */}
            {post.imageUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-cyan-400/20 shadow-lg shadow-cyan-400/10">
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
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" 
                  />
                )}
              </div>
            )}

            {/* 0G Storage Verification Links */}
            {post.storageHash && post.transactionHash && (
              <div className="mb-4 p-4 cyber-glass dark:cyber-glass-dark rounded-2xl neon-border-green">
                <div className="flex items-center space-x-3 mb-3">
                  <Database className="w-5 h-5 text-green-400 pulse-glow" />
                  <span className="text-sm font-semibold text-green-300">
                    ✅ VERIFIED ON 0G NETWORK
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-300/80">TRANSACTION:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-green-300 bg-green-400/10 px-2 py-1 rounded-lg">
                        {post.transactionHash.slice(0, 8)}...{post.transactionHash.slice(-6)}
                      </span>
                      <a 
                        href={`https://chainscan-galileo.0g.ai/tx/${post.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 cyber-glass hover:neon-border-cyan transition-all duration-300"
                        title="View transaction on 0G Chain Explorer"
                      >
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-300/80">STORAGE HASH:</span>
                    <span className="text-xs font-mono text-green-300 bg-green-400/10 px-2 py-1 rounded-lg">
                      {post.storageHash.slice(0, 8)}...{post.storageHash.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Show when post is not stored on 0G with enhanced status */}
            {!post.storageHash && !post.transactionHash && (
              <div className="mb-4 p-4 cyber-glass dark:cyber-glass-dark rounded-2xl neon-border-yellow">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="pulse-glow">
                      <Database className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-yellow-300">
                      0G STORAGE UPLOAD PENDING
                    </p>
                    <p className="text-xs text-yellow-200/80 mt-1">
                      Post created locally. Upload to decentralized storage will retry automatically when network is available.
                    </p>
                    <div className="mt-3 flex items-center space-x-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-yellow-400/10 text-yellow-300 border border-yellow-400/30">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                        AUTO-RETRYING...
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryStorageMutation.mutate()}
                        disabled={retryStorageMutation.isPending}
                        className="cyber-button-small text-xs"
                      >
                        {retryStorageMutation.isPending ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 mr-1" />
                        )}
                        RETRY NOW
                      </Button>
                      <button 
                        className="text-xs text-yellow-300 hover:text-yellow-100 transition-colors underline"
                        onClick={() => window.open('https://faucet.0g.ai', '_blank')}
                      >
                        GET 0G TOKENS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-cyan-400/10">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center space-x-2 p-2 rounded-xl transition-all duration-300 ${
                    post.isLiked 
                      ? "text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 neon-border-red" 
                      : "text-cyan-300/80 hover:text-red-400 hover:bg-red-500/10 hover:neon-border-red"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current pulse-glow" : ""}`} />
                  <span className="text-sm font-medium">{post.likesCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 p-2 rounded-xl text-cyan-300/80 hover:text-blue-400 hover:bg-blue-500/10 hover:neon-border-blue transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{post.commentsCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => repostMutation.mutate()}
                  disabled={repostMutation.isPending}
                  className={`flex items-center space-x-2 p-2 rounded-xl transition-all duration-300 ${
                    post.isReposted 
                      ? "text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 neon-border-green" 
                      : "text-cyan-300/80 hover:text-green-400 hover:bg-green-500/10 hover:neon-border-green"
                  }`}
                >
                  <Share className={`w-4 h-4 ${post.isReposted ? "fill-current pulse-glow" : ""}`} />
                  <span className="text-sm font-medium">{post.sharesCount}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-xl text-cyan-300/80 hover:text-magenta-400 hover:bg-magenta-500/10 hover:neon-border-magenta transition-all duration-300"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
                
                {/* Blockchain Verification Button - available for all posts */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        post.storageHash && post.transactionHash
                          ? "text-green-400 hover:text-green-300 hover:bg-green-500/10 hover:neon-border-green pulse-glow"
                          : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 hover:neon-border-cyan"
                      }`}
                      title="Verify on Blockchain"
                    >
                      <Shield className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="futuristic-card dark:futuristic-card-dark max-w-lg !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] !z-[100]">
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
              <div className="mt-4 pt-4 border-t border-cyan-400/10">
                {/* Existing Comments */}
                {commentsLoading ? (
                  <div className="mb-4 text-center text-cyan-300/60">
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
