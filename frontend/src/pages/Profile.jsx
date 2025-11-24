import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loansAPI } from '../services/api';
import Layout from '../components/Layout';

export default function Profile() {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
        const response = await loansAPI.getMyLoans();
        setLoans(response.data.loans || response.data || []);
        } catch (error) {
        console.error('Error loading user data:', error);
        } finally {
        setLoading(false);
        }
    };

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

    const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
    const totalFines = loans.reduce((sum, l) => sum + (l.fine_amount || 0), 0);

    if (loading) {
        return (
        <Layout>
            <div className="p-8 flex items-center justify-center">
            <p className="text-[#5F7464]">Loading profile...</p>
            </div>
        </Layout>
        );
    }

    return (
        <Layout>
        <div className="p-8 space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#5F7464] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {getInitials()}
                </div>
                <div>
                <h2 className="text-2xl font-bold text-[#2C3E2C]">{getDisplayName()}</h2>
                <p className="text-[#5F7464]">{user?.email}</p>
                <p className="text-sm text-[#5F7464] mt-1">
                    Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                </div>
            </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-[#5F7464] font-medium mb-2">Active Loans</p>
                <p className="text-4xl font-bold text-[#2C3E2C]">{activeLoans.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-[#5F7464] font-medium mb-2">Total Fines</p>
                <p className="text-4xl font-bold text-[#2C3E2C]">${totalFines.toFixed(2)}</p>
            </div>
            </div>

            {/* Loan History Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-[#2C3E2C] mb-4">Recent Activity</h3>
            {loans.length === 0 ? (
                <p className="text-[#5F7464]">No loan history yet</p>
            ) : (
                <div className="space-y-3">
                {loans.slice(0, 5).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                        <p className="font-medium text-[#2C3E2C]">{loan.book?.title || 'Unknown Book'}</p>
                        <p className="text-sm text-[#5F7464]">
                        {new Date(loan.loan_date).toLocaleDateString()}
                        </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                        loan.status === 'active' ? 'bg-green-100 text-green-700' :
                        loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {loan.status}
                    </span>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        </Layout>
    );
}