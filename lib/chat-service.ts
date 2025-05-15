export class ChatService {
  private ws: WebSocket | null = null;
  private userId: string;
  private userName: string;
  private currentMessage: string = '';
  private messageTimeout: NodeJS.Timeout | null = null;

  constructor(userId: string, userName: string) {
    this.userId = userId;
    this.userName = userName;
  }

  connect(onMessage: (content: string) => void) {
    try {
      this.ws = new WebSocket(`wss://drew-agent-llm-1-admin1339.replit.app/chat-websocket/${this.userId}`);

      this.ws.onopen = () => {
        // Send initial metadata
        this.sendMessage({
          type: "metadata",
          user_name: this.userName,
          role: "Agent",
        });
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as {
          response_type?: string;
          timestamp?: number;
          content?: string;
          content_complete?: boolean;
        };

        // Handle ping-pong
        if (data.response_type === "ping_pong") {
          this.sendMessage({
            type: "ping",
            timestamp: data.timestamp,
          });
          return;
        }

        // Handle regular messages
        if (data.content) {
          // Clear any existing timeout
          if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
          }

          // Accumulate the message content
          this.currentMessage += data.content;

          // If this is the complete message, send it immediately
          if (data.content_complete) {
            onMessage(this.currentMessage);
            this.currentMessage = '';
          } else {
            // Set a timeout to send the accumulated message if no new content arrives
            this.messageTimeout = setTimeout(() => {
              if (this.currentMessage) {
                onMessage(this.currentMessage);
                this.currentMessage = '';
              }
            }, 500); // Wait 500ms before considering the message complete
          }
        }
      };

      this.ws.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  sendMessage(message: {
    type: string;
    user_name?: string;
    role?: string;
    timestamp?: number;
    content?: string;
    conversation_history?: Array<{role: string; content: string}>;
  }) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendChatMessage(content: string) {
    this.sendMessage({
      type: "message",
      content: content,
      conversation_history: [
        { role: "user", content: content }
      ]
    });
  }

  disconnect() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}