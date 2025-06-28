// REPL Message types
export interface REPLMessage {
  id: string
  type: 'user' | 'assistant' | 'tool' | 'error' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

// CLI Communication types
export interface CLIMessage {
  id: string
  type: 'command' | 'response' | 'stream'
  command?: string
  content?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface CLICommand {
  id: string
  sessionId?: string
  text: string
  type?: 'user' | 'system' | 'tool'
  timestamp?: string
  metadata?: Record<string, any>
}

export interface CLIResponse {
  id: string
  commandId?: string
  type: 'text' | 'json' | 'error' | 'tool_result' | 'stream'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

// Tool execution types
export interface ToolCall {
  id: string
  name: string
  parameters: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'error'
  result?: any
  error?: string
}

// Session types
export interface REPLSession {
  id: string
  name: string
  messages: REPLMessage[]
  createdAt: Date
  updatedAt: Date
  workingDirectory: string
}

export interface CLISession {
  id: string
  userId: string
  isActive: boolean
  createdAt: string
  lastActivity: string
  workingDirectory: string
}

// CLI Core types
export interface CLIState {
  isConnected: boolean
  currentDirectory: string
  session: REPLSession | null
  availableTools: string[]
}
