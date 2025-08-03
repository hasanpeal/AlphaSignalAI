import { StockAnalysisChat } from "./ai-chat";

interface ConversationSession {
  chat: StockAnalysisChat;
  lastActivity: number;
}

class ConversationStore {
  private sessions: Map<string, ConversationSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  getOrCreateSession(sessionId: string): StockAnalysisChat {
    const now = Date.now();
    const session = this.sessions.get(sessionId);

    if (session && now - session.lastActivity < this.SESSION_TIMEOUT) {
      // Update last activity
      session.lastActivity = now;
      return session.chat;
    }

    // Create new session
    const newChat = new StockAnalysisChat();
    this.sessions.set(sessionId, {
      chat: newChat,
      lastActivity: now,
    });

    console.log(`🔄 [Conversation Store] Created new session: ${sessionId}`);
    return newChat;
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    console.log(`🗑️ [Conversation Store] Cleared session: ${sessionId}`);
  }

  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        console.log(
          `🧹 [Conversation Store] Cleaned up expired session: ${sessionId}`
        );
      }
    }
  }
}

export const conversationStore = new ConversationStore();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  conversationStore.cleanupExpiredSessions();
}, 5 * 60 * 1000);
