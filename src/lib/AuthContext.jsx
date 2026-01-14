// Authentication Context for ROAD2
import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from './services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                const userProfile = await userService.getProfile(currentUser.$id);
                setProfile(userProfile);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const session = await authService.login(email, password);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        const userProfile = await userService.getProfile(currentUser.$id);
        setProfile(userProfile);
        return session;
    };

    const signup = async (email, password, name) => {
        const newUser = await authService.createAccount(email, password, name);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        // Create initial profile
        const newProfile = await userService.createProfile(currentUser.$id, { name });
        setProfile(newProfile);
        return newUser;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setProfile(null);
    };

    const updateProfile = async (data) => {
        if (user) {
            const updated = await userService.updateProfile(user.$id, data);
            setProfile(updated);
            return updated;
        }
    };

    const value = {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        refreshAuth: checkAuth,
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
