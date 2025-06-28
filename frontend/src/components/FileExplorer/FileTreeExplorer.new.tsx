import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, RefreshCw, Home } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FileTreeExplorerProps {
  className?: string;
}

export const FileTreeExplorer: React.FC<FileTreeExplorerProps> = ({ className = '' }) => {
  const [fileTree] = useState<FileNode[]>([
    {
      name: 'src',
      path: '/src',
      type: 'directory',
      children: [
        { name: 'components', path: '/src/components', type: 'directory' },
        { name: 'utils', path: '/src/utils', type: 'directory' },
        { name: 'App.tsx', path: '/src/App.tsx', type: 'file' }
      ]
    },
    {
      name: 'package.json',
      path: '/package.json',
      type: 'file'
    }
  ]);
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toggleExpand = (path: string) => {
    // Simple toggle for demo
    console.log(`Toggle expand: ${path}`);
  };

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'file') {
      setSelectedFile(node.path);
    } else {
      toggleExpand(node.path);
    }
  };

  const renderFileNode = (node: FileNode, depth = 0): React.ReactNode => {
    const isSelected = selectedFile === node.path;
    const isExpanded = node.isExpanded;

    return (
      <div key={node.path} className="select-none">
        <div
          className={`flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded ${
            isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {node.type === 'directory' && (
            <span className="mr-1 text-gray-500">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          
          <span className="mr-2 text-gray-600 dark:text-gray-400">
            {node.type === 'directory' ? (
              <Folder className="w-4 h-4" />
            ) : (
              <File className="w-4 h-4" />
            )}
          </span>
          
          <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
            {node.name}
          </span>
        </div>

        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            File Explorer
          </span>
        </div>
        <button
          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* File Tree */}
      <div className="p-2 max-h-96 overflow-y-auto">
        {fileTree.map(node => renderFileNode(node))}
      </div>

      {/* Info */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          File explorer coming soon - use 'ls' and 'pwd' commands for now
        </p>
      </div>
    </div>
  );
};
