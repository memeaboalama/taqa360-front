import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthStatus, AuthUser } from '../../shared/types';
import { useAuthStore } from '../../features/auth/stores/authStore';

interface AuthContextType {
    authStatus: AuthStatus;
    userRole: 'admin' | 'educator' | 'user' | null;
    currentUser: AuthUser | null;
    logout: () => void;
    navigateToRegister: () => void;
    handleRegister: (addToast: (message: string, type?: 'success' | 'error' | 'info') => void) => void;
    navigateToLogin: () => void;
    setCurrentUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        user,
        isAuthenticated,
        status,
        logout: storeLogout,
        setUser,
        hasRole
    } = useAuthStore();

    const [authStatus, setAuthStatus] = useState<AuthStatus>(status);
    const userRole = user?.role as 'admin' | 'educator' | 'user' | null || null;
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(user);

    // Sync with auth store
    useEffect(() => {
        setAuthStatus(status);
        setCurrentUser(user);
    }, [status, user]);

    const logout = async () => {
        await storeLogout();
        setAuthStatus('loggedOut');
        setCurrentUser(null);
    };

    const navigateToRegister = () => setAuthStatus('register');
    const navigateToLogin = () => setAuthStatus('loggedOut');

    const handleRegister = (addToast: (message: string, type?: 'success' | 'error' | 'info') => void) => {
        setAuthStatus('pendingApproval');
        addToast('تم تقديم الطلب بنجاح', 'info');
    };

    const setCurrentUserWrapper = (user: AuthUser | null) => {
        setCurrentUser(user);
        setUser(user);
    };

    const value = {
        authStatus: isAuthenticated ? 'loggedIn' : authStatus,
        userRole,
        currentUser,
        logout,
        navigateToRegister,
        handleRegister,
        navigateToLogin,
        setCurrentUser: setCurrentUserWrapper
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
