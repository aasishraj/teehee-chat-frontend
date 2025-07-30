import { 
  User, 
  Token, 
  ChatSession, 
  ChatSessionWithMessages, 
  ChatSessionCreate, 
  Message, 
  MessageCreate, 
  MessageStream, 
  ProviderKey, 
  ProviderKeyCreate, 
  ProviderInfo, 
  ModelInfo 
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async googleSSO(ssoData: Record<string, unknown>): Promise<Token> {
    return this.request<Token>('/auth/google-sso', {
      method: 'POST',
      body: JSON.stringify(ssoData),
    });
  }

  async getSession(): Promise<User> {
    return this.request<User>('/auth/session');
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', { method: 'POST' });
  }

  // Chat sessions
  async listChatSessions(): Promise<ChatSession[]> {
    return this.request<ChatSession[]>('/chats/');
  }

  async createChatSession(data: ChatSessionCreate): Promise<ChatSession> {
    return this.request<ChatSession>('/chats/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChatSession(chatId: string): Promise<ChatSessionWithMessages> {
    return this.request<ChatSessionWithMessages>(`/chats/${chatId}`);
  }

  async deleteChatSession(chatId: string): Promise<void> {
    return this.request<void>(`/chats/${chatId}`, { method: 'DELETE' });
  }

  async updateChatSession(chatId: string, data: ChatSessionCreate): Promise<void> {
    return this.request<void>(`/chats/${chatId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Messages
  async listMessages(chatId: string): Promise<Message[]> {
    return this.request<Message[]>(`/chats/${chatId}/messages`);
  }

  async createMessage(chatId: string, data: MessageCreate): Promise<Message> {
    return this.request<Message>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async editMessage(messageId: string, data: MessageCreate): Promise<void> {
    return this.request<void>(`/chats/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.request<void>(`/chats/messages/${messageId}`, { method: 'DELETE' });
  }

  // Streaming
  async continueMessageStream(messageId: string, data: MessageStream): Promise<void> {
    return this.request<void>(`/stream/${messageId}/continue`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async abortMessageStream(messageId: string): Promise<void> {
    return this.request<void>(`/stream/${messageId}/abort`, { method: 'POST' });
  }

  // Provider keys
  async listProviderKeys(): Promise<ProviderKey[]> {
    return this.request<ProviderKey[]>('/user/keys/');
  }

  async addProviderKey(data: ProviderKeyCreate): Promise<ProviderKey> {
    return this.request<ProviderKey>('/user/keys/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProviderKey(keyId: string): Promise<void> {
    return this.request<void>(`/user/keys/${keyId}`, { method: 'DELETE' });
  }

  // System info
  async listProviders(): Promise<ProviderInfo[]> {
    return this.request<ProviderInfo[]>('/providers');
  }

  async listModels(): Promise<ModelInfo[]> {
    return this.request<ModelInfo[]>('/models');
  }

  async healthCheck(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/health');
  }
}

export const apiClient = new APIClient(API_BASE_URL);
export default apiClient; 