// API Types based on OpenAPI specification

export interface User {
  email: string;
  id: string;
  sso_id: string | null;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface ChatSession {
  name: string | null;
  id: string;
  user_id: string;
  root_message_id: string | null;
  created_at: string;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: Message[];
}

export interface ChatSessionCreate {
  name?: string | null;
}

export interface Message {
  role: string;
  content: any;
  id: string;
  chat_session_id: string;
  parent_message_id: string | null;
  timestamp: string;
  is_partial: boolean;
  model: string | null;
  provider: string | null;
}

export interface MessageCreate {
  role: string;
  content: any;
  parent_message_id?: string | null;
}

export interface MessageStream {
  model: string;
  provider: string;
  parent_message_id?: string | null;
}

export interface ProviderKey {
  provider_name: string;
  id: string;
  user_id: string;
  created_at: string;
}

export interface ProviderKeyCreate {
  provider_name: string;
  api_key: string;
}

export interface ProviderInfo {
  name: string;
  models: string[];
  description: string;
}

export interface ModelInfo {
  name: string;
  provider: string;
  description: string;
  max_tokens: number;
}

export interface APIError {
  detail?: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
} 