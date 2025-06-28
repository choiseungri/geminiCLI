import { Socket } from 'socket.io';
import { executeCliCommand, changeDirectoryService } from '../../services/cli.service';
import type { CLICommand } from '@shared/types'; // CLICommand 타입 임포트

interface AuthenticatedSocket extends Socket {
  user?: { // server.ts의 인증 미들웨어에서 추가한 사용자 정보 타입 (필요에 따라 확장)
    id: string;
    email: string;
    name: string;
  };
}

export const handleCliCommand = async (socket: AuthenticatedSocket, command: CLICommand) => {
  console.log(`Received cli:command from ${socket.user?.email} (Socket ID: ${socket.id}):`, command.text);

  if (!command.text || typeof command.text !== 'string') {
    socket.emit('cli:response', {
      id: command.id || new Date().toISOString(),
      commandId: command.id,
      type: 'error',
      content: 'Invalid command format.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // command.sessionId 또는 socket.id (또는 socket.user.id)를 사용하여 세션 관리
  const sessionId = command.sessionId || socket.id;
  const result = await executeCliCommand(command.text, sessionId);

  socket.emit('cli:response', {
    id: command.id ? `${command.id}-response` : new Date().toISOString(), // 응답 ID 생성
    commandId: command.id,
    type: result.type,
    content: result.content,
    timestamp: new Date().toISOString(),
  });
};

export const handleChangeDirectory = (socket: AuthenticatedSocket, data: { path: string; sessionId?: string }) => {
  const { path, sessionId: reqSessionId } = data;
  console.log(`Received cli:change-directory from ${socket.user?.email} (Socket ID: ${socket.id}):`, path);

  if (typeof path !== 'string') {
    socket.emit('cli:error', { message: 'Invalid path for changing directory.' });
    return;
  }

  const sessionId = reqSessionId || socket.id;
  try {
    const newDir = changeDirectoryService(path, sessionId);
    socket.emit('cli:directory-changed', { path: newDir, sessionId: sessionId });
    // 성공 메시지를 REPL에 표시하기 위한 추가 응답
    socket.emit('cli:response', {
        id: new Date().toISOString(),
        type: 'text',
        content: `Working directory changed to: ${newDir}`,
        timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    socket.emit('cli:error', { message: `Error changing directory: ${error.message}` });
  }
};

// 추가적인 CLI 관련 이벤트 핸들러들을 여기에 추가할 수 있습니다.
// 예: handleInterruptCommand, handleGetSessions 등
