import { Bot, Play, Users, Zap, Check, TrendingUp, UserPlus, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function PersonalAIFeed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query AI feed status
  const { data: feedStatus } = useQuery<{deployed: boolean; status: string; instanceId?: string; mode?: string}>({
    queryKey: ["/api/ai/feed/status"],
    refetchInterval: 30000, // Check status every 30 seconds
  });

  // Query 0G Compute status for authentic integration info
  const { data: computeStatus } = useQuery<{
    isConfigured: boolean;
    hasPrivateKey: boolean;
    mode: string;
    connection: boolean;
    note: string;
    details?: any;
  }>({
    queryKey: ["/api/zg/compute/status"],
    refetchInterval: 60000, // Check compute status every minute
  });

  const isSimulationMode = feedStatus?.mode === 'simulation' || computeStatus?.mode !== 'real';
  const isRealIntegration = computeStatus?.mode === 'real' && computeStatus?.connection;

  // Query AI recommendations (only when feed is deployed)
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<Array<{
    id: string;
    type: 'topic' | 'user' | 'post';
    title: string;
    description: string;
    confidence: number;
    reason: string;
  }>>({
    queryKey: ["/api/ai/feed/recommendations"],
    enabled: feedStatus?.deployed === true,
    refetchInterval: 300000, // Refresh recommendations every 5 minutes
    retry: 3,
    staleTime: 0, // Always fetch fresh data
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
    onSuccess: (data) => {
      toast({
        title: "AI Feed Deployed",
        description: data.mode === 'simulation' 
          ? "Personal AI deployed in simulation mode using OpenAI GPT-4o"
          : "Your personal AI feed is now running on authentic 0G Compute Network",
      });
      // Force refetch of both status and recommendations
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feed/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feed/recommendations"] });
      
      // Also force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/ai/feed/status"] });
        queryClient.refetchQueries({ queryKey: ["/api/ai/feed/recommendations"] });
      }, 1000);
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
                <p className="text-xs text-green-300/60">
                  {isRealIntegration ? 'Running on 0G Compute Network' : 'Development Simulation Mode'}
                </p>
                <div className="flex items-center justify-center mt-2 space-x-2">
                  {isRealIntegration ? (
                    <span className="inline-flex items-center space-x-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full border border-green-500/40">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>REAL 0G COMPUTE</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs bg-yellow-900/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-600/30">
                      <AlertCircle className="w-3 h-3" />
                      <span>SIMULATION</span>
                    </span>
                  )}
                  {computeStatus?.hasPrivateKey && (
                    <span className="inline-flex items-center space-x-1 text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full border border-blue-500/40">
                      <Activity className="w-3 h-3" />
                      <span>SDK READY</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-cyan-400/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-cyan-100">
                    {isRealIntegration ? 'AI Recommendations (0G Compute)' : 'Recommendations (Simulation)'}
                  </p>
                  {isRealIntegration && (
                    <span className="text-xs text-green-400 font-mono">AUTHENTIC</span>
                  )}
                </div>
                
                {recommendations.slice(0, 3).map((rec) => (
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
                {computeStatus?.mode === 'real' 
                  ? 'Deploy using authentic 0G Compute Network'
                  : 'Deploy in simulation mode (awaiting 0G Compute mainnet)'
                }
              </p>
              
              {/* Status indicators */}
              <div className="flex items-center justify-center space-x-2 mt-3">
                {computeStatus?.hasPrivateKey ? (
                  <span className="inline-flex items-center space-x-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full border border-green-500/40">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SDK CONFIGURED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs bg-gray-900/30 text-gray-400 px-2 py-1 rounded-full border border-gray-500/40">
                    <AlertCircle className="w-3 h-3" />
                    <span>SDK READY</span>
                  </span>
                )}
                
                {computeStatus?.mode === 'real' && computeStatus?.connection && (
                  <span className="inline-flex items-center space-x-1 text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full border border-blue-500/40">
                    <Activity className="w-3 h-3" />
                    <span>0G NETWORK</span>
                  </span>
                )}
              </div>
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
                  <p className="text-cyan-100 font-medium">
                    {computeStatus?.mode === 'real' ? '0G Compute Processing' : 'Decentralized Processing'}
                  </p>
                  <p className="text-cyan-300/60">
                    {computeStatus?.mode === 'real' ? 'Powered by official 0G SDK' : 'Runs on 0G Compute network'}
                  </p>
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