import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

export default function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
        }

        if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
        }

        setLoading(true);

        try {
        // Registrar usuario (por defecto será role: "user")
        await apiClient.post('/auth/register', {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            role: 'user' // Los usuarios normales tienen role "user"
        });

        alert('Account created successfully! Please login.');
        navigate('/login');
        } catch (err) {
        setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
            <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#5F7464] rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                </div>
                <span className="text-2xl font-bold text-[#2C3E2C]">MyBookSpace</span>
            </div>
            <h2 className="text-3xl font-bold text-[#2C3E2C]">Create Account</h2>
            <p className="text-[#5F7464] mt-2">Join our library community</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-[#2C3E2C] mb-2">
                    First Name
                    </label>
                    <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#2C3E2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    placeholder="John"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#2C3E2C] mb-2">
                    Last Name
                    </label>
                    <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#2C3E2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    placeholder="Doe"
                    />
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#2C3E2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    placeholder="you@example.com"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#2C3E2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    placeholder="••••••••"
                />
                <p className="text-xs text-[#5F7464] mt-1">At least 6 characters</p>
                </div>

                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">
                    Confirm Password
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#2C3E2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    placeholder="••••••••"
                />
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#5F7464] text-white rounded-lg hover:bg-[#4A5D4A] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <p className="text-center text-sm text-[#5F7464] mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-[#5F7464] font-medium hover:text-[#2C3E2C] underline">
                Sign in
                </Link>
            </p>
            </div>
        </div>
        </div>
    );
}