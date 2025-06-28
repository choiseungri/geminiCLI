import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // useNavigate 추가
import { useAuthStore } from '../../stores/authStore';
import { User } from '@shared/types';

// 백엔드 API 기본 URL (환경 변수 또는 상수로 설정)
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

export const GoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // URL 쿼리 파라미터에서 토큰 및 사용자 정보 파싱
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const userId = queryParams.get('userId');
    const userName = queryParams.get('userName');
    const userEmail = queryParams.get('userEmail');
    // const userPicture = queryParams.get('userPicture'); // 백엔드에서 picture도 전달한다면 추가

    if (token && userId && userName && userEmail) {
      const user: User = {
        id: userId,
        name: decodeURIComponent(userName),
        email: userEmail,
        // picture: userPicture ? decodeURIComponent(userPicture) : undefined, // 백엔드에서 picture도 전달한다면 추가
      };
      login(user, token);

      // URL에서 쿼리 파라미터 제거하고 메인 페이지로 리디렉션
      // navigate('/', { replace: true }); // 주석 처리: App.tsx에서 isAuthenticated 상태에 따라 자동으로 REPLInterface로 이동함
    } else {
      // 토큰이 없으면 로딩 상태 해제 (이미 로그인 된 상태가 아닐 경우)
      if (!isAuthenticated) {
         setIsLoading(false);
      }
    }
    // App.tsx에서 isAuthenticated 상태 변경을 감지하므로, 여기서는 명시적 navigate를 일단 보류
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, login, navigate, isAuthenticated]);

  // 이미 인증된 상태라면 로딩이나 로그인 버튼을 보여주지 않음 (App.tsx에서 처리)
   useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false); // 혹시 모를 로딩 상태 강제 해제
    }
  }, [isAuthenticated]);


  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    // 백엔드의 Google 로그인 시작 라우트로 리디렉션
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // App.tsx에서 이미 !isAuthenticated일 때 이 컴포넌트를 렌더링하므로,
  // 여기서 다시 isAuthenticated를 체크하여 null을 반환할 필요는 없을 수 있습니다.
  // 만약 App.tsx의 로직이 변경될 경우를 대비하여 유지하거나, App.tsx의 로직을 신뢰하고 제거할 수 있습니다.
  if (isAuthenticated && !location.search.includes('token=')) {
     // 이미 로그인했고, 콜백으로 돌아온 상황이 아니라면 아무것도 렌더링하지 않거나 리디렉션
     // App.tsx에서 이 컴포넌트는 !isAuthenticated일 때만 보이도록 되어있으므로 이 조건은 거의 발생하지 않음
    return null;
  }


  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Gemini CLI Web UI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in with your Google account to access the Gemini CLI interface
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {isLoading && !isAuthenticated ? ( // 로그인 진행 중이면서 아직 인증되지 않았을 때만 로딩 표시
            <div className="flex items-center justify-center py-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gemini-600 mr-2"></div>
              <p className="text-gray-700 dark:text-gray-300">Connecting to Google...</p>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              // disabled={isLoading} // isLoading 상태는 버튼 자체를 안보이게 하므로 중복될 수 있음
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gemini-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By signing in, you agree to use Gemini CLI with your Google account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
