import pytest
from app.models import Book, Loan, User
from app import db

class TestLoansAndCatalog:
    """Test suite for loans and catalog endpoints."""
    
    def test_get_all_books(self, client, init_database):
        """Test retrieving all books from catalog."""
        response = client.get('/api/catalog/books')
        
        assert response.status_code == 200
        assert 'books' in response.json
        assert len(response.json['books']) == 3
        assert response.json['books'][0]['title'] == 'Test Book 1'
    
    def test_create_book_as_admin(self, client, admin_headers, init_database):
        """Test admin can create a new book."""
        response = client.post('/api/catalog/books', 
            headers=admin_headers,
            json={
                'isbn': '978-0-12-345678-9',
                'title': 'New Test Book',
                'author': 'New Author',
                'genre': 'Mystery',
                'total_copies': 5,
                'description': 'A test book'
            }
        )
        
        assert response.status_code == 201
        assert response.json['book']['title'] == 'New Test Book'
        assert response.json['book']['available_copies'] == 5
    
    def test_reserve_book_success(self, client, auth_headers, init_database, app):
        """Test user can successfully reserve an available book."""
        # Get book with available copies (book1 has 5 available)
        with app.app_context():
            book = Book.query.filter_by(title='Test Book 1').first()
            book_id = book.id
            initial_available = book.available_copies
        
        response = client.post(f'/api/loans/reserve/{book_id}', 
            headers=auth_headers
        )
        
        assert response.status_code == 201
        assert 'loan' in response.json
        
        # Verify book availability decreased
        with app.app_context():
            book = Book.query.get(book_id)
            assert book.available_copies == initial_available - 1
    
    def test_reserve_unavailable_book_fails(self, client, auth_headers, init_database, app):
        """Test reserving a book with no available copies fails."""
        # Get book with 0 available copies (book3)
        with app.app_context():
            book = Book.query.filter_by(title='Test Book 3').first()
            book_id = book.id
        
        response = client.post(f'/api/loans/reserve/{book_id}', 
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert 'not available' in response.json['error'].lower() or 'no copies' in response.json['error'].lower()
    
    def test_get_user_loans(self, client, auth_headers, init_database):
        """Test user can retrieve their loan history."""
        response = client.get('/api/loans/my-loans', 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert 'loans' in response.json
        # Regular user should have at least 1 loan from init_database
        assert len(response.json['loans']) >= 1
    
    def test_return_book_success(self, client, auth_headers, init_database, app):
        """Test user can successfully return a borrowed book."""
        # Get the existing loan from init_database
        with app.app_context():
            loan = Loan.query.filter_by(user_id=2).first()  # Regular user ID is 2
            loan_id = loan.id
            book_id = loan.book_id
            initial_available = Book.query.get(book_id).available_copies
        
        response = client.post(f'/api/loans/return/{loan_id}', 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert 'returned' in response.json['message'].lower()
        
        # Verify book availability increased
        with app.app_context():
            book = Book.query.get(book_id)
            assert book.available_copies == initial_available + 1
    
    def test_search_books_by_title(self, client, init_database):
        """Test searching books by title."""
        response = client.get('/api/catalog/books?search=Test Book 1')
        
        assert response.status_code == 200
        assert len(response.json['books']) >= 1
        assert 'Test Book 1' in response.json['books'][0]['title']
    
    def test_get_book_by_id(self, client, init_database, app):
        """Test retrieving a specific book by ID."""
        with app.app_context():
            book = Book.query.first()
            book_id = book.id
        
        response = client.get(f'/api/catalog/books/{book_id}')
        
        assert response.status_code == 200
        assert response.json['id'] == book_id
        assert 'title' in response.json
        assert 'author' in response.json
