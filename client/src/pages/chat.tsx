import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">0G Chat</h1>
          <p className="text-muted-foreground">
            Chat with AI models powered by decentralized 0G Compute Network
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
}