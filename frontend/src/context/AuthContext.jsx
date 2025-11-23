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
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('jwt_token', access_token);
            localStorage.setItem('user_data', JSON.stringify(userData));
            setToken(access_token);
            setUser(userData);
            return true;
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        // Clean up old user_role key if it exists
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