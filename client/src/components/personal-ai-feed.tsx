import { Bot, Play, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function PersonalAIFeed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deployAIFeed = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/feed/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deploy AI feed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "AI Feed Deployed",
        description: "Your personal AI feed is now active on 0G Compute",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feed/status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="cyber-glass dark:cyber-glass-dark border-0 neon-border-cyan">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Bot className="text-cyan-400 w-5 h-5 flex-shrink-0 pulse-glow" />
          <span className="leading-tight gradient-neon-text">Your Personal AI Feed</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 cyber-glass dark:cyber-glass-dark rounded-2xl flex items-center justify-center neon-border-purple">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-cyan-100 font-medium">
              Your personal AI feed is not yet deployed
            </p>
            <p className="text-xs text-cyan-300/60">
              Deploy AI to get personalized recommendations
            </p>
          </div>

          {/* Deploy Button */}
          <Button
            onClick={() => deployAIFeed.mutate()}
            disabled={deployAIFeed.isPending}
            className="cyber-button w-full flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>
              {deployAIFeed.isPending ? "Deploying..." : "Deploy AI Feed"}
            </span>
          </Button>
        </div>

        {/* Features Preview */}
        <div className="space-y-3 pt-4 border-t border-cyan-400/20">
          <div className="flex items-center space-x-3 p-2 cyber-glass dark:cyber-glass-dark rounded-lg">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-cyan-100 font-medium">Smart Content Filtering</p>
              <p className="text-cyan-300/60">AI learns your preferences</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-2 cyber-glass dark:cyber-glass-dark rounded-lg">
            <Bot className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-cyan-100 font-medium">Decentralized Processing</p>
              <p className="text-cyan-300/60">Runs on 0G Compute network</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-2 cyber-glass dark:cyber-glass-dark rounded-lg">
            <Users className="w-4 h-4 text-green-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-cyan-100 font-medium">Community Insights</p>
              <p className="text-cyan-300/60">Connect with similar interests</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}