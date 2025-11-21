import React from 'react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FFF8E7] flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#5F7464] rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                </div>
                <span className="text-2xl font-bold text-[#2C3E2C]">MyBookSpace</span>
            </div>
            <div className="flex gap-4">
                <button className="px-6 py-2 text-[#5F7464] hover:text-[#2C3E2C] font-medium">
                Sign In
                </button>
                <button className="px-6 py-2 bg-[#5F7464] text-white rounded-lg hover:bg-[#4A5D4A] font-medium">
                Get Started
                </button>
            </div>
            </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4">
            <div className="max-w-4xl text-center space-y-8">
            <h1 className="text-6xl font-bold text-[#2C3E2C] leading-tight">
                Your Community Library
            </h1>
            
            <p className="text-xl text-[#5F7464] max-w-3xl mx-auto leading-relaxed">
                Discover books, join book clubs, and connect with fellow readers. 
                MyBookSpace is the modern way to experience your community library.
            </p>
            
            <button className="px-10 py-4 bg-white text-[#5F7464] border-2 border-[#5F7464] rounded-lg hover:bg-[#5F7464] hover:text-white font-semibold text-lg transition-colors">
                Start Reading Today
            </button>
            </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-[#5F7464]">
            <p className="text-sm">© 2025 MyBookSpace - Community Library System</p>
        </footer>
        </div>
    );
}