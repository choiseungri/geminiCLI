// Auth related types
export interface User {
  id: string
  email: string
  name: string
  picture?: string
  locale?: string
  verified?: boolean
}

export interface GoogleProfile {
  sub: string
  email: string
  name: string
  picture?: string
  locale?: string
  email_verified?: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

// OAuth flow types
export interface OAuthResponse {
  access_token: string
  refresh_token?: string
  user: User
}
