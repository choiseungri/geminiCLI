import { FolderIcon, TerminalIcon, ServerIcon, HistoryIcon, InfoIcon, Clock } from 'lucide-react'
import { useREPLStore } from '../../stores/replStore'
import { useAuthStore } from '../../stores/authStore'

export const Sidebar = () => {
  const { 
    messages, 
    isConnected, 
    currentDirectory,
    availableSessions 
  } = useREPLStore();
  
  const { user } = useAuthStore();

  // Get recent commands from messages
  const recentCommands = messages
    .filter(msg => msg.type === 'user')
    .slice(-5)
    .reverse();
  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gemini CLI
        </h2>
        {user && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user.name}
          </div>
        )}
      </div>

      {/* Status Overview */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
            <InfoIcon className="w-4 h-4 mr-2" />
            Status
          </div>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <div>Connection: {isConnected ? 'Active' : 'Disconnected'}</div>
          <div>Messages: {messages.length}</div>
          {currentDirectory && (
            <div className="truncate" title={currentDirectory}>
              Dir: {currentDirectory.split(/[/\\]/).pop() || currentDirectory}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {/* Command History */}
          <div className="mb-4">
            <div className="flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              <HistoryIcon className="w-4 h-4 mr-2" />
              Recent Commands
            </div>
            <div className="ml-2 space-y-1">
              {recentCommands.length > 0 ? (
                recentCommands.map((message, index) => (
                  <div 
                    key={`${message.id}-${index}`}
                    className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer font-mono"
                    title={message.content}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="truncate flex-1">
                        {message.content.length > 20 
                          ? `${message.content.substring(0, 20)}...` 
                          : message.content
                        }
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ml-4 text-xs text-gray-400 dark:text-gray-500">
                  No commands yet
                </div>
              )}
            </div>
          </div>

          {/* File Explorer */}
          <div className="mb-4">
            <div className="flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              <FolderIcon className="w-4 h-4 mr-2" />
              File Explorer
            </div>
            <div className="ml-4 text-xs text-gray-500 dark:text-gray-500">
              {currentDirectory ? (
                <div className="truncate" title={currentDirectory}>
                  📁 {currentDirectory.split(/[/\\]/).pop() || currentDirectory}
                </div>
              ) : (
                'No directory info'
              )}
            </div>
            <div className="ml-4 mt-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              Try: ls, pwd
            </div>
          </div>

          {/* Sessions */}
          <div className="mb-4">
            <div className="flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              <TerminalIcon className="w-4 h-4 mr-2" />
              Sessions
            </div>
            <div className="ml-4 text-xs text-gray-500 dark:text-gray-500">
              {availableSessions.length > 0 ? (
                `${availableSessions.length} active session(s)`
              ) : (
                'No active sessions'
              )}
            </div>
          </div>

          {/* AI Tools */}
          <div className="mb-4">
            <div className="flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              <ServerIcon className="w-4 h-4 mr-2" />
              AI Tools
            </div>
            <div className="ml-4 text-xs text-gray-500 dark:text-gray-500">
              File operations, Code analysis
            </div>
            <div className="ml-4 mt-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              Try: ask, chat
            </div>
          </div>

          {/* Quick Commands */}
          <div className="mb-4">
            <div className="px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              Quick Actions
            </div>
            <div className="ml-2 space-y-1">
              {[
                { cmd: 'help', desc: 'Show all commands' },
                { cmd: 'status', desc: 'System status' },
                { cmd: 'ls', desc: 'List files' },
                { cmd: 'date', desc: 'Current time' }
              ].map(({ cmd, desc }) => (
                <div 
                  key={cmd}
                  className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded cursor-pointer"
                  onClick={() => {
                    // We can later add a function to execute these commands directly
                    const event = new CustomEvent('quickCommand', { detail: cmd });
                    window.dispatchEvent(event);
                  }}
                >
                  <div className="font-mono font-medium">{cmd}</div>
                  <div className="text-gray-500 dark:text-gray-400">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
