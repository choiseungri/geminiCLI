import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes'; // authRoutes 임포트

dotenv.config(); // .env 파일 로드

const app = express();

// JSON 요청 본문 파싱을 위한 미들웨어 (필요한 경우)
app.use(express.json());

// 인증 라우트 등록
app.use('/auth', authRoutes);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // 개발 중에는 모든 출처 허용, 프로덕션에서는 프론트엔드 주소로 제한
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Socket.IO 인증 미들웨어
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log('Socket connection denied: No token provided.');
    return next(new Error('Authentication error: No token provided.'));
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret', (err: any, decoded: any) => {
    if (err) {
      console.log('Socket connection denied: Invalid token.', err.message);
      return next(new Error('Authentication error: Invalid token.'));
    }
    // 요청 객체에 사용자 정보 추가 (타입 정의 필요할 수 있음)
    (socket as any).user = decoded; // `decoded`에는 JWT 페이로드가 들어감 (예: userProfile)
    console.log(`Socket authenticated: ${socket.id}, User:`, (socket as any).user.email);
    next();
  });
});

app.get('/', (req, res) => {
  res.send('Gemini CLI Backend Server is running!');
});

io.on('connection', (socket) => {
  // 이제 socket.user 에 인증된 사용자 정보가 들어있음
  console.log(`Socket connected for user: ${(socket as any).user?.email} (ID: ${socket.id})`);

  // 프론트엔드로부터 'cli:connect' 이벤트를 받으면 초기화 메시지 전송
  socket.on('cli:connect', (data) => {
    console.log(`CLI connect event received from ${(socket as any).user?.email} (Socket ID: ${socket.id}):`, data);
    const sessionId = data?.sessionId || socket.id;
    // cli.service.ts 에서 초기 작업 디렉토리를 os.homedir()로 설정하므로, 해당 값을 사용하거나,
    // 클라이언트가 특정 디렉토리를 요청하면 그 값을 사용하도록 할 수 있습니다.
    // 여기서는 일단 cli.service.ts의 초기값을 따르도록 하고, 필요시 클라이언트 요청을 반영합니다.
    const initialWorkingDirectory = data?.workingDirectory; // || getInitialWorkingDirectoryForSession(sessionId);

    socket.emit('cli:connected', {
      sessionId: sessionId,
      workingDirectory: initialWorkingDirectory || require('os').homedir(), // 실제 초기 디렉토리 제공
      message: `Successfully connected to CLI backend. Session ID: ${sessionId}`,
    });
    console.log(`Sent cli:connected to ${socket.id}`);
  });

  // CLI 명령어 핸들러 등록
  socket.on('cli:command', (command) => {
    handleCliCommand(socket as any, command); // 타입 단언 사용
  });

  // 작업 디렉토리 변경 핸들러 등록
  socket.on('cli:change-directory', (data) => {
    handleChangeDirectory(socket as any, data); // 타입 단언 사용
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected for user ${(socket as any).user?.email} (Socket ID: ${socket.id})`);
  });
});

server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

export default server;
