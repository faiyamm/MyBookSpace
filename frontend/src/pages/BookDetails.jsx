import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogAPI, loansAPI } from '../services/api';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { ArrowLeft, BookOpen, User, Hash, Tag } from 'lucide-react';

export default function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowing, setBorrowing] = useState(false);

    useEffect(() => {
        loadBookDetails();
    }, [id]);

    const loadBookDetails = async () => {
        try {
            const response = await catalogAPI.getBook(id);
            setBook(response.data);
        } catch (error) {
            console.error('Error loading book:', error);
            alert('Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const handleBorrow = async () => {
        if (!book || book.available_copies === 0) return;
        
        setBorrowing(true);
        try {
            await loansAPI.reserveBook(book.id);
            alert('Book borrowed successfully!');
            loadBookDetails(); // Refresh to update availability
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to borrow book');
        } finally {
            setBorrowing(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="p-8 flex items-center justify-center">
                    <p className="text-[#5F7464]">Loading book details...</p>
                </div>
            </Layout>
        );
    }

    if (!book) {
        return (
            <Layout>
                <div className="p-8">
                    <p className="text-red-600">Book not found</p>
                    <Button onClick={() => navigate('/browse')} className="mt-4">
                        Back to Browse
                    </Button>
                </div>
            </Layout>
        );
    }

    const isAvailable = book.available_copies > 0;

    return (
        <Layout>
            <div className="p-8 space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#5F7464] hover:text-[#2C3E2C] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Book Details Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="grid md:grid-cols-3 gap-8 p-8">
                        {/* Book Cover */}
                        <div className="md:col-span-1">
                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-auto rounded-lg shadow-md"
                                />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-[#FFF8E7] rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-20 h-20 text-[#5F7464] opacity-50" />
                                </div>
                            )}
                        </div>

                        {/* Book Information */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Title and Author */}
                            <div>
                                <h1 className="text-3xl font-bold text-[#2C3E2C] mb-2">
                                    {book.title}
                                </h1>
                                <div className="flex items-center gap-2 text-lg text-[#5F7464]">
                                    <User className="w-5 h-5" />
                                    <span>{book.author}</span>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Hash className="w-5 h-5 text-[#5F7464]" />
                                    <div>
                                        <p className="text-sm text-[#5F7464]">ISBN</p>
                                        <p className="font-medium text-[#2C3E2C]">{book.isbn || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-[#5F7464]" />
                                    <div>
                                        <p className="text-sm text-[#5F7464]">Genre</p>
                                        <p className="font-medium text-[#2C3E2C]">{book.genre || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="bg-[#FFF8E7] rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[#5F7464] mb-1">Availability</p>
                                        <p className="text-2xl font-bold text-[#2C3E2C]">
                                            {book.available_copies} / {book.total_copies}
                                        </p>
                                        <p className="text-sm text-[#5F7464] mt-1">
                                            {isAvailable ? 'Copies available' : 'Out of stock'}
                                        </p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full font-medium ${
                                        isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {isAvailable ? 'Available' : 'Unavailable'}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {book.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-[#2C3E2C] mb-2">Description</h3>
                                    <p className="text-[#5F7464] leading-relaxed">{book.description}</p>
                                </div>
                            )}

                            {/* Borrow Button */}
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleBorrow}
                                    disabled={!isAvailable || borrowing}
                                    variant="primary"
                                    className="flex-1"
                                >
                                    {borrowing ? 'Borrowing...' : isAvailable ? 'Borrow This Book' : 'Out of Stock'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
