import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication context
 * @returns {Object} Auth context containing:
 * - user: Current user object
 * - token: JWT token
 * - login: Function to handle user login
 * - logout: Function to handle user logout
 * 
 * @example
 * const { user, login, logout } = useAuth();
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;