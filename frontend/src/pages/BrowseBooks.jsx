import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogAPI, loansAPI } from '../services/api';
import Layout from '../components/Layout';
import { BookCard } from '../components/cards';
import { SearchBar } from '../components/ui';

export default function BrowseBooks() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [availability, setAvailability] = useState('');

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
        const response = await catalogAPI.getBooks();
        setBooks(response.data.books || response.data || []);
        } catch (error) {
        console.error('Error loading books:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleBorrowBook = async (bookId) => {
        try {
        await loansAPI.reserveBook(bookId);
        alert('Book borrowed successfully!');
        loadBooks(); // Recargar para actualizar disponibilidad
        } catch (error) {
        alert(error.response?.data?.error || 'Failed to borrow book');
        }
    };

    // Filtrar libros
    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (book.isbn && book.isbn.includes(searchTerm));
        const matchesGenre = !selectedGenre || book.genre === selectedGenre;
        const matchesAvailability = !availability || 
        (availability === 'available' && book.available_copies > 0) ||
        (availability === 'unavailable' && book.available_copies === 0);
        
        return matchesSearch && matchesGenre && matchesAvailability;
    });

    // Obtener géneros únicos
    const genres = [...new Set(books.map(b => b.genre).filter(Boolean))];

    if (loading) {
        return (
        <Layout>
            <div className="p-8 flex items-center justify-center">
            <p className="text-[#5F7464]">Loading books...</p>
            </div>
        </Layout>
        );
    }

    return (
        <Layout>
        <div className="p-8 space-y-6">
            <div>
            <h2 className="text-2xl font-bold text-[#2C3E2C] mb-2">Browse Books</h2>
            <p className="text-[#5F7464]">Explore our books collection</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by title, author, or ISBN..."
                className="mb-4"
            />
            <div className="flex gap-4">
                <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                >
                <option value="">All Genres</option>
                {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                ))}
                </select>
                <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
                >
                <option value="">All Books</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                </select>
            </div>
            </div>

            <p className="text-[#5F7464]">Showing {filteredBooks.length} Books</p>

            {/* Books Grid */}
            {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
                <p className="text-[#5F7464]">No books found matching your criteria</p>
            </div>
            ) : (
            <div className="grid grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                <BookCard
                    key={book.id}
                    book={book}
                    onBookClick={() => navigate(`/book/${book.id}`)}
                    onActionClick={handleBorrowBook}
                    actionLabel="Borrow Book"
                />
                ))}
            </div>
            )}
        </div>
        </Layout>
    );
}