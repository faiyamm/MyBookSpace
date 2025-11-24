import React, { useEffect, useState } from 'react';
import { loansAPI } from '../services/api';
import Layout from '../components/Layout';
import { LoanCard } from '../components/cards';

export default function MyLoans() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
        const response = await loansAPI.getMyLoans();
        setLoans(response.data.loans || response.data || []);
        } catch (error) {
        console.error('Error loading loans:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleRenew = async (loanId) => {
        try {
        await loansAPI.renewLoan(loanId);
        alert('Loan renewed successfully!');
        loadLoans();
        } catch (error) {
        alert(error.response?.data?.error || 'Failed to renew loan');
        }
    };

    const handleReturn = async (loanId) => {
        if (!window.confirm('Are you sure you want to return this book?')) return;
        
        try {
        await loansAPI.returnBook(loanId);
        alert('Book returned successfully!');
        loadLoans();
        } catch (error) {
        alert(error.response?.data?.error || 'Failed to return book');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        });
    };

    // Backend uses 'On Loan', 'Overdue', 'Returned'
    const activeLoans = loans.filter(l => 
        l.status === 'On Loan' || 
        l.status === 'Overdue' || 
        l.status === 'active' || 
        l.status === 'overdue'
    );

    if (loading) {
        return (
        <Layout>
            <div className="p-8 flex items-center justify-center">
            <p className="text-[#5F7464]">Loading loans...</p>
            </div>
        </Layout>
        );
    }

    return (
        <Layout>
        <div className="p-8 space-y-6">
            <div>
            <h2 className="text-2xl font-bold text-[#2C3E2C] mb-2">My Loans</h2>
            <p className="text-[#5F7464]">Manage your borrowed books</p>
            </div>

            {/* Active Loans Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-[#2C3E2C] mb-2">Active Loans</h3>
            <p className="text-sm text-[#5F7464] mb-6">Books you currently have borrowed</p>

            {activeLoans.length === 0 ? (
                <div className="text-center py-8">
                <p className="text-[#5F7464]">You don't have any active loans</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-6">
                {activeLoans.map((loan) => (
                    <LoanCard
                    key={loan.id}
                    loan={loan}
                    onRenew={handleRenew}
                    onReturn={handleReturn}
                    />
                ))}
                </div>
            )}
            </div>
        </div>
        </Layout>
    );
}