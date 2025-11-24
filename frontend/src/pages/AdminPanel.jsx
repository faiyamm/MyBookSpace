import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { catalogAPI, loansAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BaseCard from '../components/cards/BaseCard';
import { Bell, Plus, DollarSign, Search, Edit2, Trash2, X } from 'lucide-react';

export default function AdminPanel() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory');
    const [showAddBook, setShowAddBook] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Data
    const [books, setBooks] = useState([]);
    const [loans, setLoans] = useState([]);
    const [catalogStats, setCatalogStats] = useState({});
    const [loanStats, setLoanStats] = useState({});
    
    // Search/Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Form for new book
    const [newBook, setNewBook] = useState({
        isbn: '',
        title: '',
        author: '',
        genre: '',
        total_copies: 1,
        description: ''
    });
    const [fetchingISBN, setFetchingISBN] = useState(false);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
        await Promise.all([
            loadBooks(),
            loadLoans(),
            loadStats()
        ]);
        } catch (error) {
        console.error('Error loading admin data:', error);
        } finally {
        setLoading(false);
        }
    };

    const loadBooks = async () => {
        try {
        const response = await catalogAPI.getBooks();
        setBooks(response.data.books || response.data || []);
        } catch (error) {
        console.error('Error loading books:', error);
        }
    };

    const loadLoans = async () => {
        try {
        const response = await loansAPI.getAllLoans();
        setLoans(response.data.loans || response.data || []);
        } catch (error) {
        console.error('Error loading loans:', error);
        }
    };

    const loadStats = async () => {
        try {
        const [catalogRes, loanRes] = await Promise.all([
            catalogAPI.getStats(),
            loansAPI.getStats()
        ]);
        setCatalogStats(catalogRes.data);
        setLoanStats(loanRes.data);
        } catch (error) {
        console.error('Error loading stats:', error);
        }
    };

    const handleFetchISBN = async () => {
        if (!newBook.isbn) {
        alert('Please enter an ISBN first');
        return;
        }
        
        setFetchingISBN(true);
        try {
        const response = await catalogAPI.previewByISBN(newBook.isbn);
        const bookData = response.data;
        const data = bookData.api_data || bookData;
        
        setNewBook(prev => ({
            ...prev,
            title: data.title || prev.title,
            author: data.author || prev.author,
            description: data.description || prev.description
        }));
        
        alert('Book information fetched successfully!');
        } catch (error) {
        alert('Could not fetch book info. Please enter manually.');
        } finally {
        setFetchingISBN(false);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
        await catalogAPI.createBook(newBook);
        alert('Book added successfully!');
        setShowAddBook(false);
        setNewBook({ isbn: '', title: '', author: '', genre: '', total_copies: 1, description: '' });
        loadAllData();
        } catch (error) {
        alert(error.response?.data?.error || 'Failed to add book');
        }
    };

    const handleEditBook = (book) => {
        setEditingBook(book);
        setNewBook({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            genre: book.genre,
            total_copies: book.total_copies,
            description: book.description || ''
        });
        setShowAddBook(true);
    };

    const handleUpdateBook = async (e) => {
        e.preventDefault();
        try {
            await catalogAPI.updateBook(editingBook.id, newBook);
            alert('Book updated successfully!');
            setShowAddBook(false);
            setEditingBook(null);
            setNewBook({ isbn: '', title: '', author: '', genre: '', total_copies: 1, description: '' });
            loadAllData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update book');
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        
        try {
        await catalogAPI.deleteBook(bookId);
        alert('Book deleted successfully!');
        loadBooks();
        loadStats();
        } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete book');
        }
    };

    const getInitials = () => {
        if (!user?.email) return 'A';
        return user.email.substring(0, 2).toUpperCase();
    };

    // Filtrar datos según tab activo
    const filteredBooks = books.filter(book => {
        const matchesSearch = searchTerm === '' || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.isbn && book.isbn.includes(searchTerm));
        
        const matchesStatus = statusFilter === '' ||
        (statusFilter === 'available' && book.available_copies > 0) ||
        (statusFilter === 'low' && book.available_copies > 0 && book.available_copies <= 2) ||
        (statusFilter === 'out' && book.available_copies === 0);
        
        return matchesSearch && matchesStatus;
    });

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = searchTerm === '' ||
        loan.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Handle both backend statuses and filter values
        const matchesStatus = statusFilter === '' || 
            (statusFilter === 'active' && (loan.status === 'On Loan' || loan.status === 'active')) ||
            (statusFilter === 'overdue' && (loan.status === 'Overdue' || loan.status === 'overdue')) ||
            (statusFilter === 'returned' && (loan.status === 'Returned' || loan.status === 'returned')) ||
            loan.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const fines = loans.filter(l => l.fine_amount > 0);

    // Calculate inventory stats from books
    const inventoryStats = {
        available: books.filter(b => b.available_copies > 0).length,
        low_stock: books.filter(b => b.available_copies > 0 && b.available_copies <= 2).length,
        out_of_stock: books.filter(b => b.available_copies === 0).length
    };

    if (loading) {
        return (
        <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
            <p className="text-gray-600">Loading admin panel...</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF8E7]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
            <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#5F7464] rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#2C3E2C]">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                    <Bell className="w-5 h-5 text-[#5F7464]" />
                </button>
                <div className="relative">
                    <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-10 h-10 bg-[#5F7464] rounded-full flex items-center justify-center text-white font-semibold hover:bg-[#4A5D4A] transition-colors"
                    >
                        {getInitials()}
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <div className="px-4 py-2 border-b border-gray-200">
                                <p className="font-semibold text-[#2C3E2C]">{user?.email}</p>
                                <span className="inline-block mt-1 text-xs bg-[#5F7464] text-white px-2 py-0.5 rounded">Admin</span>
                            </div>
                            <button
                                onClick={() => {
                                    setShowUserMenu(false);
                                    navigate('/dashboard');
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-[#5F7464]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                View User Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to logout?')) {
                                        logout();
                                        navigate('/login');
                                    }
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
            {/* Welcome */}
            <div>
            <h2 className="text-xl text-[#5F7464]">Manage your library system and monitor activity</h2>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
            <BaseCard className="bg-white">
                <p className="text-[#5F7464] font-medium mb-2">Books in Inventory</p>
                <p className="text-4xl font-bold text-[#2C3E2C] mb-1">
                {catalogStats.total_books || 0}
                </p>
                <p className="text-sm text-[#5F7464]">{catalogStats.total_copies || 0} total copies</p>
            </BaseCard>
            
            <BaseCard className="bg-white">
                <p className="text-[#5F7464] font-medium mb-2">Active Loans</p>
                <p className="text-4xl font-bold text-[#2C3E2C] mb-1">
                {loanStats.active_loans || 0}
                </p>
                <p className="text-sm text-[#5F7464]">{loanStats.overdue_loans || 0} overdue</p>
            </BaseCard>
            
            <BaseCard className="bg-white">
                <p className="text-[#5F7464] font-medium mb-2">Pending Fines</p>
                <p className="text-4xl font-bold text-[#2C3E2C] mb-1">
                ${(loanStats.total_fines || 0).toFixed(2)}
                </p>
                <p className="text-sm text-[#5F7464]">{fines.length} unpaid</p>
            </BaseCard>
            </div>

            {/* Quick Actions */}
            <BaseCard className="bg-white">
            <h3 className="text-lg font-bold text-[#2C3E2C] mb-1">Quick Actions</h3>
            <p className="text-sm text-[#5F7464] mb-4">Common administrative tasks</p>
            
            <div className="grid grid-cols-2 gap-4">
                <button 
                onClick={() => setShowAddBook(true)}
                className="flex flex-col items-center justify-center gap-2 p-6 bg-[#FFF8E7] hover:bg-[#F5EED8] rounded-lg transition-colors"
                >
                <Plus className="w-6 h-6 text-[#5F7464]" />
                <span className="font-medium text-[#2C3E2C]">Add New Book</span>
                </button>
                
                <button 
                onClick={() => setActiveTab('fines')}
                className="flex flex-col items-center justify-center gap-2 p-6 bg-[#FFF8E7] hover:bg-[#F5EED8] rounded-lg transition-colors"
                >
                <DollarSign className="w-6 h-6 text-[#5F7464]" />
                <span className="font-medium text-[#2C3E2C]">Manage Fines</span>
                </button>
            </div>
            </BaseCard>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-300">
            {[
                { id: 'inventory', label: `Inventory (${books.length})` },
                { id: 'loans', label: `Loans (${loans.length})` },
                { id: 'fines', label: `Fines & Payments (${fines.length})` }
            ].map((tab) => (
                <button
                key={tab.id}
                onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm('');
                    setStatusFilter('');
                }}
                className={`px-6 py-3 font-medium rounded-t-lg ${
                    activeTab === tab.id
                    ? 'bg-white text-[#5F7464] border-b-2 border-[#5F7464]'
                    : 'text-gray-500 hover:text-[#5F7464]'
                }`}
                >
                {tab.label}
                </button>
            ))}
            </div>

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
            <div className="space-y-6">
                {/* Inventory Stats */}
                <div className="grid grid-cols-3 gap-6">
                <BaseCard className="bg-white">
                    <p className="text-[#5F7464] font-medium mb-2">Available</p>
                    <p className="text-4xl font-bold text-green-600">{inventoryStats.available}</p>
                </BaseCard>
                <BaseCard className="bg-white">
                    <p className="text-[#5F7464] font-medium mb-2">Low Stock</p>
                    <p className="text-4xl font-bold text-orange-600">{inventoryStats.low_stock}</p>
                </BaseCard>
                <BaseCard className="bg-white">
                    <p className="text-[#5F7464] font-medium mb-2">Out of Stock</p>
                    <p className="text-4xl font-bold text-red-600">{inventoryStats.out_of_stock}</p>
                </BaseCard>
                </div>

                {/* Search Bar */}
                <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                    type="text"
                    placeholder="Search by title, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-[#2C3E2C] focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                >
                    <option value="">All Books</option>
                    <option value="available">Available</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                </select>
                </div>

                {/* Books Table */}
                <BaseCard className="bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-[#FFF8E7] border-b border-gray-200">
                        <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Book</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">ISBN</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Genre</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Total</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Available</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map((book) => (
                        <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4">
                            <p className="font-medium text-[#2C3E2C]">{book.title}</p>
                            <p className="text-sm text-[#5F7464]">{book.author}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">{book.isbn || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">{book.genre}</td>
                            <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-[#2C3E2C] text-white rounded-full text-sm font-semibold">
                                {book.total_copies}
                            </span>
                            </td>
                            <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-[#5F7464] text-white rounded-full text-sm font-semibold">
                                {book.available_copies}
                            </span>
                            </td>
                            <td className="px-6 py-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                book.available_copies === 0 ? 'bg-red-100 text-red-700' :
                                book.available_copies <= 2 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {book.available_copies === 0 ? 'Out of Stock' :
                                book.available_copies <= 2 ? 'Low Stock' :
                                'Available'}
                            </span>
                            </td>
                            <td className="px-6 py-4">
                            <div className="flex gap-2">
                                <button 
                                onClick={() => handleEditBook(book)}
                                className="p-1 hover:bg-gray-200 rounded"
                                >
                                <Edit2 className="w-4 h-4 text-[#5F7464]" />
                                </button>
                                <button 
                                onClick={() => handleDeleteBook(book.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                                >
                                <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </BaseCard>
            </div>
            )}

            {/* LOANS TAB */}
            {activeTab === 'loans' && (
            <div className="space-y-6">
                {/* Loan Stats */}
                <div className="grid grid-cols-2 gap-6">
                <BaseCard className="bg-white">
                    <p className="text-[#5F7464] font-medium mb-2">Overdue</p>
                    <p className="text-4xl font-bold text-red-600">{loanStats.overdue_loans || 0}</p>
                </BaseCard>
                <BaseCard className="bg-white">
                    <p className="text-[#5F7464] font-medium mb-2">Returned</p>
                    <p className="text-4xl font-bold text-green-600">{loanStats.returned_loans || 0}</p>
                </BaseCard>
                </div>

                {/* Search Bar */}
                <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                    type="text"
                    placeholder="Search by Borrower..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-[#2C3E2C] focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                >
                    <option value="">All Loans</option>
                    <option value="active">Active</option>
                    <option value="overdue">Overdue</option>
                    <option value="returned">Returned</option>
                </select>
                </div>

                {/* Loans Table */}
                <BaseCard className="bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-[#FFF8E7] border-b border-gray-200">
                        <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Loan ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Book</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Borrower</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Loan Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Due Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.map((loan) => (
                        <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-[#5F7464]">{loan.id}</td>
                            <td className="px-6 py-4">
                            <p className="font-medium text-[#2C3E2C]">{loan.book?.title || 'Unknown'}</p>
                            <p className="text-sm text-[#5F7464]">{loan.book?.author || 'Unknown'}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">
                            {loan.user?.email || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">
                            {new Date(loan.loan_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">
                            {new Date(loan.expiration_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                (loan.status === 'On Loan' || loan.status === 'active') ? 'bg-green-100 text-green-700' :
                                (loan.status === 'Overdue' || loan.status === 'overdue') ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {(loan.status === 'On Loan' || loan.status === 'active') ? 'Active' :
                                (loan.status === 'Overdue' || loan.status === 'overdue') ? 'Overdue' :
                                'Returned'}
                            </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2 text-[#5F7464]">
                                {(loan.status === 'On Loan' || loan.status === 'active') && <button className="hover:underline">Extend</button>}
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </BaseCard>
            </div>
            )}

            {/* FINES TAB */}
            {activeTab === 'fines' && (
            <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by Borrower..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                />
                </div>

                {/* Fines Table */}
                <BaseCard className="bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-[#FFF8E7] border-b border-gray-200">
                        <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Fine ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Book</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Borrower</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Reason</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Issue Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#2C3E2C]">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fines
                        .filter(f => searchTerm === '' || f.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((fine) => (
                        <tr key={fine.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-[#5F7464]">{fine.id}</td>
                            <td className="px-6 py-4">
                            <p className="font-medium text-[#2C3E2C]">{fine.book?.title || 'Unknown'}</p>
                            <p className="text-sm text-[#5F7464]">{fine.book?.author || 'Unknown'}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">
                            {fine.user?.email || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">
                            {fine.status === 'overdue' ? 'Late return - overdue' : ''}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">
                            {new Date(fine.loan_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                fine.status === 'returned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {fine.status === 'returned' ? 'Paid' : 'Unpaid'}
                            </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-[#2C3E2C]">
                            ${fine.fine_amount.toFixed(2)}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </BaseCard>
            </div>
            )}
        </div>

        {/* Add Book Modal */}
        {showAddBook && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2C3E2C]">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
                <button onClick={() => { setShowAddBook(false); setEditingBook(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                </button>
                </div>
                
                <form onSubmit={editingBook ? handleUpdateBook : handleAddBook} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#2C3E2C] mb-2">ISBN</label>
                    <div className="flex gap-2">
                    <Input
                        type="text"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        placeholder="978-0-14-143951-8"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        onClick={handleFetchISBN}
                        disabled={fetchingISBN}
                        variant="secondary"
                    >
                        {fetchingISBN ? 'Fetching...' : 'Fetch Info'}
                    </Button>
                    </div>
                    <p className="text-xs text-#5F7464] mt-1">Enter ISBN to auto-fill details from OpenLibrary</p>
    </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Title *</label>
                <Input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    required
                    placeholder="Book title"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Author *</label>
                <Input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    required
                    placeholder="Author name"
                />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Genre *</label>
                <select 
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#2C3E2C] focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                >
                    <option value="">Select Genre</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Romance">Romance</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Biography">Biography</option>
                    <option value="History">History</option>
                    <option value="Computer Science">Computer Science</option>
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Total Copies *</label>
                <input
                    type="number"
                    min="1"
                    value={newBook.total_copies}
                    onChange={(e) => setNewBook({ ...newBook, total_copies: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#2C3E2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    placeholder="Enter number of copies"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Description</label>
                <textarea
                value={newBook.description}
                onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[#2C3E2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                placeholder="Brief description of the book..."
                />
            </div>
            
            <div className="flex gap-4 mt-6">
                <Button
                type="button"
                onClick={() => {
                    setShowAddBook(false);
                    setEditingBook(null);
                    setNewBook({ isbn: '', title: '', author: '', genre: '', total_copies: 1, description: '' });
                }}
                variant="secondary"
                className="flex-1"
                >
                Cancel
                </Button>
                <Button 
                type="submit"
                variant="primary"
                className="flex-1"
                >
                {editingBook ? 'Update Book' : 'Add Book'}
                </Button>
            </div>
            </form>
        </div>
        </div>
    )}
    </div>
    );
}
