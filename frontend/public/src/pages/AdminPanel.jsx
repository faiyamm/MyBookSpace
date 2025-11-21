import React, { useState } from 'react';
import { Bell, Plus, Users, DollarSign } from 'lucide-react';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [showAddBook, setShowAddBook] = useState(false);

    const inventory = [
        { title: "Pride and Prejudice", isbn: "978-0-14-143951-8", author: "Jane Austen", genre: "Romance", available: 3, total: 10 },
        { title: "Pride and Prejudice", isbn: "978-0-14-143951-8", author: "Jane Austen", genre: "Romance", available: 3, total: 10 },
        { title: "Pride and Prejudice", isbn: "978-0-14-143951-8", author: "Jane Austen", genre: "Romance", available: 3, total: 10 }
    ];

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
            <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-[#5F7464]" />
            </button>
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
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-[#5F7464] font-medium mb-2">Books in Inventory</p>
                <p className="text-4xl font-bold text-[#2C3E2C] mb-1">155</p>
                <p className="text-sm text-[#5F7464]">367 total copies</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-[#5F7464] font-medium mb-2">Active Loans</p>
                <p className="text-4xl font-bold text-[#2C3E2C] mb-1">28</p>
                <p className="text-sm text-[#5F7464]">5 overdue</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-[#5F7464] font-medium mb-2">Pending Fines</p>
                <p className="text-4xl font-bold text-[#2C3E2C] mb-1">$35.50</p>
                <p className="text-sm text-[#5F7464]">3 unpaid</p>
            </div>
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
            {['Inventory (255)', 'Loans (15)', 'Fines & Payments (1)'].map((tab, idx) => (
                <button
                key={idx}
                onClick={() => setActiveTab(['inventory', 'loans', 'fines'][idx])}
                className={`px-6 py-3 font-medium ${
                    activeTab === ['inventory', 'loans', 'fines'][idx]
                    ? 'text-[#5F7464] border-b-2 border-[#5F7464]'
                    : 'text-gray-500 hover:text-[#5F7464]'
                }`}
                >
                {tab}
                </button>
            ))}
            </div>

            {/* Inventory Table */}
            {activeTab === 'inventory' && (
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Author</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Genre</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Available</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Total</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C3E2C]">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {inventory.map((book, idx) => (
                        <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                            <div>
                            <p className="font-medium text-[#2C3E2C]">{book.title}</p>
                            <p className="text-sm text-[#5F7464]">{book.isbn}</p>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-[#5F7464]">{book.author}</td>
                        <td className="px-6 py-4 text-[#5F7464]">{book.genre}</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-[#5F7464] text-white rounded-full text-sm font-semibold">
                            {book.available}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-[#2C3E2C] text-white rounded-full text-sm font-semibold">
                            {book.total}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <button className="text-[#5F7464] hover:text-[#2C3E2C] font-medium">Edit</button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            )}
        </div>

        {/* Add Book Modal */}
        {showAddBook && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-8">
                <h2 className="text-2xl font-bold text-[#2C3E2C] mb-6">Add New Book</h2>
                
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#2C3E2C] mb-2">ISBN</label>
                    <input
                    type="text"
                    placeholder="978-0-14-143951-8"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    />
                    <p className="text-xs text-[#5F7464] mt-1">Enter ISBN to auto-fill details from OpenLibrary</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Title</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Author</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Genre</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]">
                        <option>Fiction</option>
                        <option>Non-Fiction</option>
                        <option>Romance</option>
                        <option>Science Fiction</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-[#2C3E2C] mb-2">Total Copies</label>
                    <input
                        type="number"
                        min="1"
                        defaultValue="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                    />
                    </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                    <button
                    onClick={() => setShowAddBook(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-[#5F7464] rounded-lg hover:bg-gray-50 font-medium"
                    >
                    Cancel
                    </button>
                    <button className="flex-1 px-6 py-3 bg-[#5F7464] text-white rounded-lg hover:bg-[#4A5D4A] font-medium">
                    Add Book
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}