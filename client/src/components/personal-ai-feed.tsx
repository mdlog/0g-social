import { Bot, Play, Users, Zap, Check, TrendingUp, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function PersonalAIFeed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query AI feed status
  const { data: feedStatus } = useQuery({
    queryKey: ["/api/ai/feed/status"],
    refetchInterval: 30000, // Check status every 30 seconds
  });

  // Query AI recommendations (only when feed is deployed)
  const { data: recommendations } = useQuery({
    queryKey: ["/api/ai/feed/recommendations"],
    enabled: feedStatus?.deployed === true,
    refetchInterval: 300000, // Refresh recommendations every 5 minutes
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feed/recommendations"] });
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
        {feedStatus?.deployed ? (
          /* Active AI Feed */
          <div className="space-y-4">
            {/* Status Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-16 h-16 cyber-glass dark:cyber-glass-dark rounded-2xl flex items-center justify-center neon-border-green">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-sm text-green-100 font-medium">AI Feed Active</p>
                <p className="text-xs text-green-300/60">Running on 0G Compute</p>
              </div>
            </div>

            {/* AI Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-cyan-400/20">
                <p className="text-xs font-medium text-cyan-100">Personalized for You</p>
                
                {recommendations.slice(0, 3).map((rec: any) => (
                  <div key={rec.id} className="flex items-start space-x-3 p-3 cyber-glass dark:cyber-glass-dark rounded-lg hover:bg-cyan-400/10 transition-colors cursor-pointer">
                    <div className="flex-shrink-0">
                      {rec.type === 'topic' && <TrendingUp className="w-4 h-4 text-cyan-400 mt-0.5" />}
                      {rec.type === 'user' && <UserPlus className="w-4 h-4 text-purple-400 mt-0.5" />}
                      {rec.type === 'post' && <Bot className="w-4 h-4 text-green-400 mt-0.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-cyan-100 line-clamp-1">{rec.title}</p>
                      <p className="text-xs text-cyan-300/70 mt-0.5 line-clamp-2">{rec.description}</p>
                      <p className="text-xs text-cyan-400/60 mt-1">
                        {Math.round(rec.confidence * 100)}% confidence • {rec.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Deployment Section */
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 cyber-glass dark:cyber-glass-dark rounded-2xl flex items-center justify-center neon-border-purple">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-cyan-100 font-medium">
                Personal AI Feed Available
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}