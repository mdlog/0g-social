import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Cpu, 
  Shield, 
  Activity, 
  Users, 
  HardDrive,
  Zap,
  CheckCircle,
  AlertCircle,
  Play,
  Pause
} from "lucide-react";
import { useState } from "react";

interface ZGStorageStats {
  totalStorage: string;
  availableSpace: string;
  networkNodes: number;
  replicationFactor: number;
}

interface ZGComputeStats {
  totalInstances: number;
  activeUsers: number;
  computeCapacity: string;
  averageResponseTime: number;
}

interface ZGDAStats {
  totalTransactions: number;
  pendingTransactions: number;
  processedBatches: number;
  avgBatchSize: number;
  dataAvailability: number;
}

interface ComputeInstance {
  instanceId: string;
  userId: string;
  status: 'running' | 'stopped' | 'deploying' | 'error';
  cpuUsage: number;
  memoryUsage: number;
  lastActive: string;
}

interface Web3Status {
  connected: boolean;
  network: string;
  chainId: string;
  blockExplorer: string;
  rpcUrl: string;
  blockHeight: number;
  gasPrice: string;
}

export function ZGInfrastructureStatus() {
  const [isDeploying, setIsDeploying] = useState(false);

  const { data: storageStats } = useQuery<ZGStorageStats>({
    queryKey: ["/api/zg/storage/stats"],
    refetchInterval: 30000,
  });

  const { data: computeStats } = useQuery<ZGComputeStats>({
    queryKey: ["/api/zg/compute/stats"],
    refetchInterval: 10000,
  });

  const { data: daStats } = useQuery<ZGDAStats>({
    queryKey: ["/api/zg/da/stats"],
    refetchInterval: 5000,
  });

  const { data: userInstance, refetch: refetchInstance } = useQuery<ComputeInstance>({
    queryKey: ["/api/zg/compute/instance"],
    refetchInterval: 5000,
  });

  const { data: web3Status } = useQuery<Web3Status>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 5000,
  });

  const deployAI = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch("/api/zg/compute/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithmType: "engagement",
          preferences: {
            contentTypes: ["text", "image"],
            topics: ["blockchain", "ai", "tech", "0g"],
            engagement_threshold: 5,
            recency_weight: 0.7,
            diversity_factor: 0.3
          }
        })
      });
      
      if (response.ok) {
        await refetchInstance();
      }
    } catch (error) {
      console.error("Failed to deploy AI:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold gradient-text">0G Chain Infrastructure</h2>
        <p className="text-og-slate-600 dark:text-og-slate-400">
          Status real-time infrastruktur terdesentralisasi Anda
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 0G Storage */}
        <Card className="border-og-slate-200 dark:border-og-slate-700 min-h-[180px]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium">
              <Database className="w-4 h-4 text-og-primary flex-shrink-0" />
              <span className="truncate">0G Storage</span>
              <Badge variant="outline" className="ml-auto flex-shrink-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Total Storage</span>
                <span className="font-medium text-right ml-2">{storageStats?.totalStorage || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Available</span>
                <span className="font-medium text-right ml-2">{storageStats?.availableSpace || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Network Nodes</span>
                <span className="font-medium text-right ml-2">{storageStats?.networkNodes || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Replication</span>
                <span className="font-medium text-right ml-2">{storageStats?.replicationFactor || '...'}x</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 0G Compute */}
        <Card className="border-og-slate-200 dark:border-og-slate-700 min-h-[180px]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium">
              <Cpu className="w-4 h-4 text-og-secondary flex-shrink-0" />
              <span className="truncate">0G Compute</span>
              <Badge variant="outline" className="ml-auto flex-shrink-0">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Instances</span>
                <span className="font-medium text-right ml-2">{computeStats?.totalInstances || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Active Users</span>
                <span className="font-medium text-right ml-2">{computeStats?.activeUsers || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Capacity</span>
                <span className="font-medium text-right ml-2">{computeStats?.computeCapacity || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Response Time</span>
                <span className="font-medium text-right ml-2">{computeStats?.averageResponseTime || '...'}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 0G Data Availability */}
        <Card className="border-og-slate-200 dark:border-og-slate-700 min-h-[180px]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium">
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="truncate">0G DA</span>
              <Badge variant="outline" className="ml-auto flex-shrink-0 text-xs">
                {daStats?.dataAvailability || 0}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Total TXs</span>
                <span className="font-medium text-right ml-2">{daStats?.totalTransactions?.toLocaleString() || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Pending</span>
                <span className="font-medium text-right ml-2">{daStats?.pendingTransactions || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Batches</span>
                <span className="font-medium text-right ml-2">{daStats?.processedBatches || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Batch Size</span>
                <span className="font-medium text-right ml-2">{daStats?.avgBatchSize || '...'} bytes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 0G Chain Status */}
        <Card className="border-og-slate-200 dark:border-og-slate-700 min-h-[180px]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium">
              <Activity className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">0G Chain</span>
              <Badge variant={web3Status?.connected ? "default" : "secondary"} className="ml-auto flex-shrink-0 text-xs">
                {web3Status?.connected ? "Connected" : "Disconnected"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Network</span>
                <span className="font-medium text-right ml-2 truncate">{web3Status?.network || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Block Height</span>
                <span className="font-medium text-right ml-2">{web3Status?.blockHeight?.toLocaleString() || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Chain ID</span>
                <span className="font-medium text-right ml-2">{web3Status?.chainId || '...'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-og-slate-600 dark:text-og-slate-400 truncate">Gas Price</span>
                <span className="font-medium text-right ml-2">{web3Status?.gasPrice || '...'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User AI Instance */}
      <Card className="border-og-slate-200 dark:border-og-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-og-primary" />
            <span>AI Feed Pribadi Anda</span>
            {userInstance && (
              <Badge 
                variant={userInstance.status === 'running' ? 'default' : 'secondary'}
                className="ml-auto"
              >
                {userInstance.status === 'running' && <CheckCircle className="w-3 h-3 mr-1" />}
                {userInstance.status === 'stopped' && <Pause className="w-3 h-3 mr-1" />}
                {userInstance.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                {userInstance.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userInstance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-og-slate-600 dark:text-og-slate-400">CPU Usage</span>
                    <span className="font-medium">{Math.round(userInstance.cpuUsage)}%</span>
                  </div>
                  <Progress value={userInstance.cpuUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-og-slate-600 dark:text-og-slate-400">Memory Usage</span>
                    <span className="font-medium">{Math.round(userInstance.memoryUsage)}%</span>
                  </div>
                  <Progress value={userInstance.memoryUsage} className="h-2" />
                </div>
              </div>
              
              <div className="bg-og-slate-50 dark:bg-og-slate-800 rounded-lg p-3 text-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <HardDrive className="w-4 h-4 text-og-primary" />
                  <span className="font-medium">Instance Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-og-slate-600 dark:text-og-slate-400">
                  <div>ID: {userInstance.instanceId.slice(0, 12)}...</div>
                  <div>Last Active: {new Date(userInstance.lastActive).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-og-slate-600 dark:text-og-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>AI feed pribadi Anda belum di-deploy</p>
                <p className="text-xs mt-1">Deploy AI untuk mendapatkan rekomendasi yang dipersonalisasi</p>
              </div>
              <Button 
                onClick={deployAI} 
                disabled={isDeploying}
                className="gradient-brand text-white"
              >
                {isDeploying ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Deploy AI Feed
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}