export type Role = "user" | "assistant" | "system";

export type MessageType = "text" | "image" | "audio";

export interface Message {
  id: string;
  role: Role;
  type: MessageType;
  content: string;
  createdAt: number;
  streaming?: boolean;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  systemPrompt?: string;
}
