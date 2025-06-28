import React from 'react';
import { useREPLStore } from '../../stores/replStore';
import { useAuthStore } from '../../stores/authStore';
import { Wifi, WifiOff, User, Clock, FolderOpen } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { isConnected, currentDirectory } = useREPLStore();
  const { user } = useAuthStore();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between text-sm">
        {/* Left side - Connection status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
          
          {currentDirectory && (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <FolderOpen className="w-4 h-4" />
              <span className="font-mono text-xs">{currentDirectory}</span>
            </div>
          )}
        </div>

        {/* Right side - User info and time */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span className="text-xs font-medium">{user.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
