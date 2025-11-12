import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface SessionData {
  user: User | null;
}

// Custom session hook that works with our custom auth system
export function useSession() {
  const [data, setData] = useState<SessionData>({ user: null });
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          setData(sessionData);
        } else {
          setData({ user: null });
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setData({ user: null });
      } finally {
        setIsPending(false);
      }
    }

    fetchSession();
  }, []);

  return { data, isPending };
}

// Custom sign in function
export async function signIn(email: string, password: string) {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Sign in failed');
  }

  return response.json();
}

// Custom sign up function
export async function signUp(email: string, password: string, name?: string) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Sign up failed');
  }

  return response.json();
}

// Custom sign out function
export async function signOut() {
  const response = await fetch('/api/auth/signout', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Sign out failed');
  }

  // Force a page reload to clear the session state
  window.location.reload();
}