import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// 현재 작업 디렉토리를 시뮬레이션하기 위한 변수 (세션별로 관리 필요)
// 우선은 전역으로 간단히 설정. 실제로는 세션 객체 내에 저장해야 함.
let currentWorkingDirectory = os.homedir(); // 기본값은 사용자의 홈 디렉토리

interface CommandHandler {
  (args?: string[], options?: any): Promise<string | object>;
}

const commandHandlers: Record<string, CommandHandler> = {
  help: async () => {
    return `Available commands:
- help: Show this help message.
- status: Show system and connection status.
- ls [path]: List directory contents.
- pwd: Print working directory.
- echo <text>: Display a line of text.
- date: Display the current date and time.
- read <file>: Display file content.
- write <file> <content>: Write content to a file. (Not implemented yet)
- ask <question>: Ask AI a question. (Not implemented yet)
- chat <message>: Chat with AI. (Not implemented yet)
`;
  },

  status: async () => {
    return {
      nodeVersion: process.version,
      platform: os.platform(),
      uptime: os.uptime(),
      cwd: currentWorkingDirectory,
      // 추가적인 상태 정보
    };
  },

  ls: async (args?: string[]) => {
    const targetPath = args && args.length > 0 ? path.resolve(currentWorkingDirectory, args[0]) : currentWorkingDirectory;
    try {
      const stat = await fs.stat(targetPath);
      if (!stat.isDirectory()) {
        return `Error: ${targetPath} is not a directory.`;
      }
      const files = await fs.readdir(targetPath, { withFileTypes: true });
      return files.map(file => ({
        name: file.name,
        type: file.isDirectory() ? 'directory' : 'file',
        // size: file.isFile() ? (await fs.stat(path.join(targetPath, file.name))).size : undefined
      }));
    } catch (error: any) {
      return `Error listing directory ${targetPath}: ${error.message}`;
    }
  },

  pwd: async () => {
    return currentWorkingDirectory;
  },

  echo: async (args?: string[]) => {
    return args && args.length > 0 ? args.join(' ') : '';
  },

  date: async () => {
    return new Date().toISOString();
  },

  read: async (args?: string[]) => {
    if (!args || args.length === 0) {
      return 'Error: No file specified. Usage: read <filepath>';
    }
    const filePath = path.resolve(currentWorkingDirectory, args[0]);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const mimeType = require('mime-types').lookup(filePath) || 'application/octet-stream';
      return { content, metadata: { mimeType, filename: path.basename(filePath) } };
    } catch (error: any) {
      // 구분된 오류 메시지와 메타데이터를 반환하도록 수정
      return { error: `Error reading file ${filePath}: ${error.message}`, metadata: { filename: path.basename(filePath) } };
    }
  },

  // TODO: Implement 'write', 'ask', 'chat'
  write: async (args?: string[]) => {
    return 'Error: "write" command is not implemented yet.';
  },
  ask: async (args?: string[]) => {
    return 'Error: "ask" command is not implemented yet.';
  },
  chat: async (args?: string[]) => {
    return 'Error: "chat" command is not implemented yet.';
  }
};

export const executeCliCommand = async (commandText: string, sessionId: string): Promise<CLIResponseData> => {
  // TODO: 세션 ID를 사용하여 세션별 작업 디렉토리 및 상태 관리
  // currentWorkingDirectory = getSession(sessionId).workingDirectory;

  const parts = commandText.trim().split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = commandHandlers[commandName];

  if (handler) {
    try {
      const result = await handler(args);
      if (commandName === 'read') {
        // 'read' 명령어는 특별한 객체 구조를 반환
        const readResult = result as { content?: string; error?: string; metadata: object };
        if (readResult.error) {
          return { type: 'error', content: readResult.error, metadata: readResult.metadata };
        }
        // 성공 시, content는 기본 content 필드로, metadata는 metadata 필드로 전달
        return { type: 'file', content: readResult.content || '', metadata: readResult.metadata };
      }
      // 다른 명령어들은 이전과 같이 처리
      return { type: typeof result === 'string' ? 'text' : 'json', content: result, metadata: undefined };
    } catch (error: any) {
      console.error(`Error executing command "${commandName}":`, error);
      return { type: 'error', content: `Error executing command "${commandName}": ${error.message}`, metadata: undefined };
    }
  } else {
    return { type: 'error', content: `Unknown command: ${commandName}`, metadata: undefined };
  }
};

// Helper interface for response data
interface CLIResponseData {
  type: 'text' | 'json' | 'error' | 'file'; // 'file' 타입 추가
  content: any;
  metadata?: any; // metadata 필드 추가
}

// TODO: 세션 관리 로직 추가
// interface CLISession {
//   id: string;
//   workingDirectory: string;
//   // ... other session data
// }
// const sessions = new Map<string, CLISession>();
// function getSession(sessionId: string): CLISession {
//   if (!sessions.has(sessionId)) {
//     sessions.set(sessionId, { id: sessionId, workingDirectory: os.homedir() });
//   }
//   return sessions.get(sessionId)!;
// }

export const changeDirectoryService = (newPath: string, sessionId: string): string => {
    // TODO: 세션 ID를 사용하여 세션별 작업 디렉토리 관리
    // const session = getSession(sessionId);
    const resolvedPath = path.resolve(currentWorkingDirectory, newPath);
    // TODO: 실제로 디렉토리가 존재하는지 확인하는 로직 추가
    // fs.stat(resolvedPath).then(stat => if (stat.isDirectory()) currentWorkingDirectory = resolvedPath)
    currentWorkingDirectory = resolvedPath; // 임시로 바로 변경
    // session.workingDirectory = resolvedPath;
    return currentWorkingDirectory;
};
