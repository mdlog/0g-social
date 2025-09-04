import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Shield, CheckCircle, XCircle, Hash, FileText, Image, Video } from "lucide-react";
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
  author: {
    displayName: string;
    username: string;
    walletAddress: string;
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
  const [limit] = useState(50);
  const [offset] = useState(0);

  // Fetch admin posts data
  const { data: adminData, isLoading, error, refetch } = useQuery<AdminPostsResponse>({
    queryKey: ["/api/admin/posts", limit, offset],
    retry: false,
    refetchOnWindowFocus: false
  });

  // Handle unauthorized access
  useEffect(() => {
    if (error) {
      const errorData = error as any;
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
  }, [error, setLocation, toast]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive view of all posts with blockchain verification status
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
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
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

                    {/* Author */}
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{post.author.displayName}</div>
                        <div className="text-muted-foreground text-xs">
                          {post.author.walletAddress.slice(0, 6)}...{post.author.walletAddress.slice(-4)}
                        </div>
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
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPage;