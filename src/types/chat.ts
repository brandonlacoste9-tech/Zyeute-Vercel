/**
 * Chat Types - Message structure for TI-Guy chat
 */

export type Sender = 'user' | 'tiGuy';

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
}

