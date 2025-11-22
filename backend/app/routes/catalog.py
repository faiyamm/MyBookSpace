from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from .. import db
from ..models import Book, User

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

# ruta para crear libro / solo disponible para admin
@catalog.route('/books', methods=['POST'])
@admin_required
def add_book():
    data = request.get_json()

    if not all(key in data for key in ['isbn', 'title', 'author', 'total_copies']):
        return jsonify(msg='Missing required fields'), 400
    
    if Book.query.filter_by(isbn=data['isbn']).first():
        return jsonify(msg='Book with this ISBN already exists'), 409
    
    # crear obj libro
    new_book = Book(
        isbn=data['isbn'],
        title=data['title'],
        author=data['author'],
        genre=data.get('genre'),
        total_copies=data['total_copies'],
        available_copies=data['total_copies']
    )
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"msg":'Book added successfully', "id": new_book.id}), 201

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