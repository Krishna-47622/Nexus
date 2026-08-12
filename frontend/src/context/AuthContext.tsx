import React, { createContext, useContext, useState } from 'react';

export interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  collegeId: number | null;
  collegeName: string;
  primaryRole: string;
  mustChangePassword: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (permissionCode: string) => boolean;
  updateUserPasswordState: (mustChange: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('campus_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('campus_jwt_token');
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('campus_jwt_token', newToken);
    localStorage.setItem('campus_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('campus_jwt_token');
    localStorage.removeItem('campus_user');
    setToken(null);
    setUser(null);
  };

  const currentUser = user || (() => {
    try {
      const saved = localStorage.getItem('campus_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const hasPermission = (permissionCode: string) => {
    if (!currentUser) return false;
    if (currentUser.primaryRole === 'Platform Admin') return true;
    return currentUser.permissions ? currentUser.permissions.includes(permissionCode) : false;
  };

  const updateUserPasswordState = (mustChange: boolean) => {
    if (currentUser) {
      const updated = { ...currentUser, mustChangePassword: mustChange };
      localStorage.setItem('campus_user', JSON.stringify(updated));
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, token, login, logout, hasPermission, updateUserPasswordState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
