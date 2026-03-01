import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import type { Message } from '@/lib/types/messaging';

// ---------------------------------------------------------------------------
// Singleton STOMP client
// ---------------------------------------------------------------------------

let stompClient: Client | null = null;

/**
 * Returns the WebSocket base URL derived from the API URL.
 * Falls back to ws://localhost:8080/ws if NEXT_PUBLIC_WS_URL is not set.
 */
function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const host = apiUrl.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${host}/ws`;
}

/**
 * Connect to the STOMP WebSocket broker.
 * Reuses existing connection if already connected.
 */
export function connectStomp(accessToken: string): Client {
  if (stompClient?.connected) {
    return stompClient;
  }

  // Deactivate stale client if it exists
  if (stompClient) {
    stompClient.deactivate();
  }

  const client = new Client({
    brokerURL: getWsUrl(),
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: 5_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
  });

  client.onStompError = (frame) => {
    console.error('STOMP error:', frame.headers['message'], frame.body);
  };

  client.activate();
  stompClient = client;

  return client;
}

/**
 * Disconnect from the STOMP WebSocket broker.
 */
export function disconnectStomp(): void {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

/**
 * Subscribe to real-time incoming messages.
 * Returns an unsubscribe function.
 */
export function subscribeToMessages(
  callback: (message: Message) => void,
): () => void {
  if (!stompClient) {
    console.warn('STOMP client is not connected. Call connectStomp() first.');
    return () => {};
  }

  let subscription: StompSubscription | null = null;

  const handler = (stompMessage: IMessage) => {
    try {
      const parsed = JSON.parse(stompMessage.body) as Message;
      callback(parsed);
    } catch {
      console.error('Failed to parse incoming STOMP message:', stompMessage.body);
    }
  };

  // If client is already connected, subscribe immediately
  if (stompClient.connected) {
    subscription = stompClient.subscribe('/user/queue/messages', handler);
  } else {
    // Otherwise, wait for connection
    const originalOnConnect = stompClient.onConnect;
    stompClient.onConnect = (frame) => {
      originalOnConnect?.(frame);
      subscription = stompClient!.subscribe('/user/queue/messages', handler);
    };
  }

  return () => {
    subscription?.unsubscribe();
  };
}

/**
 * Get the current STOMP client instance (or null if not connected).
 */
export function getStompClient(): Client | null {
  return stompClient;
}
