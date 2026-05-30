import { useState, useEffect } from 'react';

export interface User {
  email: string;
  createdAt: string;
}

const STORAGE_KEY = 'edu-scale-user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const signUp = (email: string, password: string) => {
    // Mock signup - in real app, this would hit an API
    const newUser: User = {
      email,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  };

  const login = (email: string, password: string) => {
    // Mock login
    const existingUser: User = {
      email,
      createdAt: new Date().toISOString(),
    };
    setUser(existingUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingUser));
    return existingUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    login,
    logout,
  };
};
