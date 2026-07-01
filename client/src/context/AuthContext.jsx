import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rentease_token');
    const savedUser = localStorage.getItem('rentease_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('rentease_token');
        localStorage.removeItem('rentease_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('rentease_token', data.token);
    localStorage.setItem('rentease_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('rentease_token', data.token);
    localStorage.setItem('rentease_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('rentease_token');
    localStorage.removeItem('rentease_user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    localStorage.setItem('rentease_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
