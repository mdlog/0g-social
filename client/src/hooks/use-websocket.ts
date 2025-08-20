import { useEffect, useRef, useCallback, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected for real-time updates');
        setConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'new_post':
              // Force immediate refresh of ALL queries related to posts
              console.log('📨 New post received, refreshing feed...');
              
              // Invalidate all post queries with exact matching
              queryClient.invalidateQueries({ 
                predicate: (query) => {
                  const queryKey = query.queryKey as string[];
                  return queryKey[0] === '/api/posts' || queryKey[0] === '/api/posts/feed';
                }
              });
              
              // Also force refetch user profiles for post counts
              queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
              
              // Force immediate refetch instead of just invalidating
              const refetchPromise = queryClient.refetchQueries({ 
                predicate: (query) => {
                  const queryKey = query.queryKey as string[];
                  return queryKey[0] === '/api/posts/feed';
                }
              });
              
              console.log('🔄 Forcing refetch of feed queries...');
              refetchPromise.then(() => {
                console.log('✅ Feed refetch completed');
              }).catch((error) => {
                console.error('❌ Feed refetch failed:', error);
              });
              break;
            
            case 'post_liked':
              // Refresh posts to show updated like count
              queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
              queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
              break;
            
            case 'post_commented':
              // Refresh posts to show updated comment count
              queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
              queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
              break;
            
            default:
              console.log('Unknown WebSocket message:', message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, Math.pow(2, reconnectAttemptsRef.current) * 1000); // Exponential backoff
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setConnected(false);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connected, connect, disconnect };
}