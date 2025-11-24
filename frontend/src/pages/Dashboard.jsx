import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { catalogAPI, loansAPI } from '../services/api';
import Layout from '../components/Layout';
import { StatsCard, BookCard } from '../components/cards';
import { Book, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
        // Cargar libros y préstamos en paralelo
        const [booksRes, loansRes] = await Promise.all([
            catalogAPI.getBooks({ limit: 3 }),
            loansAPI.getMyLoans()
        ]);
        
        setBooks(booksRes.data.books || booksRes.data || []);
        setLoans(loansRes.data.loans || loansRes.data || []);
        } catch (error) {
        console.error('Error loading dashboard:', error);
        } finally {
        setLoading(false);
        }
    };

    // Calculate statistics - backend uses 'On Loan', 'Overdue', 'Returned'
    const activeLoans = loans.filter(l => 
        l.status === 'On Loan' || l.status === 'active'
    ).length;
    
    const dueThisWeek = loans.filter(l => {
        if (l.status !== 'On Loan' && l.status !== 'active') return false;
        const dueDate = new Date(l.expiration_date);
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate >= today && dueDate <= weekFromNow;
    }).length;
    
    const overdue = loans.filter(l => 
        l.status === 'Overdue' || l.status === 'overdue'
    ).length;

    if (loading) {
        return (
        <Layout>
            <div className="p-8 flex items-center justify-center">
            <p className="text-[#5F7464]">Loading...</p>
            </div>
        </Layout>
        );
    }

    return (
        <Layout>
        <div className="p-8 space-y-8">
            {/* Welcome Section */}
            <div>
            <h2 className="text-3xl font-bold text-[#2C3E2C] mb-2">
                Welcome Back, {user?.first_name || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-[#5F7464]">Discover your next great read</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
            <StatsCard 
                label="Active Loans"
                value={activeLoans}
                subtitle="Books currently borrowed"
                icon={Book}
            />
            <StatsCard 
                label="Due This Week"
                value={dueThisWeek}
                subtitle="Books to return soon"
                icon={Clock}
                valueColor="text-orange-600"
            />
            <StatsCard 
                label="Overdue"
                value={overdue}
                subtitle="Requires attention"
                icon={AlertCircle}
                valueColor="text-red-600"
            />
            </div>

            {/* Recommended Books */}
            <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2C3E2C]">Recommended for You</h3>
                <button 
                onClick={() => navigate('/browse')}
                className="text-[#5F7464] hover:text-[#2C3E2C] font-medium"
                >
                View All →
                </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
                {books.length === 0 ? (
                <p className="col-span-3 text-center text-[#5F7464]">No books available yet</p>
                ) : (
                books.slice(0, 3).map((book) => (
                    <BookCard
                    key={book.id}
                    book={book}
                    onBookClick={() => navigate(`/book/${book.id}`)}
                    showAction={false}
                    />
                ))
                )}
            </div>
            </div>
        </div>
        </Layout>
    );
}