from . import db
from datetime import datetime, timedelta

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

class Loan(db.Model):
    __tablename__ = 'Loans'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('Books.id'), nullable=False)

    loan_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expiration_date = db.Column(db.DateTime,  nullable=False)
    return_date = db.Column(db.DateTime, nullable=True)

    status = db.Column(db.String(20), default='On Loan')
    fine_amount = db.Column(db.Float, default=0.0)
    renewals = db.Column(db.Integer, default=0)

    user = db.relationship('User', backref=db.backref('loans', lazy=True))
    book = db.relationship('Book', backref=db.backref('loans', lazy=True))

    def __init__(self, user_id, book_id, loan_period_days=14):
        self.user_id = user_id
        self.book_id = book_id
        self.loan_date = datetime.utcnow()
        self.expiration_date = self.loan_date + timedelta(days=loan_period_days)
    
    def calculate_fine(self):
        """ fine of $1.00 per day overdue """
        if self.return_date:
            return 0.0
        
        if datetime.utcnow() > self.expiration_date:
            days_overdue = (datetime.utcnow() - self.expiration_date).days
            self.fine_amount = days_overdue * 1.0
            self.status = 'Overdue'
        return self.fine_amount

    def renewal(self):
        """ allows renewal up to 2 times if not overdue """
        if self.renewals >= 2:
            return False

        # don't allow renewal if already marked overdue or if current time past expiration
        if self.status == 'Overdue' or datetime.utcnow() > self.expiration_date:
            return False
        
        self.expiration_date += timedelta(days=14)
        self.renewals += 1
        return True

    def to_dict(self):
        self.calculate_fine()
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'loan_date': self.loan_date.isoformat(),
            'expiration_date': self.expiration_date.isoformat(),
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'status': self.status,
            'fine_amount': self.fine_amount,
            'renewals': self.renewals
        }