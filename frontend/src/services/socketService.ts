import { io, Socket } from 'socket.io-client';
import type { CLICommand, CLIResponse, CLIMessage, CLISession } from '@shared/types/cli.types';

export interface SocketEvents {
  // Connection events
  'cli:connected': (data: { sessionId: string; workingDirectory: string }) => void;
  'cli:disconnected': (data: { sessionId: string }) => void;
  'cli:error': (error: { message: string; commandId?: string; error?: string }) => void;

  // Command events
  'cli:response': (response: CLIResponse) => void;
  'cli:message': (message: CLIMessage) => void;

  // Session events
  'cli:sessions': (sessions: CLISession[]) => void;
  'cli:session-created': (data: { sessionId: string; status: string }) => void;
  'cli:session-terminated': (data: { sessionId: string }) => void;

  // Directory events
  'cli:directory-changed': (data: { path: string; sessionId: string }) => void;

  // Tool events
  'cli:tool-start': (data: any) => void;
  'cli:tool-end': (data: any) => void;
  'cli:tool-confirm': (data: any) => void;

  // Memory events
  'cli:memory-updated': (data: any) => void;
  'cli:session-saved': (data: any) => void;
  'cli:session-restored': (data: any) => void;

  // Status events
  'cli:status': (status: any) => void;
  'cli:interrupted': (data: { sessionId: string }) => void;
}

export type SocketEventCallback<T extends keyof SocketEvents> = SocketEvents[T];

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnecting = false;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(token: string): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.socket = io((import.meta as any).env?.VITE_API_URL || 'http://localhost:3001', {
          auth: {
            token
          },
          transports: ['websocket'],
          upgrade: true,
          rememberUpgrade: true
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.isConnecting = false;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnecting = false;
          reject(new Error(`Failed to connect: ${error.message}`));
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from WebSocket server:', reason);
          this.isConnecting = false;
        });

        // Set up event forwarding
        this.setupEventForwarding();

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  /**
   * Check if socket is connected
   */
  get connected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Emit an event to the server
   */
  private emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit(event, data);
  }

  /**
   * Connect to a CLI session
   */
  connectToCLI(sessionId?: string, workingDirectory?: string): void {
    this.emit('cli:connect', { sessionId, workingDirectory });
  }

  /**
   * Execute a CLI command
   */
  executeCommand(command: CLICommand): void {
    this.emit('cli:command', command);
  }

  /**
   * Disconnect from CLI session
   */
  disconnectFromCLI(sessionId?: string): void {
    this.emit('cli:disconnect', { sessionId });
  }

  /**
   * Get list of user sessions
   */
  getSessions(): void {
    this.emit('cli:get-sessions');
  }

  /**
   * Change working directory
   */
  changeDirectory(path: string, sessionId?: string): void {
    this.emit('cli:change-directory', { path, sessionId });
  }

  /**
   * Interrupt current command
   */
  interrupt(sessionId?: string): void {
    this.emit('cli:interrupt', { sessionId });
  }

  /**
   * Add event listener
   */
  on<T extends keyof SocketEvents>(event: T, callback: SocketEventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off<T extends keyof SocketEvents>(event: T, callback: SocketEventCallback<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Setup event listeners for socket events
   */
  private setupEventListeners(): void {
    // This will be called when socket is created
  }

  /**
   * Forward socket events to registered listeners
   */
  private setupEventForwarding(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('cli:connected', (data) => {
      this.fireEvent('cli:connected', data);
    });

    this.socket.on('cli:disconnected', (data) => {
      this.fireEvent('cli:disconnected', data);
    });

    this.socket.on('cli:error', (error) => {
      this.fireEvent('cli:error', error);
    });

    // Command events
    this.socket.on('cli:response', (response) => {
      this.fireEvent('cli:response', response);
    });

    this.socket.on('cli:message', (message) => {
      this.fireEvent('cli:message', message);
    });

    // Session events
    this.socket.on('cli:sessions', (sessions) => {
      this.fireEvent('cli:sessions', sessions);
    });

    this.socket.on('cli:session-created', (data) => {
      this.fireEvent('cli:session-created', data);
    });

    this.socket.on('cli:session-terminated', (data) => {
      this.fireEvent('cli:session-terminated', data);
    });

    // Directory events
    this.socket.on('cli:directory-changed', (data) => {
      this.fireEvent('cli:directory-changed', data);
    });

    // Tool events
    this.socket.on('cli:tool-start', (data) => {
      this.fireEvent('cli:tool-start', data);
    });

    this.socket.on('cli:tool-end', (data) => {
      this.fireEvent('cli:tool-end', data);
    });

    this.socket.on('cli:tool-confirm', (data) => {
      this.fireEvent('cli:tool-confirm', data);
    });

    // Memory events
    this.socket.on('cli:memory-updated', (data) => {
      this.fireEvent('cli:memory-updated', data);
    });

    this.socket.on('cli:session-saved', (data) => {
      this.fireEvent('cli:session-saved', data);
    });

    this.socket.on('cli:session-restored', (data) => {
      this.fireEvent('cli:session-restored', data);
    });

    // Status events
    this.socket.on('cli:status', (status) => {
      this.fireEvent('cli:status', status);
    });

    this.socket.on('cli:interrupted', (data) => {
      this.fireEvent('cli:interrupted', data);
    });
  }

  /**
   * Fire event to all registered listeners
   */
  private fireEvent(event: keyof SocketEvents, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Create singleton instance
export const socketService = new SocketService();
export default socketService;
