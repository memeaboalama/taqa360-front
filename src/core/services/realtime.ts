import { QueryClient } from '@tanstack/react-query';
import { env } from '../config/env';

export type RTEvent = {
  type: string;
  entity?: string;
  id?: string | number;
  payload?: any;
};

class Realtime {
  private ws: WebSocket | null = null;
  private es: EventSource | null = null;
  private listeners = new Set<(e: RTEvent) => void>();
  private reconnectAttempts = 0;
  private connecting = false;

  connect() {
    if (this.connecting) return;
    this.connecting = true;

    const url = (env as any).WS_URL || (env as any).SSE_URL || '';
    if (!url) {
      this.connecting = false;
      return; // optional
    }

    try {
      if (url.startsWith('ws')) {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => { this.reconnectAttempts = 0; this.connecting = false; };
        this.ws.onclose = () => this.scheduleReconnect();
        this.ws.onerror = () => this.scheduleReconnect();
        this.ws.onmessage = (msg) => this.handleMessage(msg.data);
      } else {
        this.es = new EventSource(url);
        this.es.onopen = () => { this.reconnectAttempts = 0; this.connecting = false; };
        this.es.onerror = () => this.scheduleReconnect();
        this.es.onmessage = (msg) => this.handleMessage(msg.data);
      }
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    this.connecting = false;
    this.reconnectAttempts += 1;
    const delay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
    setTimeout(() => this.connect(), delay);
  }

  private handleMessage(raw: any) {
    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (data && data.type) this.emit(data as RTEvent);
    } catch {}
  }

  on(listener: (e: RTEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(e: RTEvent) {
    this.listeners.forEach((l) => {
      try { l(e); } catch {}
    });
  }
}

export const realtime = new Realtime();

export function wireRealtimeInvalidation(queryClient: QueryClient) {
  return realtime.on((e) => {
    const entity = e.entity || e.type;
    if (!entity) return;
    try {
      queryClient.invalidateQueries({ predicate: (q) => {
        const key = q.queryKey;
        if (Array.isArray(key)) return key.includes(entity) || key[0] === entity || key[0] === 'dashboard';
        return String(key) === String(entity);
      }});
    } catch {}
  });
}
