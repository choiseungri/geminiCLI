// Tool types
export interface Tool {
  name: string
  description: string
  parameters: ToolParameter[]
  category: 'file' | 'shell' | 'web' | 'memory' | 'mcp'
}

export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  required: boolean
  default?: any
}

export interface ToolExecution {
  id: string
  toolName: string
  parameters: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'error'
  startTime: Date
  endTime?: Date
  result?: any
  error?: string
}

// File system types
export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  lastModified?: Date
  children?: FileNode[]
}
