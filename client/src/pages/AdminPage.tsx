import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Shield, CheckCircle, XCircle, Hash, FileText, Image, Video, ChevronLeft, ChevronRight, Home, Settings, Database, Users, Activity, BarChart3, Clock, User, Wallet, CreditCard, Calendar, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  storageHash?: string;
  transactionHash?: string;
  mediaStorageHash?: string;
  mediaType?: string;
  author?: {
    id?: string;
    displayName?: string;
    username?: string;
    email?: string;
    walletAddress?: string;
    isVerified?: boolean;
    isPremium?: boolean;
    reputationScore?: number;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    createdAt?: string;
  };
  blockchainUrls: {
    storageHash?: string;
    transactionHash?: string;
    mediaHash?: string;
  };
  verification: {
    hasStorageHash: boolean;
    hasTransactionHash: boolean;
    hasMediaHash: boolean;
    isBlockchainVerified: boolean;
  };
}

interface AdminPostsResponse {
  posts: Post[];
  metadata: {
    total: number;
    limit: number;
    offset: number;
    timestamp: string;
    blockchainVerifiedCount: number;
    withMediaCount: number;
  };
}

function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate offset based on current page
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch user data first to ensure session is established
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  // Fetch admin posts data only after user is loaded
  const { data: adminData, isLoading, error, refetch } = useQuery<AdminPostsResponse>({
    queryKey: [`/api/admin/posts/${itemsPerPage}/${offset}`],
    enabled: !!currentUser, // Only run after user is loaded
    retry: 3, // Retry 3 times for session issues
    retryDelay: 1000, // Wait 1 second between retries
    refetchOnWindowFocus: false
  });

  // Handle unauthorized access
  useEffect(() => {
    console.log("[ADMIN PAGE] Query state:", { 
      isLoading, 
      error: error ? JSON.stringify(error, null, 2) : null, 
      hasData: !!adminData 
    });
    
    // Debug: Log actual data structure
    if (adminData && adminData.posts && adminData.posts.length > 0) {
      console.log("[ADMIN DEBUG] First post data:", JSON.stringify({
        id: adminData.posts[0].id,
        authorId: adminData.posts[0].authorId,
        author: adminData.posts[0].author,
        hasAuthor: !!adminData.posts[0].author
      }, null, 2));
    }
    
    if (error) {
      const errorData = error as any;
      console.log("[ADMIN PAGE] Error details:", errorData);
      if (errorData?.status === 401 || errorData?.status === 403) {
        console.log("Admin access error:", errorData);
        toast({
          title: "Access Denied",
          description: "Admin access requires authorized wallet connection (0x4C6165286739696849Fb3e77A16b0639D762c5B6)",
          variant: "destructive"
        });
        // Don't redirect, show the error message instead
      }
    }
  }, [error, isLoading, adminData, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-4">
                This admin dashboard requires authorized wallet access.
              </p>
              <Button onClick={() => setLocation("/")} variant="outline">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { posts, metadata } = adminData;

  // Calculate pagination info
  const totalPages = Math.ceil(metadata.total / itemsPerPage);
  const startItem = offset + 1;
  const endItem = Math.min(offset + itemsPerPage, metadata.total);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatHash = (hash: string) => {
    if (!hash) return "N/A";
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const getMediaIcon = (mediaType?: string) => {
    if (!mediaType) return <FileText className="h-4 w-4" />;
    if (mediaType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mediaType.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    setItemsPerPage(parseInt(newSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground">DeSocialAI Management</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-8" />
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{metadata?.total || 0}</span>
                  <span className="text-xs text-muted-foreground">Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{metadata?.blockchainVerifiedCount || 0}</span>
                  <span className="text-xs text-muted-foreground">Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{metadata?.withMediaCount || 0}</span>
                  <span className="text-xs text-muted-foreground">Media</span>
                </div>
              </div>
            </div>
            
            {/* Navigation and Actions */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to App
                </Link>
              </Button>
              
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: {metadata ? new Date(metadata.timestamp).toLocaleTimeString() : '--'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">All Posts Management</h2>
        <p className="text-muted-foreground">
          Comprehensive view of all posts with blockchain verification status and pagination controls
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metadata.blockchainVerifiedCount}</div>
            <p className="text-xs text-muted-foreground">
              {((metadata.blockchainVerifiedCount / metadata.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Media</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.withMediaCount}</div>
            <p className="text-xs text-muted-foreground">
              {((metadata.withMediaCount / metadata.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDate(metadata.timestamp)}</div>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts with Blockchain Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Author Info</TableHead>
                  <TableHead>User Details</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Storage Hash</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Media Hash</TableHead>
                  <TableHead>Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    {/* Post Content */}
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-2">
                        {getMediaIcon(post.mediaType)}
                        <div className="min-w-0">
                          <p className="text-sm truncate" title={post.content}>
                            {post.content || "Media post"}
                          </p>
                          {post.mediaType && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {post.mediaType.split('/')[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Author Info */}
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {post.author?.displayName || post.author?.username || 'Unknown User'}
                          </span>
                          {post.author?.isVerified && (
                            <CheckCircle className="h-3 w-3 text-blue-600" />
                          )}
                          {post.author?.isPremium && (
                            <CreditCard className="h-3 w-3 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Wallet className="h-3 w-3" />
                          <span className="font-mono">
                            {post.author?.walletAddress ? `${post.author.walletAddress.slice(0, 8)}...${post.author.walletAddress.slice(-6)}` : 'N/A'}
                          </span>
                          {post.author?.walletAddress && (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(post.author?.walletAddress || '');
                                toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
                              }}
                              className="hover:text-primary transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* User Details */}
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {post.author?.id && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-muted-foreground">
                              ID: {post.author.id.slice(0, 8)}...
                            </span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(post.author?.id || '');
                                toast({ title: "Copied!", description: "User ID copied to clipboard" });
                              }}
                              className="hover:text-primary transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>👥 {post.author?.followersCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>📝 {post.author?.postsCount || 0}</span>
                          </div>
                        </div>
                        {post.author?.reputationScore !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">⭐ Rep: {post.author.reputationScore}</span>
                          </div>
                        )}
                        {post.author?.email && (
                          <div className="text-xs text-muted-foreground truncate" title={post.author.email}>
                            📧 {post.author.email}
                          </div>
                        )}
                        {post.author?.createdAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {new Date(post.author.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </TableCell>

                    {/* Verification Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={post.verification.isBlockchainVerified ? "default" : "secondary"}>
                          {post.verification.isBlockchainVerified ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {post.verification.isBlockchainVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Storage Hash */}
                    <TableCell>
                      {post.storageHash ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {formatHash(post.storageHash)}
                          </code>
                          {post.blockchainUrls.storageHash && (
                            <a
                              href={post.blockchainUrls.storageHash}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>

                    {/* Transaction Hash */}
                    <TableCell>
                      {post.transactionHash ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {formatHash(post.transactionHash)}
                          </code>
                          {post.blockchainUrls.transactionHash && (
                            <a
                              href={post.blockchainUrls.transactionHash}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>

                    {/* Media Hash */}
                    <TableCell>
                      {post.mediaStorageHash ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {formatHash(post.mediaStorageHash)}
                          </code>
                          {post.blockchainUrls.mediaHash && (
                            <a
                              href={post.blockchainUrls.mediaHash}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>

                    {/* Engagement */}
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        <div>♥ {post.likesCount}</div>
                        <div>💬 {post.commentsCount}</div>
                        <div>🔄 {post.sharesCount}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {metadata.total} posts
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Posts per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20" data-testid="select-page-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" data-testid="option-10">10</SelectItem>
                    <SelectItem value="25" data-testid="option-25">25</SelectItem>
                    <SelectItem value="50" data-testid="option-50">50</SelectItem>
                    <SelectItem value="100" data-testid="option-100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
                data-testid="button-previous"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1 text-sm">
                <span>Page</span>
                <span className="font-medium">{currentPage}</span>
                <span>of</span>
                <span className="font-medium">{totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
                data-testid="button-next"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </main>
      
      {/* Admin Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* System Info */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System Status
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>0G Chain:</span>
                  <Badge variant="default" className="text-xs">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>0G Storage:</span>
                  <Badge variant="default" className="text-xs">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>0G DA:</span>
                  <Badge variant="default" className="text-xs">Synced</Badge>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                  <BarChart3 className="h-3 w-3 mr-2" />
                  View Analytics
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                  <Users className="h-3 w-3 mr-2" />
                  Manage Users
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                  <Database className="h-3 w-3 mr-2" />
                  System Logs
                </Button>
              </div>
            </div>
            
            {/* Current Session */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Current Session</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="block">Admin Access</span>
                  <code className="text-xs bg-muted px-1 rounded">
                    0x4C61...c5B6
                  </code>
                </div>
                <div>
                  <span className="block">Session Time</span>
                  <span className="text-xs">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Platform Info */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Platform</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>DeSocialAI v2.0</div>
                <div>Built on 0G Chain</div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All Systems Operational</span>
                </div>
                <div className="text-xs text-muted-foreground/70">
                  © 2025 DeSocialAI. Decentralized social platform.
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Admin Panel - Authorized Access Only</span>
              <Badge variant="outline" className="text-xs">
                Secure Session
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                Privacy Policy
              </Button>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                Terms of Service
              </Button>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                Support
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminPage;