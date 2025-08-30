import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Send, Bot, User, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  verified?: boolean;
}

interface ChatResponse {
  success: boolean;
  provider?: string;
  model?: string;
  verified?: boolean;
  balance?: string;
  response?: {
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
    }>;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

interface ChatStatus {
  isConfigured: boolean;
  hasPrivateKey: boolean;
  availableProviders: number;
  balance?: string;
  error?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'You are a helpful AI assistant powered by 0G Compute Network. I can help you with questions about blockchain, DeFi, Web3, and general topics.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get chat service status
  const { data: chatStatus } = useQuery<ChatStatus>({
    queryKey: ['/api/zg/chat/status'],
    refetchInterval: 30000
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (chatMessages: Message[]) => {
      const response = await apiRequest('/api/zg/chat', 'POST', {
        messages: chatMessages.filter(msg => msg.role !== 'system' || chatMessages.length === 1),
        temperature: 0.7,
        maxTokens: 1024
      });
      return response as ChatResponse;
    },
    onSuccess: (data) => {
      if (data.success && data.response?.choices?.[0]?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response.choices[0].message.content,
          timestamp: new Date(),
          verified: data.verified
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update balance info
        if (data.balance) {
          queryClient.invalidateQueries({ queryKey: ['/api/zg/chat/status'] });
        }
        
        toast({
          title: "Response received",
          description: `Via ${data.model} ${data.verified ? '(Verified)' : ''}`,
        });
      } else {
        throw new Error(data.error || 'No response received');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Chat failed",
        description: error.message || 'Failed to get AI response',
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Fund account mutation
  const fundMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiRequest('/api/zg/chat/fund', 'POST', { amount });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Funds added successfully",
        description: "Your 0G Chat account has been funded"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/zg/chat/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add funds",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    chatMutation.mutate(newMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const addFunds = () => {
    fundMutation.mutate('0.1');
  };

  if (!chatStatus?.isConfigured) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            0G Chat
            <Badge variant="outline">Setup Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">0G Chat Not Configured</h3>
            <p className="text-muted-foreground mb-4">
              {chatStatus?.error || 'Please configure 0G Chat service to start chatting with AI'}
            </p>
            <p className="text-sm text-muted-foreground">
              Contact administrator to set up ZG_PRIVATE_KEY environment variable
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            0G Chat
            <Badge variant="secondary">
              {chatStatus?.availableProviders || 0} Providers
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {chatStatus?.balance && (
              <Badge variant="outline" className="text-xs">
                Balance: {parseFloat(chatStatus.balance).toFixed(4)} OG
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={addFunds}
              disabled={fundMutation.isPending}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Add Funds
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  ) : message.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'AI Assistant' : 'System'}
                    </span>
                    {message.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">AI Assistant</span>
                    <span className="text-xs text-muted-foreground">typing...</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by 0G Compute Network • Press Enter to send
          </p>
        </div>
      </CardContent>
    </Card>
  );
}