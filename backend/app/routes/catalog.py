from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from .. import db
from ..models import Book, User
from app.utils.external_api import fetch_book_by_isbn

catalog = Blueprint('catalog', __name__)

# autenticacion y autorización helper
def admin_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') == 'admin':
            return fn(*args, **kwargs)
        else:
            return jsonify(msg='Admin privilege required'), 403
    wrapper.__name__ = fn.__name__
    return wrapper

# ruta para previsualizar libro desde ISBN (admin only)
@catalog.route('/books/preview/<isbn>', methods=['GET'])
@admin_required
def preview_book(isbn):
    """Preview book details from OpenLibrary API before adding to catalog"""
    book_data = fetch_book_by_isbn(isbn)
    
    if not book_data:
        return jsonify({'error': 'Book not found or API error'}), 404
    
    # checar si el libro ya existe en db
    existing_book = Book.query.filter_by(isbn=isbn).first()
    if existing_book:
        return jsonify({
            'warning': 'Book already exists in catalog',
            'existing_book': {
                'id': existing_book.id,
                'title': existing_book.title,
                'author': existing_book.author,
                'available_copies': existing_book.available_copies
            },
            'api_data': book_data
        }), 200
    
    return jsonify(book_data), 200

# ruta para crear libro / solo disponible para admin
@catalog.route('/books', methods=['POST'])
@admin_required
def add_book():
    data = request.get_json()

    if 'isbn' not in data or 'total_copies' not in data:
        return jsonify(msg='ISBN and total_copies are required'), 400
    
    if Book.query.filter_by(isbn=data['isbn']).first():
        return jsonify(msg='Book with this ISBN already exists'), 409
    
    # If title/author not provided, try to fetch from API
    if not data.get('title') or not data.get('author'):
        api_data = fetch_book_by_isbn(data['isbn'])
        if api_data:
            data['title'] = data.get('title') or api_data.get('title')
            data['author'] = data.get('author') or api_data.get('author')
            data['cover_url'] = data.get('cover_url') or api_data.get('cover_url')
            data['description'] = data.get('description') or api_data.get('description')
    
    # Validate required fields after API fetch attempt
    if not data.get('title') or not data.get('author'):
        return jsonify(msg='Title and author are required (could not fetch from API)'), 400
    
    # crear obj libro
    new_book = Book(
        isbn=data['isbn'],
        title=data['title'],
        author=data['author'],
        genre=data.get('genre'),
        total_copies=data['total_copies'],
        available_copies=data['total_copies'],
        cover_url=data.get('cover_url')
    )
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"msg":'Book added successfully', "book": {
        'id': new_book.id,
        'isbn': new_book.isbn,
        'title': new_book.title,
        'author': new_book.author,
        'cover_url': new_book.cover_url
    }}), 201

# ruta para obtener lista de libros 
@catalog.route('/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    output = []
    for book in books:
        output.append({
            'id': book.id,
            'isbn': book.isbn,
            'title': book.title,
            'author': book.author,
            'genre': book.genre,
            'total_copies': book.total_copies,
            'available_copies': book.available_copies,
            'cover_url': book.cover_url
        })
    return jsonify(output), 200

# ruta para actualizar libro (admin only)
@catalog.route('/books/<int:book_id>', methods=['PUT'])
@admin_required
def update_book(book_id):
    """Update book details"""
    book = Book.query.get(book_id)
    
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    data = request.get_json()
    
    # Update fields if provided
    if 'title' in data:
        book.title = data['title']
    if 'author' in data:
        book.author = data['author']
    if 'genre' in data:
        book.genre = data['genre']
    if 'isbn' in data:
        # Check if new ISBN already exists (excluding current book)
        existing = Book.query.filter(Book.isbn == data['isbn'], Book.id != book_id).first()
        if existing:
            return jsonify({'error': 'ISBN already exists for another book'}), 409
        book.isbn = data['isbn']
    if 'cover_url' in data:
        book.cover_url = data['cover_url']
    
    # Handle total_copies update - adjust available_copies proportionally
    if 'total_copies' in data:
        new_total = data['total_copies']
        if new_total < 0:
            return jsonify({'error': 'Total copies cannot be negative'}), 400
        
        # Calculate current loans
        current_loans = book.total_copies - book.available_copies
        
        if new_total < current_loans:
            return jsonify({'error': f'Cannot reduce total copies below current loans ({current_loans})'}), 400
        
        book.available_copies = new_total - current_loans
        book.total_copies = new_total
    
    db.session.commit()
    
    return jsonify({
        'msg': 'Book updated successfully',
        'book': {
            'id': book.id,
            'isbn': book.isbn,
            'title': book.title,
            'author': book.author,
            'genre': book.genre,
            'total_copies': book.total_copies,
            'available_copies': book.available_copies,
            'cover_url': book.cover_url
        }
    }), 200

# ruta para eliminar libro (admin only)
@catalog.route('/books/<int:book_id>', methods=['DELETE'])
@admin_required
def delete_book(book_id):
    """Delete a book from catalog"""
    book = Book.query.get(book_id)
    
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    # Check if book has active loans
    active_loans = book.total_copies - book.available_copies
    if active_loans > 0:
        return jsonify({
            'error': 'Cannot delete book with active loans',
            'active_loans': active_loans
        }), 400
    
    db.session.delete(book)
    db.session.commit()
    
    return jsonify({'msg': 'Book deleted successfully'}), 200

# ruta para obtener estadísticas del catálogo (admin only)
@catalog.route('/stats', methods=['GET'])
@admin_required
def get_catalog_stats():
    """Get catalog statistics for admin dashboard"""
    from sqlalchemy import func
    
    total_books = Book.query.count()
    total_copies = db.session.query(func.sum(Book.total_copies)).scalar() or 0
    available_copies = db.session.query(func.sum(Book.available_copies)).scalar() or 0
    loaned_copies = total_copies - available_copies
    
    # Books by genre
    genre_stats = db.session.query(
        Book.genre,
        func.count(Book.id).label('count')
    ).group_by(Book.genre).all()
    
    genres = [{'genre': g.genre or 'Unknown', 'count': g.count} for g in genre_stats]
    
    # Most loaned books (books with lowest available vs total ratio)
    most_loaned = Book.query.filter(Book.total_copies > 0).order_by(
        (Book.available_copies / Book.total_copies).asc()
    ).limit(5).all()
    
    popular_books = [{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'total_copies': book.total_copies,
        'available_copies': book.available_copies,
        'loan_rate': round((1 - book.available_copies / book.total_copies) * 100, 1) if book.total_copies > 0 else 0
    } for book in most_loaned]
    
    return jsonify({
        'total_books': total_books,
        'total_copies': total_copies,
        'available_copies': available_copies,
        'loaned_copies': loaned_copies,
        'utilization_rate': round((loaned_copies / total_copies * 100), 1) if total_copies > 0 else 0,
        'genres': genres,
        'popular_books': popular_books
    }), 200