import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ImageIcon, Database, Loader2 } from "lucide-react";

export function CreatePost() {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      return await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: (data: any) => {
      setContent("");
      // Invalidate both posts queries to refresh the feed
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      
      // Show success message with 0G Storage information
      toast({
        title: "Post created successfully",
        description: data.storageHash 
          ? `Content stored on 0G Storage: ${data.storageHash.substring(0, 12)}...`
          : "Your post has been published to the decentralized network",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createPostMutation.mutate({ content: content.trim() });
  };

  const isDisabled = !content.trim() || createPostMutation.isPending;
  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            <div className="w-10 h-10 avatar-gradient-1 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening on 0G Chain?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] border-0 text-lg resize-none placeholder:text-og-slate-500 focus-visible:ring-0"
                disabled={createPostMutation.isPending}
              />
              
              {/* Character count and 0G Storage info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-og-slate-200 dark:border-og-slate-700">
                <div className="flex items-center space-x-2 text-xs text-og-slate-500">
                  <Database className="w-3 h-3" />
                  <span>Content will be stored on 0G Storage</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${
                    isOverLimit 
                      ? "text-red-500" 
                      : characterCount > maxCharacters * 0.9 
                        ? "text-yellow-500" 
                        : "text-og-slate-500"
                  }`}>
                    {characterCount}/{maxCharacters}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-og-primary hover:bg-og-primary/10"
                      disabled={createPostMutation.isPending}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={isDisabled || isOverLimit}
                      className="bg-og-primary hover:bg-og-primary/90 text-white font-semibold px-6"
                    >
                      {createPostMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Storing on 0G...
                        </>
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}