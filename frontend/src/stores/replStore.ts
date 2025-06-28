import { create } from 'zustand';
import type { REPLMessage, CLISession, CLICommand, CLIResponse } from '@shared/types/cli.types';
import socketService from '../services/socketService';

interface REPLStore {
  // Current session
  currentSession: CLISession | null;
  messages: REPLMessage[];
  
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // CLI state
  currentDirectory: string;
  availableSessions: CLISession[];
  
  // UI state
  isTyping: boolean;
  currentInput: string;
  isExecutingCommand: boolean;
  
  // Actions
  connectToWebSocket: (token: string) => Promise<void>;
  disconnectFromWebSocket: () => void;
  connectToCLI: (sessionId?: string, workingDirectory?: string) => void;
  disconnectFromCLI: (sessionId?: string) => void;
  executeCommand: (command: string) => void;
  addMessage: (message: Omit<REPLMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<REPLMessage>) => void;
  clearMessages: () => void;
  setCurrentInput: (input: string) => void;
  setTyping: (typing: boolean) => void;
  changeDirectory: (path: string) => void;
  interrupt: () => void;
  getSessions: () => void;
}

export const useREPLStore = create<REPLStore>((set, get) => ({
  // Initial state
  currentSession: null,
  messages: [],
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  currentDirectory: '',
  availableSessions: [],
  isTyping: false,
  currentInput: '',
  isExecutingCommand: false,

  // WebSocket connection
  connectToWebSocket: async (token: string) => {
    set({ isConnecting: true, connectionError: null });
    
    try {
      await socketService.connect(token);
      
      // Set up event listeners
      socketService.on('cli:connected', (data) => {
        set({ 
          isConnected: true,
          currentSession: {
            id: data.sessionId,
            userId: '', // Will be set from auth
            isActive: true,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            workingDirectory: data.workingDirectory
          },
          currentDirectory: data.workingDirectory
        });
      });

      socketService.on('cli:disconnected', () => {
        set({ isConnected: false, currentSession: null });
      });

      socketService.on('cli:error', (error) => {
        get().addMessage({
          type: 'error',
          content: error.message
        });
      });

      socketService.on('cli:response', (response: CLIResponse) => {
        get().addMessage({
          type: 'assistant',
          content: response.content,
          metadata: response.metadata
        });
        set({ isExecutingCommand: false });
      });

      socketService.on('cli:message', (message) => {
        if (message.type === 'stream') {
          // Handle streaming response
          const lastMessage = get().messages[get().messages.length - 1];
          if (lastMessage && lastMessage.type === 'assistant') {
            get().updateMessage(lastMessage.id, {
              content: lastMessage.content + (message.content || '')
            });
          } else {
            get().addMessage({
              type: 'assistant',
              content: message.content || ''
            });
          }
        }
      });

      socketService.on('cli:sessions', (sessions: CLISession[]) => {
        set({ availableSessions: sessions });
      });

      socketService.on('cli:directory-changed', (data) => {
        set({ currentDirectory: data.path });
        get().addMessage({
          type: 'system',
          content: `Changed directory to: ${data.path}`
        });
      });

      set({ isConnecting: false });
      
    } catch (error) {
      set({ 
        isConnecting: false, 
        connectionError: error instanceof Error ? error.message : 'Connection failed' 
      });
      throw error;
    }
  },

  disconnectFromWebSocket: () => {
    socketService.disconnect();
    set({ 
      isConnected: false, 
      currentSession: null,
      availableSessions: [],
      connectionError: null
    });
  },

  connectToCLI: (sessionId?: string, workingDirectory?: string) => {
    if (!socketService.connected) {
      set({ connectionError: 'WebSocket not connected' });
      return;
    }
    
    socketService.connectToCLI(sessionId, workingDirectory);
    get().addMessage({
      type: 'system',
      content: workingDirectory 
        ? `Connecting to CLI in directory: ${workingDirectory}`
        : 'Connecting to CLI...'
    });
  },

  disconnectFromCLI: (sessionId?: string) => {
    if (socketService.connected) {
      socketService.disconnectFromCLI(sessionId);
    }
    set({ currentSession: null, isConnected: false });
    get().addMessage({
      type: 'system',
      content: 'Disconnected from CLI'
    });
  },

  executeCommand: (command: string) => {
    if (!get().isConnected || !socketService.connected) {
      get().addMessage({
        type: 'error',
        content: 'Not connected to CLI'
      });
      return;
    }

    // Add user message
    get().addMessage({
      type: 'user',
      content: command
    });

    // Execute command
    const cliCommand: CLICommand = {
      id: crypto.randomUUID(),
      sessionId: get().currentSession?.id,
      text: command,
      type: 'user',
      timestamp: new Date().toISOString()
    };

    socketService.executeCommand(cliCommand);
    set({ isExecutingCommand: true, currentInput: '' });
  },

  addMessage: (messageData) => {
    const message: REPLMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...messageData,
    };
    
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessage: (id: string, updates: Partial<REPLMessage>) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setCurrentInput: (input: string) => {
    set({ currentInput: input });
  },

  setTyping: (typing: boolean) => {
    set({ isTyping: typing });
  },

  changeDirectory: (path: string) => {
    if (socketService.connected) {
      socketService.changeDirectory(path, get().currentSession?.id);
    }
  },

  interrupt: () => {
    if (socketService.connected) {
      socketService.interrupt(get().currentSession?.id);
      set({ isExecutingCommand: false });
      get().addMessage({
        type: 'system',
        content: 'Command interrupted'
      });
    }
  },

  getSessions: () => {
    if (socketService.connected) {
      socketService.getSessions();
    }
  }
}));
