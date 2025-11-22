import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedRole = localStorage.getItem('user_role');

        if (storedToken && storedRole) {
            setToken(storedToken);
            setUser({ role: storedRole });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { access_token, role } = response.data;

            localStorage.setItem('jwt_token', access_token);
            localStorage.setItem('user_role', role);
            setToken(token);
            setUser({ role: role });
            return true;
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;
    const isAdmin = user?.role === 'admin';

    const value = {
        isAuthenticated,
        isAdmin,
        user,
        token,
        loading,
        login,
        logout,
    };

    if (loading) return <div>Loading...</div>;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};