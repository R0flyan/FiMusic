const API_URL = 'http://localhost:8080'

export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export async function register(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Registration failed')
  }

  return response.json()
}

export async function login(
  username: string,
  password: string
): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}

export async function getMe(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user')
  }

  return response.json()
}