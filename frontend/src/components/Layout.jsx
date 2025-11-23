import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Book, Clock, User, Bell, LogOut } from 'lucide-react';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAdmin } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Obtener iniciales del nombre completo
    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return (user.first_name[0] + user.last_name[0]).toUpperCase();
        }
        if (!user?.email) return 'U';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    const getDisplayName = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        return user?.email?.split('@')[0] || 'User';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
        { id: 'browse', icon: Book, label: 'Browse Books', path: '/browse' },
        { id: 'loans', icon: Clock, label: 'My Loans', path: '/loans' },
        { id: 'profile', icon: User, label: 'Profile', path: '/profile' }
    ];

    return (
        <div className="min-h-screen bg-[#FFF8E7] flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
            <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/dashboard')}
            >
                <div className="w-10 h-10 bg-[#5F7464] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                </div>
                <span className="text-xl font-bold text-[#2C3E2C]">MyBookSpace</span>
            </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
                <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                    ? 'bg-[#5F7464] text-white'
                    : 'text-[#5F7464] hover:bg-gray-100'
                }`}
                >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                </button>
            ))}
            </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#2C3E2C]">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/browse' && 'Browse Books'}
                {location.pathname === '/loans' && 'My Loans'}
                {location.pathname === '/profile' && 'Profile'}
            </h1>
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-[#5F7464]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="relative">
                <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-[#5F7464] rounded-full flex items-center justify-center text-white font-semibold hover:bg-[#4A5D4A] transition-colors"
                >
                    {getInitials()}
                </button>
                
                {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                        <p className="font-semibold text-[#2C3E2C]">{getDisplayName()}</p>
                        <p className="text-sm text-[#5F7464] truncate">{user?.email}</p>
                        {isAdmin && (
                        <span className="inline-block mt-1 text-xs bg-[#5F7464] text-white px-2 py-0.5 rounded">
                            Admin
                        </span>
                        )}
                    </div>
                    <button
                        onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-[#2C3E2C]"
                    >
                        <User className="w-4 h-4" />
                        Profile
                    </button>
                    {isAdmin && (
                        <button
                        onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-[#2C3E2C]"
                        >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600 border-t border-gray-200 mt-2 pt-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                    </div>
                )}
                </div>
            </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 overflow-auto">
            {children}
            </div>
        </div>
        </div>
    );
}