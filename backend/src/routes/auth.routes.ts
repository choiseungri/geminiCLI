import express, { Router, Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // .env 파일의 환경 변수를 로드

const router: Router = express.Router();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_BASE_URL}/auth/google/callback` // 리디렉션 URI
);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Google 로그인 시작 라우트
router.get('/google', (req: Request, res: Response) => {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline', // refresh_token을 받기 위해
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent', // 매번 동의를 구하도록 (개발 중 테스트 용이)
  });
  res.redirect(authUrl);
});

// 2. Google 로그인 콜백 처리 라우트
router.get('/google/callback', async (req: Request, res: Response, next: NextFunction) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send('Authorization code not found.');
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    if (!tokens.id_token) {
      return res.status(400).send('ID token not found.');
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).send('Failed to retrieve user profile from Google.');
    }

    // TODO: 여기서 사용자 정보를 DB에 저장하거나 업데이트하는 로직 추가
    // 지금은 간단히 사용자 정보를 콘솔에 출력하고 JWT 생성
    console.log('Google User Profile:', payload);

    const userProfile = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || '',
      picture: payload.picture || '',
    };

    // 내부 시스템용 JWT 생성
    const sessionToken = jwt.sign(userProfile, JWT_SECRET, {
      expiresIn: '1h', // 토큰 유효 시간 (예: 1시간)
    });

    // 프론트엔드로 리디렉션하면서 토큰 전달 (쿼리 파라미터 또는 다른 방식 사용 가능)
    // 더 안전한 방법은 프론트엔드에서 이 토큰을 받을 수 있는 특정 페이지로 보내고,
    // 해당 페이지에서 localStorage에 저장 후 메인 페이지로 이동하는 것입니다.
    // 여기서는 간단히 쿼리 파라미터로 전달합니다.
    res.redirect(`${FRONTEND_URL}?token=${sessionToken}&userId=${userProfile.id}&userName=${encodeURIComponent(userProfile.name || '')}&userEmail=${userProfile.email}`);

  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    next(error); // 에러 핸들러로 전달
  }
});

export default router;
