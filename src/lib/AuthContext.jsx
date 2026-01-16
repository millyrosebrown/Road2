// Authentication Context for ROAD2
import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from './services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState({ status: 'checking', message: '' });

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
        verifyConnection();
    }, []);

    const verifyConnection = async () => {
        const status = await authService.checkConnection();
        // Ignore 401 as it means we are connected but not logged in
        if (status.status === 'error' && status.code === 401) {
            setConnectionStatus({ status: 'connected', message: 'Connected to Appwrite' });
        } else {
            setConnectionStatus(status);
        }
    };

    const checkAuth = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                const userProfile = await userService.getProfile(currentUser.$id);
                setProfile(userProfile);
            }
        } catch (error) {
            console.error('Auth context check error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const session = await authService.login(email, password);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            const userProfile = await userService.getProfile(currentUser.$id);
            setProfile(userProfile);
            return session;
        } catch (error) {
            console.error('Auth context login error:', error);
            throw error;
        }
    };

    const signup = async (email, password, name) => {
        try {
            const newUser = await authService.createAccount(email, password, name);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            // Create initial profile
            const newProfile = await userService.createProfile(currentUser.$id, { name });
            setProfile(newProfile);
            return newUser;
        } catch (error) {
            console.error('Auth context signup error:', error);
            throw error;
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setProfile(null);
    };

    const updateProfile = async (data) => {
        if (user) {
            // Ensure required fields like 'name' are maintained. 
            // After schema recreation, profile.name might be missing, so fallback to account user.name
            const updateData = {
                ...data,
                name: data.name || profile?.name || user?.name || 'User',
            };
            const updated = await userService.updateProfile(user.$id, updateData);
            setProfile(updated);
            return updated;
        }
    };

    const value = {
        user,
        profile,
        loading,
        connectionStatus,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        refreshAuth: checkAuth,
        verifyConnection,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
