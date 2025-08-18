import { useState } from "react";
import { Image, BarChart3, Coins } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function CreatePost() {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
      const response = await apiRequest("POST", "/api/posts", {
        content: postContent,
      });
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      toast({
        title: "Post created!",
        description: "Your post has been shared with the 0G community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPostMutation.mutate(content);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <div className="w-10 h-10 avatar-gradient-1 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <Textarea
              placeholder="What's happening in the decentralized world?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-20 resize-none border-none outline-none bg-transparent text-lg placeholder-og-slate-400 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span className="text-sm">Media</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Poll</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors"
                >
                  <Coins className="w-4 h-4" />
                  <span className="text-sm">Token Gate</span>
                </Button>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || createPostMutation.isPending}
                className="px-6 py-2 bg-og-primary text-white rounded-xl font-medium hover:bg-og-primary/90 transition-colors"
              >
                {createPostMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
