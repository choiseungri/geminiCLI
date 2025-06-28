// MCP Server types
export interface MCPServer {
  id: string
  name: string
  url: string
  status: 'connected' | 'disconnected' | 'error'
  tools: MCPTool[]
  lastPing?: Date
}

export interface MCPTool {
  name: string
  description: string
  schema: Record<string, any>
}

export interface MCPServerConfig {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
}
