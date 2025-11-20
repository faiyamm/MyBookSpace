from . import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'Users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

    role = db.Column(db.String(50), default='User', nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    #loans = db.relationship('Loan', backref='borrower', lazy='dynamic')

    def __repr__(self):
        return f'<Usuario {self.email} - Rol: {self.rol}>'

class Book(db.Model):
    __tablename__ = 'Books'

    id = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(13), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)

    total_copies = db.Column(db.Integer, default=0, nullable=False)
    available_copies = db.Column(db.Integer, default=0, nullable=False)

    genre = db.Column(db.String(100))
    cover_url = db.Column(db.String(500))

    #loans = db.relationship('Loan', backref='Book_borrowed', lazy='dynamic')

    def __repr__(self):
        return f'<Book {self.titulo} por {self.autor}>'