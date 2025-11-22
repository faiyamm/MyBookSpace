import React, { useState } from 'react';
import { Home, Book, Clock, User, Bell } from 'lucide-react';

export default function UserDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const books = [
        {
        id: 1,
        title: "Dune",
        author: "Frank Herbert",
        cover: "https://covers.openlibrary.org/b/id/8233997-M.jpg",
        available: 2,
        genre: "Fiction"
        },
        {
        id: 2,
        title: "The Old Man and the Sea",
        author: "Ernest Hemingway",
        cover: "https://covers.openlibrary.org/b/id/7896162-M.jpg",
        available: 2,
        genre: "Fiction"
        },
        {
        id: 3,
        title: "Martyr!",
        author: "Kaveh Akbar",
        cover: "https://covers.openlibrary.org/b/id/14451983-M.jpg",
        available: 4,
        genre: "Fiction"
        }
    ];

    return (
        <div className="min-h-screen bg-[#FFF8E7] flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5F7464] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                </div>
                <span className="text-xl font-bold text-[#2C3E2C]">MyBookSpace</span>
            </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
            {[
                { id: 'dashboard', icon: Home, label: 'Dashboard' },
                { id: 'browse', icon: Book, label: 'Browse Books' },
                { id: 'loans', icon: Clock, label: 'My Loans' },
                { id: 'profile', icon: User, label: 'Profile' }
            ].map((item) => (
                <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
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
        <div className="flex-1 overflow-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#2C3E2C]">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'browse' && 'Browse Books'}
                {activeTab === 'loans' && 'My Loans'}
                {activeTab === 'profile' && 'Profile'}
            </h1>
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-[#5F7464]" />
                </button>
                <div className="w-10 h-10 bg-[#5F7464] rounded-full flex items-center justify-center text-white font-semibold">
                UN
                </div>
            </div>
            </div>

            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
            <div className="p-8 space-y-8">
                <div>
                <h2 className="text-3xl font-bold text-[#2C3E2C] mb-2">Welcome Back, User Name</h2>
                <p className="text-[#5F7464]">Discover your next great read</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <p className="text-[#5F7464] font-medium mb-2">Active Loans</p>
                    <p className="text-4xl font-bold text-[#2C3E2C]">1</p>
                    <p className="text-sm text-[#5F7464] mt-1">Books currently borrowed</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <p className="text-[#5F7464] font-medium mb-2">Due This Week</p>
                    <p className="text-4xl font-bold text-[#2C3E2C]">1</p>
                    <p className="text-sm text-[#5F7464] mt-1">Books to return soon</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <p className="text-[#5F7464] font-medium mb-2">Overdue</p>
                    <p className="text-4xl font-bold text-[#2C3E2C]">0</p>
                    <p className="text-sm text-[#5F7464] mt-1">Requires attention</p>
                </div>
                </div>

                {/* Recommended Books */}
                <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#2C3E2C]">Recommended for You</h3>
                    <button className="text-[#5F7464] hover:text-[#2C3E2C] font-medium">View All →</button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {books.map((book) => (
                    <div key={book.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                        <img src={book.cover} alt={book.title} className="w-full h-64 object-cover" />
                        <div className="p-4">
                        <h4 className="font-bold text-[#2C3E2C] mb-1">{book.title}</h4>
                        <p className="text-sm text-[#5F7464] mb-3">{book.author}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs bg-[#5F7464] text-white px-3 py-1 rounded-full">
                            {book.available} Available
                            </span>
                            <span className="text-xs text-[#5F7464]">{book.genre}</span>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            )}

            {/* Browse Books Content */}
            {activeTab === 'browse' && (
            <div className="p-8 space-y-6">
                <div>
                <h2 className="text-2xl font-bold text-[#2C3E2C] mb-2">Browse Books</h2>
                <p className="text-[#5F7464]">Explore our books collection</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                <input
                    type="text"
                    placeholder="Search by title, author, or ISBN..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                />
                <div className="flex gap-4 mt-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]">
                    <option>All Genres</option>
                    <option>Fiction</option>
                    <option>Non-Fiction</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]">
                    <option>All Books</option>
                    <option>Available</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]">
                    <option>Title (A-Z)</option>
                    <option>Title (Z-A)</option>
                    </select>
                </div>
                </div>

                <p className="text-[#5F7464]">Showing 6 Books</p>

                {/* Books Grid */}
                <div className="grid grid-cols-3 gap-6">
                {[...books, ...books].map((book, idx) => (
                    <div key={idx} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                    <img src={book.cover} alt={book.title} className="w-full h-64 object-cover" />
                    <div className="p-4">
                        <h4 className="font-bold text-[#2C3E2C] mb-1">{book.title}</h4>
                        <p className="text-sm text-[#5F7464] mb-3">{book.author}</p>
                        <div className="flex items-center justify-between">
                        <span className="text-xs bg-[#5F7464] text-white px-3 py-1 rounded-full">
                            {book.available} Available
                        </span>
                        <span className="text-xs text-[#5F7464]">{book.genre}</span>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
        </div>
    );
}