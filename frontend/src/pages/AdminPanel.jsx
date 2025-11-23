import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { catalogAPI } from '../services/api';
import apiClient from '../api/apiClient';
import { Bell, Plus, Users, DollarSign, Edit2, Trash2, Book, PackageX } from 'lucide-react';
import { StatsCard } from '../components/cards';
import { SearchBar, Modal, Input, Button, Badge } from '../components/ui';

export default function AdminPanel() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory');
    const [showAddBook, setShowAddBook] = useState(false);
    const [books, setBooks] = useState([]);
    const [loans, setLoans] = useState([]);
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalCopies: 0,
        activeLoans: 0,
        overdueLoans: 0,
        totalFines: 0,
        unpaidFines: 0
    });

    // Form para agregar libro
    const [newBook, setNewBook] = useState({
        isbn: '',
        title: '',
        author: '',
        genre: '',
        total_copies: 1,
        description: ''
    });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
        await Promise.all([
            loadBooks(),
            loadLoans(),
            loadFines()
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
        const booksList = response.data.books || response.data || [];
        setBooks(booksList);
        
        // Calcular stats de inventario
        const totalCopies = booksList.reduce((sum, b) => sum + (b.total_copies || 0), 0);
        const available = booksList.filter(b => b.available_copies > 0).length;
        const lowStock = booksList.filter(b => b.available_copies > 0 && b.available_copies <= 2).length;
        const outOfStock = booksList.filter(b => b.available_copies === 0).length;
        
        setStats(prev => ({
            ...prev,
            totalBooks: booksList.length,
            totalCopies,
            available,
            lowStock,
            outOfStock
        }));
        } catch (error) {
        console.error('Error loading books:', error);
        }
    };

    const loadLoans = async () => {
        try {
        // Endpoint para admin que trae todos los préstamos
        const response = await apiClient.get('/loans/all');
        const loansList = response.data.loans || response.data || [];
        setLoans(loansList);
        
        const active = loansList.filter(l => l.status === 'active').length;
        const overdue = loansList.filter(l => l.status === 'overdue').length;
        
        setStats(prev => ({
            ...prev,
            activeLoans: active,
            overdueLoans: overdue
        }));
        } catch (error) {
        console.error('Error loading loans:', error);
        // Si no existe el endpoint, usar datos de ejemplo
        setLoans([]);
        }
    };

    const loadFines = async () => {
        try {
        const response = await apiClient.get('/loans/fines');
        const finesList = response.data.fines || response.data || [];
        setFines(finesList);
        
        const total = finesList.reduce((sum, f) => sum + (f.amount || 0), 0);
        const unpaid = finesList.filter(f => f.status === 'unpaid').length;
        
        setStats(prev => ({
            ...prev,
            totalFines: total,
            unpaidFines: unpaid
        }));
        } catch (error) {
        console.error('Error loading fines:', error);
        setFines([]);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
        await catalogAPI.createBook(newBook);
        alert('Book added successfully!');
        setShowAddBook(false);
        setNewBook({ isbn: '', title: '', author: '', genre: '', total_copies: 1, description: '' });
        loadBooks();
        } catch (error) {
        alert(error.response?.data?.error || 'Failed to add book');
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        
        try {
        await catalogAPI.deleteBook(bookId);
        alert('Book deleted successfully!');
        loadBooks();
        } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete book');
        }
    };

    const fetchBookByISBN = async () => {
        if (!newBook.isbn) return;
        
        try {
        const response = await apiClient.get(`/catalog/books/isbn/${newBook.isbn}`);
        const bookData = response.data;
        
        setNewBook(prev => ({
            ...prev,
            title: bookData.title || prev.title,
            author: bookData.author || prev.author,
            description: bookData.description || prev.description
        }));
        
        alert('Book info fetched from OpenLibrary!');
        } catch (error) {
        alert('Could not fetch book info. Please enter manually.');
        }
    };

    const getInitials = () => {
        if (!user?.email) return 'A';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
        <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
            <p className="text-[#5F7464]">Loading admin panel...</p>
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
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-[#5F7464]" />
                </button>
                <div className="w-10 h-10 bg-[#5F7464] rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials()}
                </div>
            </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
            {/* Welcome Section */}
            <div>
            <h2 className="text-2xl font-bold text-[#2C3E2C] mb-2">Manage your library system and monitor activity</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
            <StatsCard 
                label="Books in Inventory"
                value={stats.totalBooks}
                subtitle={`${stats.totalCopies} total copies`}
                icon={Book}
            />
            <StatsCard 
                label="Active Loans"
                value={stats.activeLoans}
                subtitle={`${stats.overdueLoans} overdue`}
                icon={Users}
            />
            <StatsCard 
                label="Pending Fines"
                value={`$${stats.totalFines.toFixed(2)}`}
                subtitle={`${stats.unpaidFines} unpaid`}
                icon={DollarSign}
            />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-[#2C3E2C] mb-2">Quick Actions</h3>
            <p className="text-sm text-[#5F7464] mb-4">Common administrative tasks</p>
            
            <div className="grid grid-cols-3 gap-4">
                <button 
                onClick={() => setShowAddBook(true)}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-[#FFF8E7] hover:bg-[#F5EED8] rounded-lg transition-colors"
                >
                <Plus className="w-6 h-6 text-[#5F7464]" />
                <span className="font-medium text-[#2C3E2C]">Add New Book</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-[#FFF8E7] hover:bg-[#F5EED8] rounded-lg transition-colors">
                <Users className="w-6 h-6 text-[#5F7464]" />
                <span className="font-medium text-[#2C3E2C]">Manage Users</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-[#FFF8E7] hover:bg-[#F5EED8] rounded-lg transition-colors">
                <DollarSign className="w-6 h-6 text-[#5F7464]" />
                <span className="font-medium text-[#2C3E2C]">Manage Fines</span>
                </button>
            </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
            {[
                { id: 'inventory', label: `Inventory (${books.length})` },
                { id: 'loans', label: `Loans (${loans.length})` },
                { id: 'fines', label: `Fines & Payments (${fines.length})` }
            ].map((tab) => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium ${
                    activeTab === tab.id
                    ? 'text-[#5F7464] border-b-2 border-[#5F7464]'
                    : 'text-gray-500 hover:text-[#5F7464]'
                }`}
                >
                {tab.label}
                </button>
            ))}
            </div>

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
            <div>
                {/* Stats Cards for Inventory */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                <StatsCard 
                    label="Available"
                    value={stats.available}
                    valueColor="text-green-600"
                    icon={Book}
                />
                <StatsCard 
                    label="Low Stock"
                    value={stats.lowStock}
                    valueColor="text-orange-600"
                    icon={PackageX}
                />
                <StatsCard 
                    label="Out of Stock"
                    value={stats.outOfStock}
                    valueColor="text-red-600"
                    icon={PackageX}
                />
                </div>

                {/* Search */}
                <SearchBar 
                placeholder="Search by title, author, or ISBN..."
                value=""
                onChange={() => {}}
                className="mb-4"
                />

                {/* Inventory Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#2C3E2C] mb-1">Book Inventory Management</h3>
                    <p className="text-sm text-[#5F7464]">Manage book inventory, stock levels, and availability</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-[#FFF8E7]">
                        <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Book</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">ISBN</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Genre</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Available</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Total</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                        <tr key={book.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4">
                            <div>
                                <p className="font-medium text-[#2C3E2C]">{book.title}</p>
                                <p className="text-sm text-[#5F7464]">{book.author}</p>
                            </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#5F7464]">{book.isbn || 'N/A'}</td>
                            <td className="px-6 py-4 text-[#5F7464]">{book.genre}</td>
                            <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-[#5F7464] text-white rounded-full text-sm font-semibold">
                                {book.available_copies}
                            </span>
                            </td>
                            <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-[#2C3E2C] text-white rounded-full text-sm font-semibold">
                                {book.total_copies}
                            </span>
                            </td>
                            <td className="px-6 py-4">
                            <Badge 
                                variant={
                                book.available_copies === 0 ? 'danger' :
                                book.available_copies <= 2 ? 'warning' :
                                'success'
                                }
                                text={
                                book.available_copies === 0 ? 'Out of Stock' :
                                book.available_copies <= 2 ? 'Low Stock' :
                                'Available'
                                }
                            />
                            </td>
                            <td className="px-6 py-4">
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded">
                                <Edit2 className="w-4 h-4 text-[#5F7464]" />
                                </button>
                                <button 
                                onClick={() => handleDeleteBook(book.id)}
                                className="p-2 hover:bg-gray-100 rounded"
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
                </div>
            </div>
            )}

            {/* Loans Tab */}
            {activeTab === 'loans' && (
            <div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <p className="text-[#5F7464] font-medium mb-2">Overdue</p>
                    <p className="text-4xl font-bold text-red-600">{stats.overdueLoans}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <p className="text-[#5F7464] font-medium mb-2">Returned</p>
                    <p className="text-4xl font-bold text-green-600">
                    {loans.filter(l => l.status === 'returned').length}
                    </p>
                </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#2C3E2C] mb-1">All Loans</h3>
                    <p className="text-sm text-[#5F7464]">Monitor all library loans</p>
                </div>
                
                {loans.length === 0 ? (
                    <div className="p-8 text-center text-[#5F7464]">
                    No loans found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FFF8E7]">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Loan ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Book</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Borrower</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Loan Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Due Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loans.map((loan) => (
                            <tr key={loan.id} className="border-t border-gray-200 hover:bg-gray-50">
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
                                {new Date(loan.due_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <Badge 
                                variant={
                                    loan.status === 'active' ? 'success' :
                                    loan.status === 'overdue' ? 'danger' :
                                    'default'
                                }
                                text={loan.status}
                                />
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <button className="text-[#5F7464] hover:text-[#2C3E2C]">
                                {loan.status === 'active' ? 'Extend' : 'View'}
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}
                </div>
            </div>
            )}

            {/* Fines Tab */}
        {activeTab === 'fines' && (
        <div>
            <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                type="text"
                placeholder="Search by Borrower..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                />
            </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-[#2C3E2C] mb-1">Fines Management</h3>
                <p className="text-sm text-[#5F7464]">Track and manage overdue fines</p>
            </div>
            
            {fines.length === 0 ? (
                <div className="p-8 text-center text-[#5F7464]">
                No fines found
                </div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[#FFF8E7]">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Fine ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Book</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Borrower</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Reason</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Issue Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {fines.map((fine) => (
                        <tr key={fine.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-[#5F7464]">{fine.id}</td>
                        <td className="px-6 py-4">
                            <p className="font-medium text-[#2C3E2C]">{fine.book?.title || 'Unknown'}</p>
                            <p className="text-sm text-[#5F7464]">{fine.book?.author || 'Unknown'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#5F7464]">
                            {fine.user?.email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#5F7464]">{fine.reason || 'Late return'}</td>
                        <td className="px-6 py-4 text-sm text-[#5F7464]">
                            {new Date(fine.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                            <Badge 
                            variant={fine.status === 'paid' ? 'success' : 'danger'}
                            text={fine.status || 'Unpaid'}
                            />
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#2C3E2C]">
                            ${fine.amount?.toFixed(2) || '0.00'}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            </div>
        </div>
        )}
    </div>

    {/* Add Book Modal */}
    <Modal 
        isOpen={showAddBook}
        onClose={() => {
        setShowAddBook(false);
        setNewBook({ isbn: '', title: '', author: '', genre: '', total_copies: 1, description: '' });
        }}
        title="Add New Book"
    >
        <form onSubmit={handleAddBook} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">ISBN</label>
                <div className="flex gap-2">
                <Input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="978-0-14-143951-8"
                />
                <Button
                    type="button"
                    onClick={fetchBookByISBN}
                >
                    Fetch Info
                </Button>
                </div>
                <p className="text-xs text-[#5F7464] mt-1">Enter ISBN to auto-fill details from OpenLibrary</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <Input
                label="Title"
                type="text"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                required
                />
                <Input
                label="Author"
                type="text"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                required
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Genre *</label>
                <select 
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
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
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Total Copies *</label>
                <input
                    type="number"
                    min="1"
                    value={newBook.total_copies}
                    onChange={(e) => setNewBook({ ...newBook, total_copies: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Description</label>
                <textarea
                value={newBook.description}
                onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                placeholder="Brief description of the book..."
                />
            </div>
            
            <div className="flex gap-4 mt-6">
                <Button
                type="button"
                onClick={() => {
                    setShowAddBook(false);
                    setNewBook({ isbn: '', title: '', author: '', genre: '', total_copies: 1, description: '' });
                }}
                variant="outline"
                fullWidth
                >
                Cancel
                </Button>
                <Button 
                type="submit"
                variant="primary"
                fullWidth
                >
                Add Book
                </Button>
            </div>
            </form>
    </Modal>

</div>
);
}